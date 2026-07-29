# Taking the Mulugu site live

Goal: one public website serving only Mulugu, at its own domain, from this same project.

## What happens

1. **Publish the project.** This makes the whole portal live at a `.lovable.app` URL. Backend (database, admin, uploads) is already live and needs no redeploy.
2. **Verify Mulugu content.** Confirm the Mulugu ULB row is active and has logo, hero banner(s), council/public representatives, news and contact details filled in, so the live page isn't half empty.
3. **Connect the domain.** In Project Settings > Domains, connect the domain you want (e.g. `mulugumunicipality.<yourdomain>`), add the DNS records it shows at your registrar, and wait for verification + SSL.
4. **Make that domain open Mulugu directly.** Add hostname-based resolution so a visitor to the Mulugu domain lands on the Mulugu homepage at `/` instead of having to type `/mulugu`.

## Technical section

- Add a small hostname-to-slug map (e.g. `mulugumunicipality.* -> mulugu`) read server-side in the root route.
- When the request hostname maps to a slug, `/` renders the ULB site for that slug (redirect `/` to `/mulugu`, and keep all `/mulugu/...` sub-pages working unchanged).
- On the default `.lovable.app` host, `/` keeps showing the existing central portal listing all 21 ULBs.
- Per-route `head()` metadata (title, description, canonical, og tags) for the Mulugu pages uses the live domain once it is connected.
- `/admin/login` and `/admin` stay reachable on every host, unchanged.

## Note on `telangana.gov.in`

A `*.telangana.gov.in` subdomain can only be issued by NIC — it cannot be registered from here. Until NIC issues one, the site runs on the `.lovable.app` URL or any domain you own; the switch later is just a DNS change, no rebuild.

## What I need from you

- The exact domain/subdomain to use for Mulugu (or confirmation to go live on `.lovable.app` first and attach a domain later).
