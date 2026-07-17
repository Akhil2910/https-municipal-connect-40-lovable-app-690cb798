import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import { MembersGrid } from "@/components/site/MembersGrid";
import type { CoOptionMember } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/co-option-members")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { members: [] as CoOptionMember[] };
    const { data } = await supabase.from("co_option_members").select("*").eq("ulb_id", ulb.id).order("sort_order");
    return { members: (data ?? []) as CoOptionMember[] };
  },
  component: CoOption,
});

function CoOption() {
  const ulb = useUlb();
  const { members } = Route.useLoaderData() as { members: CoOptionMember[] };
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">Co-option Members</h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>
      <MembersGrid members={members} emptyLabel="Co-option member details will be updated shortly." />
    </div>
  );
}