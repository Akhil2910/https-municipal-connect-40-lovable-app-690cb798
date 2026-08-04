-- ============================================================
-- 03-roles.sql
-- Restores application roles and municipality mappings after GoTrue creates users.
-- Run AFTER:
--   schema.sql
--   data.sql
-- ============================================================

-- ============================================================
-- SUPER ADMIN
-- ============================================================

INSERT INTO public.user_roles (user_id, role)
SELECT
    id,
    'super_admin'::public.app_role
FROM auth.users
WHERE email='superadmin@portal.local'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================
-- ASSIGN ADMIN ROLE
-- ============================================================

INSERT INTO public.user_roles (user_id, role)
SELECT
    au.id,
    'admin'::public.app_role
FROM auth.users au
JOIN public.ulbs u
ON au.email =
    lower(replace(u.slug,'-','')) || 'admin@portal.local'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================
-- MAP ADMIN TO MUNICIPALITY
-- ============================================================

INSERT INTO public.ulb_admins
(
    user_id,
    ulb_id,
    label
)
SELECT
    au.id,
    u.id,
    u.name || ' Admin'
FROM auth.users au
JOIN public.ulbs u
ON au.email =
    lower(replace(u.slug,'-','')) || 'admin@portal.local'
ON CONFLICT (user_id, ulb_id)
DO NOTHING;

-- ============================================================
-- VERIFY
-- ============================================================

SELECT
    u.email,
    r.role
FROM auth.users u
LEFT JOIN public.user_roles r
ON r.user_id=u.id
ORDER BY
    r.role,
    u.email;