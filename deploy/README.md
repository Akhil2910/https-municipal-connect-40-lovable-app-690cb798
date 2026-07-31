# Deployment Guide — Telangana ULB Portal (21 municipalities)

Three parts:
1. Get the code into Git (GitHub)
2. Host it on AWS (EC2 + Nginx + RDS PostgreSQL + S3)
3. Connect to the database from pgAdmin on your own machine

---

## Part 1 — Push the code to Git

### Option A (recommended) — from Lovable
1. In the editor, click the **+** button next to the chat input (bottom-left).
2. Choose **GitHub → Connect project**.
3. Authorize the Lovable GitHub App and pick the account/organisation (e.g. the department's GitHub org).
4. Click **Create Repository**. The full codebase is pushed automatically.
5. From then on it is two-way: edits here push to GitHub, pushes to GitHub sync back here.

### Option B — manual, from your machine
```bash
# after downloading the codebase zip from the editor (Download codebase)
cd municipal-portal
git init
git add .
git commit -m "Initial commit: Telangana ULB portal"
git branch -M main
git remote add origin https://github.com/<org>/<repo>.git
git push -u origin main
```

### Everyday Git commands
```bash
git pull origin main          # get latest
git checkout -b feature/xyz   # new branch
git add . && git commit -m "message"
git push origin feature/xyz   # then open a Pull Request
```

`.env` must never be committed. Keep a `.env.example` with variable names only.

---

## Part 2 — Host on AWS

Target architecture:

```text
  21 domains (NIC)  ->  A record  ->  Elastic IP
                                        |
                                   EC2 (Ubuntu)
                                   Nginx :80/:443
                                        |
                                Node app :3000 (PM2)
                                     /        \
                            RDS PostgreSQL    S3 bucket
                            (private subnet)  (images/PDFs)
```

### Step 1 — Create the RDS PostgreSQL database
1. AWS Console → **RDS → Create database**.
2. Engine: **PostgreSQL 16**. Template: Production (or Dev/Test to save cost).
3. Instance: `db.t3.small`, Storage 20 GB gp3.
4. DB identifier: `ulb-portal-db`; Master username: `ulbadmin`; set a strong master password and store it safely.
5. Connectivity: same VPC as the EC2 instance, **Public access = No** (see Part 3 for pgAdmin access via SSH tunnel).
6. Create a security group `rds-sg` allowing inbound **TCP 5432 only from the EC2 security group**.
7. Note the endpoint: `ulb-portal-db.xxxxx.ap-south-1.rds.amazonaws.com`.

### Step 2 — Create the S3 bucket
1. **S3 → Create bucket**, name `ulb-portal-media`, region `ap-south-1`.
2. Block all public access **on**; serve files through the app/CloudFront or pre-signed URLs.
3. Add CORS on the bucket so browser uploads work:
```json
[{"AllowedHeaders":["*"],"AllowedMethods":["GET","PUT"],"AllowedOrigins":["https://*.telangana.gov.in"],"ExposeHeaders":["ETag"]}]
```
4. **IAM → Users → Create user** `ulb-portal-app`, attach a policy allowing `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on that bucket only. Save the access key and secret.

### Step 3 — Launch the EC2 instance
1. **EC2 → Launch instance**: Ubuntu 24.04 LTS, `t3.medium`, 30 GB gp3.
2. Create/download a key pair `ulb-portal.pem`.
3. Security group `web-sg`: inbound **22 (your office IP only)**, **80**, **443** from anywhere.
4. **Elastic IP → Allocate → Associate** with this instance. **This fixed IP is what you give NIC.**

### Step 4 — Prepare the server
```bash
ssh -i ulb-portal.pem ubuntu@<ELASTIC_IP>

sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql-client git
sudo npm install -g pm2
curl -fsSL https://bun.sh/install | bash && source ~/.bashrc
```

### Step 5 — Deploy the app
```bash
cd /var/www
sudo git clone https://github.com/<org>/<repo>.git ulb-portal
sudo chown -R ubuntu:ubuntu ulb-portal
cd ulb-portal
bun install

nano .env      # see variables below
bun run build
pm2 start ".output/server/index.mjs" --name ulb-portal
pm2 save && pm2 startup     # run the command it prints
```

`.env` on the server:
```bash
DATABASE_URL=postgresql://ulbadmin:<password>@ulb-portal-db.xxxxx.ap-south-1.rds.amazonaws.com:5432/postgres
SESSION_SECRET=<64-char random string>
S3_BUCKET=ulb-portal-media
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
GOOGLE_MAPS_API_KEY=...
PORT=3000
```

### Step 6 — Load the database
```bash
psql "$DATABASE_URL" -f deploy/00-prereqs.sql
psql "$DATABASE_URL" -f deploy/schema.sql
psql "$DATABASE_URL" -f deploy/data.sql
```

- `00-prereqs.sql` — creates the `auth` schema, `auth.users`, `auth.uid()` and the
  `anon` / `authenticated` / `service_role` roles that the policies reference. Run it first on any
  plain PostgreSQL (RDS or local).
- `schema.sql` — all tables, enums, functions, grants and row-level-security policies.
- `data.sql` — every current row (21 municipalities, council/co-option members, news, notices,
  tenders, gallery, pages, domains) as `INSERT` statements.

Re-export at any time from a machine that can reach the current database:
```bash
pg_dump "$SOURCE_URL" --schema=public --schema-only --no-owner --no-privileges > deploy/schema.sql
pg_dump "$SOURCE_URL" --schema=public --data-only  --no-owner --column-inserts > deploy/data.sql
```

### Step 7 — Nginx + SSL
`/etc/nginx/sites-available/ulb-portal`:
```nginx
server {
    listen 80;
    server_name mulugumunicipality.telangana.gov.in www.mulugumunicipality.telangana.gov.in
                asifabadmunicipality.telangana.gov.in www.asifabadmunicipality.telangana.gov.in;
                # ... add all 21 domains and their www variants

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;              # required: the app routes by hostname
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/ulb-portal /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx     # select all listed domains; auto-renew is installed
```

### Step 8 — Give each domain to each municipality
1. Give NIC the **Elastic IP**; they create an A record for each domain (root + `www`) pointing at it.
2. Log in at `https://<any-domain>/admin/login` as the super admin.
3. Open the **Domains** tab → enter hostname → pick the municipality → **Add domain**.
4. Visit the domain — it opens that municipality's homepage at `/`. No redeploy needed per domain.

### Redeploying after a code change
```bash
cd /var/www/ulb-portal && git pull && bun install && bun run build && pm2 restart ulb-portal
```

---

## Part 3 — Connect to the database from pgAdmin on your PC

RDS sits in a private subnet, so connect through an SSH tunnel via the EC2 instance. This is the secure, recommended way.

### Option A — SSH tunnel inside pgAdmin (easiest)
1. Open pgAdmin → right-click **Servers → Register → Server**.
2. **General** tab → Name: `ULB Portal RDS`.
3. **Connection** tab:
   - Host: the RDS endpoint, `ulb-portal-db.xxxxx.ap-south-1.rds.amazonaws.com`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `ulbadmin`
   - Password: the RDS master password (tick *Save password*)
4. **SSH Tunnel** tab:
   - Use SSH tunnelling: **Yes**
   - Tunnel host: `<ELASTIC_IP>`  ·  Tunnel port: `22`
   - Username: `ubuntu`
   - Authentication: **Identity file** → select `ulb-portal.pem`
5. **Save**. The tree expands and you can browse `public` → Tables.

> On Windows, if pgAdmin rejects the `.pem`: right-click the file → Properties → Security → Advanced → disable inheritance, remove all users except your own.

### Option B — manual tunnel, then a plain connection
```bash
ssh -i ulb-portal.pem -L 5433:ulb-portal-db.xxxxx.ap-south-1.rds.amazonaws.com:5432 ubuntu@<ELASTIC_IP> -N
```
Leave that terminal open, then in pgAdmin connect to Host `localhost`, Port `5433`, user `ulbadmin`.

### Option C — direct access (only if policy allows)
1. RDS → Modify → **Public access: Yes**.
2. In `rds-sg`, add inbound TCP 5432 from **your office public IP /32 only** — never `0.0.0.0/0`.
3. Connect pgAdmin straight to the RDS endpoint, no tunnel.

### Connecting to local PostgreSQL (development)
Host `localhost`, Port `5432`, user `postgres`, database `ulb_portal`:
```bash
createdb ulb_portal
psql -d ulb_portal -f deploy/00-prereqs.sql
psql -d ulb_portal -f deploy/schema.sql
psql -d ulb_portal -f deploy/data.sql
```
Then set `DATABASE_URL=postgresql://postgres:<pwd>@localhost:5432/ulb_portal` in your local `.env` and run `bun run dev`.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| pgAdmin "timeout expired" | Security group doesn't allow 5432 from EC2, or the SSH tunnel isn't running |
| pgAdmin "no pg_hba.conf entry" | Set SSL mode to `require` (or append `?sslmode=require`) |
| Domain shows the wrong municipality | Hostname not added in the admin **Domains** tab, or `proxy_set_header Host $host;` missing in Nginx |
| 502 Bad Gateway | Node process down — `pm2 logs ulb-portal`, then `pm2 restart ulb-portal` |
| Certbot fails | The domain's A record isn't pointing at the Elastic IP yet — wait for DNS propagation |
| Uploads fail in the browser | S3 bucket CORS missing the site origin |

## Rough monthly cost (ap-south-1)
EC2 t3.medium ~$30 · RDS db.t3.small ~$25 · storage/S3/backups ~$8 · Elastic IP free while attached → **≈ $60–70/month**
