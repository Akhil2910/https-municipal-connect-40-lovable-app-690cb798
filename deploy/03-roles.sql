-- Assign application authorization after deploy/create-users.mjs has created
-- accounts through GoTrue's supported Admin API. This file never modifies
-- GoTrue-managed auth records.

BEGIN;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'superadmin@portal.local'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin'::public.app_role
FROM auth.users AS au
JOIN public.ulbs AS u
  ON lower(au.email) = lower(replace(u.slug, '-', '')) || 'admin@portal.local'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.ulb_admins (user_id, ulb_id, label)
SELECT au.id, u.id, u.name || ' Admin'
FROM auth.users AS au
JOIN public.ulbs AS u
  ON lower(au.email) = lower(replace(u.slug, '-', '')) || 'admin@portal.local'
ON CONFLICT (user_id, ulb_id) DO UPDATE
SET label = EXCLUDED.label;

COMMIT;

SELECT
  (SELECT count(*) FROM public.user_roles WHERE role = 'super_admin') AS super_admin_roles,
  (SELECT count(*) FROM public.user_roles WHERE role = 'admin') AS municipality_admin_roles,
  (SELECT count(*) FROM public.ulb_admins) AS municipality_mappings;