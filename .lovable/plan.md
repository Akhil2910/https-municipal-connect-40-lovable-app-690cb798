# Deployment readiness check: not yet ready

Short answer: the SQL files are ready, but the application code is not. Right now the app still talks to the Lovable-hosted backend for data, login and images. A plain PostgreSQL database on AWS RDS cannot answer those calls on its own.

## What is already done

- `deploy/schema.sql` — all tables, enums, functions, access rules
- `deploy/data.sql` — all 21 municipalities and their content
- `deploy/00-prereqs.sql` — roles and helpers needed on plain PostgreSQL
- `deploy/README.md` — EC2, Nginx, RDS, pgAdmin, SSL steps
- Host-based routing (one domain per municipality) and the admin/domain management screens

## What is still missing

1. **Data access** — 26 files call the hosted backend's REST API directly from the browser. On AWS these must go through server-side code that connects to RDS with a normal PostgreSQL connection.
2. **Login** — admin sign-in uses the hosted auth service. Needs to be replaced with our own email/password login (hashed passwords in the `admin_users` table, signed session cookie), keeping one super admin plus one admin per municipality.
3. **Image uploads** — the admin panel uploads to the hosted storage bucket. Needs to switch to the AWS S3 bucket.
4. **Build output** — the project currently builds for an edge runtime. It must build a plain Node.js server bundle so PM2 can run it on EC2.

## Plan to finish

1. Add a PostgreSQL connection layer (`pg` pool, `DATABASE_URL`) plus a small query helper, all server-side.
2. Convert every page and admin section from browser database calls to server functions that run those queries, keeping current behaviour and per-municipality scoping.
3. Implement own auth: password hashing, `/admin/login` server action, HTTP-only session cookie, super-admin vs municipality-admin permission checks on every write.
4. Switch uploads to S3 with a signed-URL server function; keep image URLs stored in the same columns.
5. Switch the build to a Node server target, add `.env.example` (DATABASE_URL, SESSION_SECRET, AWS keys, S3 bucket, Google Maps key) and PM2 config.
6. Update `deploy/README.md` for: run locally against local PostgreSQL first, then EC2 + RDS + S3, then give NIC the Elastic IP and map each domain in the Domains tab.
7. Regenerate `data.sql` with admin accounts using the new password hashes.

## Notes

- Faster alternative: run the self-hosted backend stack (Docker) on the EC2 box instead of steps 1-4; the database is still PostgreSQL on the same server, and almost no code changes are needed. Slower to operate, quicker to ship.
- Nothing about the current look, pages, or content changes in either path.
