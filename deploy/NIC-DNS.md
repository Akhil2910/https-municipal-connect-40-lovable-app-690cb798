# DNS request sheet for NIC

Give NIC this information for every municipality domain.

**IP address to be mapped:** `<YOUR ELASTIC IP>`
(You get this from AWS: EC2 -> Elastic IPs -> Allocate. It never changes once allocated.)

Every domain uses the **same** IP. The website itself decides which municipality to
show, based on the domain name in the request.

| # | Municipality | Domain            | Record type | Name  | Value (IP)        |
|---|--------------|-------------------|-------------|-------|-------------------|
| 1 | Mulugu       | example.gov.in    | A           | @     | `<YOUR ELASTIC IP>` |
| 1 | Mulugu       | example.gov.in    | A           | www   | `<YOUR ELASTIC IP>` |
| 2 | ...          |                   | A           | @     | `<YOUR ELASTIC IP>` |
| 2 | ...          |                   | A           | www   | `<YOUR ELASTIC IP>` |

Also add one record for the backend:

| Purpose | Domain              | Record type | Name | Value |
|---------|---------------------|-------------|------|-------|
| Backend | api.example.gov.in  | A           | api  | `<YOUR ELASTIC IP>` |

## After NIC confirms

1. Wait until `ping yourdomain.gov.in` shows your Elastic IP (can take a few hours).
2. Add the domain names to `server_name` in `/etc/nginx/sites-available/portal`, then
   `sudo nginx -t && sudo systemctl reload nginx`.
3. Turn on HTTPS (see Part 5 of `deploy/README.md`).
4. Log in at `https://yourdomain.gov.in/admin/login` as the super admin and open the
   **Domains** tab to link each domain to its municipality.

Note: opening the bare IP in a browser will not show the site. That is normal - the
server only answers to domain names.
