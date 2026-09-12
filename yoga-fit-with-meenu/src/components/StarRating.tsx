"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star display, used on the public pricing page and in admin
 * lists. `size` controls the icon size (maps to a Tailwind h-/w- class). */
export function StarRating({
  rating,
  size = 4,
  className,
}: {
  rating: number;
  size?: 3 | 4 | 5;
  className?: string;
}) {
  const sizeClass = size === 3 ? "h-3 w-3" : size === 5 ? "h-5 w-5" : "h-4 w-4";
  const rounded = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(sizeClass, n <= rounded ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")}
        />
      ))}
    </div>
  );
}

/** Interactive star picker used in the public "write a review" form and
 * the admin review form. Click-to-set, keyboard accessible via native
 * button focus + Enter/Space. */
export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              n <= value ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200 hover:fill-amber-200 hover:text-amber-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}
