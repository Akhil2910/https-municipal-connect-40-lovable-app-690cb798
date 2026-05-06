import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useUlb } from "./$slug";
import { Ticker } from "@/components/site/Ticker";
import hero from "@/assets/hero-default.jpg";
import cmPortrait from "@/assets/cm-portrait.jpg";
import {
  FileText, Receipt, ScrollText, Hammer, Camera, Building2,
  AlertCircle, Phone, ArrowRight,
} from "lucide-react";
import type { News, Notice, Banner, Leadership } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) throw new Error("Not found");
    const [banners, news, notices, leadership] = await Promise.all([
      supabase.from("banners").select("*").eq("ulb_id", ulb.id).eq("is_active", true).order("sort_order"),
      supabase.from("news").select("*").eq("ulb_id", ulb.id).eq("is_published", true).order("published_at", { ascending: false }).limit(6),
      supabase.from("notices").select("*").eq("ulb_id", ulb.id).order("notice_date", { ascending: false }).limit(8),
      supabase.from("leadership").select("*").eq("ulb_id", ulb.id).order("sort_order"),
    ]);
    return {
      banners: (banners.data ?? []) as Banner[],
      news: (news.data ?? []) as News[],
      notices: (notices.data ?? []) as Notice[],
      leadership: (leadership.data ?? []) as Leadership[],
    };
  },
  component: UlbHome,
});

const QUICK = [
  { icon: Receipt, label: "Property Tax", to: "property-tax" },
  { icon: FileText, label: "Trade License", to: "trade-license" },
  { icon: ScrollText, label: "Birth & Death", to: "certificates" },
  { icon: Building2, label: "Building Permit", to: "building-permit" },
  { icon: Hammer, label: "Tenders", to: "tenders" },
  { icon: AlertCircle, label: "Grievance", to: "grievance" },
  { icon: Camera, label: "Gallery", to: "gallery" },
  { icon: Phone, label: "Contact", to: "contact" },
];

function UlbHome() {
  const ulb = useUlb();
  const { banners, news, notices, leadership } = Route.useLoaderData() as {
    banners: Banner[]; news: News[]; notices: Notice[]; leadership: Leadership[];
  };
  const slides = banners.length ? banners : [{
    id: "default", image_url: hero,
    title: `Welcome to ${ulb.name} ${ulb.type ?? "Municipality"}`,
    subtitle: "Building a transparent, citizen-first urban future.",
    link_url: null,
  } as unknown as Banner];
  const top = slides[0];
  const cm = leadership.find((l) => l.role.toLowerCase().includes("chief minister")) ?? null;
  const others = leadership.filter((l) => l !== cm).slice(0, 3);

  return (
    <>
      <Ticker notices={notices} />

      {/* Hero / Rising Banner */}
      <section className="relative overflow-hidden">
        <img src={top.image_url} alt={top.title ?? ""} width={1920} height={900}
             className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.78 }} />
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-primary-foreground animate-fade-up">
          <p className="text-sm uppercase tracking-[0.3em] opacity-90">Government of Telangana</p>
          <h2 className="font-display text-4xl md:text-6xl font-black mt-3 max-w-3xl">
            {top.title ?? `Welcome to ${ulb.name}`}
          </h2>
          <p className="mt-4 max-w-2xl text-lg opacity-95">
            {top.subtitle ?? "Empowering citizens through transparent governance and digital services."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/$slug/services" params={{ slug: ulb.slug }}
                  className="bg-accent text-accent-foreground px-6 py-3 rounded-md font-bold hover:opacity-90">
              Explore Citizen Services
            </Link>
            <Link to="/$slug/grievance" params={{ slug: ulb.slug }}
                  className="bg-white/10 backdrop-blur border border-white/30 px-6 py-3 rounded-md font-bold hover:bg-white/20">
              Lodge a Grievance
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Services */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {QUICK.map((q) => (
            <Link key={q.label} to="/$slug/services" params={{ slug: ulb.slug }}
                  className="bg-card border rounded-lg p-4 text-center hover:border-gov-green hover:shadow-[var(--shadow-elegant)] transition group">
              <q.icon className="h-7 w-7 mx-auto text-gov-green group-hover:scale-110 transition" />
              <p className="text-xs font-medium mt-2">{q.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CM / Leadership Banner */}
      <section className="bg-gov-cream border-y">
        <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-[280px_1fr] items-center">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-gov-saffron to-gov-green opacity-20 rounded-lg" />
            <img src={cm?.photo_url || cmPortrait} alt={cm?.name ?? "Chief Minister"}
                 width={280} height={350} className="relative w-full max-w-[280px] mx-auto rounded-lg object-cover shadow-[var(--shadow-elegant)]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Message</p>
            <h3 className="font-display text-3xl font-black text-gov-navy mt-1">
              {cm?.name ?? "Hon'ble Chief Minister"}
            </h3>
            <p className="text-sm text-muted-foreground">{cm?.role ?? "Chief Minister, Government of Telangana"}</p>
            <blockquote className="mt-4 border-l-4 border-gov-saffron pl-4 italic text-foreground/80">
              {cm?.message ?? `Together, we are building a model municipality at ${ulb.name} — efficient, accountable and citizen-centric.`}
            </blockquote>
          </div>
        </div>
      </section>

      {/* News + Notices */}
      <section className="container mx-auto px-4 py-16 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-black text-gov-navy">Latest News</h3>
            <Link to="/$slug/news" params={{ slug: ulb.slug }} className="text-sm text-gov-green font-bold flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {news.length === 0 ? (
            <p className="text-sm text-muted-foreground">No news yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {news.map((n) => (
                <article key={n.id} className="bg-card border rounded-lg overflow-hidden hover:shadow-[var(--shadow-elegant)] transition">
                  {n.image_url && <img src={n.image_url} alt="" className="w-full h-40 object-cover" loading="lazy" />}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">{new Date(n.published_at).toLocaleDateString()}</p>
                    <h4 className="font-bold mt-1">{n.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <aside>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-black text-gov-navy">Notices</h3>
            <Link to="/$slug/notices" params={{ slug: ulb.slug }} className="text-sm text-gov-green font-bold flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="bg-card border rounded-lg divide-y">
            {notices.length === 0 && <li className="p-4 text-sm text-muted-foreground">No notices yet.</li>}
            {notices.map((n) => (
              <li key={n.id} className="p-4 hover:bg-muted/50">
                <p className="text-xs text-accent font-bold uppercase">{n.category ?? "Notice"}</p>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.notice_date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* Leadership */}
      {others.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h3 className="font-display text-2xl font-black text-gov-navy mb-6">Leadership</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {others.map((l) => (
              <div key={l.id} className="bg-card border rounded-lg p-4 flex gap-4">
                {l.photo_url && <img src={l.photo_url} alt={l.name} className="h-20 w-20 rounded-full object-cover" />}
                <div>
                  <h4 className="font-bold">{l.name}</h4>
                  <p className="text-sm text-muted-foreground">{l.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}