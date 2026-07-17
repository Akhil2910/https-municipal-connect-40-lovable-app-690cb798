import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import orgChart from "@/assets/org-chart.jpg.asset.json";
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
  const image = page?.image_url || orgChart.url;
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">
        {page?.title || "Organizational Chart"}
      </h1>
      <p className="text-muted-foreground mt-2">
        {ulb.name} {ulb.type ?? "Municipality"} · Administrative Hierarchy
      </p>
      <div className="mx-auto mt-3 h-1 w-20 bg-gradient-to-r from-gov-saffron via-white to-gov-green rounded-full" />

      {page?.body && <p className="mt-6 text-sm text-foreground/80 whitespace-pre-wrap">{page.body}</p>}

      <div className="mt-8 bg-card border rounded-xl p-4 md:p-8 shadow-[var(--shadow-elegant)]">
        <img
          src={image}
          alt={`Organizational chart of ${ulb.name} Municipality`}
          className="w-full h-auto mx-auto"
          loading="lazy"
        />
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Source: Directorate of Municipal Administration, Government of Telangana.
      </p>
    </div>
  );
}