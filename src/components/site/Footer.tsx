import { Link } from "@tanstack/react-router";
import type { Ulb } from "@/lib/ulb-types";

export function Footer({ ulb }: { ulb?: Ulb }) {
  return (
    <footer className="bg-gov-navy text-primary-foreground mt-16">
      <div className="gov-tricolor-bar" />
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-bold">{ulb?.name ?? "Telangana ULBs"}</h3>
          <p className="text-sm opacity-80 mt-2">
            {ulb?.type ?? "Municipality"} Office, {ulb?.address ?? "Telangana, India"}
          </p>
          <p className="text-sm opacity-80 mt-1">{ulb?.phone ?? "Helpline: 1800-XXX-XXXX"}</p>
          <p className="text-sm opacity-80">{ulb?.email ?? "contact@ulb.telangana.gov.in"}</p>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-90">
            {ulb && <>
              <li><Link to="/$slug/about" params={{ slug: ulb.slug }} className="hover:underline">About</Link></li>
              <li><Link to="/$slug/tenders" params={{ slug: ulb.slug }} className="hover:underline">Tenders</Link></li>
              <li><Link to="/$slug/grievance" params={{ slug: ulb.slug }} className="hover:underline">Lodge Grievance</Link></li>
            </>}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Citizen Services</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li>Property Tax</li>
            <li>Trade Licenses</li>
            <li>Birth & Death Certificates</li>
            <li>Building Permissions</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Government</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><a href="https://www.telangana.gov.in" target="_blank" rel="noopener" className="hover:underline">Government of Telangana</a></li>
            <li><a href="https://cdma.telangana.gov.in" target="_blank" rel="noopener" className="hover:underline">CDMA Telangana</a></li>
            <li><a href="https://www.india.gov.in" target="_blank" rel="noopener" className="hover:underline">India.gov.in</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs opacity-75 text-center">
          © {new Date().getFullYear()} {ulb?.name ?? "Telangana ULBs"} · All rights reserved.
        </div>
      </div>
    </footer>
  );
}