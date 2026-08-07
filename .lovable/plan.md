# Weather & Air Quality: make it work outside Lovable

## Why it fails locally / on AWS

The weather panel calls Google Weather, Air Quality and Geocoding through the
Lovable connector gateway (`connector-gateway.lovable.dev`) using two values that
only exist inside the Lovable environment: `LOVABLE_API_KEY` and the
connector-managed `GOOGLE_MAPS_API_KEY`. On your laptop and on the EC2 server
those variables are empty, so the server function throws
"Missing Google Maps connector credentials" and the panel shows
"Live data unavailable right now."

## What to change

1. **Dual-mode data fetching** in `src/lib/weather.functions.ts`:
   - If `GOOGLE_API_KEY` is set (self-hosted mode), call Google's public
     endpoints directly with `?key=...`:
     - `https://maps.googleapis.com/maps/api/geocode/json`
     - `https://weather.googleapis.com/v1/currentConditions:lookup`
     - `https://airquality.googleapis.com/v1/currentConditions:lookup`
   - Otherwise fall back to the existing Lovable gateway path (so the Lovable
     preview keeps working unchanged).
   - Return a clear, human-readable `error` string when no key is configured.
2. **Cache results** for ~10 minutes per municipality (in-memory on the server)
   to keep Google API usage and cost low.
3. **Env wiring**: add `GOOGLE_API_KEY=` to `deploy/.env.example` with notes.

## The document

New file `deploy/WEATHER-AND-AIR.md`, written step-by-step for a non-technical
reader, covering:

- What the panel shows and where the data comes from.
- Creating a Google Cloud project and enabling the three required APIs
  (Geocoding API, Weather API, Air Quality API).
- Creating an API key, restricting it by server IP (the EC2 Elastic IP) and by
  those three APIs only.
- Enabling billing (all three APIs require a billing account; free monthly
  credit covers a portal of this size).
- Where to paste the key: `GOOGLE_API_KEY=...` in the `.env` next to
  `package.json`, then `npm run build` and restart with PM2.
- Local testing: same key in your local `.env`, `npm run dev`, open a
  municipality page and confirm the panel fills in.
- Troubleshooting table: blank panel, "REQUEST_DENIED", "API not enabled",
  "IP not authorised", quota exceeded — with the exact fix for each.
- How to check the server logs for the exact Google error message.

## Technical notes

- Keys are read inside the handler (never at module scope) so runtime env from
  `--env-file=.env` is picked up.
- `GOOGLE_API_KEY` stays server-side only; it is never sent to the browser.
- No database or UI changes; `WeatherPanel.tsx` already handles the error and
  loading states.
