create extension if not exists pgcrypto;

create table if not exists public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  name text not null,
  category text,
  claimed_by text,
  is_complete boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.trip_notes (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  title text,
  content text not null,
  added_by text,
  created_at timestamptz default now()
);

create table if not exists public.trip_events (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  day_key text not null,
  title text not null,
  notes text,
  added_by text,
  created_at timestamptz default now()
);

alter table public.trip_items enable row level security;
alter table public.trip_notes enable row level security;
alter table public.trip_events enable row level security;

create policy "public trip items read"
on public.trip_items for select
using (true);

create policy "public trip items write"
on public.trip_items for all
using (true)
with check (true);

create policy "public trip notes read"
on public.trip_notes for select
using (true);

create policy "public trip notes write"
on public.trip_notes for all
using (true)
with check (true);

create policy "public trip events read"
on public.trip_events for select
using (true);

create policy "public trip events write"
on public.trip_events for all
using (true)
with check (true);
