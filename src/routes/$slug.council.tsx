import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import { MembersGrid } from "@/components/site/MembersGrid";
import type { CouncilMember } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/council")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { members: [] as CouncilMember[] };
    const { data } = await supabase.from("council_members").select("*").eq("ulb_id", ulb.id).order("sort_order");
    return { members: (data ?? []) as CouncilMember[] };
  },
  component: Council,
});

function Council() {
  const ulb = useUlb();
  const { members } = Route.useLoaderData() as { members: CouncilMember[] };
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">Municipal Council</h1>
      <p className="text-muted-foreground mt-2">Elected body of {ulb.name} {ulb.type ?? "Municipality"}</p>
      <MembersGrid members={members} emptyLabel="Council member details will be published here shortly." />
    </div>
  );
}