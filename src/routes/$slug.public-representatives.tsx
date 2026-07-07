import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";

export const Route = createFileRoute("/$slug/public-representatives")({
  component: PublicReps,
});

function PublicReps() {
  const ulb = useUlb();
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">About</p>
      <h1 className="font-display text-4xl font-black text-gov-navy mt-2">Public Representatives</h1>
      <p className="text-muted-foreground mt-2">{ulb.name} {ulb.type ?? "Municipality"}</p>
      <div className="mt-6 bg-card border rounded-lg p-6 text-sm text-foreground/80">
        MPs, MLAs, and other public representatives serving the municipality area will be
        listed here.
      </div>
    </div>
  );
}