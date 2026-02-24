-- RPC function for account self-deletion.
-- Runs as SECURITY DEFINER so it can delete from auth.users,
-- but auth.uid() ensures the user can only delete themselves.
-- Called from the client via supabase.rpc('delete_own_auth_user').

CREATE OR REPLACE FUNCTION public.delete_own_auth_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Only authenticated users can call this
REVOKE ALL ON FUNCTION public.delete_own_auth_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_auth_user() TO authenticated;
