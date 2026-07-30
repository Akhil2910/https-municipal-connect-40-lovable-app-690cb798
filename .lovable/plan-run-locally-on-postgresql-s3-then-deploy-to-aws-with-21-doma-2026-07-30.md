# Run locally on PostgreSQL + S3, then deploy to AWS with 21 domains

Same codebase, same pages, same admin panel. Nothing about the site structure, layout, or existing content changes — only the backend it talks to and how it is run.

Order of work: make it run on your own PostgreSQL + S3 locally first, verify everything, then deploy the exact same build to an AWS EC2 instance, give NIC the public IP, and map each domain they issue to one municipality.

## Part 1 — Local: PostgreSQL instead of the hosted backend

- Add a PostgreSQL connection pool on the server, configured by `DATABASE_URL` in `.env`.
- Export the current schema (all existing tables: `ulbs`, `news`, `notices`, `tenders`, `departments`, `gallery`, `banners`, `pages`, `leadership`, `council_members`, `co_option_members`, `public_representatives`, `services_info`, `grievances`) to `deploy/schema.sql` — column-for-column identical, so no page changes.
- Export all current rows to `deploy/data.sql` (21 municipalities, all councillors, news, gallery, pages).
- Move every database call in the page and admin files behind server functions that run SQL against PostgreSQL. Each page keeps the exact same data shape it renders today.
- `bun install`, load the two SQL files into local Postgres, `bun run dev` — full site running on your machine with your own database.

## Part 2 — Two levels of admin

New `admin_users` table: email, password hash, role (`super_admin` or `ulb_admin`), and `ulb_id` (empty for super admin).

- **Super admin** — one account. Sees the municipality dropdown, can manage all 21, can create and delete municipality admins, and owns the domain mapping screen.
- **Municipality admin** — one account per municipality. Logs in at the same `/admin/login`, no dropdown; the panel is locked to their own municipality. Every save is checked server-side against their `ulb_id`, so one municipality's admin can never edit another's content.

Login verifies the password on the server and issues an encrypted session cookie. Existing admin screens stay as they are; they just receive a scoped municipality list.

## Part 3 — File storage on S3

- Replace the current storage bucket with one S3 bucket, keys prefixed per municipality (`mulugu/gallery/...`).
- Admin upload asks the server for a pre-signed upload URL, browser uploads straight to S3, the public URL is saved in the database — same upload button, same behaviour.
- Existing uploaded images and PDFs are copied into the bucket and their URLs updated in the database.
- Locally this works against the real S3 bucket using credentials in `.env`, so the upload path is proven before deployment.

## Part 4 — Deploy to AWS

- Build a plain Node server bundle (instead of the current edge build) started with `node .output/server/index.mjs` on port 3000, kept alive by PM2.
- EC2 Ubuntu instance with an **Elastic IP** — this is the fixed public IP you give NIC.
- Nginx in front on ports 80/443, proxying to the Node process; Certbot for SSL.
- RDS PostgreSQL in a private subnet, reachable only from the EC2 instance; the same `schema.sql` and `data.sql` load into it.
- Suggested size: EC2 t3.medium, RDS db.t3.small, 20 GB storage.

## Part 5 — Giving each domain to each municipality

New `domains` table: hostname, municipality, primary flag. A **Domain Mapping** screen in the super admin panel lets you add a row like `mulugumunicipality.telangana.gov.in → Mulugu`.

How it works end to end:

```text
Visitor opens mulugumunicipality.telangana.gov.in
        │
NIC DNS: A record -> your Elastic IP
        │
Nginx on EC2 (one certificate covering all 21 hostnames)
        │
App reads the Host header, looks it up in the domains table
        │
Serves the Mulugu site at "/"
```

Steps once NIC issues the domains:

1. Give NIC the Elastic IP; they point each domain's A record (root and `www`) at it.
2. In the super admin Domain Mapping screen, add each hostname and pick its municipality. No code change, no redeploy per domain.
3. Add the hostnames to the Nginx server block and run Certbot once for all of them.
4. Open each domain and confirm it lands on the right municipality homepage.

Until a domain is mapped, the site still works at `/mulugu`, `/asifabad`, etc., so nothing breaks while NIC processes the requests.

## Technical notes

- Everything in Parts 1-3 is code I write here; the app still runs in this preview during the work, pointed at whichever database is configured.
- `.env.example` will list every variable: `DATABASE_URL`, `SESSION_SECRET`, `S3_BUCKET`, `S3_REGION`, AWS keys, `GOOGLE_MAPS_API_KEY`.
- Google Maps needs a department-owned API key restricted to the 21 domains.
- `deploy/README.md` will contain the full local setup and the blank-EC2-to-live-site steps, so your team can rebuild it without me.
- Rough AWS cost: about $60-70/month for EC2 + RDS + S3.

## Build order

1. PostgreSQL schema, data export, and data layer (runs locally).
2. Admin users table, login, and super admin / municipality admin scoping.
3. S3 uploads and media migration.
4. Domains table and the Domain Mapping screen.
5. Node build target, PM2 config, Nginx template, and the deployment README.
