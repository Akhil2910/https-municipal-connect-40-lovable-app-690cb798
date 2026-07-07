import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";

export const Route = createFileRoute("/$slug/chairperson")({
  component: Chairperson,
});

function Chairperson() {
  const ulb = useUlb();
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">
        Chairperson &amp; Vice Chairperson
      </h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>
      <div className="mt-6 bg-card border rounded-lg p-6 text-sm text-foreground/80">
        The Chairperson and Vice Chairperson lead the council and represent the municipality
        in official functions. Profiles will be published here shortly.
      </div>
    </div>
  );
}