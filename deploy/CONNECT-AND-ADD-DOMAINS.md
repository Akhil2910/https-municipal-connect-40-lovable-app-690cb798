# Connect to the EC2 server from your computer, and add domains

Everything below is typed into **Command Prompt** (Windows) or **Terminal** (Mac/Linux)
on your own computer. Follow it top to bottom.

---

## Part 0 — What you need before you start

| Thing | Where it comes from |
|---|---|
| The key file, e.g. `portal-key.pem` | Downloaded once when you created the EC2 instance |
| The Elastic IP, e.g. `13.126.8.141` | AWS Console -> EC2 -> Elastic IPs |
| The login name | `ubuntu` (for an Ubuntu instance) |
| The domain names | From NIC / your registrar |

Put the `.pem` file somewhere easy, for example `C:\aws\portal-key.pem`.

---

## Part 1 — Fix the key file permissions (one time)

SSH refuses to use a key that other users can read.

**Windows (Command Prompt, run as Administrator):**

```cmd
cd C:\aws
icacls portal-key.pem /inheritance:r
icacls portal-key.pem /grant:r "%USERNAME%":R
```

**Mac / Linux:**

```bash
chmod 400 ~/Downloads/portal-key.pem
```

---

## Part 2 — Connect to the server

**Windows:**

```cmd
ssh -i C:\aws\portal-key.pem ubuntu@13.126.8.141
```

**Mac / Linux:**

```bash
ssh -i ~/Downloads/portal-key.pem ubuntu@13.126.8.141
```

Replace `13.126.8.141` with your Elastic IP.

First time it asks `Are you sure you want to continue connecting (yes/no)?` — type `yes` and press Enter.

You are connected when the prompt changes to something like:

```text
ubuntu@ip-172-31-4-21:~$
```

To leave the server, type `exit`.

### If it does not connect

| Message | Fix |
|---|---|
| `Connection timed out` | EC2 -> Security Groups -> Inbound rules: allow **SSH port 22** from **My IP** |
| `Permission denied (publickey)` | Wrong key file, or wrong user name (`ubuntu`, not `root` or `ec2-user`) |
| `UNPROTECTED PRIVATE KEY FILE` | Redo Part 1 |
| `ssh is not recognized` | Windows: Settings -> Apps -> Optional features -> Add **OpenSSH Client** |

### Copying a file from your computer to the server

Run this in a **new** window (not inside the SSH session):

```cmd
scp -i C:\aws\portal-key.pem C:\path\to\file.sql ubuntu@13.126.8.141:/home/ubuntu/
```

---

## Part 3 — Point the domain at the server (DNS)

Do this at NIC / your registrar, once per domain. Every domain uses the **same** IP.

| Record type | Name | Value |
|---|---|---|
| A | `@` | your Elastic IP |
| A | `www` | your Elastic IP |

Check it worked from your own Command Prompt:

```cmd
nslookup mulugumunicipality.in
```

It must print your Elastic IP. DNS can take a few hours. **Do not continue to Part 5
(HTTPS) until this shows the right IP.**

---

## Part 4 — Tell Nginx about the domain (on the server)

Connect with SSH (Part 2), then:

```bash
sudo nano /etc/nginx/sites-available/portal
```

Find the `server_name` line in the **website** block and list every domain, separated by
spaces, ending with a semicolon:

```nginx
server_name
    mulugumunicipality.in www.mulugumunicipality.in
    asifabadmunicipality.in www.asifabadmunicipality.in;
```

Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`.

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

`nginx -t` must say `syntax is ok` and `test is successful`. If it does not, re-open the
file and fix the line it names — do not reload until it passes.

Now open `http://mulugumunicipality.in` in a browser. The site should load.

---

## Part 5 — Turn on HTTPS (padlock)

Only after Part 3 shows the correct IP and Part 4 loads over `http://`.

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d mulugumunicipality.in -d www.mulugumunicipality.in
```

Add `-d yourdomain -d www.yourdomain` for every domain in the same command — one
certificate can cover all of them. Choose **redirect** when asked, so `http://` goes to
`https://`.

Renewal is automatic. Check it with:

```bash
sudo certbot renew --dry-run
```

---

## Part 6 — Link each domain to its municipality (in the website)

This is what makes `mulugumunicipality.in` open the **Mulugu** site at `/`.

1. Open `https://<any of your domains>/admin/login`
2. Sign in as the super admin (`superadmin@portal.local`)
3. Open the **Domains** tab
4. Enter the hostname (`mulugumunicipality.in`), pick the municipality, click **Add domain**
5. Repeat for the `www.` version of the same domain

No redeploy, no restart. Reload the domain and it lands on that municipality's homepage.

Prefer SQL? Edit `deploy/04-domains.sql`, add one line per domain, then on the server:

```bash
psql "$DATABASE_URL" -f deploy/04-domains.sql
```

---

## Part 7 — Adding one more domain later

1. Registrar: A records `@` and `www` -> the same Elastic IP
2. Wait for `nslookup` to show the IP
3. Add the two hostnames to `server_name` -> `sudo nginx -t` -> `sudo systemctl reload nginx`
4. `sudo certbot --nginx -d newdomain -d www.newdomain`
5. Admin -> Domains -> map it to its municipality

---

## Quick reference

```cmd
ssh -i C:\aws\portal-key.pem ubuntu@ELASTIC_IP     :: connect
exit                                               :: disconnect
nslookup yourdomain.in                             :: check DNS
```

```bash
pm2 status                    # is the website process running
pm2 logs portal --lines 50    # website errors
pm2 restart portal            # restart the website
sudo nginx -t                 # check nginx config
sudo systemctl reload nginx   # apply nginx config
docker compose ps             # backend containers (run in the deploy folder)
```

| Symptom | Likely cause |
|---|---|
| Domain shows nothing | DNS not pointing at the Elastic IP yet (Part 3) |
| "Welcome to nginx" page | Domain missing from `server_name` (Part 4) |
| Wrong municipality shown | Hostname not mapped in Admin -> Domains (Part 6) |
| 502 Bad Gateway | App is down: `pm2 status`, then `pm2 restart portal` |
| Certbot fails | DNS not propagated, or port 80 blocked in the Security Group |