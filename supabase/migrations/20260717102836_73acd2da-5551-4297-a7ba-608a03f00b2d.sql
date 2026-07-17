
-- Members tables
CREATE TABLE public.council_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ward TEXT,
  designation TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.council_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.council_members TO authenticated;
GRANT ALL ON public.council_members TO service_role;
ALTER TABLE public.council_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read council_members" ON public.council_members FOR SELECT USING (true);
CREATE POLICY "admin write council_members" ON public.council_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_council_members_updated BEFORE UPDATE ON public.council_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.co_option_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ward TEXT,
  designation TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.co_option_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.co_option_members TO authenticated;
GRANT ALL ON public.co_option_members TO service_role;
ALTER TABLE public.co_option_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read co_option_members" ON public.co_option_members FOR SELECT USING (true);
CREATE POLICY "admin write co_option_members" ON public.co_option_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_co_option_updated BEFORE UPDATE ON public.co_option_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.public_representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  designation TEXT,
  constituency TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.public_representatives TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_representatives TO authenticated;
GRANT ALL ON public.public_representatives TO service_role;
ALTER TABLE public.public_representatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read public_representatives" ON public.public_representatives FOR SELECT USING (true);
CREATE POLICY "admin write public_representatives" ON public.public_representatives FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_public_reps_updated BEFORE UPDATE ON public.public_representatives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Editable content pages (About sub-pages, etc.)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT,
  body TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ulb_id, slug)
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "admin write pages" ON public.pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for public-assets bucket (private bucket, but readable by anyone)
CREATE POLICY "public read public-assets" ON storage.objects FOR SELECT
  USING (bucket_id = 'public-assets');
CREATE POLICY "auth upload public-assets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'public-assets');
CREATE POLICY "auth update public-assets" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'public-assets');
CREATE POLICY "auth delete public-assets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'public-assets');
