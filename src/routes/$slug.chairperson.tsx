import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import type { Page } from "@/lib/ulb-types";

const CHAIR_SLUGS = ["chairperson", "chairman", "chair-person"];
const VICE_SLUGS = ["vice-chairperson", "vice-chairman", "vice chairman", "vice chairperson", "vicechairperson", "vicechairman"];

export const Route = createFileRoute("/$slug/chairperson")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { pages: [] as Page[] };
    const { data } = await supabase.from("pages").select("*").eq("ulb_id", ulb.id);
    return { pages: (data ?? []) as Page[] };
  },
  component: Chairperson,
});

function pickPage(pages: Page[], slugs: string[]) {
  const norm = (s: string) => s.toLowerCase().trim().replace(/[\s_]+/g, "-");
  const set = new Set(slugs.map(norm));
  return pages.find((p) => set.has(norm(p.slug ?? "")));
}

function ProfileCard({ page, fallbackTitle }: { page: Page | undefined; fallbackTitle: string }) {
  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <h2 className="font-display text-2xl font-bold text-gov-navy">{page?.title || fallbackTitle}</h2>
      {page?.image_url && (
        <img src={page.image_url} alt={page.title ?? fallbackTitle} className="mt-4 rounded-lg border w-full max-h-80 object-cover" />
      )}
      <div className="mt-4 text-sm text-foreground/80 whitespace-pre-wrap">
        {page?.body || `Profile of the ${fallbackTitle} will be published here shortly.`}
      </div>
    </div>
  );
}

function Chairperson() {
  const ulb = useUlb();
  const { pages } = Route.useLoaderData() as { pages: Page[] };
  const chair = pickPage(pages, CHAIR_SLUGS);
  const vice = pickPage(pages, VICE_SLUGS);
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">
        Chairperson & Vice Chairperson
      </h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <ProfileCard page={chair} fallbackTitle="Chairperson" />
        <ProfileCard page={vice} fallbackTitle="Vice Chairperson" />
      </div>
    </div>
  );
}