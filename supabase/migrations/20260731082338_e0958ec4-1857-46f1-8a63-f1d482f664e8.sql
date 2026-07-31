UPDATE public.ulbs SET hero_image_url = '/uploads/asifabad-hero-2.jpg' WHERE hero_image_url LIKE '%asifabad-hero-2.jpg%';
UPDATE public.ulbs SET hero_image_url = '/uploads/aswaraopet-hero.jpg' WHERE hero_image_url LIKE '%aswaraopet-hero.jpg%';
UPDATE public.ulbs SET hero_image_url = '/uploads/asifabad-hero.webp' WHERE hero_image_url LIKE '%asifabad-hero.webp%';
UPDATE public.ulbs SET logo_url = regexp_replace(logo_url, '^/__l5e/assets-v1/[^/]+/', '/uploads/') WHERE logo_url LIKE '/__l5e/%';
UPDATE public.pages SET image_url = regexp_replace(image_url, '^/__l5e/assets-v1/[^/]+/', '/uploads/') WHERE image_url LIKE '/__l5e/%';
UPDATE public.gallery SET image_url = regexp_replace(image_url, '^/__l5e/assets-v1/[^/]+/', '/uploads/') WHERE image_url LIKE '/__l5e/%';