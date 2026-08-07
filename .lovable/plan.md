# Weather & Air Quality: dual-mode (Lovable + self-hosted AWS)

## Why it fails on AWS

`src/lib/weather.functions.ts` routes Geocoding, Weather and Air Quality through
`connector-gateway.lovable.dev`, authenticated with `LOVABLE_API_KEY` and the
connector-managed `GOOGLE_MAPS_API_KEY`. Neither exists on EC2 or on a laptop, so
the handler throws "Missing Google Maps connector credentials" and the panel
falls back to "Live data unavailable right now."

## 1. Dual-mode fetching (`src/lib/weather.functions.ts`)

Detect the mode inside the handler (never at module scope):

- **Self-hosted** — `GOOGLE_API_KEY` present: call Google directly with `?key=`
  - `https://maps.googleapis.com/maps/api/geocode/json`
  - `https://weather.googleapis.com/v1/currentConditions:lookup`
  - `https://airquality.googleapis.com/v1/currentConditions:lookup` (POST)
- **Lovable** — no `GOOGLE_API_KEY`: existing gateway path, unchanged.

One small helper builds the URL + headers per mode; the response parsing,
return shape and `UlbWeather` type stay exactly as today, so
`WeatherPanel.tsx` needs no change.

## 2. Environment variables

Add `GOOGLE_API_KEY=` with explanatory comments to `.env.example` (created if
absent) and `deploy/.env.example`. Server-side only — never `VITE_`-prefixed,
never sent to the browser.

## 3. Server-side caching

In-memory `Map` keyed by ULB slug, 10-minute TTL, holding the resolved
coordinates and the last successful payload. Coordinates are cached longer
(they never change) so repeat calls skip the geocode request entirely.

## 4. Error handling

Inspect each Google response status/body and return a specific `error` string:

| Situation | Message shown |
|---|---|
| No key configured | Weather service is not configured (missing Google API key) |
| 403 `API_KEY_SERVICE_BLOCKED` / API not enabled | Google API key is not allowed to use this API |
| 403 referrer/IP blocked | Google API key restrictions block this server |
| 429 / `OVER_QUERY_LIMIT` | Google API quota exceeded |
| Weather call fails | Weather service unavailable |
| Air quality call fails | Air quality service unavailable |

Weather and air are fetched independently: if only one fails, the other still
renders. Full Google status + body is logged server-side for `pm2 logs`.

## 5. Documentation — `deploy/WEATHER-AND-AIR.md`

Step-by-step for a non-technical operator:
Google Cloud project → enable Geocoding, Weather, Air Quality APIs → enable
billing → create API key → restrict by EC2 Elastic IP and to those three APIs →
put `GOOGLE_API_KEY` in `.env` → local test with `npm run dev` → AWS deploy
(`git pull`, `npm install`, `npm run build`, `pm2 restart portal`) → how to test
each municipality page → troubleshooting table mapping each on-screen message to
its exact fix, plus how to read the error in `pm2 logs`.

## 6. Production safety

Only `src/lib/weather.functions.ts`, the two `.env.example` files and the new
doc change. No database, routing, host-mapping, auth, Nginx, PM2, or UI changes.
With no `GOOGLE_API_KEY` set, behaviour is byte-for-byte what it is today, so
Lovable Preview and the live sites are unaffected until you add the key.
