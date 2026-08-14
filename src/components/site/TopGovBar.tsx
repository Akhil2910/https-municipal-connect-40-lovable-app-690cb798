import { Link } from "@tanstack/react-router";
import { Accessibility, ArrowLeft } from "lucide-react";

function setFontScale(scale: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.fontSize = `${scale * 100}%`;
  try { localStorage.setItem("gov-font-scale", String(scale)); } catch {}
}

function adjust(delta: number) {
  let current = 1;
  try {
    const v = parseFloat(localStorage.getItem("gov-font-scale") ?? "1");
    if (!isNaN(v)) current = v;
  } catch {}
  const next = Math.min(1.4, Math.max(0.85, +(current + delta).toFixed(2)));
  setFontScale(next);
}

export function TopGovBar({ ulbName }: { ulbName?: string }) {
  return (
    <div className="bg-gov-navy text-primary-foreground text-xs">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-1.5">
        <div className="flex items-center gap-2">
          {ulbName && (
            <Link
              to="/"
              onClick={() => { try { sessionStorage.setItem("skip-launch", "1"); } catch {} }}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-1 font-semibold transition"
              aria-label="Back to all municipalities"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Municipalities
            </Link>
          )}
          <span className="opacity-90">
            Government of Telangana · {ulbName ?? "Urban Local Bodies"}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/screen-reader"
            aria-label="Screen Reader Access"
            title="Screen Reader Access"
            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <Accessibility className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1" role="group" aria-label="Font size">
            <button
              type="button"
              onClick={() => adjust(-0.1)}
              aria-label="Decrease font size"
              className="h-7 w-7 rounded bg-white/10 hover:bg-white/20 font-bold"
            >A-</button>
            <button
              type="button"
              onClick={() => setFontScale(1)}
              aria-label="Reset font size"
              className="h-7 w-7 rounded bg-white/10 hover:bg-white/20 font-bold"
            >A</button>
            <button
              type="button"
              onClick={() => adjust(0.1)}
              aria-label="Increase font size"
              className="h-7 w-7 rounded bg-white/10 hover:bg-white/20 font-bold"
            >A+</button>
          </div>
          <span className="hidden md:inline-block h-4 w-px bg-white/30 mx-1" />
          <div className="flex items-center gap-3 opacity-90">
            <a href="#main" className="hover:underline hidden sm:inline">Skip to content</a>
            <Link to="/admin/login" className="hover:underline">Staff Login</Link>
          </div>
        </div>
      </div>
      <div className="gov-tricolor-bar" />
    </div>
  );
}