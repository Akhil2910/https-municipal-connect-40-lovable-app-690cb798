import { Link, useParams } from "@tanstack/react-router";
import emblem from "@/assets/ulb-emblem.png";
import cmPortrait from "@/assets/cm-portrait.png";
import telanganaLogo from "@/assets/telangana-logo.jpg";
import risingLogo from "@/assets/rising-2047.png";
import sridevi from "@/assets/tk-sridevi.webp.asset.json";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { Ulb } from "@/lib/ulb-types";

const NAV = [
  { to: "/$slug", label: "Home" },
  { to: "/$slug/about", label: "About" },
  { to: "/$slug/departments", label: "Departments" },
  { to: "/$slug/services", label: "Citizen Services" },
  { to: "/$slug/news", label: "News" },
  { to: "/$slug/tenders", label: "Tenders" },
  { to: "/$slug/gallery", label: "Gallery" },
  { to: "/$slug/grievance", label: "Grievance" },
  { to: "/$slug/contact", label: "Contact" },
] as const;

export function UlbHeader({ ulb }: { ulb: Ulb }) {
  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug ?? ulb.slug;
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-card shadow-sm border-b">
      <div className="container mx-auto flex items-center gap-4 px-4 py-4">
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <img
            src={telanganaLogo}
            alt="Government of Telangana emblem"
            width={64}
            height={64}
            className="h-14 w-14 md:h-16 md:w-16 object-contain"
          />
          <img
            src={risingLogo}
            alt="Telangana Rising 2047"
            width={64}
            height={64}
            className="h-14 w-14 md:h-16 md:w-16 object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Government of Telangana · {ulb.type ?? "Municipality"}
          </p>
          <h1 className="font-display text-xl md:text-3xl font-black text-gov-navy truncate">
            {ulb.name} {ulb.type ?? "Municipality"}
          </h1>
          <p className="text-xs text-muted-foreground hidden md:block">
            Office of the Commissioner · ULB Code {ulb.code}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <figure className="flex flex-col items-center w-28">
            <img
              src={sridevi.url}
              alt="Dr. T.K. Sreedevi IAS"
              width={72}
              height={72}
              className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover object-top aspect-square border-2 border-gov-green shadow"
            />
            <figcaption className="mt-1 text-center leading-tight">
              <p className="text-[10px] font-bold text-gov-navy">Dr. T.K. Sreedevi IAS</p>
              <p className="text-[9px] text-muted-foreground">
                Secretary to Government, MA Dept &amp; CDMA
              </p>
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center w-28">
            <img
              src={cmPortrait}
              alt="Sri A. Revanth Reddy, Hon'ble Chief Minister"
              width={72}
              height={72}
              className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover object-top aspect-square border-2 border-gov-saffron shadow"
            />
            <figcaption className="mt-1 text-center leading-tight">
              <p className="text-[10px] font-bold text-gov-navy">Sri A. Revanth Reddy</p>
              <p className="text-[9px] text-muted-foreground">
                Hon'ble Chief Minister,<br />Government of Telangana
              </p>
            </figcaption>
          </figure>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 rounded border"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <nav className="bg-gov-green text-primary-foreground">
        <ul className={`container mx-auto px-4 ${open ? "block" : "hidden"} lg:flex flex-wrap`}>
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                params={{ slug }}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/$slug" }}
                className="block px-4 py-3 text-sm font-medium hover:bg-black/15 transition"
                activeProps={{ className: "block px-4 py-3 text-sm font-bold bg-black/20" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="lg:ml-auto">
            <a
              href="https://emunicipal.telangana.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-sm font-bold bg-gov-saffron text-gov-navy hover:opacity-90 transition"
            >
              Ease of Doing Business ↗
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}