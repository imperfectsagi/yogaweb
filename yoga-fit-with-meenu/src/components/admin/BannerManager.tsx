"use client";

import { useEffect, useState, useRef } from "react";

type Banner = {
  type: "image" | "video" | null;
  mediaId: string | null;
  url: string | null;
  posterUrl: string | null;
  altText: string | null;
};

const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;

export function BannerManager() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/banner")
      .then((res) => res.json())
      .then((data) => {
        if (data.banner) {
          setBanner(data.banner);
          setAltText(data.banner.altText || "");
        }
      })
      .catch(() => setError("Could not load current banner."))
      .finally(() => setLoading(false));
  }, []);

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
      };

      const saveRes = await fetch("/api/admin/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner),
      });
      const saveData = await saveRes.json().catch(() => ({}));

      if (!saveRes.ok) {
        setError(saveData.error || "Uploaded, but could not save banner settings.");
        setUploading(false);
        return;
      }

      setBanner(newBanner);
      setSuccess("Banner updated. It's now live on the homepage.");
    } catch {
      setError("Network error during upload. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAltTextSave() {
    if (!banner?.url || !banner.type || !banner.mediaId) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, altText }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save description.");
        return;
      }
      setBanner({ ...banner, altText });
      setSuccess("Description saved.");
    } catch {
      setError("Network error. Please try again.");
    }
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

      {banner?.url ? (
        <div>
          <p className="text-sm font-medium mb-2">Current banner</p>
          <div className="rounded-card overflow-hidden border border-border bg-gray-100">
            {banner.type === "video" ? (
              <video src={banner.url} className="w-full h-48 object-cover" muted loop playsInline controls />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={banner.url} alt={banner.altText || ""} className="w-full h-48 object-cover" />
            )}
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
          className="w-full text-sm rounded border border-border px-3 py-2"
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
        <div className="flex gap-2">
          <input
            id="alt-text"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Meenu guiding a group yoga class outdoors"
            className="flex-1 rounded border border-border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAltTextSave}
            disabled={!banner?.url}
            className="btn-secondary text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
