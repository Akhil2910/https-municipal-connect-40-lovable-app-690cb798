# Weather & Air Quality — setup guide

The "Live Environment" panel on every municipality home page shows temperature,
humidity, wind, rain chance, UV index and the Air Quality Index.

The data comes from three Google services:

| Data | Google service |
|---|---|
| Turning the municipality address into map coordinates | Geocoding API |
| Temperature, wind, humidity, rain, UV | Weather API |
| AQI and pollutants | Air Quality API |

## How the app decides where to get the data

The app runs in one of two modes and picks automatically — you do not change any code:

| Mode | When | What happens |
|---|---|---|
| Self-hosted (AWS / your laptop) | `GOOGLE_API_KEY` is set in `.env` | Calls Google directly with your key |
| Lovable Preview | `GOOGLE_API_KEY` is empty | Uses the built-in Lovable connector |

So: **set `GOOGLE_API_KEY` on your server, and the panel starts working.**
Nothing else in the site changes.

---

## Part 1 — Create the Google Cloud project

1. Open https://console.cloud.google.com and sign in with a Google account.
2. Click the project dropdown at the top, then **New Project**.
3. Name it e.g. `municipal-portal` and click **Create**.
4. Wait a few seconds, then make sure the new project is selected in the dropdown.

## Part 2 — Turn on billing

All three APIs require a billing account, even though normal usage for 21 municipal
sites stays inside Google's free monthly credit.

1. Left menu → **Billing**.
2. **Link a billing account** (create one with a credit/debit card if you have none).
3. Confirm the project shows a linked billing account.

Tip: set a budget alert (Billing → Budgets & alerts) so you get an email if usage rises.

## Part 3 — Enable the three APIs

For each of the three names below:

1. Left menu → **APIs & Services → Library**.
2. Search for the name.
3. Open it and click **Enable**.

Enable all three:

- **Geocoding API**
- **Weather API**
- **Air Quality API**

(If your site's map also uses Maps JavaScript API, leave that enabled too.)

## Part 4 — Create the API key

1. Left menu → **APIs & Services → Credentials**.
2. **Create credentials → API key**.
3. Copy the key that appears (looks like `AIza...`). Keep it private.

## Part 5 — Restrict the key (important)

Still on the key's settings page:

**Application restrictions**
- Choose **IP addresses**.
- Add your EC2 Elastic IP (e.g. `13.126.8.141`).
- For local testing you can temporarily choose **None**, then switch back to IP addresses.
- Do **not** choose "HTTP referrers" — server calls send no referrer and Google will block them.

**API restrictions**
- Choose **Restrict key**.
- Select exactly: Geocoding API, Weather API, Air Quality API.

Click **Save**. Changes can take up to 5 minutes to take effect.

---

## Part 6 — Local development

1. In the project folder, open `.env` (copy from `.env.example` if it does not exist).
2. Add the line:

   ```
   GOOGLE_API_KEY=AIza...your-key...
   ```

3. Start the app:

   ```
   npm install
   npm run dev
   ```

4. Open a municipality page (e.g. `http://localhost:3000/asifabad`) and scroll to
   the "Live Environment" panel. It should fill with real values within a second or two.

## Part 7 — Deploy on AWS EC2

Connect to the server, then:

```bash
cd ~/https-municipal-connect-40-lovable-app   # your project folder (or /path/to/your/project)
git pull                       # get the latest code
nano .env                      # add: GOOGLE_API_KEY=AIza...your-key...
npm install
npm run build
pm2 restart portal
pm2 logs portal --lines 50     # watch for errors
```

Nothing else needs to change — Nginx, SSL, PM2, the database, domains and the
admin panel are untouched.

## Part 8 — Test

1. Visit each municipality site over HTTPS, e.g. `https://mulugumunicipality.telangana.gov.in`
   (other sites follow the same pattern, e.g. `https://asifabadmunicipality.telangana.gov.in`).
2. The panel shows a temperature, "Feels like", humidity, wind, rain chance, UV and AQI.
3. Reload the page — it should be instant, because results are cached on the server
   for 10 minutes per municipality.
4. Check the server log for problems:

   ```bash
   pm2 logs portal | grep weather
   ```

---

## Troubleshooting

The panel shows the actual reason on screen. Match it below.

| Message on the panel | What it means | Fix |
|---|---|---|
| Google API key missing | `GOOGLE_API_KEY` is not in `.env`, or the app was not restarted | Add the line to `.env`, then `npm run build && pm2 restart portal` |
| Google API key is not allowed to call the ... API | That API is not enabled, or not in the key's allowed list | Part 3 and Part 5 above |
| Google API key restrictions block this server | The key is referrer-restricted, or the server IP is not allowed | Part 5: set IP restrictions to the EC2 Elastic IP |
| Google API quota exceeded | Free credit or a quota limit was reached | Check Billing → Reports and API quotas |
| Invalid Google API configuration | Key is wrong, deleted, or billing is off | Re-check Parts 2, 4, 5 |
| Weather service unavailable | Google's Weather API returned an error | Check `pm2 logs portal` for the full Google message |
| Air quality service unavailable | Google's Air Quality API returned an error | Same as above; weather still shows |
| Could not locate this municipality on the map | The address in the admin panel is too vague | Edit the ULB address in the admin panel to include town and district |

Extra checks:

- Verify the key reached the server: `pm2 env 0 | grep GOOGLE_API_KEY` (should not be empty).
- The start script loads `.env` automatically (`node --env-file=.env ...`), so the file must
  sit next to `package.json`.
- Wait 5 minutes after changing key restrictions in Google Cloud.
- The panel caches for 10 minutes; restart PM2 to clear it immediately.

## Cost

Typical usage for 21 sites: geocoding results are cached almost permanently, and
weather/air are fetched at most once per 10 minutes per municipality — roughly
6,000 calls a month in total, which normally stays inside Google's free monthly credit.

## Security note

`GOOGLE_API_KEY` is used only on the server. It is never sent to the browser and must
never be renamed with a `VITE_` prefix, which would expose it publicly.
