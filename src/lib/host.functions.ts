import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { supabase } from "@/integrations/supabase/client";

/**
 * Explicit overrides: hostname (or first label) -> ULB slug.
 * Only needed when the domain name does not contain the municipality slug.
 */
export const HOST_SLUG_MAP: Record<string, string> = {
  mulugumunicipality: "mulugu",
};

const GENERIC_HOSTS = ["lovable.app", "lovableproject.com", "localhost"];

/** Candidate slugs derived from a hostname, e.g. "mulugumunicipality.in" -> ["mulugumunicipality", "mulugu"]. */
export function candidateSlugsFromHost(host: string | undefined | null): string[] {
  if (!host) return [];
  const clean = host.toLowerCase().split(":")[0];
  if (GENERIC_HOSTS.some((g) => clean === g || clean.endsWith(`.${g}`))) return [];
  const out = new Set<string>();
  for (const [key, slug] of Object.entries(HOST_SLUG_MAP)) {
    if (clean === key || clean.includes(`${key}.`)) out.add(slug);
  }
  const labels = clean.split(".").filter((l) => l && l !== "www");
  for (const label of labels) {
    out.add(label);
    const stripped = label.replace(/(municipality|corporation|nagarpanchayat|municipal)$/i, "");
    if (stripped && stripped !== label) out.add(stripped);
  }
  return [...out];
}

export function resolveSlugFromHost(host: string | undefined | null): string | null {
  if (!host) return null;
  const clean = host.toLowerCase().split(":")[0];
  for (const [key, slug] of Object.entries(HOST_SLUG_MAP)) {
    if (clean === key || clean.startsWith(`${key}.`) || clean.includes(`${key}.`)) {
      return slug;
    }
  }
  return null;
}

export const getHostSlug = createServerFn({ method: "GET" }).handler(async () => {
  let host: string | null = null;
  try {
    host = getRequestHost();
  } catch {
    host = null;
  }
  const clean = host ? host.toLowerCase().split(":")[0] : null;

  // 1. Exact hostname mapping configured by the super admin (domains table).
  if (clean) {
    const bare = clean.replace(/^www\./, "");
    const { data: mapped } = await supabase
      .from("domains")
      .select("ulb_id, ulbs!inner(slug, is_active)")
      .in("hostname", [clean, bare, `www.${bare}`])
      .limit(1);
    const row = mapped?.[0] as { ulbs?: { slug: string; is_active: boolean } } | undefined;
    if (row?.ulbs?.is_active) return { slug: row.ulbs.slug };
  }

  // 2. Fall back to deriving the slug from the hostname labels.
  const candidates = candidateSlugsFromHost(host);
  if (candidates.length === 0) return { slug: null };
  const { data } = await supabase
    .from("ulbs")
    .select("slug")
    .in("slug", candidates)
    .eq("is_active", true)
    .limit(1);
  return { slug: data?.[0]?.slug ?? null };
});
