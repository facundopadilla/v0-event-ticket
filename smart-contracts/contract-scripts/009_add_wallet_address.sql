-- Add wallet_address column to profiles table for MetaMask integration
alter table public.profiles 
add column if not exists wallet_address text unique;

-- Add index for wallet address lookups
create index if not exists idx_profiles_wallet_address 
on public.profiles(wallet_address) 
where wallet_address is not null;

-- Add comment for documentation
comment on column public.profiles.wallet_address is 'Ethereum wallet address for Web3 authentication';
