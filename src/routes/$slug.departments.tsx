import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useUlb } from "./$slug";
import type { Department } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug/departments")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    const { data } = await supabase.from("departments").select("*").eq("ulb_id", ulb!.id).order("name");
    return { items: (data ?? []) as Department[] };
  },
  component: () => {
    const ulb = useUlb();
    const { items } = Route.useLoaderData() as { items: Department[] };
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-black text-gov-navy">Departments</h1>
        <p className="text-muted-foreground mt-1">{ulb.name} {ulb.type}</p>
        {items.length === 0 ? (
          <p className="mt-8 text-muted-foreground">Department information will be published soon.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {items.map((d) => (
              <div key={d.id} className="bg-card border rounded-lg p-5">
                <h3 className="font-bold text-gov-navy">{d.name}</h3>
                {d.head_name && <p className="text-sm">Head: {d.head_name}</p>}
                {d.description && <p className="text-sm text-muted-foreground mt-2">{d.description}</p>}
                <div className="text-xs text-muted-foreground mt-3 space-y-1">
                  {d.phone && <p>📞 {d.phone}</p>}
                  {d.email && <p>✉️ {d.email}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});