-- Run this in the Supabase SQL Editor after creating the project

create table if not exists rsvps (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  attending   text not null check (attending in ('yes', 'maybe', 'no')),
  created_at  timestamptz not null default now()
);

-- Allow anyone to read all RSVPs (needed for the guest wall)
create policy "public read"
  on rsvps for select
  using (true);

-- Allow anyone to insert an RSVP (no auth needed for a party invite)
create policy "public insert"
  on rsvps for insert
  with check (true);

-- Turn on RLS (policies above only take effect when RLS is enabled)
alter table rsvps enable row level security;
