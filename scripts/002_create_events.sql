-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date timestamp with time zone not null,
  location text,
  max_attendees integer,
  creator_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.events enable row level security;

-- RLS policies for events
create policy "events_select_all"
  on public.events for select
  using (true);

create policy "events_insert_own"
  on public.events for insert
  with check (auth.uid() = creator_id);

create policy "events_update_own"
  on public.events for update
  using (auth.uid() = creator_id);

create policy "events_delete_own"
  on public.events for delete
  using (auth.uid() = creator_id);
