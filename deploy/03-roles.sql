-- ============================================================
-- 03-roles.sql
-- Restores application roles and municipality mappings after GoTrue creates users.
-- Run AFTER:
--   schema.sql
--   data.sql
-- ============================================================

CREATE SCHEMA IF NOT EXISTS deployment;
CREATE TABLE IF NOT EXISTS deployment.auth_migration_backup (
    old_user_id uuid NOT NULL,
    email text NOT NULL,
    role text,
    ulb_id uuid,
    label text
);

-- Remove role assignments that point at IDs retired by the legacy-user migration.
DELETE FROM public.user_roles r
USING deployment.auth_migration_backup b
WHERE r.user_id = b.old_user_id;

-- Restore every assignment captured before legacy accounts were recreated.
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT au.id, b.role::public.app_role
FROM deployment.auth_migration_backup b
JOIN auth.users au ON lower(au.email) = b.email
WHERE b.role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.ulb_admins (user_id, ulb_id, label)
SELECT DISTINCT au.id, b.ulb_id, b.label
FROM deployment.auth_migration_backup b
JOIN auth.users au ON lower(au.email) = b.email
WHERE b.ulb_id IS NOT NULL
ON CONFLICT (user_id, ulb_id) DO UPDATE SET label = EXCLUDED.label;

-- Ensure the standard portal accounts always have their required assignments.

INSERT INTO public.user_roles (user_id, role)
SELECT
    id,
    'super_admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'superadmin@portal.local'
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
ON lower(au.email) =
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
ON lower(au.email) =
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

-- Repair administrator mappings that still reference retired GoTrue IDs.
-- First copy each orphaned mapping to the recreated user matched by the email
-- captured in deployment.auth_migration_backup. ON CONFLICT keeps this safe
-- when the restored mapping was already inserted above.
INSERT INTO public.ulb_admins (user_id, ulb_id, label)
SELECT DISTINCT
    au.id,
    a.ulb_id,
    COALESCE(a.label, b.label)
FROM public.ulb_admins a
JOIN deployment.auth_migration_backup b
  ON b.old_user_id = a.user_id
JOIN auth.users au
  ON lower(au.email) = lower(b.email)
LEFT JOIN auth.users existing_user
  ON existing_user.id = a.user_id
WHERE existing_user.id IS NULL
ON CONFLICT (user_id, ulb_id)
DO UPDATE SET label = COALESCE(EXCLUDED.label, public.ulb_admins.label);

-- The matching mappings now exist under their recreated user IDs. Remove the
-- retired rows, plus any orphan that has no backup/email match and therefore
-- cannot possibly satisfy the auth.users foreign key.
DELETE FROM public.ulb_admins a
WHERE NOT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = a.user_id
);

-- Refuse to create the constraint unless orphan cleanup is complete.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.ulb_admins a
        LEFT JOIN auth.users u ON u.id = a.user_id
        WHERE u.id IS NULL
    ) THEN
        RAISE EXCEPTION 'Cannot add ulb_admins_user_id_fkey: orphan administrator mappings remain';
    END IF;
END $$;

-- Existing installations did not always include this relationship. Add it
-- only after old IDs have been remapped to the recreated GoTrue users.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ulb_admins_user_id_fkey'
          AND conrelid = 'public.ulb_admins'::regclass
    ) THEN
        ALTER TABLE public.ulb_admins
            ADD CONSTRAINT ulb_admins_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Keep deployment.auth_migration_backup as an audit trail. Its unique index
-- makes repeated migrations idempotent and prevents duplicate backup rows.