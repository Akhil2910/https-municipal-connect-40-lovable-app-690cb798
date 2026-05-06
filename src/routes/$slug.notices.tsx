import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Notice } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/notices")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    const { data } = await supabase.from("notices").select("*").eq("ulb_id", ulb!.id).order("notice_date", { ascending: false });
    return { items: (data ?? []) as Notice[] };
  },
  component: () => {
    const { items } = Route.useLoaderData() as { items: Notice[] };
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-black text-gov-navy">Notices & Circulars</h1>
        <ul className="mt-8 bg-card border rounded-lg divide-y">
          {items.length === 0 && <li className="p-6 text-muted-foreground">No notices yet.</li>}
          {items.map((n) => (
            <li key={n.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-accent font-bold uppercase">{n.category ?? "Notice"}</p>
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(n.notice_date).toLocaleDateString()}</p>
              </div>
              {n.file_url && <a href={n.file_url} target="_blank" rel="noopener" className="text-sm text-gov-green font-bold underline">Download</a>}
            </li>
          ))}
        </ul>
      </div>
    );
  },
});