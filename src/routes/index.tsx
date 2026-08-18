import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getHostSlug } from "@/lib/host.functions";
import { TopGovBar } from "@/components/site/TopGovBar";
import { Footer } from "@/components/site/Footer";
import { LaunchDoors } from "@/components/site/LaunchDoors";
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

/**
 * LAUNCH MODE — temporary.
 * While only the launch municipalities should be visible on the home page,
 * keep LAUNCH_MODE = true.
 * AFTER THE LAUNCH PROGRAM: set LAUNCH_MODE = false to show all 21 again.
 */
const LAUNCH_MODE = false;
const LAUNCH_SLUGS = ["mulugu", "moinabad", "kohir", "chevella", "aswaraopeta", "kalluru"];

function Index() {
  const { ulbs: allUlbs } = Route.useLoaderData() as { ulbs: Ulb[] };
  const ulbs = LAUNCH_MODE
    ? LAUNCH_SLUGS.map((s) => allUlbs.find((u) => u.slug === s)).filter(Boolean) as Ulb[]
    : allUlbs;
  return (
    <div className="min-h-screen flex flex-col">
      <LaunchDoors />
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
          <div className="relative container mx-auto px-4 py-10 md:py-14 text-primary-foreground animate-fade-up">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] opacity-90">Telangana · CDMA</p>
            <h2 className="font-display text-3xl md:text-4xl font-black mt-2">
              Choose your Municipality
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ulbs.map((u) => (
                <Link key={u.id} to="/$slug" params={{ slug: u.slug }}
                      className="group bg-card text-foreground border rounded-2xl p-7 md:p-8 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-gov-cream flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-gov-green" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl md:text-3xl font-black text-gov-navy truncate">{u.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{u.type} · {u.state}</p>
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
