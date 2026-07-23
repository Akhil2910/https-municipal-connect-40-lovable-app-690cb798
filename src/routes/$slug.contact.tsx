import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { supabase } from "@/integrations/supabase/client";
import type { Page } from "@/lib/ulb-types";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

export const Route = createFileRoute("/$slug/contact")({
  loader: async ({ params }) => {
    const { data: ulb } = await supabase.from("ulbs").select("id").eq("slug", params.slug).single();
    if (!ulb) return { page: null as Page | null };
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("ulb_id", ulb.id)
      .eq("slug", "contact")
      .maybeSingle();
    return { page: (data ?? null) as Page | null };
  },
  component: ContactPage,
});

function ContactPage() {
  const ulb = useUlb();
  const { page } = Route.useLoaderData() as { page: Page | null };
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Reach Us</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">{page?.title || "Contact Us"}</h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>

      {page?.image_url && (
        <img src={page.image_url} alt={page.title ?? "Contact"} className="mt-6 rounded-lg border max-h-80 w-full object-cover" />
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-lg p-5 space-y-3 text-sm">
          {ulb.address && (
            <p className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 text-gov-green shrink-0" /><span>{ulb.address}</span></p>
          )}
          {ulb.phone && (
            <p className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 text-gov-green shrink-0" /><a href={`tel:${ulb.phone}`}>{ulb.phone}</a></p>
          )}
          {ulb.email && (
            <p className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 text-gov-green shrink-0" /><a href={`mailto:${ulb.email}`}>{ulb.email}</a></p>
          )}
          {ulb.website && (
            <p className="flex gap-2"><Globe className="w-4 h-4 mt-0.5 text-gov-green shrink-0" /><a href={ulb.website} target="_blank" rel="noreferrer">{ulb.website}</a></p>
          )}
          {!ulb.address && !ulb.phone && !ulb.email && !ulb.website && (
            <p className="text-muted-foreground">Contact details will be updated shortly.</p>
          )}
        </div>
        <div className="bg-card border rounded-lg p-5 text-sm whitespace-pre-wrap text-foreground/80">
          {page?.body || "Office hours: Monday to Saturday, 10:30 AM to 5:00 PM. For grievances, please use the Grievance section."}
        </div>
      </div>
    </div>
  );
}