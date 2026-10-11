-- ==============================================================================
-- SpendWise Phase 2: Complete PostgreSQL Schema, RLS Policies, and Atomic RPCs
-- Target Supabase Project: https://iklrcgxxteuyoxwykxhd.supabase.co
-- ==============================================================================

-- Enable UUID extension if not already available
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency text not null default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to create a profile automatically whenever a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, currency)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'INR'
  )
  on conflict (id) do nothing;

  -- Seed default categories for the new user
  insert into public.categories (user_id, name, transaction_type, icon) values
    (new.id, 'Groceries & Food', 'expense', 'shopping-cart'),
    (new.id, 'Dining Out', 'expense', 'utensils'),
    (new.id, 'Rent & Housing', 'expense', 'home'),
    (new.id, 'Utilities & Bills', 'expense', 'zap'),
    (new.id, 'Transportation & Fuel', 'expense', 'car'),
    (new.id, 'Shopping & Retail', 'expense', 'bag'),
    (new.id, 'Entertainment & OTT', 'expense', 'tv'),
    (new.id, 'Healthcare & Medical', 'expense', 'activity'),
    (new.id, 'Education & Courses', 'expense', 'book'),
    (new.id, 'Salary', 'income', 'briefcase'),
    (new.id, 'Freelance / Consulting', 'income', 'laptop'),
    (new.id, 'Investments & Dividends', 'income', 'trending-up'),
    (new.id, 'Rental Income', 'income', 'building'),
    (new.id, 'Gifts & Reimbursements', 'income', 'gift'),
    (new.id, 'Account Transfer', 'transfer', 'arrow-left-right');

  -- Seed default primary account
  insert into public.accounts (user_id, name, account_type, opening_balance) values
    (new.id, 'Primary Bank Account', 'bank', 0.00),
    (new.id, 'Cash in Hand', 'cash', 0.00);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. Accounts Table
-- ------------------------------------------------------------------------------
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('cash', 'bank', 'wallet')),
  opening_balance numeric(12, 2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_accounts_user_id on public.accounts(user_id);

-- ------------------------------------------------------------------------------
-- 3. Categories Table
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  transaction_type text not null check (transaction_type in ('income', 'expense', 'transfer')),
  icon text default 'tag',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_categories_user_id on public.categories(user_id);

-- ------------------------------------------------------------------------------
-- 4. Transactions Table
-- ------------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(12, 2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash', 'UPI', 'card', 'bank transfer', 'other')),
  description text not null,
  transaction_date date not null default current_date,
  transfer_group_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_account_id on public.transactions(account_id);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);
create index if not exists idx_transactions_transfer_group on public.transactions(transfer_group_id);

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 5. Budgets Table
-- ------------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  amount_limit numeric(12, 2) not null check (amount_limit > 0),
  month_start date not null default date_trunc('month', current_date)::date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_user_category_month unique (user_id, category_id, month_start)
);

create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_budgets_month on public.budgets(month_start);

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Profiles Policies
drop policy if exists "Profiles select owned" on public.profiles;
create policy "Profiles select owned" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles update owned" on public.profiles;
create policy "Profiles update owned" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Accounts Policies
drop policy if exists "Accounts select owned" on public.accounts;
create policy "Accounts select owned" on public.accounts
  for select using (auth.uid() = user_id);

drop policy if exists "Accounts insert owned" on public.accounts;
create policy "Accounts insert owned" on public.accounts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Accounts update owned" on public.accounts;
create policy "Accounts update owned" on public.accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Accounts delete owned" on public.accounts;
create policy "Accounts delete owned" on public.accounts
  for delete using (auth.uid() = user_id);

-- Categories Policies
drop policy if exists "Categories select owned" on public.categories;
create policy "Categories select owned" on public.categories
  for select using (auth.uid() = user_id);

drop policy if exists "Categories insert owned" on public.categories;
create policy "Categories insert owned" on public.categories
  for insert with check (auth.uid() = user_id);

drop policy if exists "Categories update owned" on public.categories;
create policy "Categories update owned" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Categories delete owned" on public.categories;
create policy "Categories delete owned" on public.categories
  for delete using (auth.uid() = user_id);

-- Transactions Policies
-- Strict verification: account_id and category_id must belong to the authenticated user!
drop policy if exists "Transactions select owned" on public.transactions;
create policy "Transactions select owned" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "Transactions insert owned" on public.transactions;
create policy "Transactions insert owned" on public.transactions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.accounts a
      where a.id = account_id and a.user_id = auth.uid()
    )
    and (
      category_id is null or exists (
        select 1 from public.categories c
        where c.id = category_id and c.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Transactions update owned" on public.transactions;
create policy "Transactions update owned" on public.transactions
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.accounts a
      where a.id = account_id and a.user_id = auth.uid()
    )
    and (
      category_id is null or exists (
        select 1 from public.categories c
        where c.id = category_id and c.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Transactions delete owned" on public.transactions;
create policy "Transactions delete owned" on public.transactions
  for delete using (auth.uid() = user_id);

-- Budgets Policies
drop policy if exists "Budgets select owned" on public.budgets;
create policy "Budgets select owned" on public.budgets
  for select using (auth.uid() = user_id);

drop policy if exists "Budgets insert owned" on public.budgets;
create policy "Budgets insert owned" on public.budgets
  for insert with check (
    auth.uid() = user_id
    and (
      category_id is null or exists (
        select 1 from public.categories c
        where c.id = category_id and c.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Budgets update owned" on public.budgets;
create policy "Budgets update owned" on public.budgets
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      category_id is null or exists (
        select 1 from public.categories c
        where c.id = category_id and c.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Budgets delete owned" on public.budgets;
create policy "Budgets delete owned" on public.budgets
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. Atomic Transfer RPC (Stored Procedure)
-- ------------------------------------------------------------------------------
-- Ensures source and destination transactions are created atomically within a
-- single database transaction, with server-side ownership and amount validation.
create or replace function public.create_transfer(
  p_source_account_id uuid,
  p_destination_account_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_description text,
  p_transaction_date date default current_date
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user_id uuid;
  v_group_id uuid;
  v_source_name text;
  v_dest_name text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized: User not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'Transfer amount must be greater than zero';
  end if;

  if p_source_account_id = p_destination_account_id then
    raise exception 'Source and destination accounts must be different';
  end if;

  -- Validate source account ownership
  select name into v_source_name
  from public.accounts
  where id = p_source_account_id and user_id = v_user_id;

  if v_source_name is null then
    raise exception 'Source account does not exist or does not belong to you';
  end if;

  -- Validate destination account ownership
  select name into v_dest_name
  from public.accounts
  where id = p_destination_account_id and user_id = v_user_id;

  if v_dest_name is null then
    raise exception 'Destination account does not exist or does not belong to you';
  end if;

  v_group_id := gen_random_uuid();

  -- Outgoing transfer record (from source)
  insert into public.transactions (
    user_id,
    account_id,
    type,
    amount,
    payment_method,
    description,
    transaction_date,
    transfer_group_id
  ) values (
    v_user_id,
    p_source_account_id,
    'transfer',
    p_amount,
    p_payment_method,
    coalesce(nullif(p_description, ''), 'Transfer to ' || v_dest_name),
    p_transaction_date,
    v_group_id
  );

  -- Incoming transfer record (to destination)
  insert into public.transactions (
    user_id,
    account_id,
    type,
    amount,
    payment_method,
    description,
    transaction_date,
    transfer_group_id
  ) values (
    v_user_id,
    p_destination_account_id,
    'transfer',
    p_amount,
    p_payment_method,
    coalesce(nullif(p_description, ''), 'Transfer from ' || v_source_name),
    p_transaction_date,
    v_group_id
  );

  return v_group_id;
end;
$$;
