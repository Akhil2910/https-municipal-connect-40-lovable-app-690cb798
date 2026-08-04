# How to put the Municipal Portal online (step-by-step)

This guide assumes you have never done this before. Follow the parts in order.
Every step says **what you should see** when it worked.

Words used here:
- **Terminal** - the black window where you type commands. On Windows use "PowerShell",
  on Mac use "Terminal".
- **Server** - a computer in the cloud (AWS) that stays on all the time.
- **Domain** - a web address like `mulugumunicipality.in`.

What we are building:

```text
   visitor's browser
          |
     [ your domain ]
          |
   AWS server (one computer, one fixed IP)
          |-- Nginx      : receives all visits, knows nothing else
          |-- The website: Node.js app on port 3000
          |-- The backend: PostgreSQL 16 + login + file storage (Docker), port 8000
          |-- AWS S3     : stores uploaded photos
```

One server runs **all 21 municipality websites**. Which site a visitor sees is
decided by the domain they typed.

---

## Part 1 - Run it on your own computer first

Do this before touching AWS. If it works here, it will work there.

### 1.1 Install the tools

| Tool | Download | Check it worked |
|------|----------|-----------------|
| Node.js 20+ | https://nodejs.org (choose "LTS") | `node -v` prints `v20...` or higher |
| Docker Desktop | https://docker.com/products/docker-desktop | `docker -v` prints a version |
| Git | https://git-scm.com/downloads | `git -v` prints a version |

### 1.2 Get the code

If you already have the project folder, skip this. Otherwise:

```bash
git clone <your-repository-url> municipal-portal
cd municipal-portal
```

### 1.3 Install the website's parts

```bash
npm install
```
You should see a lot of text and then no red "ERR!" lines.

### 1.4 Create your settings file

```bash
cp deploy/.env.example .env
bash deploy/generate-keys.sh
```
The second command prints four lines. Open `.env` in a text editor and paste
those four lines over the matching lines. Also set `POSTGRES_PASSWORD` to any
strong password you invent.

Leave `VITE_SUPABASE_URL` and `SUPABASE_URL` as `http://localhost:8000` for now.

### 1.5 Start the backend (database + login + files)

```bash
docker compose -f deploy/docker-compose.yml --env-file .env up -d
```
Check it:
```bash
docker ps
```
You should see five containers: `portal-db`, `portal-auth`, `portal-rest`,
`portal-storage`, `portal-gateway`.

### 1.6 Load the database

Run these **in this order**:

```bash
docker exec -i portal-db psql -U postgres < deploy/schema.sql
docker exec -i portal-db psql -U postgres < deploy/data.sql
docker exec -i portal-db psql -U postgres < deploy/03-admins.sql
```

The last command prints a table of email addresses. That means the logins were
created:

- Super admin: `superadmin@portal.local` / `superadmin@321`
- Each municipality: `<name>admin@portal.local` / `<name>@123`
  (for example `muluguadmin@portal.local` / `mulugu@123`)

> `deploy/00-prereqs.sql` is **only** needed if you run a plain PostgreSQL
> database without the login container. With the Docker setup above, skip it.

### 1.7 Start the website

```bash
npm run dev
```
Open http://localhost:8080 in your browser. You should see a municipality site.
Then open http://localhost:8080/admin/login and sign in as the super admin.

**If you see "Missing Supabase environment variable"** - your `.env` is not filled
in correctly. Go back to step 1.4.

---

## Part 2 - Put the code on GitHub

1. Create a free account at https://github.com.
2. Click **New repository**, name it `municipal-portal`, keep it **Private**, click
   **Create repository**.
3. In your project folder:

```bash
git init
git add .
git commit -m "Municipal portal"
git branch -M main
git remote add origin https://github.com/<your-username>/municipal-portal.git
git push -u origin main
```

You should see your files on the GitHub page after refreshing.

> `.env` is never uploaded - it holds your passwords. That is on purpose.

---

## Part 3 - Create the AWS pieces

Sign in at https://console.aws.amazon.com. Pick region **Asia Pacific (Mumbai)
ap-south-1** in the top-right corner and keep it for everything.

### 3.1 The server (EC2)

1. Search **EC2** -> **Instances** -> **Launch instances**.
2. Name: `municipal-portal`.
3. Image: **Ubuntu Server 24.04 LTS**.
4. Instance type: **t3.large** (2 vCPU / 8 GB). Use **t3.xlarge** if all 21 sites get busy.
5. Key pair: **Create new key pair**, name it `portal-key`, type RSA, format `.pem`.
   It downloads a file - **keep it safe, you cannot download it again**.
6. Network settings -> **Edit** -> Allow: SSH (22), HTTP (80), HTTPS (443).
7. Storage: change 8 GB to **50 GB**.
8. **Launch instance**.

### 3.2 The fixed IP (Elastic IP)

1. EC2 -> **Elastic IPs** -> **Allocate Elastic IP address** -> **Allocate**.
2. Select it -> **Actions** -> **Associate Elastic IP address** -> choose your
   instance -> **Associate**.
3. Write this IP down. This is the number NIC asks for.

### 3.3 The photo storage (S3)

1. Search **S3** -> **Create bucket**.
2. Name: `municipal-portal-uploads-<something-unique>`, region Mumbai.
3. Uncheck **Block all public access** (uploaded photos must be viewable), tick the
   confirmation box. Create.
4. Search **IAM** -> **Users** -> **Create user** -> name `portal-s3`.
5. Attach policy **AmazonS3FullAccess** -> Create user.
6. Open the user -> **Security credentials** -> **Create access key** -> choose
   "Application running outside AWS" -> copy the **Access key** and **Secret access key**.

### 3.4 Connect to the server

On your computer, in the folder where `portal-key.pem` was downloaded:

```bash
chmod 400 portal-key.pem
ssh -i portal-key.pem ubuntu@<YOUR ELASTIC IP>
```
Type `yes` when asked. You should now see a prompt like `ubuntu@ip-172-...:~$`.
Everything from here is typed **on the server**.

---

## Part 4 - Install and run the app on the server

### 4.1 Install the tools

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo npm install -g pm2
exit
```
Log in again with the same `ssh` command (this makes Docker work without `sudo`).

### 4.2 Get the code

```bash
git clone https://github.com/<your-username>/municipal-portal.git
cd municipal-portal
npm install
```

### 4.3 Settings for production

```bash
cp deploy/.env.example .env
bash deploy/generate-keys.sh
nano .env
```
Fill in:
- the four generated lines
- `POSTGRES_PASSWORD` - a strong password
- `VITE_SUPABASE_URL` and `SUPABASE_URL` -> `https://api.<your-domain>`
  (use `http://<YOUR ELASTIC IP>:8000` only if you do not have a domain yet)
- `STORAGE_BACKEND=s3`, `AWS_S3_BUCKET`, `AWS_REGION=ap-south-1`,
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` from step 3.3

Save with `Ctrl+O`, `Enter`, then `Ctrl+X`.

### 4.4 Start the backend and load the database

```bash
docker compose -f deploy/docker-compose.yml --env-file .env up -d
docker exec -i portal-db psql -U postgres < deploy/schema.sql
docker exec -i portal-db psql -U postgres < deploy/data.sql
docker exec -i portal-db psql -U postgres < deploy/03-admins.sql
```

### 4.5 Build and start the website

```bash
npm run build:node
pm2 start "npm run start" --name portal
pm2 save
pm2 startup       # copy the command it prints and run it - this survives reboots
```
Check:
```bash
curl -I http://localhost:3000
```
You should see `HTTP/1.1 200 OK`.

---

## Part 5 - Domains and HTTPS

### 5.1 Give NIC the IP

Open `deploy/NIC-DNS.md`, fill in your Elastic IP and the 21 domains, send it to NIC.
They create `A` records. Wait until `ping yourdomain.gov.in` returns your IP.

### 5.2 Tell Nginx about the domains

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/portal
sudo nano /etc/nginx/sites-available/portal
```
Replace the `_` in `server_name` with all your domains separated by spaces
(both `example.gov.in` and `www.example.gov.in`), and set the API server_name to
`api.<your-domain>`. Then:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
`nginx -t` must say **syntax is ok** and **test is successful**.

Now open `http://yourdomain.gov.in` in a browser - the site should load.

### 5.3 Turn on HTTPS (the padlock)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.gov.in -d www.example.gov.in -d api.example.gov.in
```
Add `-d domain -d www.domain` for every municipality in the same command.
Choose "redirect" when asked. Renewal happens automatically.

### 5.4 Link each domain to its municipality

Go to `https://<any-of-your-domains>/admin/login`, sign in as super admin, open the
**Domains** tab, and add each hostname next to its municipality. Save.

Visit each domain - it should now open that municipality's own homepage at `/`.

---

## Part 6 - Look at the database from your own computer (pgAdmin)

1. Install pgAdmin: https://www.pgadmin.org/download/
2. Right-click **Servers** -> **Register** -> **Server**.
3. **General** tab: Name `Municipal Portal`.
4. **Connection** tab: Host `localhost`, Port `5432`, Database `postgres`,
   Username `postgres`, Password = your `POSTGRES_PASSWORD`.
5. **SSH Tunnel** tab: turn it **on**.
   - Tunnel host: your Elastic IP
   - Tunnel port: 22
   - Username: `ubuntu`
   - Authentication: **Identity file** -> select `portal-key.pem`
6. Save. The server appears on the left; expand
   `Databases -> postgres -> Schemas -> public -> Tables`.

This is safe: the database is only reachable through your key, not from the internet.

---

## Part 7 - Day-to-day

**Publish new changes**
```bash
cd ~/municipal-portal
git pull
npm install
npm run build:node
pm2 restart portal
```

**See if something is wrong**
```bash
pm2 logs portal --lines 50      # website errors
docker compose -f deploy/docker-compose.yml logs --tail=50   # backend errors
sudo tail -50 /var/log/nginx/error.log                       # Nginx errors
```

**Back up the database (do this weekly)**
```bash
docker exec portal-db pg_dump -U postgres > ~/backup-$(date +%F).sql
```
Copy that file off the server, or upload it to S3:
`aws s3 cp ~/backup-$(date +%F).sql s3://<your-bucket>/backups/`

**Common problems**

| What you see | What to do |
|--------------|------------|
| `502 Bad Gateway` | The website is not running: `pm2 restart portal`, then `pm2 logs portal` |
| Site loads but no content | Backend down: `docker compose -f deploy/docker-compose.yml up -d` |
| Wrong municipality shows | Hostname not mapped: Admin -> Domains tab |
| Login returns `400 Bad Request` | Follow **Repair a 400 login error** below; this normally means the AWS user/password row is missing or stale |
| Photo upload fails | Check the S3 keys and bucket name in `.env`, then `pm2 restart portal` |
| Browsing the raw IP shows an error | Normal. Use a domain name. |

**Change a password**
```bash
docker exec -it portal-db psql -U postgres -c \
  "UPDATE auth.users SET encrypted_password = crypt('NEW-PASSWORD', gen_salt('bf')) WHERE email='superadmin@portal.local';"
```

### Repair a 400 login error

A `POST /auth/v1/token?grant_type=password` response with status 400 means the
browser reached the login service successfully, but that service rejected the
credentials. On the EC2 server, from the project directory, run:

```bash
# 1. Confirm all backend containers are healthy/running.
docker compose -f deploy/docker-compose.yml --env-file .env ps

# 2. Re-run the idempotent account script. It now also resets stale passwords.
docker exec -i portal-db psql -v ON_ERROR_STOP=1 -U postgres < deploy/03-admins.sql

# 3. Restart login and gateway services after the database repair.
docker compose -f deploy/docker-compose.yml --env-file .env restart auth kong

# 4. Inspect the login service if the request still returns 400.
docker compose -f deploy/docker-compose.yml --env-file .env logs --tail=100 auth
```

In step 2, the final table must show `email_confirmed = t` and
`password_set = t` for `superadmin@portal.local`. Then sign in with the full
email `superadmin@portal.local` and password `superadmin@321` (not only the word
`superadmin`).

Also make sure the values used to build the website point to this same AWS
backend. Because Vite embeds `VITE_SUPABASE_URL` at build time, changing `.env`
requires a new build:

```bash
grep -E '^(VITE_SUPABASE_URL|SUPABASE_URL)=' .env
npm run build:node
pm2 restart portal
```

Both URLs must identify the same backend. Use `https://api.<your-domain>` after
HTTPS is configured; while testing only by IP, use `http://<ELASTIC-IP>:8000`.

---

## Files in this folder

| File | What it is |
|------|------------|
| `.env.example` | Template for your settings file |
| `generate-keys.sh` | Prints the secret keys you need |
| `docker-compose.yml` | Runs PostgreSQL, logins, and file storage |
| `kong.yml` | Sends backend requests to the right place |
| `schema.sql` | All the database tables and security rules |
| `data.sql` | All 21 municipalities and their current content |
| `03-admins.sql` | Creates the super admin and 21 municipality admins |
| `04-domains.sql` | Optional: map domains to municipalities via SQL |
| `00-prereqs.sql` | Only for a plain PostgreSQL setup without the login container |
| `nginx.conf` | Web server configuration |
| `NIC-DNS.md` | The sheet to hand to NIC |
