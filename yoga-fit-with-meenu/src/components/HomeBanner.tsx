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
  // Default to "cover": a professional full-width hero fills its band
  // edge-to-edge with no gray letterbox gaps, like a typical marketing
  // site hero banner. The focal point (set by the admin by clicking on
  // the banner in Admin → Homepage Banner) keeps the important part of
  // the image centered in view, so the edge-crop this requires never
  // hides the subject. Admins can still switch to "contain" from Admin →
  // Homepage Banner if they'd rather show the complete image with
  // letterboxing instead of any cropping.
  const objectFit = banner.fit === "contain" ? "contain" : "cover";

  // Full-width hero banner: the wrapper spans the entire viewport (it's
  // rendered outside container-narrow by the homepage), with no side
  // margins, rounded corners or borders — like a real hero banner, not a
  // boxed-in card. "cover" fills a tall responsive band edge-to-edge
  // (height scales with viewport width so the crop stays proportional on
  // any screen). "contain" instead lets the element size itself from the
  // image/video's own intrinsic aspect ratio (h-auto), so the browser
  // letterboxes automatically instead of ever cropping content.
  const frameClass =
    objectFit === "contain"
      ? "block w-full h-auto max-h-[85vh]"
      : "block w-full h-[60vw] max-h-[600px] min-h-[280px] sm:h-[42vw] sm:min-h-[340px] md:h-[36vw]";

  return (
    <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
          width={1920}
          height={1080}
          className={frameClass}
          style={{ objectFit, objectPosition, width: "100%", height: "auto" }}
          loading="lazy"
          sizes="100vw"
          unoptimized
        />
      )}
    </div>
  );
}
