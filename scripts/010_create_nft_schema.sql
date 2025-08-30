-- Create NFT tickets table
CREATE TABLE IF NOT EXISTS nft_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    token_id BIGINT NOT NULL, -- NFT token ID on blockchain
    contract_address TEXT NOT NULL, -- Smart contract address
    owner_wallet_address TEXT NOT NULL, -- Current owner's wallet
    owner_user_id UUID REFERENCES auth.users(id), -- Link to user if they have an account
    metadata_uri TEXT, -- IPFS URI for NFT metadata
    is_used BOOLEAN DEFAULT FALSE, -- Whether ticket has been used for entry
    used_at TIMESTAMP WITH TIME ZONE,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contract_address, token_id)
);

-- Create marketplace listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nft_ticket_id UUID NOT NULL REFERENCES nft_tickets(id) ON DELETE CASCADE,
    seller_wallet_address TEXT NOT NULL,
    seller_user_id UUID REFERENCES auth.users(id),
    price_wei TEXT NOT NULL, -- Price in wei (string to handle big numbers)
    price_eth DECIMAL(18,8) NOT NULL, -- Price in ETH for display
    currency TEXT DEFAULT 'ETH', -- Currency type
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NFT transactions table
CREATE TABLE IF NOT EXISTS nft_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nft_ticket_id UUID NOT NULL REFERENCES nft_tickets(id) ON DELETE CASCADE,
    transaction_hash TEXT NOT NULL UNIQUE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'transfer', 'sale', 'burn')),
    from_wallet_address TEXT,
    to_wallet_address TEXT NOT NULL,
    price_wei TEXT, -- Only for sales
    price_eth DECIMAL(18,8), -- Only for sales
    block_number BIGINT,
    gas_used BIGINT,
    gas_price_wei TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nft_tickets_event_id ON nft_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_nft_tickets_owner_wallet ON nft_tickets(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_tickets_owner_user ON nft_tickets(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_transactions_hash ON nft_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_nft_transactions_ticket ON nft_transactions(nft_ticket_id);

-- Enable RLS on all tables
ALTER TABLE nft_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nft_tickets
CREATE POLICY "Users can view all NFT tickets" ON nft_tickets FOR SELECT USING (true);
CREATE POLICY "Users can insert NFT tickets they own" ON nft_tickets FOR INSERT 
    WITH CHECK (auth.uid() = owner_user_id OR owner_wallet_address IS NOT NULL);
CREATE POLICY "Users can update their own NFT tickets" ON nft_tickets FOR UPDATE 
    USING (auth.uid() = owner_user_id);

-- RLS Policies for marketplace_listings
CREATE POLICY "Users can view all marketplace listings" ON marketplace_listings FOR SELECT USING (true);
CREATE POLICY "Users can create their own listings" ON marketplace_listings FOR INSERT 
    WITH CHECK (auth.uid() = seller_user_id);
CREATE POLICY "Users can update their own listings" ON marketplace_listings FOR UPDATE 
    USING (auth.uid() = seller_user_id);
CREATE POLICY "Users can delete their own listings" ON marketplace_listings FOR DELETE 
    USING (auth.uid() = seller_user_id);

-- RLS Policies for nft_transactions
CREATE POLICY "Users can view all NFT transactions" ON nft_transactions FOR SELECT USING (true);
CREATE POLICY "System can insert NFT transactions" ON nft_transactions FOR INSERT USING (true);
CREATE POLICY "System can update NFT transactions" ON nft_transactions FOR UPDATE USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_nft_tickets_updated_at BEFORE UPDATE ON nft_tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
</sql>
