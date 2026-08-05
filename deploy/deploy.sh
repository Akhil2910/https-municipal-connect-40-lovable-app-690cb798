#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env. Copy deploy/.env.example to .env and configure it first." >&2
  exit 1
fi

echo "Starting PostgreSQL and backend services..."
docker compose -f deploy/docker-compose.yml --env-file .env up -d

echo "Waiting for PostgreSQL and GoTrue..."
for attempt in $(seq 1 60); do
  if docker exec portal-db pg_isready -U postgres >/dev/null 2>&1 && \
     curl --silent --fail "http://localhost:8000/auth/v1/health" >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" == "60" ]]; then
    echo "Backend did not become ready. Run docker compose logs." >&2
    exit 1
  fi
  sleep 2
done

if ! docker exec portal-db psql -U postgres -d postgres -Atqc "SELECT to_regclass('public.ulbs') IS NOT NULL" | grep -qx t; then
  docker exec -i portal-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < deploy/01-schema.sql
  docker exec -i portal-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < deploy/02-seed.sql
else
  echo "Schema and municipality data already exist; preserving current data."
fi

echo "Checking for legacy SQL-created authentication users..."
# The migration stages public assignments, normalizes malformed legacy string
# fields so GoTrue can read every row, and removes portal users via Admin API.
SUPABASE_URL=http://localhost:8000 node --env-file=.env deploy/migrate-legacy-users.mjs

echo "Provisioning portal users through the GoTrue Admin API..."
SUPABASE_URL=http://localhost:8000 node --env-file=.env deploy/create-users.mjs

echo "Restoring roles and municipality mappings..."
docker exec -i portal-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < deploy/03-roles.sql

echo "Verifying users, assignments, and real password logins..."
SUPABASE_URL=http://localhost:8000 node --env-file=.env deploy/verify-deployment.mjs