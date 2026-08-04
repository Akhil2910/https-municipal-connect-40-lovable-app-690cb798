--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = off;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

-- Self-hosted prerequisites. GoTrue creates auth.users; this file never writes
-- to GoTrue-managed auth tables.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS public;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'super_admin',
    'admin'
);


--
-- Name: can_manage_ulb(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_manage_ulb(_ulb_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (
        SELECT 1 FROM public.ulb_admins
        WHERE user_id = auth.uid() AND ulb_id = _ulb_id
      )
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    title text,
    subtitle text,
    image_url text NOT NULL,
    link_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text
);


--
-- Name: co_option_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.co_option_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    name text NOT NULL,
    ward text,
    designation text,
    phone text,
    email text,
    photo_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: council_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.council_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    name text NOT NULL,
    ward text,
    designation text,
    phone text,
    email text,
    photo_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    name text NOT NULL,
    head_name text,
    description text,
    phone text,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text
);


--
-- Name: domains; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domains (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hostname text NOT NULL,
    ulb_id uuid NOT NULL,
    is_primary boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    image_url text NOT NULL,
    caption text,
    category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text
);


--
-- Name: grievances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grievances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    ticket_no text DEFAULT ('GRV-'::text || upper(substr(md5((random())::text), 1, 8))) NOT NULL,
    citizen_name text NOT NULL,
    phone text NOT NULL,
    email text,
    category text NOT NULL,
    description text NOT NULL,
    address text,
    status text DEFAULT 'open'::text NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leadership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leadership (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    photo_url text,
    message text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text
);


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    title text NOT NULL,
    summary text,
    body text,
    image_url text,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text
);


--
-- Name: notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    title text NOT NULL,
    category text,
    file_url text,
    notice_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text
);


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    slug text NOT NULL,
    title text,
    body text,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: public_representatives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_representatives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    name text NOT NULL,
    designation text,
    constituency text,
    phone text,
    email text,
    photo_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: services_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    icon text,
    short_description text,
    content text,
    external_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tenders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ulb_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    reference_no text,
    file_url text,
    published_date date DEFAULT CURRENT_DATE NOT NULL,
    last_date date,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text
);


--
-- Name: ulb_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ulb_admins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ulb_id uuid NOT NULL,
    label text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ulbs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ulbs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    code text,
    type text DEFAULT 'Municipality'::text,
    district text,
    state text DEFAULT 'Telangana'::text,
    logo_url text,
    hero_image_url text,
    about text,
    vision text,
    mission text,
    address text,
    phone text,
    email text,
    website text,
    established_year integer,
    population integer,
    area_sqkm numeric,
    primary_color text DEFAULT '#0a5c36'::text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: co_option_members co_option_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.co_option_members
    ADD CONSTRAINT co_option_members_pkey PRIMARY KEY (id);


--
-- Name: council_members council_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.council_members
    ADD CONSTRAINT council_members_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: domains domains_hostname_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_hostname_key UNIQUE (hostname);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: gallery gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery
    ADD CONSTRAINT gallery_pkey PRIMARY KEY (id);


--
-- Name: grievances grievances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_pkey PRIMARY KEY (id);


--
-- Name: grievances grievances_ticket_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_ticket_no_key UNIQUE (ticket_no);


--
-- Name: leadership leadership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leadership
    ADD CONSTRAINT leadership_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: pages pages_ulb_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_ulb_id_slug_key UNIQUE (ulb_id, slug);


--
-- Name: public_representatives public_representatives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_representatives
    ADD CONSTRAINT public_representatives_pkey PRIMARY KEY (id);


--
-- Name: services_info services_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_info
    ADD CONSTRAINT services_info_pkey PRIMARY KEY (id);


--
-- Name: services_info services_info_ulb_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_info
    ADD CONSTRAINT services_info_ulb_id_slug_key UNIQUE (ulb_id, slug);


--
-- Name: tenders tenders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenders
    ADD CONSTRAINT tenders_pkey PRIMARY KEY (id);


--
-- Name: ulb_admins ulb_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ulb_admins
    ADD CONSTRAINT ulb_admins_pkey PRIMARY KEY (id);


--
-- Name: ulb_admins ulb_admins_user_id_ulb_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ulb_admins
    ADD CONSTRAINT ulb_admins_user_id_ulb_id_key UNIQUE (user_id, ulb_id);


--
-- Name: ulbs ulbs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ulbs
    ADD CONSTRAINT ulbs_pkey PRIMARY KEY (id);


--
-- Name: ulbs ulbs_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ulbs
    ADD CONSTRAINT ulbs_slug_key UNIQUE (slug);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: banners_ulb_slug_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX banners_ulb_slug_uniq ON public.banners USING btree (ulb_id, slug) WHERE (slug IS NOT NULL);


--
-- Name: departments_ulb_slug_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX departments_ulb_slug_uniq ON public.departments USING btree (ulb_id, slug) WHERE (slug IS NOT NULL);


--
-- Name: gallery_ulb_slug_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gallery_ulb_slug_uniq ON public.gallery USING btree (ulb_id, slug) WHERE (slug IS NOT NULL);


--
-- Name: idx_domains_hostname; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_domains_hostname ON public.domains USING btree (hostname);


--
-- Name: leadership_ulb_slug_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX leadership_ulb_slug_uniq ON public.leadership USING btree (ulb_id, slug) WHERE (slug IS NOT NULL);


--
-- Name: news_ulb_slug_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_ulb_slug_uniq ON public.news USING btree (ulb_id, slug) WHERE (slug IS NOT NULL);


--
-- Name: notices_ulb_slug_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX notices_ulb_slug_uniq ON public.notices USING btree (ulb_id, slug) WHERE (slug IS NOT NULL);


--
-- Name: tenders_ulb_slug_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tenders_ulb_slug_uniq ON public.tenders USING btree (ulb_id, slug) WHERE (slug IS NOT NULL);


--
-- Name: domains domains_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER domains_set_updated_at BEFORE UPDATE ON public.domains FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: grievances grievances_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER grievances_updated BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: co_option_members trg_co_option_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_co_option_updated BEFORE UPDATE ON public.co_option_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: council_members trg_council_members_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_council_members_updated BEFORE UPDATE ON public.council_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: pages trg_pages_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: public_representatives trg_public_reps_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_public_reps_updated BEFORE UPDATE ON public.public_representatives FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: ulbs ulbs_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ulbs_updated BEFORE UPDATE ON public.ulbs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: banners banners_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: co_option_members co_option_members_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.co_option_members
    ADD CONSTRAINT co_option_members_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: council_members council_members_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.council_members
    ADD CONSTRAINT council_members_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: departments departments_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: domains domains_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: gallery gallery_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery
    ADD CONSTRAINT gallery_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: grievances grievances_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: leadership leadership_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leadership
    ADD CONSTRAINT leadership_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: news news_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: notices notices_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: pages pages_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: public_representatives public_representatives_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_representatives
    ADD CONSTRAINT public_representatives_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: services_info services_info_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services_info
    ADD CONSTRAINT services_info_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: tenders tenders_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenders
    ADD CONSTRAINT tenders_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: ulb_admins ulb_admins_ulb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ulb_admins
    ADD CONSTRAINT ulb_admins_ulb_id_fkey FOREIGN KEY (ulb_id) REFERENCES public.ulbs(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: grievances Anyone submit grievance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone submit grievance" ON public.grievances FOR INSERT WITH CHECK (true);


--
-- Name: banners Public view banners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view banners" ON public.banners FOR SELECT USING (true);


--
-- Name: departments Public view departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view departments" ON public.departments FOR SELECT USING (true);


--
-- Name: domains Public view domains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view domains" ON public.domains FOR SELECT USING (true);


--
-- Name: gallery Public view gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view gallery" ON public.gallery FOR SELECT USING (true);


--
-- Name: leadership Public view leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view leadership" ON public.leadership FOR SELECT USING (true);


--
-- Name: news Public view news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view news" ON public.news FOR SELECT USING (is_published);


--
-- Name: notices Public view notices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view notices" ON public.notices FOR SELECT USING (true);


--
-- Name: services_info Public view services_info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view services_info" ON public.services_info FOR SELECT USING (true);


--
-- Name: tenders Public view tenders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view tenders" ON public.tenders FOR SELECT USING (true);


--
-- Name: ulbs Public view ulbs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view ulbs" ON public.ulbs FOR SELECT USING (true);


--
-- Name: grievances Super admin delete grievances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin delete grievances" ON public.grievances FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: banners Super admin manage banners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage banners" ON public.banners TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: departments Super admin manage departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage departments" ON public.departments TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: domains Super admin manage domains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage domains" ON public.domains TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: gallery Super admin manage gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage gallery" ON public.gallery TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: leadership Super admin manage leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage leadership" ON public.leadership TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: news Super admin manage news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage news" ON public.news TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: notices Super admin manage notices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage notices" ON public.notices TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: services_info Super admin manage services_info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage services_info" ON public.services_info TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: tenders Super admin manage tenders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage tenders" ON public.tenders TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: ulb_admins Super admin manage ulb_admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage ulb_admins" ON public.ulb_admins TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: ulbs Super admin manage ulbs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin manage ulbs" ON public.ulbs TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: grievances Super admin update grievances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin update grievances" ON public.grievances FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: grievances Super admin view grievances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admin view grievances" ON public.grievances FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: user_roles Super admins manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: banners ULB admin manage banners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage banners" ON public.banners TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: co_option_members ULB admin manage co_option_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage co_option_members" ON public.co_option_members TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: council_members ULB admin manage council_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage council_members" ON public.council_members TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: departments ULB admin manage departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage departments" ON public.departments TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: gallery ULB admin manage gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage gallery" ON public.gallery TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: leadership ULB admin manage leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage leadership" ON public.leadership TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: news ULB admin manage news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage news" ON public.news TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: notices ULB admin manage notices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage notices" ON public.notices TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: pages ULB admin manage pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage pages" ON public.pages TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: public_representatives ULB admin manage public_representatives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage public_representatives" ON public.public_representatives TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: services_info ULB admin manage services_info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage services_info" ON public.services_info TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: tenders ULB admin manage tenders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin manage tenders" ON public.tenders TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: grievances ULB admin update grievances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin update grievances" ON public.grievances FOR UPDATE TO authenticated USING (public.can_manage_ulb(ulb_id)) WITH CHECK (public.can_manage_ulb(ulb_id));


--
-- Name: ulbs ULB admin update own ulb; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin update own ulb" ON public.ulbs FOR UPDATE TO authenticated USING (public.can_manage_ulb(id)) WITH CHECK (public.can_manage_ulb(id));


--
-- Name: grievances ULB admin view grievances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "ULB admin view grievances" ON public.grievances FOR SELECT TO authenticated USING (public.can_manage_ulb(ulb_id));


--
-- Name: user_roles Users view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: ulb_admins Users view own ulb_admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own ulb_admins" ON public.ulb_admins FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: co_option_members admin write co_option_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write co_option_members" ON public.co_option_members TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: council_members admin write council_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write council_members" ON public.council_members TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: pages admin write pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write pages" ON public.pages TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: public_representatives admin write public_representatives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write public_representatives" ON public.public_representatives TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));


--
-- Name: banners; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

--
-- Name: co_option_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.co_option_members ENABLE ROW LEVEL SECURITY;

--
-- Name: council_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.council_members ENABLE ROW LEVEL SECURITY;

--
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: domains; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

--
-- Name: grievances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

--
-- Name: leadership; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;

--
-- Name: news; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

--
-- Name: notices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

--
-- Name: pages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

--
-- Name: public_representatives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.public_representatives ENABLE ROW LEVEL SECURITY;

--
-- Name: co_option_members read co_option_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read co_option_members" ON public.co_option_members FOR SELECT USING (true);


--
-- Name: council_members read council_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read council_members" ON public.council_members FOR SELECT USING (true);


--
-- Name: pages read pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read pages" ON public.pages FOR SELECT USING (true);


--
-- Name: public_representatives read public_representatives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read public_representatives" ON public.public_representatives FOR SELECT USING (true);


--
-- Name: services_info; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services_info ENABLE ROW LEVEL SECURITY;

--
-- Name: tenders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;

--
-- Name: ulb_admins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ulb_admins ENABLE ROW LEVEL SECURITY;

--
-- Name: ulbs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ulbs ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Data API privileges. RLS policies above remain the authorization boundary.
-- Public reads and grievance submission require anon access; authenticated
-- users receive CRUD privileges constrained by their role/ULB policies.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

--
-- PostgreSQL database dump complete
--


