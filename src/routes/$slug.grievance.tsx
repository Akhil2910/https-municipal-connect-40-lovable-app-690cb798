import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, Mail } from "lucide-react";

export const Route = createFileRoute("/$slug/grievance")({
  head: () => ({ meta: [{ title: "Lodge a Grievance" }] }),
  component: GrievancePage,
});

const PRAJAVANI_URL = "https://prajavani.cgg.gov.in/";

function GrievancePage() {
  const ulb = useUlb();
  return (
    <section className="container mx-auto px-4 py-14 max-w-3xl">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Citizen Voice</p>
        <h1 className="font-display text-3xl md:text-4xl font-black text-gov-navy mt-2 flex items-center justify-center gap-2">
          <AlertCircle className="h-7 w-7 text-gov-saffron" /> Lodge a Grievance
        </h1>
        <div className="mx-auto mt-3 h-1 w-20 bg-gradient-to-r from-gov-saffron via-white to-gov-green rounded-full" />
        <p className="text-sm text-muted-foreground mt-3">
          Report civic issues to {ulb.name} {ulb.type ?? "Municipality"} through the Government of Telangana Prajavani portal.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 grid gap-6 shadow-sm text-center">
        <div>
          <h2 className="font-bold text-gov-navy text-lg">Prajavani Grievance Portal</h2>
          <Button asChild className="mt-3 bg-gov-green hover:bg-gov-green/90">
            <a href={PRAJAVANI_URL} target="_blank" rel="noopener noreferrer">
              Go to Prajavani <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
          <p className="text-xs text-muted-foreground mt-2 break-all">{PRAJAVANI_URL}</p>
        </div>
        {ulb.email && (
          <div className="border-t pt-6">
            <h2 className="font-bold text-gov-navy text-lg">Email the Municipality</h2>
            <a href={`mailto:${ulb.email}`} className="mt-2 inline-flex items-center gap-2 text-gov-green hover:underline break-all">
              <Mail className="h-4 w-4 shrink-0" /> {ulb.email}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
