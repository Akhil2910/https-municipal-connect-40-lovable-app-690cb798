import { useEffect, useState } from "react";
import { Scissors } from "lucide-react";

const sridevi = "/images/tk-sridevi.webp";
const emblem = "/logos/telangana-emblem.png";

/**
 * LAUNCH CEREMONY OVERLAY — temporary.
 * Shown once per browser session on the home page.
 * Remove <LaunchDoors /> from src/routes/index.tsx after the launch program.
 */
export function LaunchDoors() {
  const [visible, setVisible] = useState(false);
  const [cut, setCut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("ulb-launch-done") === "1") return;
    setVisible(true);
  }, []);

  const launch = () => {
    if (cut) return;
    setCut(true);
    sessionStorage.setItem("ulb-launch-done", "1");
    window.setTimeout(() => setGone(true), 2600);
  };

  if (!visible || gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] ${cut ? "pointer-events-none" : ""}`}
      style={{ perspective: "1600px" }}
      role="dialog"
      aria-label="Launch ceremony"
    >
      {/* Backdrop behind the doors */}
      <div className={`absolute inset-0 bg-background transition-opacity duration-700 ${cut ? "opacity-0 delay-[1600ms]" : "opacity-100"}`} />

      {/* LEFT DOOR — launch announcement */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 origin-left overflow-hidden border-r border-white/20 transition-transform duration-[2200ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          background: "var(--gradient-hero)",
          transform: cut ? "rotateY(-105deg)" : "rotateY(0deg)",
          boxShadow: "var(--shadow-elegant)",
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 0, transparent 45%)" }} />
        <div className="relative h-full flex flex-col items-center justify-center gap-5 px-6 md:px-12 text-center text-primary-foreground">
          <img src={emblem} alt="Government of Telangana emblem" width={72} height={72} className="h-14 w-14 md:h-20 md:w-20 object-contain" />
          <p className="text-[10px] md:text-xs uppercase tracking-[0.35em] opacity-90">Government of Telangana · CDMA</p>
          <h2 className="font-display text-xl md:text-4xl font-black leading-tight">
            Launch of Newly Established<br />ULB Websites
          </h2>
          <div className="h-px w-24 bg-primary-foreground/50" />
          <img
            src={sridevi}
            alt="Dr. T.K. Sreedevi, IAS"
            width={128}
            height={128}
            className="h-20 w-20 md:h-32 md:w-32 rounded-full object-cover ring-4 ring-primary-foreground/60"
          />
          <div>
            <p className="text-xs md:text-sm opacity-90">Launched by</p>
            <p className="font-display text-base md:text-2xl font-black">Dr. T.K. Sreedevi, IAS</p>
            <p className="text-xs md:text-sm opacity-90">Secretary, Municipal Administration Department</p>
          </div>
        </div>
      </div>

      {/* RIGHT DOOR — Independence Day */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 origin-right overflow-hidden transition-transform duration-[2200ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          transform: cut ? "rotateY(105deg)" : "rotateY(0deg)",
          boxShadow: "var(--shadow-elegant)",
        }}
      >
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1" style={{ background: "var(--gov-saffron)" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background: "var(--gov-green)" }} />
        </div>
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative h-full flex flex-col items-center justify-center gap-4 px-6 md:px-12 text-center text-white">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.35em]">15 August 2026</p>
          <h2 className="font-display text-2xl md:text-5xl font-black leading-tight drop-shadow">
            Happy 80th<br />Independence Day
          </h2>
          {/* Ashoka Chakra */}
          <div className="relative h-20 w-20 md:h-32 md:w-32 rounded-full border-4 border-[#0a3a8f] animate-[spin_18s_linear_infinite]">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 block h-1/2 w-px bg-[#0a3a8f]"
                style={{ transform: `translate(-50%,-100%) rotate(${i * 15}deg)`, transformOrigin: "bottom center" }}
              />
            ))}
          </div>
          <p className="text-sm md:text-lg font-medium drop-shadow">Jai Hind · జై హింద్</p>
        </div>
      </div>

      {/* RIBBON */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 md:h-24">
        <div
          className="absolute inset-y-0 left-0 w-1/2 origin-left transition-transform duration-[1400ms] ease-in"
          style={{
            background: "linear-gradient(180deg, oklch(0.55 0.22 25) 0%, oklch(0.42 0.20 25) 50%, oklch(0.32 0.16 25) 100%)",
            transform: cut ? "rotate(-14deg) translateX(-110%)" : "none",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 origin-right transition-transform duration-[1400ms] ease-in"
          style={{
            background: "linear-gradient(180deg, oklch(0.55 0.22 25) 0%, oklch(0.42 0.20 25) 50%, oklch(0.32 0.16 25) 100%)",
            transform: cut ? "rotate(14deg) translateX(110%)" : "none",
          }}
        />
      </div>

      {/* LAUNCH BUTTON */}
      {!cut && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
          <button
            onClick={launch}
            className="group relative inline-flex items-center gap-3 rounded-full bg-card px-8 py-4 md:px-12 md:py-5 font-display text-base md:text-xl font-black text-gov-navy shadow-[var(--shadow-elegant)] ring-4 ring-gov-saffron/70 transition hover:scale-105 active:scale-95"
          >
            <Scissors className="h-5 w-5 md:h-6 md:w-6 text-gov-green transition-transform group-hover:-rotate-12" />
            Cut the Ribbon &amp; Launch
          </button>
        </div>
      )}
    </div>
  );
}