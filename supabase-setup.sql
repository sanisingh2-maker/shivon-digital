-- Run this script in Supabase Dashboard > SQL Editor.
-- The public website can INSERT bookings only. It cannot read or update them.
-- Only authenticated users explicitly listed in admin_users can view/update bookings.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  booking_id text not null unique default ('SD-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10))),
  created_at timestamptz not null default now(),
  service text not null check (service in ('Social Media Marketing')),
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 80),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  business_name text check (business_name is null or char_length(business_name) <= 120),
  details text not null check (char_length(trim(details)) between 10 and 1500),
  budget text check (budget is null or budget in ('₹3,000 से कम','₹3,000–₹10,000','₹10,000–₹25,000','₹25,000 से अधिक')),
  status text not null default 'new' check (status in ('new','contacted','in_progress','completed','cancelled'))
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
alter table public.admin_users enable row level security;

-- Anonymous/public visitors may submit a booking, but cannot read booking rows.
drop policy if exists "public can submit booking" on public.bookings;
create policy "public can submit booking" on public.bookings
  for insert to anon, authenticated
  with check (
    service = 'Social Media Marketing'
    and char_length(trim(customer_name)) between 2 and 80
    and phone ~ '^[6-9][0-9]{9}$'
    and char_length(trim(details)) between 10 and 1500
  );

-- Admins can read bookings only if their authenticated user ID is allow-listed.
drop policy if exists "admins can read bookings" on public.bookings;
create policy "admins can read bookings" on public.bookings
  for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "admins can update bookings" on public.bookings;
create policy "admins can update bookings" on public.bookings
  for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- Do not create a public SELECT policy for admin_users.
-- Add the admin user using the SQL below after creating that user in Supabase Auth:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'YOUR-ADMIN-EMAIL-HERE';
