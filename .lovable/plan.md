# Hosting this portal on a Telangana Government server

Short answer: yes, it can run entirely on a government (SDC / NIC / state cloud) server. Nothing here is locked to Lovable. But three things have to be replaced, because today they are provided by Lovable's infrastructure.

## What moves as-is

- All 21 municipality websites, the hero sliders, council/co-option/public representative pages, gallery, news, notices, tenders, grievance form and the `/admin` dashboard — this is ordinary React + TanStack Start code.
- The whole codebase can be exported to GitHub and cloned to any machine.

## What has to be replaced

**1. The build target.** The app is currently packaged for an edge runtime (Cloudflare Workers). A government server will be a normal Linux VM, so the build output must be switched to a Node.js server bundle and run behind nginx/Apache with a process manager. This is a configuration change, not a rewrite.

**2. The database, auth, storage.** Today the database, admin login and all uploaded images live on Lovable Cloud. On a government server this becomes either:
- a **self-hosted Supabase** instance (Docker) on the same VM/cluster — keeps the code unchanged, or
- a plain **PostgreSQL** installed by NIC — this needs the data-access layer rewritten, so self-hosted Supabase is strongly preferred.
The full schema and all existing content can be exported from here and restored there. Uploaded images move from Cloud storage to the server's disk or the state object store.

**3. External keys.** The weather / air-quality panel uses Google Maps through Lovable's connector. On a government server the department needs its own Google Maps API key (or the panel is switched to an IMD / TSDPS government feed instead).

## Server requirements to request from NIC/SDC

- Linux VM, 4 vCPU / 8 GB RAM / 100 GB disk is comfortable for 21 sites (2 vCPU / 4 GB is the minimum).
- Node.js 20+, PostgreSQL 15+, nginx, Docker (if self-hosting Supabase).
- Daily database + uploads backup.
- SSL certificate and the `*.telangana.gov.in` subdomains issued by NIC, one per municipality, all pointing to the same server.

## Migration steps

1. Export the code to GitHub and clone it on the government server.
2. Stand up the database there and restore the exported schema + all 21 municipalities' content.
3. Copy uploaded images (logos, hero banners, gallery, member photos) into the new storage location.
4. Point the app at the new database and storage via environment variables on that server.
5. Switch the build output to a Node server bundle, run it under a process manager, put nginx in front.
6. Map each municipality's `.gov.in` subdomain to the server; the existing hostname routing already opens the right municipality at `/`.
7. Recreate the super-admin account on the new database and verify the admin panel end to end.

## Cost

Once it runs on the government server there is no recurring Lovable or domain cost — only the department's existing server capacity. A Lovable subscription is still useful if you want to keep editing the project here and re-export updates; otherwise future changes are made directly in the code on that server.

## What I can do from here

Steps 1–5 need access to the government server, which I do not have. What I can prepare in this project:
- switch the build configuration to a Node server target,
- add a deployment README with the exact commands, nginx config and environment variables,
- produce a full SQL dump of the schema and all current content, plus a listing of every uploaded file to copy.

Approve and I'll prepare that handover package.
