import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";

/**
 * Map a public hostname to a single-ULB site.
 * Add an entry here when a municipality gets its own domain.
 * Matching is case-insensitive and ignores the port.
 */
export const HOST_SLUG_MAP: Record<string, string> = {
  mulugumunicipality: "mulugu",
};

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
  return { slug: resolveSlugFromHost(host) };
});
