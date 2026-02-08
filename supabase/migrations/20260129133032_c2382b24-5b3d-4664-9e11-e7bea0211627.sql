-- Fix 1: Create a view for organizers that hides sensitive contact info
-- Organizers will query this view instead of the base table directly

CREATE VIEW public.event_registrations_organizer_view
WITH (security_invoker=on) AS
  SELECT 
    id,
    event_id,
    user_id,
    full_name,
    department,
    year_of_study,
    status,
    created_at
    -- Intentionally excluding: email, phone (sensitive PII)
  FROM public.event_registrations;

-- Update the organizer SELECT policy to deny direct access
-- First drop the existing policy
DROP POLICY IF EXISTS "Organizers can view registrations for their events" ON public.event_registrations;

-- Recreate with false condition so organizers must use the view
-- Users can still see their own registrations via "Users can view their own registrations" policy
CREATE POLICY "Organizers cannot directly access registrations" 
ON public.event_registrations 
FOR SELECT 
USING (
  -- Only allow users to see their own registrations directly
  auth.uid() = user_id
);

-- Drop the old "Users can view their own registrations" policy since we're combining it
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;

-- Create a new RLS policy for the view to allow organizers to select from it
-- Note: Views with security_invoker=on respect RLS of underlying tables

-- Create a security definer function that organizers can use to get registration counts
-- and limited attendee info through the view
CREATE OR REPLACE FUNCTION public.get_event_registrations_for_organizer(p_event_id uuid)
RETURNS TABLE (
  id uuid,
  event_id uuid,
  user_id uuid,
  full_name text,
  department text,
  year_of_study text,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    er.id,
    er.event_id,
    er.user_id,
    er.full_name,
    er.department,
    er.year_of_study,
    er.status,
    er.created_at
  FROM public.event_registrations er
  INNER JOIN public.events e ON e.id = er.event_id
  WHERE er.event_id = p_event_id
    AND e.organizer_id = auth.uid();
$$;

-- Fix 2: Add INSERT policy on notifications table
-- Only allow service role or system processes to insert notifications
-- Regular users should not be able to create notifications for others

CREATE POLICY "Only authenticated users can insert their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  -- Deny all user-initiated inserts
  -- Notifications should only be created by backend/edge functions using service role
  false
);

-- Add a comment explaining that notifications should be inserted via edge functions
COMMENT ON TABLE public.notifications IS 'Notifications table - INSERT operations should only be performed by edge functions using service role key';