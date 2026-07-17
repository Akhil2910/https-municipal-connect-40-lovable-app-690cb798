import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useUlb } from "./$slug";
import { Ticker } from "@/components/site/Ticker";
import { OnlineServices } from "@/components/site/OnlineServices";
import { WeatherPanel } from "@/components/site/WeatherPanel";
import hero from "@/assets/hero-default.jpg";
import { ArrowRight, Users, MapPin, Calendar, Landmark, Target, Eye, Map as MapIcon } from "lucide-react";
import type { News, Notice, Banner, Leadership } from "@/lib/ulb-types";
import { useEffect, useState } from "react";

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

function UlbHome() {
  const ulb = useUlb();
  const { banners, news, notices, leadership } = Route.useLoaderData() as {
    banners: Banner[]; news: News[]; notices: Notice[]; leadership: Leadership[];
  };
  const slides = banners.length ? banners : [{
    id: "default", image_url: ulb.hero_image_url ?? hero,
    title: `Welcome to ${ulb.name} ${ulb.type ?? "Municipality"}`,
    subtitle: "Building a transparent, citizen-first urban future.",
    link_url: null,
  } as unknown as Banner];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  const top = slides[idx] ?? slides[0];
  const cm = leadership.find((l) => l.role.toLowerCase().includes("chief minister")) ?? null;
  const others = leadership.filter((l) => l !== cm).slice(0, 3);
  void cm;

  return (
    <>
      <Ticker notices={notices} />

      {/* Hero / Rising Banner */}
      <section className="relative overflow-hidden min-h-[480px] md:min-h-[560px]">
        {slides.map((s, i) => (
          <img key={s.id} src={s.image_url} alt={s.title ?? ""} width={1920} height={900}
               className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === idx ? 'opacity-100' : 'opacity-0'}`} />
        ))}
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
            <a href="#online-services"
               className="bg-accent text-accent-foreground px-6 py-3 rounded-md font-bold hover:opacity-90">
              Explore Citizen Services
            </a>
            <Link to="/$slug/grievance" params={{ slug: ulb.slug }}
                  className="bg-white/10 backdrop-blur border border-white/30 px-6 py-3 rounded-md font-bold hover:bg-white/20">
              Lodge a Grievance
            </Link>
          </div>
          {slides.length > 1 && (
            <div className="mt-6 flex gap-2">
              {slides.map((s, i) => (
                <button key={s.id} aria-label={`Slide ${i + 1}`} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? 'bg-white w-8' : 'bg-white/50 w-2'}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Services */}
      {/* Municipality at a Glance — replaces generic quick links */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Know Your City</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-gov-navy mt-2">
            {ulb.name} at a Glance
          </h2>
          <div className="mx-auto mt-3 h-1 w-20 bg-gradient-to-r from-gov-saffron via-white to-gov-green rounded-full" />
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-10">
          {[
            { icon: Users, label: "Population", value: ulb.population ? ulb.population.toLocaleString("en-IN") : "—" },
            { icon: MapPin, label: "Area", value: ulb.area_sqkm ? `${ulb.area_sqkm} km²` : "—" },
            { icon: Calendar, label: "Established", value: ulb.established_year ?? "—" },
            { icon: Landmark, label: "District", value: ulb.district ?? ulb.type ?? "—" },
          ].map((s) => (
            <div key={s.label} className="bg-card border rounded-xl p-5 text-center hover:border-gov-green hover:shadow-[var(--shadow-elegant)] transition">
              <s.icon className="h-8 w-8 mx-auto text-gov-green" />
              <p className="font-display text-2xl font-black text-gov-navy mt-3">{s.value}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {ulb.about && (
            <div className="lg:col-span-1 bg-gradient-to-br from-gov-navy to-gov-navy/90 text-primary-foreground rounded-xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gov-saffron">About</p>
              <h3 className="font-display text-2xl font-black mt-2">{ulb.name}</h3>
              <p className="text-sm mt-3 opacity-90 line-clamp-6">{ulb.about}</p>
              <Link to="/$slug/about" params={{ slug: ulb.slug }}
                    className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-gov-saffron hover:underline">
                Read more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          {ulb.vision && (
            <div className="bg-card border-l-4 border-gov-green rounded-xl p-6 shadow-sm">
              <Eye className="h-7 w-7 text-gov-green" />
              <p className="text-xs font-bold uppercase tracking-widest text-accent mt-3">Our Vision</p>
              <p className="text-sm text-foreground/80 mt-2 italic">{ulb.vision}</p>
            </div>
          )}
          {ulb.mission && (
            <div className="bg-card border-l-4 border-gov-saffron rounded-xl p-6 shadow-sm">
              <Target className="h-7 w-7 text-gov-saffron" />
              <p className="text-xs font-bold uppercase tracking-widest text-accent mt-3">Our Mission</p>
              <p className="text-sm text-foreground/80 mt-2 italic">{ulb.mission}</p>
            </div>
          )}
        </div>
      </section>

      {/* Online Services Carousel */}
      <OnlineServices />

      {/* Location Map */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Find Us</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-gov-navy mt-2 flex items-center justify-center gap-2">
            <MapIcon className="h-7 w-7 text-gov-green" /> Location of {ulb.name}
          </h2>
          <div className="mx-auto mt-3 h-1 w-20 bg-gradient-to-r from-gov-saffron via-white to-gov-green rounded-full" />
          {ulb.address && <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">{ulb.address}</p>}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl overflow-hidden border shadow-[var(--shadow-elegant)] aspect-[16/10] lg:aspect-auto lg:min-h-[520px] bg-muted">
            <iframe
              title={`Map of ${ulb.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                [ulb.address, ulb.name, ulb.district, ulb.state ?? "Telangana", "India"].filter(Boolean).join(", ")
              )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
            />
          </div>
          <WeatherPanel slug={ulb.slug} ulbName={ulb.name} />
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