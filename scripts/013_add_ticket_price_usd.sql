-- Add ticket_price_usd column to events table
ALTER TABLE events ADD COLUMN ticket_price_usd DECIMAL(10,2);

-- Add comment to explain the column
COMMENT ON COLUMN events.ticket_price_usd IS 'Ticket price in US Dollars';

-- Optionally set a default value for existing events (if any)
-- UPDATE events SET ticket_price_usd = 0.00 WHERE ticket_price_usd IS NULL;
