-- ============================================================
--  OPTIONAL: map each municipality to its own domain name.
--  You can also do this from the website: Admin -> Domains tab.
--  Replace the example hostnames with your real ones, then run this file.
-- ============================================================

INSERT INTO public.domains (hostname, ulb_id, is_primary)
SELECT h.hostname, s.id, true
FROM (VALUES
  ('mulugumunicipality.in',       'mulugu'),
  ('www.mulugumunicipality.in',   'mulugu')
  -- add one line per domain, ending each line except the last with a comma
) AS h(hostname, slug)
JOIN public.ulbs s ON s.slug = h.slug
ON CONFLICT (hostname) DO UPDATE SET ulb_id = EXCLUDED.ulb_id;

SELECT d.hostname, s.name FROM public.domains d JOIN public.ulbs s ON s.id = d.ulb_id ORDER BY s.name;
