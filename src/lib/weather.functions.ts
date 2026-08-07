import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";
const GEOCODE_HOST = "https://maps.googleapis.com";
const WEATHER_HOST = "https://weather.googleapis.com";
const AIR_HOST = "https://airquality.googleapis.com";

const WEATHER_TTL_MS = 10 * 60 * 1000; // 10 minutes
const GEO_TTL_MS = 30 * 24 * 60 * 60 * 1000; // coordinates rarely change

export type UlbWeather = {
  location: { name: string; lat: number; lng: number } | null;
  weather: {
    temperatureC: number | null;
    feelsLikeC: number | null;
    humidity: number | null;
    windKph: number | null;
    condition: string | null;
    iconUri: string | null;
    precipProbability: number | null;
    precipQty: number | null;
    uvIndex: number | null;
  } | null;
  air: {
    aqi: number | null;
    category: string | null;
    dominantPollutant: string | null;
    color: string | null;
  } | null;
  updatedAt: string;
  error?: string;
};

type Geo = { name: string; lat: number; lng: number };

const geoCache = new Map<string, { at: number; value: Geo }>();
const resultCache = new Map<string, { at: number; value: UlbWeather }>();

function readCache<T>(m: Map<string, { at: number; value: T }>, k: string, ttl: number) {
  const hit = m.get(k);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  if (hit) m.delete(k);
  return null;
}

/** Human-readable message for a failed Google response. */
async function describeFailure(res: Response, service: string): Promise<string> {
  let body = "";
  try {
    body = await res.text();
  } catch {
    /* ignore */
  }
  console.error(`[weather] ${service} request failed [${res.status}]: ${body}`);
  const reason = /API_KEY_HTTP_REFERRER_BLOCKED|API_KEY_SERVICE_BLOCKED|API_KEY_IP_ADDRESS_BLOCKED|REQUEST_DENIED|OVER_QUERY_LIMIT|RESOURCE_EXHAUSTED/.exec(
    body,
  )?.[0];
  if (res.status === 429 || reason === "OVER_QUERY_LIMIT" || reason === "RESOURCE_EXHAUSTED")
    return "Google API quota exceeded — check billing and quotas in Google Cloud.";
  if (reason === "API_KEY_SERVICE_BLOCKED")
    return `Google API key is not allowed to call the ${service} API — enable that API and add it to the key's allowed list.`;
  if (reason === "API_KEY_HTTP_REFERRER_BLOCKED" || reason === "API_KEY_IP_ADDRESS_BLOCKED")
    return "Google API key restrictions block this server — allow the server IP (or set restrictions to None).";
  if (res.status === 403 || reason === "REQUEST_DENIED")
    return `Invalid Google API configuration for the ${service} API (403).`;
  if (res.status === 400) return `Invalid request sent to the ${service} API (400).`;
  return `${service} service unavailable (HTTP ${res.status}).`;
}

export const getUlbWeather = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<UlbWeather> => {
    const nowIso = () => new Date().toISOString();
    const empty = (error?: string): UlbWeather => ({
      location: null,
      weather: null,
      air: null,
      updatedAt: nowIso(),
      ...(error ? { error } : {}),
    });

    // ---- Mode detection (inside the handler, never at module scope) ----
    const googleKey = process.env.GOOGLE_API_KEY?.trim();
    const selfHosted = Boolean(googleKey);
    const lovableKey = process.env.LOVABLE_API_KEY;
    const connectorKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!selfHosted && (!lovableKey || !connectorKey)) {
      return empty(
        "Google API key missing — set GOOGLE_API_KEY in the server environment (see deploy/WEATHER-AND-AIR.md).",
      );
    }

    const gwHeaders = (json = false): Record<string, string> => {
      const h: Record<string, string> = {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectorKey as string,
      };
      if (json) h["Content-Type"] = "application/json";
      return h;
    };
    const jsonHeaders = (json: boolean) =>
      selfHosted ? (json ? { "Content-Type": "application/json" } : {}) : gwHeaders(json);
    const withKey = (url: string) =>
      selfHosted ? `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(googleKey!)}` : url;

    const geocodeUrl = (q: string) =>
      withKey(
        selfHosted
          ? `${GEOCODE_HOST}/maps/api/geocode/json?address=${encodeURIComponent(q)}`
          : `${GATEWAY}/maps/api/geocode/json?address=${encodeURIComponent(q)}`,
      );
    const weatherUrl = (lat: number, lng: number) =>
      withKey(
        selfHosted
          ? `${WEATHER_HOST}/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lng}`
          : `${GATEWAY}/weather/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lng}`,
      );
    const airUrl = () =>
      withKey(
        selfHosted
          ? `${AIR_HOST}/v1/currentConditions:lookup`
          : `${GATEWAY}/airquality/v1/currentConditions:lookup`,
      );

    // ---- Cached full result ----
    const cached = readCache(resultCache, data.slug, WEATHER_TTL_MS);
    if (cached) return cached;

    // ---- Resolve the municipality ----
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return empty("Server database configuration is missing.");
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: ulb } = await sb
      .from("ulbs")
      .select("name,district,state,address")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!ulb) return empty("Municipality not found.");

    const q = [ulb.address, ulb.name, ulb.district, ulb.state ?? "Telangana", "India"]
      .filter(Boolean)
      .join(", ");

    try {
      // ---- Geocode (cached separately; coordinates don't change) ----
      let geo = readCache(geoCache, data.slug, GEO_TTL_MS);
      if (!geo) {
        const geoRes = await fetch(geocodeUrl(q), { headers: jsonHeaders(false) });
        if (!geoRes.ok) return empty(await describeFailure(geoRes, "Geocoding"));
        const gj = await geoRes.json();
        const loc = gj?.results?.[0]?.geometry?.location;
        if (!loc) {
          console.error(`[weather] geocode returned no result for "${q}": ${gj?.status ?? ""}`);
          return empty(
            gj?.status === "REQUEST_DENIED"
              ? "Invalid Google API configuration for the Geocoding API."
              : "Could not locate this municipality on the map.",
          );
        }
        geo = {
          name: gj.results[0].formatted_address ?? q,
          lat: loc.lat as number,
          lng: loc.lng as number,
        };
        geoCache.set(data.slug, { at: Date.now(), value: geo });
      }

      // ---- Weather + Air in parallel; one failing must not kill the other ----
      const [wRes, aRes] = await Promise.all([
        fetch(weatherUrl(geo.lat, geo.lng), { headers: jsonHeaders(false) }).catch(() => null),
        fetch(airUrl(), {
          method: "POST",
          headers: jsonHeaders(true),
          body: JSON.stringify({ location: { latitude: geo.lat, longitude: geo.lng } }),
        }).catch(() => null),
      ]);

      let error: string | undefined;
      let w: any = null;
      if (!wRes) error = "Weather service unavailable — could not reach Google.";
      else if (!wRes.ok) error = await describeFailure(wRes, "Weather");
      else w = await wRes.json();

      let a: any = null;
      if (!aRes) error ??= "Air quality service unavailable — could not reach Google.";
      else if (!aRes.ok) {
        const airErr = await describeFailure(aRes, "Air Quality");
        error ??= airErr;
      } else a = await aRes.json();

      if (!w && !a) return empty(error ?? "Live data unavailable right now.");

      const idx = a?.indexes?.find((i: { code: string }) => i.code === "uaqi") ?? a?.indexes?.[0];

      const result: UlbWeather = {
        location: geo,
        weather: w
          ? {
              temperatureC: w?.temperature?.degrees ?? null,
              feelsLikeC: w?.feelsLikeTemperature?.degrees ?? null,
              humidity: w?.relativeHumidity ?? null,
              windKph: w?.wind?.speed?.value ?? null,
              condition: w?.weatherCondition?.description?.text ?? null,
              iconUri: w?.weatherCondition?.iconBaseUri
                ? `${w.weatherCondition.iconBaseUri}.svg`
                : null,
              precipProbability: w?.precipitation?.probability?.percent ?? null,
              precipQty: w?.precipitation?.qpf?.quantity ?? null,
              uvIndex: w?.currentConditionsHistory?.uvIndex ?? w?.uvIndex ?? null,
            }
          : null,
        air: idx
          ? {
              aqi: idx.aqi ?? null,
              category: idx.category ?? null,
              dominantPollutant: idx.dominantPollutant ?? null,
              color: idx.color
                ? `rgb(${Math.round((idx.color.red ?? 0) * 255)},${Math.round(
                    (idx.color.green ?? 0) * 255,
                  )},${Math.round((idx.color.blue ?? 0) * 255)})`
                : null,
            }
          : null,
        updatedAt: nowIso(),
      };

      resultCache.set(data.slug, { at: Date.now(), value: result });
      return result;
    } catch (e) {
      console.error("[weather] unexpected failure", e);
      return empty(e instanceof Error ? e.message : "Failed to fetch live data.");
    }
  });
