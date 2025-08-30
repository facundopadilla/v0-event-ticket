-- Add NFT-related fields to events table
ALTER TABLE events 
ADD COLUMN nft_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN nft_price DECIMAL(18,8) DEFAULT 0,
ADD COLUMN nft_supply INTEGER DEFAULT 0,
ADD COLUMN nft_contract_address TEXT,
ADD COLUMN nft_minted_count INTEGER DEFAULT 0;

-- Add index for NFT-enabled events
CREATE INDEX idx_events_nft_enabled ON events(nft_enabled) WHERE nft_enabled = TRUE;

-- Add constraint to ensure NFT price is positive when NFTs are enabled
ALTER TABLE events 
ADD CONSTRAINT check_nft_price_positive 
CHECK (NOT nft_enabled OR (nft_enabled AND nft_price > 0));

-- Add constraint to ensure NFT supply is positive when NFTs are enabled
ALTER TABLE events 
ADD CONSTRAINT check_nft_supply_positive 
CHECK (NOT nft_enabled OR (nft_enabled AND nft_supply > 0));
