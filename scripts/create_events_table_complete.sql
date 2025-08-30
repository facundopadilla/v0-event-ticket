-- Create events table with all necessary columns
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL, -- Alias for title for compatibility
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200) NOT NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    max_attendees INTEGER NOT NULL DEFAULT 100,
    
    -- NFT/Ticket related fields
    nft_enabled BOOLEAN DEFAULT false,
    ticket_price_usd DECIMAL(10,2), -- Price in USD
    nft_supply INTEGER, -- Number of NFT tickets available
    max_tickets INTEGER, -- Alias for nft_supply for compatibility
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_creator_id_idx ON events(creator_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_nft_enabled_idx ON events(nft_enabled);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Users can view all events
CREATE POLICY "Users can view all events" ON events
    FOR SELECT
    USING (true);

-- Users can insert their own events
CREATE POLICY "Users can create events" ON events
    FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

-- Users can update their own events
CREATE POLICY "Users can update own events" ON events
    FOR UPDATE
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Users can delete their own events
CREATE POLICY "Users can delete own events" ON events
    FOR DELETE
    USING (auth.uid() = creator_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
