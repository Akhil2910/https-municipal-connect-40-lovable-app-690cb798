
-- Roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Super admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ULBs
CREATE TABLE public.ulbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT DEFAULT 'Municipality',
  district TEXT,
  state TEXT DEFAULT 'Telangana',
  logo_url TEXT,
  hero_image_url TEXT,
  about TEXT,
  vision TEXT,
  mission TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  established_year INT,
  population INT,
  area_sqkm NUMERIC,
  primary_color TEXT DEFAULT '#0a5c36',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER ulbs_updated BEFORE UPDATE ON public.ulbs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.ulbs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view ulbs" ON public.ulbs FOR SELECT USING (true);
CREATE POLICY "Super admin manage ulbs" ON public.ulbs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- Generic content per ULB
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Super admin manage banners" ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view news" ON public.news FOR SELECT USING (is_published);
CREATE POLICY "Super admin manage news" ON public.news FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  file_url TEXT,
  notice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Super admin manage notices" ON public.notices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  head_name TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Super admin manage departments" ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  reference_no TEXT,
  file_url TEXT,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view tenders" ON public.tenders FOR SELECT USING (true);
CREATE POLICY "Super admin manage tenders" ON public.tenders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Super admin manage gallery" ON public.gallery FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.services_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  short_description TEXT,
  content TEXT,
  external_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ulb_id, slug)
);
ALTER TABLE public.services_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view services_info" ON public.services_info FOR SELECT USING (true);
CREATE POLICY "Super admin manage services_info" ON public.services_info FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  message TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view leadership" ON public.leadership FOR SELECT USING (true);
CREATE POLICY "Super admin manage leadership" ON public.leadership FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ulb_id UUID NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  ticket_no TEXT NOT NULL UNIQUE DEFAULT 'GRV-' || upper(substr(md5(random()::text),1,8)),
  citizen_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER grievances_updated BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit grievance" ON public.grievances FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admin view grievances" ON public.grievances FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Super admin update grievances" ON public.grievances FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Super admin delete grievances" ON public.grievances FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));

-- Seed 21 ULBs
INSERT INTO public.ulbs (slug, name, code) VALUES
('aliyadbad','Aliyadbad','302811'),
('asifabad','Asifabad','301596'),
('aswaraopeta','Aswaraopeta','302289'),
('bichkunda','Bichkunda','302728'),
('chevella','Chevella','302290'),
('devarakadara','Devarakadara','302291'),
('edulapuram','Edulapuram','302293'),
('gaddapotharam','Gaddapotharam','302294'),
('gummadidala','Gummadidala','302324'),
('indresham','Indresham','302732'),
('isnapur','Isnapur','302304'),
('jinnaram','Jinnaram','302736'),
('kalluru','Kalluru','302727'),
('kesamudram','Kesamudram','302303'),
('kohir','Kohir','302302'),
('maddur','Maddur','302301'),
('moinabad','Moinabad','302299'),
('muduchinthalapally','Muduchinthalapally','302710'),
('mulugu','Mulugu','302731'),
('station-ghanpur','Station Ghanpur','302292'),
('yellapet','Yellapet','302809');
