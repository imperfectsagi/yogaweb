"use client";

import { useEffect, useState, useRef } from "react";

type Banner = {
  type: "image" | "video" | null;
  mediaId: string | null;
  url: string | null;
  posterUrl: string | null;
  altText: string | null;
  focalX: number;
  focalY: number;
  fit: "cover" | "contain";
};

const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;

const DEFAULT_BANNER: Banner = {
  type: null,
  mediaId: null,
  url: null,
  posterUrl: null,
  altText: null,
  focalX: 50,
  focalY: 50,
  // "cover" fills the full-width hero edge-to-edge by default (no gray
  // gaps), matching a typical professional hero banner; admins can switch
  // to "contain" below if they want to show the complete image instead,
  // with letterboxing where the aspect ratio doesn't match.
  fit: "cover",
};

export function BannerManager() {
  const [banner, setBanner] = useState<Banner>(DEFAULT_BANNER);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/banner")
      .then((res) => res.json())
      .then((data) => {
        if (data.banner) {
          setBanner({ ...DEFAULT_BANNER, ...data.banner });
          setAltText(data.banner.altText || "");
        }
      })
      .catch(() => setError("Could not load current banner."))
      .finally(() => setLoading(false));
  }, []);

  async function persistBanner(next: Banner) {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save banner settings.");
        return false;
      }
      setBanner(next);
      setSuccess("Banner updated. It's now live on the homepage.");
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const maxBytes = (isImage ? MAX_IMAGE_MB : MAX_VIDEO_MB) * 1024 * 1024;

    if (!isImage && !isVideo) {
      setError("Please choose an image (JPG, PNG, WebP, AVIF) or a video (MP4, WebM).");
      return;
    }
    if (file.size > maxBytes) {
      setError(
        `File is too large. Maximum size is ${isImage ? MAX_IMAGE_MB : MAX_VIDEO_MB} MB for ${isImage ? "images" : "videos"}.`
      );
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));

      if (!uploadRes.ok) {
        setError(uploadData.error || "Upload failed.");
        setUploading(false);
        return;
      }

      const newBanner: Banner = {
        type: uploadData.media.kind,
        mediaId: uploadData.media.id,
        url: uploadData.media.url,
        posterUrl: null,
        altText: altText || null,
        focalX: 50,
        focalY: 50,
        fit: "cover",
      };

      await persistBanner(newBanner);
    } catch {
      setError("Network error during upload. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!banner.url) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setBanner((b) => ({
      ...b,
      focalX: Math.max(0, Math.min(100, x)),
      focalY: Math.max(0, Math.min(100, y)),
    }));
  }

  async function handleRemoveBanner() {
    await persistBanner(DEFAULT_BANNER);
    setAltText("");
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading current banner…</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded-button border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-button border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      {banner.url ? (
        <div>
          <p className="text-sm font-medium mb-2">Current banner</p>
          <div
            ref={previewRef}
            onClick={handlePreviewClick}
            className="relative rounded-card overflow-hidden border border-border bg-gray-100 cursor-crosshair select-none"
            title="Click anywhere to set the focal point"
          >
            {banner.type === "video" ? (
              <video
                src={banner.url}
                className="w-full h-48 pointer-events-none"
                style={{ objectFit: banner.fit, objectPosition: `${banner.focalX}% ${banner.focalY}%` }}
                muted
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.url}
                alt={banner.altText || ""}
                className="w-full h-48 pointer-events-none"
                style={{ objectFit: banner.fit, objectPosition: `${banner.focalX}% ${banner.focalY}%` }}
              />
            )}
            {/* Focal point marker */}
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white bg-primary shadow pointer-events-none"
              style={{ left: `${banner.focalX}%`, top: `${banner.focalY}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1">
            Click anywhere on the image to set the focal point (the part that stays visible when the
            banner is cropped on mobile). Current: {banner.focalX}%, {banner.focalY}%
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Crop mode</label>
            <select
              value={banner.fit}
              onChange={(e) => setBanner((b) => ({ ...b, fit: e.target.value as "cover" | "contain" }))}
              className="rounded border border-border px-2 py-1.5 text-sm"
            >
              <option value="cover">Fill full-width banner (recommended — crops edges, use focal point to keep the subject in view)</option>
              <option value="contain">Show complete image (no cropping — may letterbox)</option>
            </select>
            <button
              type="button"
              onClick={() => persistBanner(banner)}
              disabled={saving}
              className="btn-primary text-sm py-1.5 px-4"
            >
              {saving ? "Saving…" : "Save position & crop"}
            </button>
            <button
              type="button"
              onClick={handleRemoveBanner}
              disabled={saving}
              className="text-sm text-red-600 hover:underline ml-auto"
            >
              Remove banner
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">No banner uploaded yet. The homepage will show its default hero text only.</p>
      )}

      <div>
        <label htmlFor="banner-file" className="block text-sm font-medium mb-1">
          Upload new banner (image or video)
        </label>
        <input
          id="banner-file"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full text-sm rounded border border-border px-3 py-3 sm:py-2"
        />
        <p className="text-xs text-muted mt-1">
          Images: JPG, PNG, WebP or AVIF, up to {MAX_IMAGE_MB} MB. Videos: MP4 or WebM, up to {MAX_VIDEO_MB} MB.
          The banner loads lazily on the site so page speed isn&apos;t affected.
        </p>
        {uploading && <p className="text-sm text-primary mt-2">Uploading…</p>}
      </div>

      <div>
        <label htmlFor="alt-text" className="block text-sm font-medium mb-1">
          Description (for accessibility &amp; SEO)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="alt-text"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Meenu guiding a group yoga class outdoors"
            className="flex-1 rounded border border-border px-3 py-2.5 sm:py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => persistBanner({ ...banner, altText })}
            disabled={!banner.url || saving}
            className="btn-secondary text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
