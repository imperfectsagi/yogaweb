"use client";

import { useRef, useState } from "react";
import { ChevronDown, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { StarRating, StarRatingInput } from "@/components/StarRating";
import { cn } from "@/lib/utils";

export type PackageReviewData = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  images_json: string | null;
  created_at: string;
};

const MAX_IMAGES = 4;
const MAX_IMAGE_MB = 3;

function timeAgo(iso: string): string {
  const date = new Date(iso.replace(" ", "T") + "Z");
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** Shows approved reviews for one package (with average rating + photos)
 * and a collapsible "Write a review" form that submits into the moderation
 * queue (status = pending) via POST /api/reviews. */
export function PackageReviews({
  packageId,
  packageName,
  reviews,
}: {
  packageId: string;
  packageName: string;
  reviews: PackageReviewData[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-6 border-t border-border pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          {reviews.length > 0 ? (
            <div className="flex items-center gap-2">
              <StarRating rating={average} size={4} />
              <span className="text-sm font-medium">{average.toFixed(1)}</span>
              <span className="text-xs text-muted">
                ({reviews.length} review{reviews.length === 1 ? "" : "s"})
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted">No reviews yet</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>

      {showForm && (
        <ReviewForm
          packageId={packageId}
          packageName={packageName}
          onDone={() => setShowForm(false)}
        />
      )}

      {reviews.length > 0 && (
        <ul className="mt-4 space-y-4">
          {visibleReviews.map((r) => {
            const images: string[] = r.images_json ? JSON.parse(r.images_json) : [];
            return (
              <li key={r.id} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.customer_name}</span>
                    <StarRating rating={r.rating} size={3} />
                  </div>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(r.created_at)}</span>
                </div>
                <p className="mt-1 text-muted leading-relaxed">{r.review_text}</p>
                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt={`Photo from ${r.customer_name}'s review`}
                        className="h-16 w-16 rounded-button border border-border object-cover"
                      />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {reviews.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} />
          {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </div>
  );
}

function ReviewForm({
  packageId,
  packageName,
  onDone,
}: {
  packageId: string;
  packageName: string;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (images.length >= MAX_IMAGES) {
      setError(`You can attach up to ${MAX_IMAGES} photos.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_IMAGE_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/reviews/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }
      setImages((imgs) => [...imgs, data.url]);
    } catch {
      setError("Network error during upload. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (text.trim().length < 5) {
      setError("Please write a few words about your experience.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: packageId,
          customer_name: name.trim(),
          rating,
          review_text: text.trim(),
          images,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not submit review. Please try again.");
        return;
      }
      setSuccess(data.message || "Thank you! Your review will appear once approved.");
      setName("");
      setRating(5);
      setText("");
      setImages([]);
      setTimeout(onDone, 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mt-4 rounded-card border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        {success}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-card border border-border bg-gray-50/60 p-4">
      <p className="text-xs text-muted">Reviewing: {packageName}</p>
      {error && <p className="rounded-button border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      <div>
        <label htmlFor={`name-${packageId}`} className="mb-1 block text-xs font-medium">
          Your name
        </label>
        <input
          id={`name-${packageId}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          className="w-full rounded border border-border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor={`text-${packageId}`} className="mb-1 block text-xs font-medium">
          Your review
        </label>
        <textarea
          id={`text-${packageId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={3}
          maxLength={2000}
          className="w-full rounded border border-border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Photos (optional)</label>
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-16 w-16 rounded-button border border-border object-cover" />
              <button
                type="button"
                onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                aria-label="Remove photo"
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow border border-border"
              >
                <X className="h-3 w-3 text-red-600" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-button border border-dashed border-border text-muted hover:border-primary/40 hover:text-primary"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-4 w-4" />
                  <span className="flex items-center gap-0.5 text-[10px]">
                    <Upload className="h-2.5 w-2.5" />
                    Add
                  </span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={submitting} className="btn-primary text-sm">
          {submitting ? "Submitting…" : "Submit review"}
        </button>
        <button type="button" onClick={onDone} className="btn-secondary text-sm">
          Cancel
        </button>
      </div>
      <p className="text-[11px] text-muted">Your review will be checked by our team before it appears publicly.</p>
    </form>
  );
}
