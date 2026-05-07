import { Link, useParams } from "@tanstack/react-router";
import emblem from "@/assets/ulb-emblem.png";
import cmPortrait from "@/assets/cm-portrait.png";
import telanganaLogo from "@/assets/telangana-logo.jpg";
import risingLogo from "@/assets/rising-2047.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { Ulb } from "@/lib/ulb-types";

const NAV = [
  { to: "/$slug", label: "Home" },
  { to: "/$slug/about", label: "About" },
  { to: "/$slug/departments", label: "Departments" },
  { to: "/$slug/services", label: "Citizen Services" },
  { to: "/$slug/news", label: "News" },
  { to: "/$slug/notices", label: "Notices" },
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
        <img
          src={cmPortrait}
          alt="Hon'ble Chief Minister of Telangana"
          width={72}
          height={72}
          className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-gov-saffron shadow"
        />
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
        </ul>
      </nav>
    </header>
  );
}