import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { fetchUlbBySlug } from "@/lib/ulb-loader";
import { TopGovBar } from "@/components/site/TopGovBar";
import { UlbHeader } from "@/components/site/UlbHeader";
import { Footer } from "@/components/site/Footer";
import type { Ulb } from "@/lib/ulb-types";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => ({ ulb: await fetchUlbBySlug(params.slug) }),
  head: ({ loaderData }) => {
    const ulb = loaderData?.ulb as Ulb | undefined;
    const name = ulb ? `${ulb.name} ${ulb.type ?? "Municipality"}` : "Municipality";
    return {
      meta: [
        { title: `${name} — Official Website` },
        { name: "description", content: ulb?.about ?? `Official website of ${name}, Government of Telangana.` },
        { property: "og:title", content: name },
        { property: "og:description", content: ulb?.about ?? "Citizen services & information." },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold">Municipality not found</h1>
        <p className="text-muted-foreground mt-2">{error.message}</p>
      </div>
    </div>
  ),
  component: UlbLayout,
});

function UlbLayout() {
  const { ulb } = Route.useLoaderData() as { ulb: Ulb };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopGovBar ulbName={ulb.name} />
      <UlbHeader ulb={ulb} />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer ulb={ulb} />
    </div>
  );
}

export function useUlb(): Ulb {
  const data = useLoaderData({ from: "/$slug" }) as { ulb: Ulb };
  return data.ulb;
}