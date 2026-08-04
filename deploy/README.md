# Municipal Portal production deployment

This package deploys the existing portal on AWS EC2 using Node.js, Nginx,
Docker, PostgreSQL 16, GoTrue, Kong, PostgREST and Storage API. One installation
serves every municipality; hostname mappings select the site.

## Authentication design

Authentication users are created only through GoTrue's supported Admin API.
No deployment SQL inserts into `auth.users` or `auth.identities`, and no SQL
hashes passwords. SQL is limited to the application schema, municipality data,
roles, mappings and permissions.

Deployment order:

```text
docker compose up
  -> deploy/01-schema.sql
  -> deploy/02-seed.sql
  -> deploy/create-users.mjs (GoTrue Admin API)
  -> deploy/03-roles.sql
  -> deploy/verify-deployment.mjs
```

## 1. Requirements

- Ubuntu 24.04 LTS EC2 instance, recommended `t3.large`, 50 GB disk
- Elastic IP
- Node.js 20 or newer
- Docker Engine with Docker Compose
- Git, Nginx and PM2
- Ports 22, 80 and 443 open; keep 5432 and 8000 private in production

Install server tools:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo npm install -g pm2
exit
```

Reconnect by SSH after `exit` so Docker group membership is active.

## 2. Get and configure the project

```bash
git clone https://github.com/<your-user>/<your-repository>.git municipal-portal
cd municipal-portal
npm install
cp deploy/.env.example .env
bash deploy/generate-keys.sh
nano .env
```

Copy all four generated key lines into `.env`. Set a strong
`POSTGRES_PASSWORD`. Keep all existing environment variable names unchanged.

For local setup, keep `SUPABASE_URL` and `VITE_SUPABASE_URL` as
`http://localhost:8000`. On EC2, use the API domain such as
`https://api.example.gov.in`; before HTTPS/DNS is ready you may temporarily use
`http://<ELASTIC-IP>:8000`.

For local storage, keep `STORAGE_BACKEND=file`. For S3, set:

```dotenv
STORAGE_BACKEND=s3
AWS_REGION=ap-south-1
AWS_S3_BUCKET=<bucket-name>
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
```

Never commit `.env`.

## 3. Fresh or repeat deployment

Run from the project root:

```bash
npm run deploy:backend
```

On a fresh database this creates the schema and loads all existing
municipality, gallery, department, notice, tender, council, chairperson, media
and public representative data. On an initialized database it preserves current
data, skips existing users, creates only missing users, re-applies missing
roles/mappings, and verifies every login.

Expected final output includes:

```text
✓ Super Admin exists
✓ Municipality Admins exist
✓ Super Admin login succeeds
✓ Mulugu Admin login succeeds
✓ All 21 municipality logins succeed
Deployment verification passed.
```

## 4. Accounts

- Super Admin: `superadmin@portal.local` / `superadmin@321`
- Municipality email: `<slug-without-hyphens>admin@portal.local`
- Municipality password: `<slug-without-hyphens>@123`

Examples:

- `muluguadmin@portal.local` / `mulugu@123`
- `kohiradmin@portal.local` / `kohir@123`
- `stationghanpuradmin@portal.local` / `stationghanpur@123`

Existing accounts are never duplicated or overwritten. To provision missing
accounts only:

```bash
npm run deploy:users
npm run deploy:roles
npm run deploy:verify
```

## 5. Manual deployment order

Use this only when diagnosing an individual step:

```bash
docker compose -f deploy/docker-compose.yml --env-file .env up -d
docker exec -i portal-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < deploy/01-schema.sql
docker exec -i portal-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < deploy/02-seed.sql
npm run deploy:users
npm run deploy:roles
npm run deploy:verify
```

`01-schema.sql` and `02-seed.sql` are fresh-database files. Do not manually run
them on a populated database. The automated command detects an initialized
schema and safely skips them.

## 6. Build and start the website

```bash
npm run build:node
pm2 start "npm run start" --name portal
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup`, then check:

```bash
curl -I http://localhost:3000
```

## 7. Nginx, domains and HTTPS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/portal
sudo nano /etc/nginx/sites-available/portal
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/portal
sudo nginx -t && sudo systemctl reload nginx
```

Add all municipality hostnames to `server_name`, including `www` names, and
configure the API hostname to proxy to port 8000. Point every DNS A record at
the EC2 Elastic IP.

Install certificates after DNS resolves:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.gov.in -d www.example.gov.in -d api.example.gov.in
```

Add each domain in Admin -> Domains so it maps to the correct municipality.

## 8. pgAdmin through an SSH tunnel

Do not expose PostgreSQL port 5432 publicly. In pgAdmin create a server with:

- Connection host: `localhost`
- Port: `5432`
- Database: `postgres`
- Username: `postgres`
- Password: the `.env` value of `POSTGRES_PASSWORD`
- SSH tunnel host: the EC2 Elastic IP
- SSH port: `22`
- SSH username: `ubuntu`
- Identity file: the EC2 `.pem` key

## 9. Updating an existing deployment

Back up first:

```bash
docker exec portal-db pg_dump -U postgres -d postgres > ~/portal-backup-$(date +%F-%H%M).sql
```

Then update:

```bash
cd ~/municipal-portal
git pull
npm install
npm run deploy:backend
npm run build:node
pm2 restart portal
```

The backend deployment preserves initialized content and only repairs missing
auth users, roles or mappings.

## 10. Verification and troubleshooting

Run the complete verifier at any time:

```bash
npm run deploy:verify
```

Inspect services:

```bash
docker compose -f deploy/docker-compose.yml --env-file .env ps
docker compose -f deploy/docker-compose.yml --env-file .env logs --tail=100 auth kong db rest storage
pm2 logs portal --lines 100
```

If login returns 400, do not insert or update auth tables with SQL. Run:

```bash
npm run deploy:users
npm run deploy:roles
npm run deploy:verify
```

If a user already exists with an unknown password, this utility intentionally
does not overwrite it. Update or recreate that user through a supported GoTrue
Admin API operation, then rerun verification.

If `.env` API URLs change, rebuild because Vite embeds the browser URL:

```bash
npm run build:node
pm2 restart portal
```

## 11. Rollback

Keep a database backup and the previous Git commit/build before deployment. To
roll back application code:

```bash
cd ~/municipal-portal
git checkout <previous-known-good-commit>
npm install
npm run build:node
pm2 restart portal
```

To restore a database backup, stop write-capable services first:

```bash
docker compose -f deploy/docker-compose.yml --env-file .env stop auth rest storage
cat ~/portal-backup-YYYY-MM-DD-HHMM.sql | docker exec -i portal-db psql -U postgres -d postgres
docker compose -f deploy/docker-compose.yml --env-file .env start auth rest storage
npm run deploy:verify
```

Do not delete `db-data` or `storage-data` during a normal code rollback.

## 12. Deployment files

| File | Purpose |
|---|---|
| `01-schema.sql` | Application tables, functions, RLS and permissions |
| `02-seed.sql` | All existing municipality and website content |
| `create-users.mjs` | Idempotent GoTrue Admin API user provisioning |
| `03-roles.sql` | Idempotent application roles and ULB mappings |
| `verify-deployment.mjs` | Database, role, mapping and real login checks |
| `deploy.sh` | Complete backend deployment orchestrator |
| `docker-compose.yml` | PostgreSQL, GoTrue, PostgREST, Storage and Kong |
| `kong.yml` | Backend route configuration |
| `04-domains.sql` | Optional SQL hostname mappings |
| `nginx.conf` | Public web/API reverse proxy |
| `NIC-DNS.md` | Domain/IP worksheet |