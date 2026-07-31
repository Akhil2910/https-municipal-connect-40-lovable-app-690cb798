# Static IP for the 21 Municipality Portals

## The situation

Lovable hosting cannot provide a dedicated static IP. Sites are served from a shared global edge network, and `185.158.133.1` is an anycast address shared by many projects — it is not reserved for this project and must not be given to NIC as "our server IP" for whitelisting or long-term A-record mapping.

A fixed, project-owned public IP requires self-hosting. On AWS that is an **Elastic IP** attached to the EC2 instance running the app.

## What to add

### 1. Elastic IP section in the deployment guide
Extend `deploy/README.md` with a dedicated "Static public IP" section:
- Allocate an Elastic IP in the same region as the EC2 instance
- Associate it with the instance (survives stop/start and instance replacement)
- Note that it must be released only when decommissioning, otherwise the IP changes
- Security group rules: allow 80/443 from anywhere, 22 restricted to admin IPs

### 2. NIC handover sheet
Add `deploy/NIC-DNS.md` — a fill-in sheet to submit for all 21 domains:
- One table with columns: municipality, domain, record type, host, value
- Every domain gets `A @ -> <ELASTIC_IP>` and `A www -> <ELASTIC_IP>`
- A single placeholder `<ELASTIC_IP>` to substitute once AWS allocates it
- Note that the same IP serves all 21 domains; the app routes by hostname

### 3. Nginx multi-domain confirmation
Verify and document in the guide that the Nginx server block accepts all 42 hostnames and forwards the original `Host` header, so the existing hostname routing in `src/lib/host.functions.ts` resolves the right municipality.

### 4. Certbot command for all domains
Add the ready-to-paste Certbot command covering all 42 hostnames on one certificate, plus the renewal cron note.

## Technical notes

- No application code changes are needed. Hostname-to-municipality mapping already exists via the `domains` table and the Super Admin "Domains" tab.
- Elastic IP is free while attached to a running instance; AWS charges hourly when allocated but unattached.
- If high availability is later required, the static entry point becomes a Network Load Balancer with Elastic IPs per availability zone — same DNS story for NIC.
