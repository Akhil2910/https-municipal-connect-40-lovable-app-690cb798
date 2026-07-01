import { useState } from "react";
import {
  Receipt, Home, Droplet, Store, RefreshCw, Megaphone,
  RadioTower, FileSignature, Building2, Construction,
  AlertCircle, Baby, ChevronLeft, ChevronRight, Briefcase,
} from "lucide-react";

export type OnlineService = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
};

export const DEFAULT_ONLINE_SERVICES: OnlineService[] = [
  { label: "Property Tax",                 icon: Receipt,        url: "https://cdma.cgg.gov.in/cdma_arbs/CDMA_PG/PTMenu" },
  { label: "Property Tax (Vacant Land)",   icon: Home,           url: "https://cdma.cgg.gov.in/cdma_arbs/CDMA_VLT/VLTMenu" },
  { label: "Water Tap Connection",         icon: Droplet,        url: "https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/ljkljkljkl" },
  { label: "Trade Licence",                icon: Store,          url: "https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/dgdfgdfgdfgfd" },
  { label: "Trade Licence Renewal",        icon: RefreshCw,      url: "https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/gdfgdfgdf" },
  { label: "Signage Licence (Ads)",        icon: Megaphone,      url: "https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/bnmbmbnmbn" },
  { label: "Mobile Towers",                icon: RadioTower,     url: "https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/kjhkjhkjhkjh" },
  { label: "Mutations",                    icon: FileSignature,  url: "https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/cbvcbvcbcv" },
  { label: "Building Permission",          icon: Building2,      url: "https://buildnow.telangana.gov.in/" },
  { label: "Road Cutting Permission",      icon: Construction,   url: "https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/sdfsfsdfsdf" },
  { label: "Grievances",                   icon: AlertCircle,    url: "https://egovindia.in/ulbwisecomplaints/index.php" },
  { label: "Unified Birth & Death",        icon: Baby,           url: "https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/mnmbnmnbmnbm" },
  { label: "Ease of Doing Business",       icon: Briefcase,      url: "https://cdma.cgg.gov.in/EoDB" },
];

export function OnlineServices({ services = DEFAULT_ONLINE_SERVICES }: { services?: OnlineService[] }) {
  const [start, setStart] = useState(0);
  const visible = 5;
  const max = Math.max(0, services.length - visible);
  const prev = () => setStart((s) => Math.max(0, s - 1));
  const next = () => setStart((s) => Math.min(max, s + 1));
  const window = services.slice(start, start + visible);
  const centerIdx = Math.floor(visible / 2);

  return (
    <section id="online-services" className="relative bg-gov-cream/40 border-y scroll-mt-24">
      <div className="container mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Citizen Portal</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-gov-navy mt-2">
            Online Services
          </h2>
          <div className="mx-auto mt-3 h-1 w-20 bg-gradient-to-r from-gov-saffron via-white to-gov-green rounded-full" />
        </div>

        <div className="relative">
          <button
            onClick={prev}
            disabled={start === 0}
            aria-label="Previous services"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-0 md:px-16">
            {window.map((s, i) => {
              const isCenter = i === centerIdx;
              return (
                <a
                  key={`${s.label}-${start}-${i}`}
                  href={s.url}
                  target={s.url.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`group bg-card border-2 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 ${
                    isCenter
                      ? "border-gov-green shadow-[var(--shadow-elegant)] scale-105 md:scale-110 py-10 px-4"
                      : "border-border/60 hover:border-gov-green/60 hover:-translate-y-1 py-8 px-4 opacity-90"
                  }`}
                >
                  <s.icon className={`mb-3 transition ${isCenter ? "h-14 w-14 text-gov-green" : "h-12 w-12 text-gov-navy group-hover:text-gov-green"}`} />
                  <p className={`font-bold ${isCenter ? "text-gov-navy text-base" : "text-sm text-foreground/80"}`}>
                    {s.label}
                  </p>
                </a>
              );
            })}
          </div>

          <button
            onClick={next}
            disabled={start >= max}
            aria-label="Next services"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStart(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === start ? "w-8 bg-gov-green" : "w-2 bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}