import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import type { Tender } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/tenders")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { tenders: [] as Tender[] };
    const { data } = await supabase
      .from("tenders")
      .select("*")
      .eq("ulb_id", ulb.id)
      .order("published_date", { ascending: false });
    return { tenders: (data ?? []) as Tender[] };
  },
  component: TendersPage,
});

function TendersPage() {
  const ulb = useUlb();
  const { tenders } = Route.useLoaderData() as { tenders: Tender[] };
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Procurement</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">Tenders & Notifications</h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>

      {tenders.length === 0 ? (
        <div className="mt-8 bg-card border rounded-lg p-8 text-center text-muted-foreground">
          No tenders published yet. Please check back soon.
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {tenders.map((t) => (
            <article key={t.id} className="bg-card border rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-bold text-gov-navy">{t.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.reference_no && <>Ref: {t.reference_no} · </>}
                  {t.category && <>{t.category} · </>}
                  Status: <span className="uppercase">{t.status ?? "open"}</span>
                </p>
                {t.description && <p className="text-sm mt-2 text-foreground/80">{t.description}</p>}
                <p className="text-xs text-muted-foreground mt-2">
                  {t.published_date && <>Published: {t.published_date} · </>}
                  {t.last_date && <>Last date: {t.last_date}</>}
                </p>
              </div>
              {t.file_url && (
                <a
                  href={t.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center px-4 py-2 rounded-md bg-gov-green text-primary-foreground text-sm font-semibold hover:opacity-90"
                >
                  View / Download ↗
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}