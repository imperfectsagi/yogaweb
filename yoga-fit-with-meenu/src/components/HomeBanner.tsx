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
  // Default to "contain" rather than "cover": the priority is showing the
  // COMPLETE uploaded image (whatever its aspect ratio) rather than
  // cropping it to fill a fixed box. Admins can still opt into "cover"
  // from Admin → Homepage Banner if they specifically want an edge-to-edge
  // crop for a wide, landscape-shaped image.
  const objectFit = banner.fit === "cover" ? "cover" : "contain";

  // "cover" keeps the old fixed-height crop strip (a deliberate choice for
  // that mode). "contain" instead uses a generous max-height and lets the
  // element size itself from the image's own intrinsic aspect ratio (via
  // width/height below + h-auto), so nothing is forced into a box that
  // doesn't match the upload — the browser letterboxes automatically.
  const frameClass =
    objectFit === "contain"
      ? "w-full h-auto max-h-[75vh] sm:max-h-[560px]"
      : "w-full h-56 sm:h-72 md:h-96";

  return (
    <div className="rounded-card overflow-hidden border border-border shadow-sm mb-10 bg-gray-100 flex items-center justify-center">
      {banner.type === "video" ? (
        // preload="none" + no autoplay keeps initial page weight small; the
        // browser only fetches video data once the user presses play, and
        // the poster image (if set) gives an instant visual with zero cost.
        <video
          src={banner.url}
          poster={banner.posterUrl || undefined}
          className={frameClass}
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
          width={1600}
          height={900}
          className={frameClass}
          style={{ objectFit, objectPosition, width: "100%", height: "auto" }}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 1200px"
          unoptimized
        />
      )}
    </div>
  );
}
