-- ============================================================
-- 03-roles.sql
-- Restores application roles and municipality mappings after GoTrue creates users.
-- Run AFTER:
--   schema.sql
--   data.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public._deployment_auth_migration_backup (
    old_user_id uuid NOT NULL,
    email text NOT NULL,
    role text,
    ulb_id uuid,
    label text
);

-- Remove mappings that point at IDs retired by the legacy-user migration.
DELETE FROM public.ulb_admins a
USING public._deployment_auth_migration_backup b
WHERE a.user_id = b.old_user_id;

-- Restore every assignment captured before legacy accounts were recreated.
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT au.id, b.role::public.app_role
FROM public._deployment_auth_migration_backup b
JOIN auth.users au ON lower(au.email) = b.email
WHERE b.role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.ulb_admins (user_id, ulb_id, label)
SELECT DISTINCT au.id, b.ulb_id, b.label
FROM public._deployment_auth_migration_backup b
JOIN auth.users au ON lower(au.email) = b.email
WHERE b.ulb_id IS NOT NULL
ON CONFLICT (user_id, ulb_id) DO UPDATE SET label = EXCLUDED.label;

-- Ensure the standard portal accounts always have their required assignments.

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

DROP TABLE public._deployment_auth_migration_backup;