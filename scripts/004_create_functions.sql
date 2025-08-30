-- Function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Extract alias from user metadata or generate a default one
  insert into public.profiles (id, alias)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'alias',
      'user_' || substr(new.id::text, 1, 8)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to generate sequential token numbers
create or replace function public.generate_token_number(event_uuid uuid)
returns integer
language plpgsql
security definer
as $$
declare
  next_number integer;
begin
  select coalesce(max(token_number), 0) + 1
  into next_number
  from public.tokens
  where event_id = event_uuid;
  
  return next_number;
end;
$$;

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add updated_at triggers
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row
  execute function public.handle_updated_at();

create trigger tokens_updated_at
  before update on public.tokens
  for each row
  execute function public.handle_updated_at();
