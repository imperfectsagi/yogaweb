"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TestimonialData = {
  id: string;
  name: string;
  review: string;
  location: string | null;
  photo_url: string | null;
};

// How many testimonials show before the visitor has to tap "Read All
// Testimonials". Keeps the homepage from growing unbounded as an admin
// adds more testimonials over time, while still showing a representative
// few up front. This is purely a display limit — every testimonial saved
// in the admin panel is still fetched and rendered once expanded; none
// are ever dropped or deleted.
const INITIAL_VISIBLE = 3;

/** Homepage "What Students Say" grid. Receives every published
 * testimonial (already capped server-side to a sane page-load size by
 * page.tsx) and controls how many are visible on screen: only the first
 * `INITIAL_VISIBLE` show initially, with the rest revealed via "Read All
 * Testimonials" and collapsible again via "Hide Testimonials". If there
 * are `INITIAL_VISIBLE` or fewer testimonials, no toggle is shown at all —
 * behaves exactly like a plain grid, unchanged. */
export function TestimonialsSection({
  testimonials,
  heading,
}: {
  testimonials: TestimonialData[];
  heading: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = testimonials.length > INITIAL_VISIBLE;
  const visible = expanded ? testimonials : testimonials.slice(0, INITIAL_VISIBLE);

  return (
    <section className="section bg-primary/5">
      <div className="container-narrow">
        <h2 className="text-2xl md:text-3xl text-center mb-10">{heading}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((t) => (
            <div key={t.id} className="rounded-card border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-muted leading-relaxed">&ldquo;{t.review}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                {t.photo_url && (
                  // Plain <img>, not next/image: this app runs on
                  // Cloudflare Workers (@opennextjs/cloudflare), which
                  // doesn't support Next's built-in image optimizer —
                  // same reasoning as HomeBanner.tsx and the blog images
                  // elsewhere on this page. Sized noticeably larger than
                  // before (was h-10/w-10 = 40px, a barely-visible
                  // thumbnail) so the person is actually recognizable,
                  // while staying circular + object-cover so the layout
                  // and text never shift or overlap regardless of the
                  // source image's own dimensions.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.photo_url}
                    alt={t.name}
                    className="h-16 w-16 rounded-full object-cover shrink-0 ring-1 ring-border"
                  />
                )}
                <p className="text-sm font-medium">
                  {t.name}
                  {t.location && <span className="text-muted font-normal"> · {t.location}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
              {expanded ? "Hide Testimonials" : "Read All Testimonials"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
