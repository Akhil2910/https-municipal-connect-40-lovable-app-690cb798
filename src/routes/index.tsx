import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getHostSlug } from "@/lib/host.functions";
import { TopGovBar } from "@/components/site/TopGovBar";
import { Footer } from "@/components/site/Footer";
const emblem = "/logos/ulb-emblem.png";
const hero = "/images/hero-default.jpg";
import { Building2, ArrowRight } from "lucide-react";
import type { Ulb } from "@/lib/ulb-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telangana Urban Local Bodies — Official Portal" },
      { name: "description", content: "Official portal for the Urban Local Bodies (Municipalities) of Telangana. Citizen services, news, notices, tenders & grievances." },
      { property: "og:title", content: "Telangana Urban Local Bodies" },
      { property: "og:description", content: "Choose your Municipality to access citizen services online." },
    ],
  }),
  loader: async () => {
    const { slug } = await getHostSlug();
    if (slug) throw redirect({ to: "/$slug", params: { slug } });
    const { data, error } = await supabase
      .from("ulbs")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return { ulbs: (data ?? []) as Ulb[] };
  },
  component: Index,
});

function Index() {
  const { ulbs } = Route.useLoaderData() as { ulbs: Ulb[] };
  return (
    <div className="min-h-screen flex flex-col">
      <TopGovBar />
      <header className="bg-card border-b">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <img src={emblem} alt="Emblem" width={56} height={56} className="h-14 w-14" />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Government of Telangana</p>
            <h1 className="font-display text-2xl md:text-3xl font-black text-gov-navy">Urban Local Bodies Portal</h1>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <section className="relative overflow-hidden">
          <img src={hero} alt="" width={1920} height={1080}
               className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.9 }} />
          <div className="relative container mx-auto px-4 py-16 md:py-24 text-primary-foreground animate-fade-up">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] opacity-90">Telangana · CDMA</p>
            <h2 className="font-display text-4xl md:text-6xl font-black mt-2 max-w-3xl">
              21 New Urban Local Bodies. One Citizen Portal.
            </h2>
            <p className="mt-4 max-w-2xl text-base md:text-lg opacity-90">
              Access services, news, notices, tenders and grievance redressal for every newly notified Municipality across Telangana.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ulbs.map((u) => (
                <Link key={u.id} to="/$slug" params={{ slug: u.slug }}
                      className="group bg-card text-foreground border rounded-xl p-5 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-gov-cream flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gov-green" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl font-bold text-gov-navy">{u.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {u.type ?? "Municipality"}{u.code ? ` · Code ${u.code}` : " · Code"}
                      </p>
                      <p className="text-sm text-muted-foreground">{u.state ?? "Telangana"}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-gov-green group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
