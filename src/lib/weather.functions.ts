import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

type Env = { url: string; key: string };
function env(): Env {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  return { url, key };
}
function gwHeaders(json = false): Record<string, string> {
  const lk = process.env.LOVABLE_API_KEY;
  const gk = process.env.GOOGLE_MAPS_API_KEY;
  if (!lk || !gk) throw new Error("Missing Google Maps connector credentials");
  const h: Record<string, string> = {
    Authorization: `Bearer ${lk}`,
    "X-Connection-Api-Key": gk,
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

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

export const getUlbWeather = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<UlbWeather> => {
    const { url, key } = env();
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: ulb } = await sb
      .from("ulbs")
      .select("name,district,state,address")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!ulb) throw new Error("ULB not found");

    const q = [ulb.address, ulb.name, ulb.district, ulb.state ?? "Telangana", "India"]
      .filter(Boolean)
      .join(", ");

    const empty: UlbWeather = {
      location: null,
      weather: null,
      air: null,
      updatedAt: new Date().toISOString(),
    };

    try {
      const geoRes = await fetch(
        `${GATEWAY}/maps/api/geocode/json?address=${encodeURIComponent(q)}`,
        { headers: gwHeaders() },
      );
      const geo = await geoRes.json();
      const loc = geo?.results?.[0]?.geometry?.location;
      if (!loc) return { ...empty, error: "Geocode failed" };
      const lat = loc.lat as number;
      const lng = loc.lng as number;

      const [wRes, aRes] = await Promise.all([
        fetch(
          `${GATEWAY}/weather/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lng}`,
          { headers: gwHeaders() },
        ),
        fetch(`${GATEWAY}/airquality/v1/currentConditions:lookup`, {
          method: "POST",
          headers: gwHeaders(true),
          body: JSON.stringify({ location: { latitude: lat, longitude: lng } }),
        }),
      ]);

      const w = wRes.ok ? await wRes.json() : null;
      const a = aRes.ok ? await aRes.json() : null;

      const idx = a?.indexes?.find((i: { code: string }) => i.code === "uaqi") ?? a?.indexes?.[0];

      return {
        location: { name: geo.results[0].formatted_address ?? q, lat, lng },
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
        updatedAt: new Date().toISOString(),
      };
    } catch (e) {
      return { ...empty, error: e instanceof Error ? e.message : "Failed to fetch" };
    }
  });