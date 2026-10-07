import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import type { Page } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/organizational-chart")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { page: null as Page | null };
    const { data } = await supabase.from("pages").select("*").eq("ulb_id", ulb.id).eq("slug", "organizational-chart").maybeSingle();
    return { page: (data ?? null) as Page | null };
  },
  component: OrgChart,
});

function OrgChart() {
  const ulb = useUlb();
  const { page } = Route.useLoaderData() as { page: Page | null };
  const image = page?.image_url;
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">
        {page?.title || "Organizational Chart"}
      </h1>
      <p className="text-muted-foreground mt-2">
        {ulb.name} {ulb.type ?? "Municipality"} · Administrative Hierarchy
      </p>
      <div className="mx-auto mt-3 h-1 w-20 bg-gradient-to-r from-gov-navy via-gov-navy/60 to-gov-navy/20 rounded-full" />

      {page?.body && <p className="mt-6 text-sm text-foreground/80 whitespace-pre-wrap">{page.body}</p>}

      <div className="mt-8 bg-card border rounded-xl p-4 md:p-8 shadow-[var(--shadow-elegant)] overflow-x-auto">
        {image ? (
          <img src={image} alt={`Organizational chart of ${ulb.name}`} className="w-full h-auto mx-auto" loading="lazy" />
        ) : (
          <BlueChart />
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Source: Directorate of Municipal Administration, Government of Telangana.
      </p>
    </div>
  );
}
type Node = { title: string; sub?: string; children?: Node[]; staff?: string[] };

const CHART: Node[] = [
  { title: "Engineering", sub: "M.E.", children: [
    { title: "Civil Works", staff: ["A.E.", "W.I.", "Workers", "Watchmen"] },
    { title: "Street Lighting", staff: ["A.E.", "L.S.", "Workers"] },
  ]},
  { title: "Town Planning", sub: "T.P.O.", children: [
    { title: "T.P.S, T.P.B.O", staff: ["Tracer", "Chainmen"] },
  ]},
  { title: "Public Health", sub: "M.H.O.", children: [
    { title: "Sanitation", staff: ["S.S.", "S.I.", "H.A.", "Sanitary Ministry", "Driver", "Cleaner", "Sweeper", "Drain Cleaner", "Workers", "Watchmen"] },
    { title: "Dispensaries", staff: ["M.N.O.", "F.N.O.", "Watchmen"] },
    { title: "Maternity Services", staff: ["W.M.O.", "Ayah", "Watchmen"] },
  ]},
  { title: "Administration", children: [
    { title: "Ministerial Manager", staff: ["Sr Asst.", "Jr Asst.", "Typist", "R.A.", "Attenders", "Watchmen"] },
    { title: "Revenue R.O.", staff: ["R.I.", "B.O.", "Attenders"] },
    { title: "Accounts Accountant", staff: ["Sr Asst.", "Jr Asst.", "Attenders"] },
  ]},
  { title: "U.P.A.", sub: "P.O.", children: [{ title: "C.O." }] },
];

function BlueChart() {
  return (
    <div className="min-w-[900px] flex flex-col items-center">
      <div className="rounded-full bg-gov-navy text-primary-foreground px-12 py-4 font-display text-2xl font-bold shadow-lg">
        Commissioner
      </div>
      <div className="h-6 w-px bg-gov-navy/40" />
      <div className="w-full border-t-2 border-dashed border-gov-navy/40" />
      <div className="grid grid-cols-5 gap-4 w-full">
        {CHART.map((d) => (
          <div key={d.title} className="flex flex-col items-center">
            <div className="h-5 w-px bg-gov-navy/40" />
            <div className="w-full rounded-lg bg-gov-navy/80 text-primary-foreground text-center px-3 py-2 shadow">
              <p className="font-bold text-sm">{d.title}</p>
              {d.sub && <p className="text-xs opacity-90">{d.sub}</p>}
            </div>
            <div className="flex flex-col gap-3 mt-3 w-full">
              {d.children?.map((c) => (
                <div key={c.title} className="flex flex-col items-center">
                  <div className="h-3 w-px bg-gov-navy/40" />
                  <div className="w-full rounded-full bg-gov-navy/15 text-gov-navy border border-gov-navy/40 text-center px-2 py-1 text-xs font-bold">
                    {c.title}
                  </div>
                  {c.staff && (
                    <div className="mt-2 w-full rounded-md bg-gov-navy/5 border border-gov-navy/20 text-gov-navy text-center px-2 py-2 text-xs leading-relaxed">
                      {c.staff.join(" · ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
