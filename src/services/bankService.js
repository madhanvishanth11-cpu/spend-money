import { supabase } from './supabase';

/**
 * SpendWise Bank Connectivity Service
 * Architecture: RBI-regulated Account Aggregator (AA) framework.
 *
 * Security Principles:
 * - NO banking passwords, OTPs, ATM PINs, or UPI PINs are ever requested, processed, or stored.
 * - Consent is managed exclusively through RBI-licensed NBFC-AAs (e.g. Setu, Finvu, OneMoney).
 * - Real provider credentials reside solely on secure serverless backend environments, NEVER in client-side React code.
 */

export const isBankProviderConfigured = Boolean(
  import.meta.env.VITE_BANK_AA_PROVIDER_CONFIGURED === 'true'
);

// Fetch all linked bank connections for the authenticated user
export const getBankConnections = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bank_connections')
    .select(`
      *,
      account:accounts (id, name, account_type, opening_balance)
    `)
    .order('created_at', { ascending: false });

  // If table doesn't exist yet, gracefully return empty array
  if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
    return [];
  }
  if (error) throw error;
  return data || [];
};

// Disconnect / Revoke a bank connection
export const disconnectBankConnection = async (connectionId) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('bank_connections')
    .delete()
    .eq('id', connectionId);
  if (error) throw error;
};

// Sync / refresh transactions from the bank
export const syncBankConnection = async (connectionId) => {
  if (!isBankProviderConfigured) {
    throw new Error('Bank integration setup required. An RBI Account Aggregator provider (e.g., Setu, Finvu, or OneMoney) is required for automated bank synchronization.');
  }

  // In production with an AA backend, call the secure Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('sync-bank-account', {
    body: { connectionId }
  });

  if (error) throw error;
  return data;
};
