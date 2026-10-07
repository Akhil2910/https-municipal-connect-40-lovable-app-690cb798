import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
const cmPortrait = "/logos/cm-portrait.png";
import type { Leadership } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/about")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { leadership: [] as Leadership[] };
    const { data } = await supabase.from("leadership").select("*").eq("ulb_id", ulb.id).order("sort_order");
    return { leadership: (data ?? []) as Leadership[] };
  },
  component: About,
});

function About() {
  const ulb = useUlb();
  const { leadership } = Route.useLoaderData() as { leadership: Leadership[] };
  const cm = leadership.find((l: Leadership) => l.role.toLowerCase().includes("chief minister")) ?? null;
  const commissioner = leadership.find((l: Leadership) => l.role.toLowerCase().includes("commissioner")) ?? null;
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-display text-4xl font-black text-gov-navy">About {ulb.name}</h1>
      <p className="text-muted-foreground mt-2">{ulb.type} · ULB Code {ulb.code}</p>

      <div className="prose mt-6">
        <p>{ulb.about ?? `${ulb.name} is one of the newly notified Urban Local Bodies of Telangana, established to deliver efficient civic services and infrastructure to its citizens.`}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-bold text-gov-green">Our Vision</h3>
          <p className="text-sm mt-2">{ulb.vision ?? "To be a model municipality known for clean, green and citizen-friendly governance."}</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-bold text-gov-green">Our Mission</h3>
          <p className="text-sm mt-2">{ulb.mission ?? "Deliver transparent, accountable and digital-first urban services for sustainable development."}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-8">
        {[
          ["Established", ulb.established_year ?? "—"],
          ["Population", ulb.population?.toLocaleString() ?? "—"],
          ["Area (sq.km)", ulb.area_sqkm ?? "—"],
          ["District", ulb.district ?? "—"],
        ].map(([k, v]) => (
          <div key={String(k)} className="bg-gov-cream border rounded-lg p-4 text-center">
            <p className="text-2xl font-black text-gov-navy">{String(v)}</p>
            <p className="text-xs text-muted-foreground">{String(k)}</p>
          </div>
        ))}
      </div>

      {/* Chief Minister's Message */}
      <section className="mt-12 bg-gov-cream border rounded-xl overflow-hidden">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] items-center p-6 md:p-8">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-gov-saffron to-gov-green opacity-20 rounded-lg" />
            <img
              src={cm?.photo_url || cmPortrait}
              alt={cm?.name ?? "Chief Minister"}
              width={240}
              height={300}
              className="relative w-full max-w-[240px] mx-auto rounded-lg aspect-[4/5] object-cover object-top shadow-[var(--shadow-elegant)]"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Message</p>
            <h3 className="font-display text-2xl md:text-3xl font-black text-gov-navy mt-1">
              {cm?.name ?? "Sri A. Revanth Reddy"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {cm?.role ?? "Hon'ble Chief Minister, Government of Telangana"}
            </p>
            <blockquote className="mt-4 border-l-4 border-gov-saffron pl-4 italic text-foreground/80">
              {cm?.message ?? `Together, we are building a model municipality at ${ulb.name} — efficient, accountable and citizen-centric.`}
            </blockquote>
          </div>
        </div>
      </section>

      {/* Secretary MA&UD / CDMA */}
      <section className="mt-8 bg-gov-cream border rounded-xl overflow-hidden">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] items-center p-6 md:p-8">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-gov-saffron to-gov-green opacity-20 rounded-lg" />
            <img
              src="/images/tk-sridevi.webp"
              alt="Dr. T.K. Sreedevi IAS"
              width={240}
              height={300}
              className="relative w-full max-w-[240px] mx-auto rounded-lg aspect-[4/5] object-cover object-top shadow-[var(--shadow-elegant)]"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Leadership</p>
            <h3 className="font-display text-2xl md:text-3xl font-black text-gov-navy mt-1">Dr. T.K. Sreedevi IAS</h3>
            <p className="text-sm text-muted-foreground">Secretary to Government, MA&amp;UD Dept &amp; CDMA, Government of Telangana</p>
          </div>
        </div>
      </section>


      {/* Commissioner's Message */}
      {commissioner && (
        <section className="mt-8 bg-card border rounded-xl overflow-hidden">
          <div className="grid gap-6 md:grid-cols-[240px_1fr] items-center p-6 md:p-8">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-gov-green to-gov-navy opacity-20 rounded-lg" />
              {commissioner.photo_url ? (
                <img
                  src={commissioner.photo_url}
                  alt={commissioner.name}
                  width={240}
                  height={300}
                  className="relative w-full max-w-[240px] mx-auto rounded-lg aspect-[4/5] object-cover object-top shadow-[var(--shadow-elegant)]"
                />
              ) : (
                <div className="relative w-full max-w-[240px] mx-auto rounded-lg aspect-[4/5] bg-muted grid place-items-center text-muted-foreground text-sm">
                  Photo coming soon
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent">Message</p>
              <h3 className="font-display text-2xl md:text-3xl font-black text-gov-navy mt-1">
                {commissioner.name}
              </h3>
              <p className="text-sm text-muted-foreground">{commissioner.role}</p>
              {commissioner.message && (
                <blockquote className="mt-4 border-l-4 border-gov-green pl-4 italic text-foreground/80">
                  {commissioner.message}
                </blockquote>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}