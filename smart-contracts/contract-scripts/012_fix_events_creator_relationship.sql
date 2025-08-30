-- Fix the events table to properly reference profiles instead of auth.users
-- and add the missing foreign key constraint

-- First, update existing events to ensure creator_id matches profile id
-- (This assumes creator_id currently contains auth.users.id values)
UPDATE public.events 
SET creator_id = profiles.id 
FROM public.profiles 
WHERE events.creator_id = profiles.id;

-- Drop the old foreign key constraint
ALTER TABLE public.events 
DROP CONSTRAINT IF EXISTS events_creator_id_fkey;

-- Add the new foreign key constraint to profiles table
ALTER TABLE public.events 
ADD CONSTRAINT events_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update RLS policies to work with profiles
DROP POLICY IF EXISTS "events_insert_own" ON public.events;
DROP POLICY IF EXISTS "events_update_own" ON public.events;
DROP POLICY IF EXISTS "events_delete_own" ON public.events;

-- Create new RLS policies that work with profiles
CREATE POLICY "events_insert_own"
  ON public.events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = events.creator_id 
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "events_update_own"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = events.creator_id 
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "events_delete_own"
  ON public.events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = events.creator_id 
      AND profiles.id = auth.uid()
    )
  );
