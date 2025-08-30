-- Create tokens table
create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  token_number integer not null,
  is_used boolean default false,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique token numbers per event
  unique(event_id, token_number)
);

-- Enable RLS
alter table public.tokens enable row level security;

-- RLS policies for tokens
create policy "tokens_select_own"
  on public.tokens for select
  using (auth.uid() = owner_id);

create policy "tokens_select_event_creator"
  on public.tokens for select
  using (
    auth.uid() in (
      select creator_id from public.events where id = tokens.event_id
    )
  );

create policy "tokens_insert_event_creator"
  on public.tokens for insert
  with check (
    auth.uid() in (
      select creator_id from public.events where id = tokens.event_id
    )
  );

create policy "tokens_update_own"
  on public.tokens for update
  using (auth.uid() = owner_id);

create policy "tokens_update_event_creator"
  on public.tokens for update
  using (
    auth.uid() in (
      select creator_id from public.events where id = tokens.event_id
    )
  );

create policy "tokens_delete_event_creator"
  on public.tokens for delete
  using (
    auth.uid() in (
      select creator_id from public.events where id = tokens.event_id
    )
  );
