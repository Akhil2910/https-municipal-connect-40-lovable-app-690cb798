
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.leadership ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS news_ulb_slug_uniq ON public.news (ulb_id, slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS notices_ulb_slug_uniq ON public.notices (ulb_id, slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS banners_ulb_slug_uniq ON public.banners (ulb_id, slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS tenders_ulb_slug_uniq ON public.tenders (ulb_id, slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS leadership_ulb_slug_uniq ON public.leadership (ulb_id, slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS departments_ulb_slug_uniq ON public.departments (ulb_id, slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS gallery_ulb_slug_uniq ON public.gallery (ulb_id, slug) WHERE slug IS NOT NULL;
