-- 1. Per-municipality admin mapping
CREATE TABLE public.ulb_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ulb_id uuid NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ulb_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ulb_admins TO authenticated;
GRANT ALL ON public.ulb_admins TO service_role;

ALTER TABLE public.ulb_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin manage ulb_admins" ON public.ulb_admins
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users view own ulb_admins" ON public.ulb_admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. Helper: may the current user manage this ULB?
CREATE OR REPLACE FUNCTION public.can_manage_ulb(_ulb_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (
        SELECT 1 FROM public.ulb_admins
        WHERE user_id = auth.uid() AND ulb_id = _ulb_id
      )
$$;

GRANT EXECUTE ON FUNCTION public.can_manage_ulb(uuid) TO authenticated;

-- 3. Domain -> ULB mapping
CREATE TABLE public.domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostname text NOT NULL UNIQUE,
  ulb_id uuid NOT NULL REFERENCES public.ulbs(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.domains TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.domains TO authenticated;
GRANT ALL ON public.domains TO service_role;

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view domains" ON public.domains
  FOR SELECT USING (true);

CREATE POLICY "Super admin manage domains" ON public.domains
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER domains_set_updated_at
  BEFORE UPDATE ON public.domains
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_domains_hostname ON public.domains (hostname);

-- 4. ULB-scoped write access for municipality admins
CREATE POLICY "ULB admin manage news" ON public.news
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage notices" ON public.notices
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage banners" ON public.banners
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage tenders" ON public.tenders
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage leadership" ON public.leadership
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage departments" ON public.departments
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage gallery" ON public.gallery
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage services_info" ON public.services_info
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage council_members" ON public.council_members
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage co_option_members" ON public.co_option_members
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage public_representatives" ON public.public_representatives
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin manage pages" ON public.pages
  FOR ALL TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

-- 5. Grievances: municipality admins may read + update their own ULB's complaints
CREATE POLICY "ULB admin view grievances" ON public.grievances
  FOR SELECT TO authenticated
  USING (public.can_manage_ulb(ulb_id));

CREATE POLICY "ULB admin update grievances" ON public.grievances
  FOR UPDATE TO authenticated
  USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));

-- 6. ULB profile: municipality admin may update their own row only
CREATE POLICY "ULB admin update own ulb" ON public.ulbs
  FOR UPDATE TO authenticated
  USING (public.can_manage_ulb(id)) WITH CHECK (public.can_manage_ulb(id));