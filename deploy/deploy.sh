#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env. Copy deploy/.env.example to .env and configure it first." >&2
  exit 1
fi

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

SUPABASE_URL=http://localhost:8000 node --env-file=.env deploy/migrate-legacy-users.mjs
SUPABASE_URL=http://localhost:8000 node --env-file=.env deploy/create-users.mjs
docker exec -i portal-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < deploy/03-roles.sql
SUPABASE_URL=http://localhost:8000 node --env-file=.env deploy/verify-deployment.mjs