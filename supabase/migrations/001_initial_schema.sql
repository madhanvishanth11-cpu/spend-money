-- ==============================================================================
-- SpendWise Phase 2: Production Schema Migration
-- Migration: 001_initial_schema.sql
-- Target: Supabase PostgreSQL (public schema)
--
-- Features:
--   1. Clean Dependency Order: Creates all tables before functions, triggers, and RPCs.
--   2. Explicit Transfer Distinguishability:
--      - Transfers use transfer_side ('outgoing' | 'incoming') or check constraint.
--      - Outgoing transfers deduct from source account balance.
--      - Incoming transfers credit to destination account balance.
--      - Transfers are categorized as 'transfer' and excluded from income & expenses.
--   3. Atomic RPC (create_transfer):
--      - Both sides of a transfer are created in a single transaction with identical transfer_group_id.
--      - Fully validated server-side for user ownership of both accounts.
--   4. Hardened Security:
--      - SECURITY DEFINER functions set search_path = public, pg_temp.
--      - Full Row Level Security (RLS) on all 5 user tables.
--      - Cross-tenant prevention: inserting/updating transactions or budgets verifies
--        that referenced account_id and category_id belong to auth.uid().
--   5. Default Currency: INR. No mock data or fake transactions created.
-- ==============================================================================

-- 0. Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- STEP 1: CREATE ALL BASE TABLES FIRST
-- ==============================================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency text not null default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Accounts Table
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('cash', 'bank', 'wallet')),
  opening_balance numeric(12, 2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_accounts_user_id on public.accounts(user_id);

-- 3. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  transaction_type text not null check (transaction_type in ('income', 'expense', 'transfer')),
  icon text default 'tag',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_categories_user_id on public.categories(user_id);

-- 4. Transactions Table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  transfer_side text check (
    (type = 'transfer' and transfer_side in ('outgoing', 'incoming')) or
    (type != 'transfer' and transfer_side is null)
  ),
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

-- 5. Budgets Table
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

-- ==============================================================================
-- STEP 2: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Profiles RLS
drop policy if exists "Profiles select owned" on public.profiles;
create policy "Profiles select owned" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles insert owned" on public.profiles;
create policy "Profiles insert owned" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Profiles update owned" on public.profiles;
create policy "Profiles update owned" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Accounts RLS
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

-- Categories RLS
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

-- Transactions RLS
-- Strict cross-resource verification: user can only reference accounts and categories they own
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

-- Budgets RLS
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

-- ==============================================================================
-- STEP 3: SECURED FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 1. Timestamp Auto-Updater Trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- 2. Hardened New User Setup Trigger (SECURITY DEFINER with fixed search_path)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Create profile
  insert into public.profiles (id, display_name, currency)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    'INR'
  )
  on conflict (id) do nothing;

  -- Seed default categories
  insert into public.categories (user_id, name, transaction_type, icon) values
    (new.id, 'Groceries & Food', 'expense', 'shopping-cart'),
    (new.id, 'Dining Out', 'expense', 'utensils'),
    (new.id, 'Rent & Housing', 'expense', 'home'),
    (new.id, 'Utilities & Bills', 'expense', 'zap'),
    (new.id, 'Transportation & Fuel', 'expense', 'car'),
    (new.id, 'Shopping & Retail', 'expense', 'bag'),
    (new.id, 'Healthcare & Medical', 'expense', 'activity'),
    (new.id, 'Entertainment & OTT', 'expense', 'tv'),
    (new.id, 'Education & Courses', 'expense', 'book'),
    (new.id, 'Miscellaneous', 'expense', 'tag'),
    (new.id, 'Salary', 'income', 'briefcase'),
    (new.id, 'Freelance / Consulting', 'income', 'laptop'),
    (new.id, 'Investments & Dividends', 'income', 'trending-up'),
    (new.id, 'Other Income', 'income', 'gift');

  -- Seed default zero-balance accounts
  insert into public.accounts (user_id, name, account_type, opening_balance) values
    (new.id, 'Primary Bank Account', 'bank', 0.00),
    (new.id, 'Cash in Hand', 'cash', 0.00);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- STEP 4: ATOMIC ACCOUNT TRANSFER STORED PROCEDURE (RPC)
-- ==============================================================================
-- Atomically executes account transfers within a single database transaction.
-- Verifies server-side ownership of source and destination accounts.
-- Transferred amounts use transfer_side ('outgoing' and 'incoming') to explicitly
-- distinguish deduction vs addition, avoiding keyword-parsing ambiguities.
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
set search_path = public, pg_temp
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

  -- 1. Source Account Record: Outgoing transfer (deducted from source balance)
  insert into public.transactions (
    user_id,
    account_id,
    type,
    transfer_side,
    amount,
    payment_method,
    description,
    transaction_date,
    transfer_group_id
  ) values (
    v_user_id,
    p_source_account_id,
    'transfer',
    'outgoing',
    p_amount,
    p_payment_method,
    coalesce(nullif(trim(p_description), ''), 'Transfer to ' || v_dest_name),
    p_transaction_date,
    v_group_id
  );

  -- 2. Destination Account Record: Incoming transfer (credited to destination balance)
  insert into public.transactions (
    user_id,
    account_id,
    type,
    transfer_side,
    amount,
    payment_method,
    description,
    transaction_date,
    transfer_group_id
  ) values (
    v_user_id,
    p_destination_account_id,
    'transfer',
    'incoming',
    p_amount,
    p_payment_method,
    coalesce(nullif(trim(p_description), ''), 'Transfer from ' || v_source_name),
    p_transaction_date,
    v_group_id
  );

  return v_group_id;
end;
$$;
