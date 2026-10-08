// Public sub-pages of each municipality site, listed in the sitemap.
export const ULB_PUBLIC_PAGES = [
  "",
  "/about",
  "/organizational-chart",
  "/council",
  "/chairperson",
  "/co-option-members",
  "/public-representatives",
  "/departments",
  "/news",
  "/notices",
  "/tenders",
  "/gallery",
  "/media-coverage",
  "/grievance",
  "/contact",
];

export function ulbDisplayName(name: string, type?: string | null) {
  return `${name} ${type ?? "Municipality"}`;
}
