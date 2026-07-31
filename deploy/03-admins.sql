-- ============================================================
--  Creates the login accounts.
--  Run this AFTER schema.sql and data.sql.
--
--    Super admin : superadmin@portal.local / superadmin@321
--    Each ULB    : <slug>admin@portal.local / <slug>@123
--                  e.g. muluguadmin@portal.local / mulugu@123
--
--  Change the passwords below before going live.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- 1. Super admin (can manage all 21 municipalities) ----------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'superadmin@portal.local', crypt('superadmin@321', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::public.app_role
FROM auth.users u
WHERE u.email = 'superadmin@portal.local'
ON CONFLICT DO NOTHING;

-- ---------- 2. One admin per municipality ----------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
SELECT
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  lower(replace(ulbs.slug, '-', '')) || 'admin@portal.local',
  crypt(lower(replace(ulbs.slug, '-', '')) || '@123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
FROM public.ulbs
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'ulb_admin'::public.app_role
FROM auth.users u
JOIN public.ulbs s
  ON u.email = lower(replace(s.slug, '-', '')) || 'admin@portal.local'
ON CONFLICT DO NOTHING;

INSERT INTO public.ulb_admins (user_id, ulb_id, label)
SELECT u.id, s.id, s.name || ' Admin'
FROM auth.users u
JOIN public.ulbs s
  ON u.email = lower(replace(s.slug, '-', '')) || 'admin@portal.local'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ulb_admins a WHERE a.user_id = u.id AND a.ulb_id = s.id
);

-- ---------- 3. Show what was created ----------
SELECT u.email, r.role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
ORDER BY r.role, u.email;
