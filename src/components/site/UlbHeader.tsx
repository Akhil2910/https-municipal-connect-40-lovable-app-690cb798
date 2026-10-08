import { Link, useParams } from "@tanstack/react-router";
const emblem = "/logos/ulb-emblem.png";
const cmPortrait = "/logos/cm-portrait.png";
const telanganaLogo = "/logos/telangana-emblem.png";
const risingLogo = "/logos/rising-2047-logo-v2.png";
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
    <header className="bg-gov-cream shadow-sm border-b">
      <div className="container mx-auto flex items-center gap-3 md:gap-6 px-4 py-3">
        <div className="flex items-center gap-3 xl:gap-6 shrink-0">
          <img
            src={telanganaLogo}
            alt="Government of Telangana emblem"
            width={120}
            height={120}
            className="h-14 w-14 md:h-20 md:w-20 xl:h-28 xl:w-28 object-contain"
          />
          <figure className="hidden lg:flex flex-col items-center">
            <img
              src={cmPortrait}
              alt="Sri A. Revanth Reddy, Hon'ble Chief Minister"
              width={88}
              height={112}
              className="h-20 w-16 xl:h-28 xl:w-24 object-cover object-top"
            />
            <figcaption className="mt-1 text-center leading-tight">
              <p className="text-xs text-foreground">Sri A.Revanth Reddy</p>
              <p className="text-[10px] text-foreground">Hon'ble Chief Minister and Minister MA&amp;UD</p>
            </figcaption>
          </figure>
        </div>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-xs md:text-base xl:text-lg text-foreground">
            Government of Telangana
          </p>
          <h1 className="font-display text-lg sm:text-2xl xl:text-3xl font-bold text-foreground leading-tight break-words">
            {ulb.name} {ulb.type ?? "Municipality"}
          </h1>
        </div>
        <div className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0">
          <img
            src={risingLogo}
            alt="Telangana Rising 2047"
            width={120}
            height={120}
            className="h-20 w-20 xl:h-28 xl:w-28 object-contain"
          />
          <img
            src="/logos/cdma-logo.jpeg"
            alt="Commissioner & Director of Municipal Administration (CDMA)"
            width={120}
            height={120}
            className="h-20 w-20 xl:h-28 xl:w-28 object-contain mix-blend-multiply"
          />
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden shrink-0 p-2 rounded border"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <nav className="bg-gov-navy text-primary-foreground">
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
                    className="block px-4 py-2.5 text-sm hover:bg-gov-navy/10 lg:hover:text-gov-navy"
                    activeProps={{ className: "block px-4 py-2.5 text-sm font-bold bg-gov-navy/10 text-gov-navy" }}
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
              className="block px-4 py-3 text-sm font-bold bg-white text-gov-navy hover:opacity-90 transition"
            >
              Ease of Doing Business ↗
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}