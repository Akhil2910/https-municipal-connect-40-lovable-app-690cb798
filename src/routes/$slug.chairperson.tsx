import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import type { Page } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/chairperson")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { page: null as Page | null };
    const { data } = await supabase.from("pages").select("*").eq("ulb_id", ulb.id).eq("slug", "chairperson").maybeSingle();
    return { page: (data ?? null) as Page | null };
  },
  component: Chairperson,
});

function Chairperson() {
  const ulb = useUlb();
  const { page } = Route.useLoaderData() as { page: Page | null };
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">
        {page?.title || "Chairperson & Vice Chairperson"}
      </h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>
      {page?.image_url && (
        <img src={page.image_url} alt={page.title ?? "Chairperson"} className="mt-6 rounded-lg border max-h-96 object-cover" />
      )}
      <div className="mt-6 bg-card border rounded-lg p-6 text-sm text-foreground/80 whitespace-pre-wrap">
        {page?.body || "The Chairperson and Vice Chairperson lead the council and represent the municipality in official functions. Profiles will be published here shortly."}
      </div>
    </div>
  );
}