import Image from "next/image";
import { getBannerSettings } from "@/lib/db";

export async function HomeBanner() {
  let banner: Awaited<ReturnType<typeof getBannerSettings>> | null = null;
  try {
    banner = await getBannerSettings();
  } catch {
    // D1 not bound yet (e.g. plain `next dev` without wrangler) — fail
    // gracefully so the page still renders without a banner.
    banner = null;
  }

  if (!banner?.url || !banner.type) return null;

  const objectPosition = `${banner.focalX ?? 50}% ${banner.focalY ?? 50}%`;
  const objectFit = banner.fit === "contain" ? "contain" : "cover";

  return (
    <div className="rounded-card overflow-hidden border border-border shadow-sm mb-10 bg-gray-100">
      {banner.type === "video" ? (
        // preload="none" + no autoplay keeps initial page weight small; the
        // browser only fetches video data once the user presses play, and
        // the poster image (if set) gives an instant visual with zero cost.
        <video
          src={banner.url}
          poster={banner.posterUrl || undefined}
          className="w-full h-56 sm:h-72 md:h-96"
          style={{ objectFit, objectPosition }}
          muted
          loop
          playsInline
          controls
          preload="none"
          aria-label={banner.altText || "Yoga Fit with Meenu"}
        />
      ) : (
        <Image
          src={banner.url}
          alt={banner.altText || "Yoga Fit with Meenu"}
          width={1200}
          height={500}
          className="w-full h-56 sm:h-72 md:h-96"
          style={{ objectFit, objectPosition }}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 1200px"
          unoptimized={objectFit === "contain"}
        />
      )}
    </div>
  );
}
