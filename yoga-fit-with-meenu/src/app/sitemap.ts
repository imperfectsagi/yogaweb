import { MetadataRoute } from "next";
import { SITE } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/services/group-yoga-classes",
    "/services/personal-yoga-classes",
    "/services/online-yoga-classes",
    "/services/yoga-for-beginners",
    "/pricing",
    "/blog",
    "/blog/getting-started-with-yoga-beginner",
    "/contact",
    "/free-class",
    "/faq",
    "/privacy-policy",
    "/terms-and-conditions",
  ];

  return staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
