-- Add display_name column to profiles table
ALTER TABLE profiles ADD COLUMN display_name TEXT;

-- Update existing profiles to use alias as display_name
UPDATE profiles SET display_name = alias WHERE display_name IS NULL;
