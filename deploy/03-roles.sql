-- ============================================================
-- 03-admins.sql
-- Creates Super Admin and Municipality Admin accounts
-- Run AFTER:
--   schema.sql
--   data.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- SUPER ADMIN
-- ============================================================

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'superadmin@portal.local',
    crypt('superadmin@321', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
WHERE NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email='superadmin@portal.local'
);

INSERT INTO public.user_roles (user_id, role)
SELECT
    id,
    'super_admin'::public.app_role
FROM auth.users
WHERE email='superadmin@portal.local'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================
-- CREATE ONE LOGIN FOR EVERY MUNICIPALITY
-- ============================================================

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',

    lower(replace(u.slug,'-','')) || 'admin@portal.local',

    crypt(
        lower(replace(u.slug,'-','')) || '@123',
        gen_salt('bf')
    ),

    now(),
    now(),
    now(),

    '{"provider":"email","providers":["email"]}',
    '{}'

FROM public.ulbs u

WHERE NOT EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.email =
        lower(replace(u.slug,'-','')) || 'admin@portal.local'
);

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