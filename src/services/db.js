import { supabase } from './supabase';

/**
 * SpendWise Database Access Layer
 * All operations run through authenticated Supabase client with RLS active.
 */

// --- Profiles ---
export const getProfile = async (userId) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// --- Accounts ---
export const getAccounts = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createAccount = async (account) => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      name: account.name,
      account_type: account.account_type || account.type,
      opening_balance: Number(account.opening_balance || account.balance || 0),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAccount = async (id, account) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('accounts')
    .update({
      name: account.name,
      account_type: account.account_type || account.type,
      opening_balance: Number(account.opening_balance ?? account.balance ?? 0),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAccount = async (id) => {
  if (!supabase) return;
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw error;
};

// --- Categories ---
export const getCategories = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createCategory = async (category) => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name: category.name,
      transaction_type: category.transaction_type,
      icon: category.icon || 'tag',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// --- Transactions ---
export const getTransactions = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      account:accounts (id, name, account_type),
      category:categories (id, name, icon)
    `)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createTransaction = async (tx) => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If this is a transfer, call the atomic RPC function
  if (tx.type === 'transfer' && tx.destination_account_id) {
    const { data: groupId, error: rpcError } = await supabase.rpc('create_transfer', {
      p_source_account_id: tx.account_id,
      p_destination_account_id: tx.destination_account_id,
      p_amount: Number(tx.amount),
      p_payment_method: tx.payment_method,
      p_description: tx.description,
      p_transaction_date: tx.transaction_date,
    });
    if (rpcError) throw rpcError;
    return { transfer_group_id: groupId };
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: tx.account_id,
      category_id: tx.category_id || null,
      type: tx.type,
      amount: Number(tx.amount),
      payment_method: tx.payment_method,
      description: tx.description,
      transaction_date: tx.transaction_date || new Date().toISOString().split('T')[0],
      transfer_group_id: tx.transfer_group_id || null,
    })
    .select(`
      *,
      account:accounts (id, name, account_type),
      category:categories (id, name, icon)
    `)
    .single();
  if (error) throw error;
  return data;
};

export const updateTransaction = async (id, tx) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('transactions')
    .update({
      account_id: tx.account_id,
      category_id: tx.category_id || null,
      type: tx.type,
      amount: Number(tx.amount),
      payment_method: tx.payment_method,
      description: tx.description,
      transaction_date: tx.transaction_date,
    })
    .eq('id', id)
    .select(`
      *,
      account:accounts (id, name, account_type),
      category:categories (id, name, icon)
    `)
    .single();
  if (error) throw error;
  return data;
};

export const deleteTransaction = async (id, transferGroupId = null) => {
  if (!supabase) return;
  // If transaction was part of an atomic transfer group, delete both sides atomically
  if (transferGroupId) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('transfer_group_id', transferGroupId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  }
};

// --- Budgets ---
export const getBudgets = async (monthStart) => {
  if (!supabase) return [];
  let query = supabase.from('budgets').select(`
    *,
    category:categories (id, name, icon)
  `);

  if (monthStart) {
    query = query.eq('month_start', monthStart);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const saveBudget = async (budget) => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (budget.id) {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        amount_limit: Number(budget.amount_limit),
      })
      .eq('id', budget.id)
      .select(`*, category:categories (id, name, icon)`)
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      category_id: budget.category_id || null,
      amount_limit: Number(budget.amount_limit),
      month_start: budget.month_start || new Date().toISOString().slice(0, 7) + '-01',
    })
    .select(`*, category:categories (id, name, icon)`)
    .single();
  if (error) throw error;
  return data;
};

export const deleteBudget = async (id) => {
  if (!supabase) return;
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
};
