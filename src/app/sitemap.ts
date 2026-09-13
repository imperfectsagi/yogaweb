import { MetadataRoute } from "next";
import { SITE } from "@/lib/utils";
import { getPublishedServices, getPublishedPosts } from "@/lib/db";

type ServiceSlug = { slug: string };
type PostSlug = { slug: string; published_at: string | null };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/pricing",
    "/blog",
    "/contact",
    "/free-class",
    "/faq",
    "/privacy-policy",
    "/terms-and-conditions",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const services = (await getPublishedServices()) as unknown as ServiceSlug[];
    for (const s of services) {
      entries.push({
        url: `${base}/services/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // D1 unreachable at build/request time — sitemap still includes static routes.
  }

  try {
    const posts = (await getPublishedPosts(100)) as unknown as PostSlug[];
    for (const p of posts) {
      entries.push({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.published_at ? new Date(p.published_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // D1 unreachable — skip dynamic blog entries.
  }

  return entries;
}
