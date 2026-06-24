-- ============================================================
-- CafePOS User Management Functions
-- Version: 1.0.0
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- Create user via RPC (bypasses RLS for admin operations)
CREATE OR REPLACE FUNCTION public.create_app_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT,
  p_outlet_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Only owner can create users
  IF public.get_user_role() != 'owner' THEN
    RAISE EXCEPTION 'Only owner can create users';
  END IF;

  -- Validate role
  IF p_role NOT IN ('owner', 'manager', 'cashier', 'barista', 'inventory_staff') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Create auth user using Supabase auth admin
  -- Note: This requires the service_role key to be available
  -- For now, we'll create the profile and let the owner create the auth user separately

  -- Insert user profile (will be linked when auth user is created)
  -- We use a generated UUID that will be used as the auth user ID
  v_user_id := gen_random_uuid();

  INSERT INTO public.user_profiles (id, name, role, outlet_id)
  VALUES (v_user_id, p_name, p_role, p_outlet_id);

  v_result := jsonb_build_object(
    'user_id', v_user_id,
    'email', p_email,
    'name', p_name,
    'role', p_role,
    'outlet_id', p_outlet_id
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user role and outlet
CREATE OR REPLACE FUNCTION public.update_app_user(
  p_user_id UUID,
  p_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_outlet_id UUID DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Only owner can update users
  IF public.get_user_role() != 'owner' THEN
    RAISE EXCEPTION 'Only owner can update users';
  END IF;

  -- Validate role if provided
  IF p_role IS NOT NULL AND p_role NOT IN ('owner', 'manager', 'cashier', 'barista', 'inventory_staff') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  UPDATE public.user_profiles SET
    name = COALESCE(p_name, name),
    role = COALESCE(p_role, role),
    outlet_id = COALESCE(p_outlet_id, outlet_id),
    is_active = COALESCE(p_is_active, is_active)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all users (Owner only)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  name TEXT,
  role TEXT,
  outlet_id UUID,
  outlet_name TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Only owner and manager can view all users
  IF public.get_user_role() NOT IN ('owner', 'manager') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    up.id,
    up.name,
    up.role,
    up.outlet_id,
    o.name as outlet_name,
    up.is_active,
    up.created_at
  FROM public.user_profiles up
  LEFT JOIN public.outlets o ON o.id = up.outlet_id
  ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
