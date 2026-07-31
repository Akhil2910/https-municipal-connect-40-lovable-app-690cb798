# Production Deployment Package for AWS + PostgreSQL

Goal: everything needed to take this project from Lovable to a live AWS server running PostgreSQL, written so a complete beginner can follow it step by step.

## Key decision: how the backend runs on AWS

The app talks to its backend through a Supabase-style client used in 26 files (auth, row-level security, storage, all the admin CRUD screens). Two ways to run that on AWS:

- **Recommended — self-hosted Supabase on the EC2 server (Docker).** The database *is* PostgreSQL 16; Supabase is just the API, auth and storage layer sitting on top. Zero application code rewrites, all data stays on your server, admin logins and RLS keep working exactly as they do now.
- Alternative — bare AWS RDS PostgreSQL with no Supabase layer. This means rewriting all 26 data files, replacing auth with custom session cookies, and rebuilding storage on S3. Weeks of work and a much higher chance of bugs.

This plan uses the recommended path: **PostgreSQL on the server, via the self-hosted Supabase stack**, with the option to point it at AWS RDS later by changing one connection string.

## What gets built

### 1. Node.js production build (code change)
The project currently builds for Cloudflare's edge runtime, which cannot run on EC2.
- Switch the Vite build target to the Node server preset and remove the Cloudflare plugin/`wrangler.jsonc` from the production path
- Add `npm run start` that boots the built Node server on port 3000
- Confirm the build output runs locally before touching AWS

### 2. Environment configuration
- `deploy/.env.example` listing every variable with plain-English notes: database URL, Supabase URL and keys, Google Maps key, session secret
- Clear marking of which values are safe to share and which are secret

### 3. Docker Compose backend
- `deploy/docker-compose.yml` running PostgreSQL 16, Supabase auth/API/storage, and an S3-compatible storage target
- Storage configured to use **AWS S3** for uploaded photos (hero images, member photos, gallery), with a local-disk fallback for testing

### 4. Database setup
The three SQL files already exist and stay as-is, loaded in order:
1. `deploy/00-prereqs.sql` — roles and `auth.uid()`
2. `deploy/schema.sql` — tables, functions, RLS policies
3. `deploy/data.sql` — all 21 municipalities and their current content
Plus a script that recreates the super admin and the 21 municipality admin logins.

### 5. Nginx + HTTPS
- `deploy/nginx.conf` accepting all 21 municipality domains plus their `www` versions, forwarding the original `Host` header so hostname routing picks the right municipality
- Certbot command covering every hostname on one certificate, with auto-renewal

### 6. Static IP and DNS for NIC
- Elastic IP allocation and attachment steps (one fixed public IP for all 21 sites)
- `deploy/NIC-DNS.md` — a fill-in table: every domain, `A @` and `A www`, all pointing at the same Elastic IP

### 7. The beginner guide
`deploy/README.md` rewritten as a numbered, no-assumptions walkthrough:
- Part 1: run it on your own laptop first (install Node, install Docker, load the database, open the site)
- Part 2: put the code on GitHub
- Part 3: create the AWS account pieces — EC2 instance, Elastic IP, S3 bucket, security group — with exactly which buttons to click
- Part 4: copy the code up, run the backend, start the app with PM2 so it restarts on reboot
- Part 5: Nginx, domains, HTTPS
- Part 6: connect pgAdmin from your own computer through an SSH tunnel
- Part 7: how to update the site later, take backups, and what to check when something breaks
Every step states what you should see when it worked, and what to do if you see an error instead.

## Notes

- No changes to any page, design, or admin screen — this is packaging and configuration only.
- Suggested server size: 4 vCPU / 8 GB RAM Ubuntu 24.04, which comfortably handles 21 low-traffic municipal sites.
- The hostname-to-municipality mapping and the Super Admin "Domains" tab already exist and need no changes.
