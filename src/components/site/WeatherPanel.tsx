import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getUlbWeather } from "@/lib/weather.functions";
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, Gauge, Loader2 } from "lucide-react";

export function WeatherPanel({ slug, ulbName }: { slug: string; ulbName: string }) {
  const fn = useServerFn(getUlbWeather);
  const [data, setData] = useState<Awaited<ReturnType<typeof fn>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fn({ data: { slug } })
      .then((res) => { if (!cancelled) { setData(res); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="rounded-xl overflow-hidden border shadow-[var(--shadow-elegant)] bg-gradient-to-br from-gov-navy via-gov-navy to-[hsl(215,60%,18%)] text-white flex flex-col">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gov-saffron">Live Environment</p>
          <h3 className="font-display text-lg font-black">{ulbName} · Weather & Air</h3>
        </div>
        <Cloud className="h-6 w-6 text-white/70" />
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      )}

      {(error || (data && data.error && !data.weather && !data.air)) && !isLoading && (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-white/70">
          {(data?.error as string | undefined) ?? "Live data unavailable right now."}
        </div>
      )}

      {data && (data.weather || data.air) && (
        <div className="flex-1 p-5 grid gap-4">
          {/* Temperature hero */}
          <div
            className="rounded-lg p-4 flex items-center justify-between"
            style={{
              background: tempGradient(data.weather?.temperatureC ?? 28),
            }}
          >
            <div>
              <div className="text-5xl font-black leading-none">
                {fmt(data.weather?.temperatureC, "°C")}
              </div>
              <div className="text-xs mt-2 opacity-90">
                Feels like {fmt(data.weather?.feelsLikeC, "°C")}
              </div>
              <div className="text-sm mt-1 font-semibold">
                {data.weather?.condition ?? "—"}
              </div>
            </div>
            {data.weather?.iconUri ? (
              <img src={data.weather.iconUri} alt="" className="h-20 w-20" />
            ) : (
              <Sun className="h-16 w-16 opacity-80" />
            )}
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Metric icon={<Droplets className="h-4 w-4" />} label="Humidity" value={fmt(data.weather?.humidity, "%")} />
            <Metric icon={<Wind className="h-4 w-4" />} label="Wind" value={fmt(data.weather?.windKph, " km/h")} />
            <Metric icon={<CloudRain className="h-4 w-4" />} label="Rain chance" value={fmt(data.weather?.precipProbability, "%")} />
            <Metric icon={<Thermometer className="h-4 w-4" />} label="UV Index" value={fmt(data.weather?.uvIndex, "")} />
          </div>

          {/* Air quality */}
          <div className="rounded-lg p-4 bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
                <Gauge className="h-4 w-4" /> Air Quality Index
              </div>
              {data.air?.aqi != null && (
                <span
                  className="text-xs font-bold px-2 py-1 rounded"
                  style={{ background: data.air.color ?? "#22c55e", color: "#0b1220" }}
                >
                  AQI {data.air.aqi}
                </span>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold">{data.air?.category ?? "—"}</div>
            {data.air?.dominantPollutant && (
              <div className="text-[11px] text-white/60 mt-0.5">
                Dominant pollutant: {data.air.dominantPollutant.toUpperCase()}
              </div>
            )}
          </div>

          <p className="text-[10px] text-white/50 text-center">
            Sources: Google Weather & Air Quality · IMD / TSDPS reference · Updated{" "}
            {new Date(data.updatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/60">
        {icon} {label}
      </div>
      <div className="text-lg font-black mt-1">{value}</div>
    </div>
  );
}

function fmt(v: number | null | undefined, suffix: string) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${Math.round(v * 10) / 10}${suffix}`;
}

function tempGradient(t: number) {
  // Heat-map style: cool blue → green → yellow → orange → red
  const stops = [
    { t: 10, c: "#1e3a8a" },
    { t: 20, c: "#0ea5e9" },
    { t: 26, c: "#10b981" },
    { t: 32, c: "#f59e0b" },
    { t: 38, c: "#ef4444" },
    { t: 45, c: "#7f1d1d" },
  ];
  const c1 = pick(t, stops);
  const c2 = pick(t + 6, stops);
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}
function pick(t: number, stops: { t: number; c: string }[]) {
  for (let i = 0; i < stops.length - 1; i++) {
    if (t <= stops[i + 1].t) return stops[i].c;
  }
  return stops[stops.length - 1].c;
}