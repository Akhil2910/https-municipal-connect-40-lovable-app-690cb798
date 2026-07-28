import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { News } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/news")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    const { data } = await supabase.from("news").select("*").eq("ulb_id", ulb!.id).eq("is_published", true).order("published_at", { ascending: false });
    return { items: (data ?? []) as News[] };
  },
  component: () => {
    const { items } = Route.useLoaderData() as { items: News[] };
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-black text-gov-navy">News & Updates</h1>
        {items.length === 0 ? <p className="mt-6 text-muted-foreground">No news yet.</p> :
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {items.map((n) => (
            <article key={n.id} className="bg-card border rounded-lg overflow-hidden">
              {n.image_url && <img src={n.image_url} alt={n.title} className="w-full h-48 object-contain bg-muted" loading="lazy" />}
              <div className="p-5">
                <p className="text-xs text-muted-foreground">{new Date(n.published_at).toLocaleDateString()}</p>
                <h3 className="font-bold mt-1">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{n.summary}</p>
              </div>
            </article>
          ))}
        </div>}
      </div>
    );
  },
});