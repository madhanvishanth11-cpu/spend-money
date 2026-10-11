-- SpendWise Database Schema for Supabase
-- Run this script inside the Supabase SQL Editor

-- 1. Accounts Table
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  type text not null check (type in ('bank', 'wallet', 'cash')),
  account_number text default '',
  balance numeric(12, 2) default 0,
  institution text default '',
  color text default 'emerald',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Transactions Table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  type text not null check (type in ('expense', 'income')),
  title text not null,
  amount numeric(12, 2) not null,
  category text not null,
  account_id uuid references public.accounts(id) on delete set null,
  payment_method text not null check (payment_method in ('upi', 'card', 'bank-transfer', 'cash')),
  date date not null default current_date,
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Budgets Table
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  category text not null,
  allocated numeric(12, 2) not null,
  period text default 'monthly',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Policies for public or authenticated user access
create policy "Allow all operations for development" on public.accounts
  for all using (true) with check (true);

create policy "Allow all operations for development" on public.transactions
  for all using (true) with check (true);

create policy "Allow all operations for development" on public.budgets
  for all using (true) with check (true);
