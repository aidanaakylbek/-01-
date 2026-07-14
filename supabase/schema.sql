create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  grade text,
  initials text,
  role text not null default 'student',
  telegram_parent_verified boolean not null default false,
  subscription_status text not null default 'inactive'
    check (subscription_status in ('inactive', 'active', 'expired', 'cancelled')),
  subscription_plan text check (subscription_plan in ('monthly', 'three_months', 'yearly')),
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  diagnostic_completed boolean not null default false,
  diagnostic_score integer,
  diagnostic_weak_topics text[],
  mentor_style text not null default 'friendly'
    check (mentor_style in ('soft', 'strict', 'friendly', 'olympiad')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  phone_verified boolean not null default false,
  telegram_chat_id text,
  telegram_connected boolean not null default false,
  telegram_verified_at timestamptz,
  invite_code text not null unique,
  last_report_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  student_name text,
  student_email text,
  parent_phone text,
  plan_key text not null check (plan_key in ('monthly', 'three_months', 'yearly')),
  plan_name text not null,
  amount integer not null,
  currency text not null default 'KZT',
  payment_method text not null check (payment_method in ('kaspi_pay', 'kaspi_red', 'kaspi_0_0_12')),
  status text not null default 'pending'
    check (status in ('pending', 'invoice_sent', 'approved', 'rejected', 'expired')),
  kaspi_invoice_reference text,
  kaspi_payment_link text,
  admin_note text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  rejected_at timestamptz
);

create table if not exists public.weekly_report_deliveries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  week_key text not null,
  sent_at timestamptz not null default now(),
  unique (student_id, week_key)
);

create index if not exists parents_student_id_idx on public.parents(student_id);
create index if not exists parents_invite_code_idx on public.parents(invite_code);
create index if not exists payment_requests_user_id_idx on public.payment_requests(user_id);
