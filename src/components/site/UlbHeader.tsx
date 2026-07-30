import { Link, useParams } from "@tanstack/react-router";
import emblem from "@/assets/ulb-emblem.png";
import cmPortrait from "@/assets/cm-portrait.png";
import telanganaLogo from "@/assets/telangana-emblem.png.asset.json";
import risingLogo from "@/assets/rising-2047-logo.png.asset.json";
import sridevi from "@/assets/tk-sridevi.webp.asset.json";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Ulb } from "@/lib/ulb-types";

const NAV = [
  { to: "/$slug", label: "Home" },
  { to: "/$slug/departments", label: "Departments" },
  { to: "/$slug/news", label: "News" },
  { to: "/$slug/tenders", label: "Tenders" },
  { to: "/$slug/gallery", label: "Gallery" },
  { to: "/$slug/contact", label: "Contact" },
] as const;

const ABOUT_ITEMS = [
  { to: "/$slug/about", label: "ULB Profile" },
  { to: "/$slug/organizational-chart", label: "Organizational Chart" },
  { to: "/$slug/council", label: "Council" },
  { to: "/$slug/co-option-members", label: "Co-option Members" },
  { to: "/$slug/chairperson", label: "Chairperson & Vice Chairperson" },
  { to: "/$slug/public-representatives", label: "Public Representatives" },
  { to: "/$slug/media-coverage", label: "Media Coverage" },
] as const;

export function UlbHeader({ ulb }: { ulb: Ulb }) {
  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug ?? ulb.slug;
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-card shadow-sm border-b">
      <div className="container mx-auto flex items-center gap-4 px-4 py-4">
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <img
            src={telanganaLogo.url}
            alt="Government of Telangana emblem"
            width={96}
            height={96}
            className="h-20 w-20 md:h-24 md:w-24 object-contain"
          />
          <img
            src={risingLogo.url}
            alt="Telangana Rising 2047"
            width={96}
            height={96}
            className="h-20 w-20 md:h-24 md:w-24 object-contain"
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
        <div className="hidden md:flex items-start gap-5 shrink-0">
          <figure className="flex flex-col items-center w-32">
            <img
              src={sridevi.url}
              alt="Dr. T.K. Sreedevi IAS"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover object-center aspect-square border-2 border-gov-green shadow bg-gov-cream"
            />
            <figcaption className="mt-1 text-center leading-tight">
              <p className="text-[10px] font-bold text-gov-navy">Dr. T.K. Sreedevi IAS</p>
              <p className="text-[9px] text-muted-foreground">
                Secretary to Government, MA Dept &amp; CDMA
              </p>
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center w-32">
            <img
              src={cmPortrait}
              alt="Sri A. Revanth Reddy, Hon'ble Chief Minister"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover object-top aspect-square border-2 border-gov-saffron shadow"
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
        <ul className={`container mx-auto px-4 ${open ? "block" : "hidden"} lg:flex lg:items-center`}>
          {NAV.slice(0, 1).map((item) => (
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
          <li className="relative group">
            <button className="w-full lg:w-auto flex items-center gap-1 px-4 py-3 text-sm font-medium hover:bg-black/15 transition">
              About <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <ul className="lg:absolute lg:left-0 lg:top-full lg:min-w-[240px] lg:bg-card lg:text-foreground lg:shadow-lg lg:border lg:rounded-b-md lg:hidden lg:group-hover:block bg-black/20 z-20">
              {ABOUT_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    params={{ slug }}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm hover:bg-gov-green/10 lg:hover:text-gov-green"
                    activeProps={{ className: "block px-4 py-2.5 text-sm font-bold bg-gov-green/10 text-gov-green" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {NAV.slice(1).map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                params={{ slug }}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium hover:bg-black/15 transition"
                activeProps={{ className: "block px-4 py-3 text-sm font-bold bg-black/20" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={`/${slug}#online-services`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium hover:bg-black/15 transition"
            >
              Citizen Services
            </a>
          </li>
          <li>
            <Link
              to="/$slug/grievance"
              params={{ slug }}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium hover:bg-black/15 transition"
              activeProps={{ className: "block px-4 py-3 text-sm font-bold bg-black/20" }}
            >
              Grievance
            </Link>
          </li>
          <li className="lg:ml-auto">
            <a
              href="https://emunicipal.telangana.gov.in/etistmvcdfwefrzxczx/hjhjhj)]"
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