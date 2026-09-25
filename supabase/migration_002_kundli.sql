-- Run this once in Supabase's SQL editor for each environment (dev + prod).

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  dob date,
  birth_time text,
  birth_time_unknown boolean default false,
  birth_place text,
  hand_shape text,
  seed integer,
  language text default 'en',
  teaser_text text,
  full_text text,
  full_text_en text,
  paid boolean default false,
  razorpay_order_id text,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id),
  name text,
  contact text,
  interest text default 'mahadasha',
  created_at timestamptz default now()
);
