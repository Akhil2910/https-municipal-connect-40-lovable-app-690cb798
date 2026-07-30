# Host all 21 municipality sites on AWS (EC2 + RDS + S3)

One codebase, one EC2 server, 21 domains. Each domain opens its own municipality site automatically — the app already resolves the municipality from the incoming hostname.

## What you end up with

```text
21 domains ──> Route 53 / registrar DNS ──> Elastic IP
                                              │
                                        EC2 (Ubuntu)
                                    Nginx (SSL, 21 server blocks)
                                              │
                                     Node server (this app)
                                        │            │
                                  RDS Postgres    S3 bucket
                                  (all content)   (photos, PDFs)
```

Admin panel stays at `/admin` on every domain, managing all 21 from one login.

## Part 1 — Make the app run as a plain Node server

Today the app builds for an edge runtime. For an EC2 VM it must build a Node server bundle instead.

- Switch the build target from the Cloudflare preset to the Node preset.
- Produce `.output/server/index.mjs` plus static assets, started with `node .output/server/index.mjs` on port 3000.
- Move all runtime configuration to environment variables read inside server handlers (DB URL, S3 bucket, JWT secret) — no values baked into the build.
- Add `ecosystem.config.cjs` for PM2 so the app restarts on crash and on reboot.

## Part 2 — Replace the managed backend with RDS + S3

This is the largest piece of work. Today the browser talks directly to the managed backend, and access rules live in the database as row-level policies. With plain RDS there is no such client-facing API, so every read and write must move behind server functions on the EC2 box.

Work involved:

1. **Schema export.** Generate one SQL file creating all 15 tables (`ulbs`, `news`, `notices`, `tenders`, `departments`, `gallery`, `banners`, `pages`, `leadership`, `council_members`, `co_option_members`, `public_representatives`, `services_info`, `grievances`, plus admin users) and load it into RDS.
2. **Data export.** Dump all current rows (21 municipalities, councillors, news, gallery, pages) as INSERT statements and load them into RDS.
3. **Data layer.** Add a Postgres connection pool on the server and rewrite every database call in the ~24 files that currently query the managed client into server functions that run SQL against RDS. Public pages get read-only queries; admin pages get authenticated write queries.
4. **Auth.** Replace the hosted auth with an admin users table (email + bcrypt password hash) and an encrypted session cookie. `/admin/login` verifies the password server-side; every admin server function checks the session before writing. Row-level policies are replaced by this server-side check.
5. **File storage.** Replace the current storage bucket with an S3 bucket. Admin uploads go through a server function that returns a pre-signed PUT URL; the browser uploads directly to S3; public images are served from the bucket (optionally via CloudFront).
6. **Media migration.** Copy every existing uploaded image/PDF from the current storage into the S3 bucket and rewrite the stored URLs in the database.

## Part 3 — AWS infrastructure

- **EC2**: Ubuntu 22.04, t3.medium (2 vCPU / 4 GB) to start; t3.large if traffic grows. Elastic IP attached so the public IP never changes.
- **Security group**: inbound 80, 443 from anywhere; 22 restricted to your office/VPN IP.
- **RDS Postgres**: db.t3.small, 20 GB gp3, private subnet, automated daily backups, reachable only from the EC2 security group.
- **S3**: one bucket for all municipalities, keys prefixed per municipality (`mulugu/gallery/...`), public read on objects, CORS allowing the 21 domains.
- **Nginx**: reverse proxy to `127.0.0.1:3000`, one server block per domain, HTTP redirected to HTTPS.
- **SSL**: Certbot issues and auto-renews certificates for all 21 domains and their `www` variants.

## Part 4 — The 21 domains

Because routing is hostname-based, no per-domain code or per-domain deployment is needed.

1. Point each domain's A record (root and `www`) at the Elastic IP.
2. Confirm each domain name contains its municipality name — for example `mulugumunicipality.in` resolves to Mulugu. For any domain that does not, add a single line to the existing hostname map so it points at the right municipality.
3. Run Certbot once listing all 42 hostnames.
4. Verify each domain opens its own homepage.

## Part 5 — Handover package

- `deploy/README.md`: full server setup from a blank EC2 instance to live site.
- `deploy/schema.sql` and `deploy/data.sql`.
- `deploy/nginx.conf` template and the Certbot command.
- `.env.example` listing every required variable.
- Update/rollback steps: `git pull`, build, `pm2 reload`.

## Technical notes

- Google Maps calls need a Google Cloud API key owned by your department, restricted to the 21 domains.
- The weather panel calls an external API from the server — the EC2 instance needs outbound internet (NAT or public subnet).
- Once the app runs against RDS, the Lovable preview here will no longer show live data unless it is also pointed at RDS. Recommended: finish content entry on the current backend first, then migrate.
- Rough AWS cost: EC2 t3.medium ~$30/mo, RDS db.t3.small ~$25/mo, S3 + transfer ~$5/mo, Elastic IP free while attached — roughly $60-70/month plus domain fees.

## Suggested order

1. Node build target + PM2 config (app runs on a VM at all).
2. RDS schema and data migration.
3. Data layer and auth rewrite.
4. S3 storage and media migration.
5. EC2 + Nginx + SSL + the 21 domains.
6. Handover docs.

Steps 1-4 are code changes I can do here. Step 5 runs in your AWS account using the scripts and docs from step 6.
