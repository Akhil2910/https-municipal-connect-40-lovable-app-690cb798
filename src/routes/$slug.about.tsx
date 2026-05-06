import { createFileRoute } from "@tanstack/react-router";
import { useUlb } from "./$slug";

export const Route = createFileRoute("/$slug/about")({
  component: About,
});

function About() {
  const ulb = useUlb();
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-display text-4xl font-black text-gov-navy">About {ulb.name}</h1>
      <p className="text-muted-foreground mt-2">{ulb.type} · ULB Code {ulb.code}</p>

      <div className="prose mt-6">
        <p>{ulb.about ?? `${ulb.name} is one of the newly notified Urban Local Bodies of Telangana, established to deliver efficient civic services and infrastructure to its citizens.`}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-bold text-gov-green">Our Vision</h3>
          <p className="text-sm mt-2">{ulb.vision ?? "To be a model municipality known for clean, green and citizen-friendly governance."}</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-bold text-gov-green">Our Mission</h3>
          <p className="text-sm mt-2">{ulb.mission ?? "Deliver transparent, accountable and digital-first urban services for sustainable development."}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-8">
        {[
          ["Established", ulb.established_year ?? "—"],
          ["Population", ulb.population?.toLocaleString() ?? "—"],
          ["Area (sq.km)", ulb.area_sqkm ?? "—"],
          ["District", ulb.district ?? "—"],
        ].map(([k, v]) => (
          <div key={String(k)} className="bg-gov-cream border rounded-lg p-4 text-center">
            <p className="text-2xl font-black text-gov-navy">{String(v)}</p>
            <p className="text-xs text-muted-foreground">{String(k)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}