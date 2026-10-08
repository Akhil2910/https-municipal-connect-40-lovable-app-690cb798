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
    const district = ulb?.district?.trim();
    const title = `${name} | Official Website | Government of Telangana`;
    const description =
      `Official website of ${name}${district ? `, ${district} District` : ""}, Telangana. ` +
      `Property tax, water tap connection, trade licence, building permission, birth & death certificates, grievances, news, notices and tenders.`;
    const jsonLd = ulb
      ? {
          "@context": "https://schema.org",
          "@type": "GovernmentOrganization",
          name,
          alternateName: [ulb.name, `${ulb.name} Municipal Council`],
          description,
          ...(ulb.email ? { email: ulb.email } : {}),
          ...(ulb.phone ? { telephone: ulb.phone } : {}),
          address: {
            "@type": "PostalAddress",
            ...(ulb.address ? { streetAddress: ulb.address } : {}),
            addressLocality: ulb.name,
            ...(district ? { addressRegion: `${district}, Telangana` } : { addressRegion: "Telangana" }),
            addressCountry: "IN",
          },
          areaServed: { "@type": "City", name: ulb.name },
          parentOrganization: {
            "@type": "GovernmentOrganization",
            name: "Commissioner & Director of Municipal Administration (CDMA), Government of Telangana",
          },
        }
      : null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: ulb ? `${ulb.name}, ${name}, ${ulb.name} municipal office, ${ulb.name} property tax, ${ulb.name} trade licence${district ? `, ${district}` : ""}, Telangana municipality, CDMA Telangana` : "Telangana municipality" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: name },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      scripts: jsonLd ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }] : [],
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