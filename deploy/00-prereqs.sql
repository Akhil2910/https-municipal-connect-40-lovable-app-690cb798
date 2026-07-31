-- Run this FIRST on a plain PostgreSQL (RDS or local) server, before schema.sql.
-- The dump was taken from a Postgres that had Supabase's auth schema and roles.
-- These objects recreate the minimum the schema/policies depend on.

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

CREATE SCHEMA IF NOT EXISTS auth;

-- Minimal users table (the app's own auth layer writes into this on AWS).
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Current user id for RLS; the app sets it per request:
--   SELECT set_config('request.jwt.claim.sub', '<user-uuid>', true);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
