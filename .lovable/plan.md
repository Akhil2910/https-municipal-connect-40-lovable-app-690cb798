# Public IP / A-record setup for the 21 municipality domains

## Answer for the NIC form field

"IP address to be mapped/Changed (Compulsory)":

```text
185.158.133.1
```

Use this same IP on all 21 municipality domain request forms, for both the root domain and `www`. If the form asks for a record type, choose **A**. Also give NIC the `_lovable` TXT verification value for that specific domain (unique per domain, shown in Lovable when the domain is added) — without it the domain will not verify.

## The IP to give NIC

```text
A     @      185.158.133.1
A     www    185.158.133.1
TXT   _lovable    lovable_verify=<value shown per domain>
```

The A-record IP `185.158.133.1` is the same for every domain. The TXT verification value is unique per domain and is shown in Lovable when you add that domain.

## About "error code: 1003" when you open the IP in a browser

Typing `185.158.133.1` in the address bar returning `error code: 1003` is normal and does not mean the IP is wrong. That IP is a shared edge address that routes by domain name, so a request with no domain attached is rejected. The only correct way to use it is as the A-record target for a domain name — once NIC maps the domain to it, the domain opens the site over HTTPS.

So: give NIC this IP for the form, but do not test it by browsing to the IP.

Note: this is an anycast edge IP shared across Lovable-hosted sites, not a dedicated IP reserved for Telangana. It is stable and is the officially supported target for A records, but it is not an exclusive IP. If NIC's policy requires a dedicated IP owned by the department, that only comes from hosting on the SDC/NIC VM (covered in the separate self-hosting plan).

## Steps per municipality domain

1. Project Settings -> Domains -> Connect existing domain.
2. Enter the domain, e.g. `mulugumunicipality.gov.in`.
3. Add the same domain again with the `www.` prefix (it is not added automatically).
4. Hand NIC the three records above for that domain.
5. Wait for propagation, then the status moves Verifying -> Setting up -> Active, and SSL is issued automatically.
6. Repeat for all 21 domains on this same project.

No code change is needed: hostname-based routing in `src/lib/host.functions.ts` already maps each incoming domain to its municipality, so each domain opens its own site at `/`.

## What I can prepare next

- A one-page DNS request sheet for NIC listing all 21 domains with their required A/TXT records, ready to email.
- A checklist to track connection status per municipality.

## Technical notes

- Root and `www` both need A records; pick one as Primary in Lovable and the other redirects.
- Do not leave old/conflicting A or CNAME records on the same names.
- If a CAA record exists, it must permit Let's Encrypt or SSL issuance fails.
- If NIC fronts the domains with their own proxy/CDN, use the proxy option (CNAME-based verification) instead of A records.
