import { createFileRoute } from "@tanstack/react-router";
import { ULB_PUBLIC_PAGES } from "@/lib/seo-pages";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabase } = await import("@/integrations/supabase/client");
        const { candidateSlugsFromHost } = await import("@/lib/host.functions");
        const url = new URL(request.url);
        const host = request.headers.get("x-forwarded-host") ?? url.host;
        const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
        const origin = `${proto}://${host}`;

        const { data } = await supabase.from("ulbs").select("slug").eq("is_active", true).order("name");
        const all = (data ?? []).map((u) => u.slug);
        // On a municipality's own domain, list only that municipality's pages.
        const candidates = candidateSlugsFromHost(host);
        const own = all.filter((s) => candidates.includes(s));
        const slugs = own.length ? own : all;

        const urls: string[] = own.length ? [] : [`${origin}/`];
        for (const s of slugs) for (const p of ULB_PUBLIC_PAGES) urls.push(`${origin}/${s}${p}`);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`)
          .join("\n")}\n</urlset>\n`;
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
