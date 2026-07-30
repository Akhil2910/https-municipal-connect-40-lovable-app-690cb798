import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import { MembersGrid, type MemberLike } from "@/components/site/MembersGrid";
import type { CouncilMember, CoOptionMember, PublicRepresentative } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/council")({
  loader: async ({ params }) => {
    const empty = {
      members: [] as CouncilMember[],
      coOption: [] as CoOptionMember[],
      reps: [] as PublicRepresentative[],
    };
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return empty;
    const [council, coOption, reps] = await Promise.all([
      supabase.from("council_members").select("*").eq("ulb_id", ulb.id).order("sort_order"),
      supabase.from("co_option_members").select("*").eq("ulb_id", ulb.id).order("sort_order"),
      supabase.from("public_representatives").select("*").eq("ulb_id", ulb.id).order("sort_order"),
    ]);
    return {
      members: (council.data ?? []) as CouncilMember[],
      coOption: (coOption.data ?? []) as CoOptionMember[],
      reps: (reps.data ?? []) as PublicRepresentative[],
    };
  },
  component: Council,
});

const isChair = (d?: string | null) => /chair/i.test(d ?? "") && !/vice/i.test(d ?? "");
const isViceChair = (d?: string | null) => /vice[\s-]*chair/i.test(d ?? "");

function Section({ title, members, emptyLabel }: { title: string; members: MemberLike[]; emptyLabel: string }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold text-gov-navy border-b pb-2">{title}</h2>
      <MembersGrid members={members} emptyLabel={emptyLabel} />
    </section>
  );
}

function Council() {
  const ulb = useUlb();
  const { members, coOption, reps } = Route.useLoaderData() as {
    members: CouncilMember[];
    coOption: CoOptionMember[];
    reps: PublicRepresentative[];
  };

  const leaders = members.filter((m) => isChair(m.designation) || isViceChair(m.designation));
  const ordered = [
    ...leaders.filter((m) => isChair(m.designation)),
    ...leaders.filter((m) => isViceChair(m.designation)),
  ];
  const ward = members.filter((m) => !leaders.includes(m));

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">Municipal Council</h1>
      <p className="text-muted-foreground mt-2">Elected body of {ulb.name} {ulb.type ?? "Municipality"}</p>

      {ordered.length > 0 && (
        <Section title="Chairperson & Vice Chairperson" members={ordered} emptyLabel="" />
      )}
      <section className="mt-12">
        <MembersGrid
          members={[...ward, ...coOption]}
          emptyLabel="Council member details will be published here shortly."
        />
      </section>
      <Section title="Public Representatives" members={reps} emptyLabel="MPs, MLAs, and other public representatives will be listed here." />
    </div>
  );
}