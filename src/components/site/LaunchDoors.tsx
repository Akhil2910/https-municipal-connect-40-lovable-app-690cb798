import { useEffect, useState } from "react";
import { Scissors, ArrowRight } from "lucide-react";

const sridevi = "/images/tk-sridevi.webp";
const emblem = "/logos/telangana-emblem.png";
const flag = "/images/independence-80.jpg";

/**
 * LAUNCH CEREMONY OVERLAY — temporary.
 * Shown on every visit/refresh of the home page.
 * Remove <LaunchDoors /> from src/routes/index.tsx after the launch program.
 */
export function LaunchDoors() {
  const [visible, setVisible] = useState(true);
  const [cut, setCut] = useState(false);
  const [wish, setWish] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const launch = () => {
    if (cut) return;
    setCut(true);
    window.setTimeout(() => setWish(true), 1500);
  };

  if (!visible || gone) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ perspective: "1600px" }} role="dialog" aria-label="Launch ceremony">
      {/* BACKDROP — flag stage sits behind the doors so the site is never revealed mid-animation */}
      <div className="absolute inset-0">
        <img src={flag} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* ===== STAGE 1 — CLOSED DOORS WITH ANNOUNCEMENT ===== */}
      <div
        className={`absolute inset-0 z-20 transition-opacity duration-700 ${wish ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {/* LEFT DOOR */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 origin-left overflow-hidden transition-transform duration-[1600ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{
            background: "var(--gradient-hero)",
            transform: cut ? "rotateY(-105deg)" : "rotateY(0deg)",
            boxShadow: "var(--shadow-elegant)",
          }}
        />
        {/* RIGHT DOOR */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 origin-right overflow-hidden border-l border-white/20 transition-transform duration-[1600ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{
            background: "var(--gradient-hero)",
            transform: cut ? "rotateY(105deg)" : "rotateY(0deg)",
            boxShadow: "var(--shadow-elegant)",
          }}
        />

        {/* ANNOUNCEMENT — centred across both doors */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-primary-foreground transition-opacity duration-500 ${cut ? "opacity-0" : "opacity-100"}`}
        >
          <img src={emblem} alt="Government of Telangana emblem" width={80} height={80} className="h-14 w-14 md:h-20 md:w-20 object-contain" />
          <p className="mt-4 text-[10px] md:text-xs uppercase tracking-[0.35em] opacity-90">Government of Telangana · CDMA</p>
          <h2 className="mt-3 font-display text-2xl md:text-5xl font-black leading-tight">
            Launch of Newly Established<br />ULB Websites
          </h2>
          <div className="mt-5 h-px w-28 bg-primary-foreground/50" />
          <img
            src={sridevi}
            alt="Dr. T.K. Sreedevi, IAS"
            width={128}
            height={128}
            className="mt-5 h-20 w-20 md:h-28 md:w-28 rounded-full object-cover ring-4 ring-primary-foreground/60"
          />
          <p className="mt-3 text-xs md:text-sm opacity-90">Launched by</p>
          <p className="font-display text-lg md:text-2xl font-black">Dr. T.K. Sreedevi, IAS</p>
          <p className="text-xs md:text-sm opacity-90">Secretary, Municipal Administration Department</p>
        </div>

        {/* RIBBON — near the bottom, clear of the text */}
        <div className="absolute inset-x-0 bottom-24 md:bottom-28 h-12 md:h-16">
          <div
            className="absolute inset-y-0 left-0 w-1/2 origin-left transition-transform duration-[1200ms] ease-in"
            style={{
              background: "linear-gradient(180deg, oklch(0.55 0.22 25) 0%, oklch(0.42 0.20 25) 50%, oklch(0.32 0.16 25) 100%)",
              transform: cut ? "rotate(-14deg) translateX(-110%)" : "none",
            }}
          />
          <div
            className="absolute inset-y-0 right-0 w-1/2 origin-right transition-transform duration-[1200ms] ease-in"
            style={{
              background: "linear-gradient(180deg, oklch(0.55 0.22 25) 0%, oklch(0.42 0.20 25) 50%, oklch(0.32 0.16 25) 100%)",
              transform: cut ? "rotate(14deg) translateX(110%)" : "none",
            }}
          />
        </div>

        {/* LAUNCH BUTTON — below the ribbon */}
        {!cut && (
          <div className="absolute inset-x-0 bottom-6 md:bottom-8 flex justify-center">
            <button
              onClick={launch}
              className="group inline-flex items-center gap-3 rounded-full bg-card px-8 py-3.5 md:px-12 md:py-4 font-display text-base md:text-xl font-black text-gov-navy shadow-[var(--shadow-elegant)] ring-4 ring-gov-saffron/70 transition hover:scale-105 active:scale-95"
            >
              <Scissors className="h-5 w-5 md:h-6 md:w-6 text-gov-green transition-transform group-hover:-rotate-12" />
              Cut the Ribbon &amp; Launch
            </button>
          </div>
        )}
      </div>

      {/* ===== STAGE 2 — INDEPENDENCE DAY WISH ===== */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${wish ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="relative h-full flex flex-col items-center justify-end pb-10 md:pb-14 gap-4 px-6 text-center text-white">
          <p className="font-display text-xl md:text-3xl font-black drop-shadow-lg">
            Wishing you all a Happy 80th Independence Day
          </p>
          <p className="text-sm md:text-lg drop-shadow">15 August 2026 · Jai Hind · జై హింద్</p>
          <button
            onClick={() => setGone(true)}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-card px-8 py-3.5 font-display text-base md:text-lg font-black text-gov-navy shadow-[var(--shadow-elegant)] ring-4 ring-gov-green/60 transition hover:scale-105 active:scale-95"
          >
            Enter the Portal
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}