-- ==============================================================================
-- SpendWise Phase 3: Bank Account Connectivity Migration
-- Migration: 002_bank_connections.sql
-- Target: Supabase PostgreSQL (public schema)
--
-- Security & RBI Regulatory Compliance:
--   - Compliant with RBI Account Aggregator (AA) data model.
--   - Stores ONLY masked identifiers, consent IDs, and sync timestamps.
--   - NEVER stores banking passwords, ATM PINs, UPI PINs, or OTPs.
--   - Protected by Row Level Security (RLS) tied to auth.uid().
-- ==============================================================================

-- 1. Bank Connections Table
create table if not exists public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'account_aggregator', -- e.g. 'setu_aa', 'finvu', 'onemoney'
  institution_name text not null,                     -- e.g. 'HDFC Bank', 'State Bank of India'
  institution_logo text,
  masked_account_number text not null,                -- e.g. '•••• 4821'
  account_type text not null default 'savings',       -- 'savings', 'current', 'credit_card'
  consent_id text,                                    -- RBI AA Consent Artifact Reference
  consent_status text not null default 'active' check (consent_status in ('pending', 'active', 'revoked', 'expired')),
  linked_account_id uuid references public.accounts(id) on delete set null,
  bank_reported_balance numeric(12, 2),               -- Real-time balance as reported by the bank
  balance_as_of timestamp with time zone,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_bank_connections_user_id on public.bank_connections(user_id);
create index if not exists idx_bank_connections_consent on public.bank_connections(consent_id);

-- 2. Add bank synchronization metadata to transactions table if not present
alter table public.transactions
  add column if not exists external_reference text,
  add column if not exists is_imported boolean default false;

-- Create unique index to prevent duplicate transaction imports
create unique index if not exists idx_transactions_user_external_ref
  on public.transactions(user_id, external_reference)
  where external_reference is not null;

-- 3. Enable RLS on bank_connections
alter table public.bank_connections enable row level security;

-- Policies for bank_connections
drop policy if exists "Bank connections select owned" on public.bank_connections;
create policy "Bank connections select owned" on public.bank_connections
  for select using (auth.uid() = user_id);

drop policy if exists "Bank connections insert owned" on public.bank_connections;
create policy "Bank connections insert owned" on public.bank_connections
  for insert with check (auth.uid() = user_id);

drop policy if exists "Bank connections update owned" on public.bank_connections;
create policy "Bank connections update owned" on public.bank_connections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Bank connections delete owned" on public.bank_connections;
create policy "Bank connections delete owned" on public.bank_connections
  for delete using (auth.uid() = user_id);
