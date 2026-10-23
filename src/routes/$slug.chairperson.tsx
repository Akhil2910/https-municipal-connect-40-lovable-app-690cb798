import { createFileRoute } from "@tanstack/react-router";
import { Phone, User } from "lucide-react";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import type { Page, CouncilMember } from "@/lib/ulb-types";

const CHAIR_SLUGS = ["chairperson", "chairman", "chair-person"];
const VICE_SLUGS = ["vice-chairperson", "vice-chairman", "vice chairman", "vice chairperson", "vicechairperson", "vicechairman"];

export const Route = createFileRoute("/$slug/chairperson")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { pages: [] as Page[], members: [] as CouncilMember[] };
    const [pages, members] = await Promise.all([
      supabase.from("pages").select("*").eq("ulb_id", ulb.id),
      supabase.from("council_members").select("*").eq("ulb_id", ulb.id).ilike("designation", "%chair%").order("sort_order"),
    ]);
    return { pages: (pages.data ?? []) as Page[], members: (members.data ?? []) as CouncilMember[] };
  },
  component: Chairperson,
});

function pickPage(pages: Page[], slugs: string[]) {
  const norm = (s: string) => s.toLowerCase().trim().replace(/[\s_]+/g, "-");
  const set = new Set(slugs.map(norm));
  return pages.find((p) => set.has(norm(p.slug ?? "")));
}

function ProfileCard({ page, member, fallbackTitle }: { page?: Page; member?: CouncilMember; fallbackTitle: string }) {
  const img = page?.image_url || member?.photo_url;
  const name = member?.name;
  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <h2 className="font-display text-2xl font-bold text-gov-navy">{page?.title || fallbackTitle}</h2>
      <div className="mt-4 h-56 bg-gov-cream rounded-lg border flex items-center justify-center p-2">
        {img ? (
          <img src={img} alt={name ?? fallbackTitle} className="max-h-full max-w-full object-contain rounded" />
        ) : (
          <User className="h-16 w-16 text-muted-foreground/40" />
        )}
      </div>
      {name && <p className="mt-3 font-bold text-gov-navy">{name}</p>}
      {member?.ward && <p className="text-xs text-muted-foreground">{/^ward/i.test(member.ward) ? member.ward : `Ward ${member.ward}`}</p>}
      {member?.phone && (
        <a href={`tel:${member.phone}`} className="mt-1 flex items-center gap-2 text-sm text-gov-green hover:underline">
          <Phone className="h-3.5 w-3.5" /> {member.phone}
        </a>
      )}
      {(page?.body || !member) && (
        <div className="mt-4 text-sm text-foreground/80 whitespace-pre-wrap">
          {page?.body || `Profile of the ${fallbackTitle} will be published here shortly.`}
        </div>
      )}
    </div>
  );
}

function Chairperson() {
  const ulb = useUlb();
  const { pages, members } = Route.useLoaderData() as { pages: Page[]; members: CouncilMember[] };
  const isVice = (d?: string | null) => /vice/i.test(d ?? "");
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">Chairperson & Vice Chairperson</h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <ProfileCard page={pickPage(pages, CHAIR_SLUGS)} member={members.find((m) => !isVice(m.designation))} fallbackTitle="Chairperson" />
        <ProfileCard page={pickPage(pages, VICE_SLUGS)} member={members.find((m) => isVice(m.designation))} fallbackTitle="Vice Chairperson" />
      </div>
    </div>
  );
}
