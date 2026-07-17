import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import { MembersGrid } from "@/components/site/MembersGrid";
import type { PublicRepresentative } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/public-representatives")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { members: [] as PublicRepresentative[] };
    const { data } = await supabase.from("public_representatives").select("*").eq("ulb_id", ulb.id).order("sort_order");
    return { members: (data ?? []) as PublicRepresentative[] };
  },
  component: PublicReps,
});

function PublicReps() {
  const ulb = useUlb();
  const { members } = Route.useLoaderData() as { members: PublicRepresentative[] };
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">Public Representatives</h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>
      <MembersGrid members={members} emptyLabel="MPs, MLAs, and other public representatives will be listed here." />
    </div>
  );
}