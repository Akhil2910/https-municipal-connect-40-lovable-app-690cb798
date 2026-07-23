import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import type { Gallery } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/gallery")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { items: [] as Gallery[] };
    const { data } = await supabase.from("gallery").select("*").eq("ulb_id", ulb.id).order("created_at", { ascending: false });
    return { items: (data ?? []) as Gallery[] };
  },
  component: GalleryPage,
  errorComponent: ({ error }) => <div className="container mx-auto px-4 py-12" role="alert">{error.message}</div>,
  notFoundComponent: () => <div className="container mx-auto px-4 py-12">No gallery.</div>,
});

function GalleryPage() {
  const ulb = useUlb();
  const { items } = Route.useLoaderData() as { items: Gallery[] };
  return (
    <div className="container mx-auto px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Media</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">Photo Gallery</h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>

      {items.length === 0 ? (
        <div className="mt-8 bg-card border rounded-lg p-6 text-sm text-muted-foreground">
          No photos have been uploaded yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((g) => (
            <figure key={g.id} className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="aspect-[4/3] bg-gov-cream overflow-hidden">
                {g.image_url && (
                  <img src={g.image_url} alt={g.caption ?? "Gallery image"} className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              {(g.caption || g.category) && (
                <figcaption className="p-3">
                  {g.caption && <div className="text-sm font-medium text-gov-navy truncate">{g.caption}</div>}
                  {g.category && <div className="text-xs text-muted-foreground">{g.category}</div>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}