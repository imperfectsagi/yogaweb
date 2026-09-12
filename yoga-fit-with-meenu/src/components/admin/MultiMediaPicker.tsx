"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

const MAX_IMAGE_MB = 5;
const MAX_IMAGES = 6;

/**
 * Multi-image version of MediaPicker, used for the review photo gallery
 * (Admin → Reviews). Uploads through the existing admin upload endpoint —
 * this component is only ever rendered behind requireAdmin(), unlike the
 * public review form's own uploader at /api/reviews/upload.
 */
export function MultiMediaPicker({
  value,
  onChange,
  label = "Photos",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (value.length >= MAX_IMAGES) {
      setError(`You can add up to ${MAX_IMAGES} photos per review.`);
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
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }
      onChange([...value, data.media.url]);
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-24 w-24 rounded-card border border-border object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove photo"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow border border-border hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5 text-red-600" />
            </button>
          </div>
        ))}
        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-card border border-dashed border-border text-muted hover:border-primary/40 hover:text-primary"
          >
            {uploading ? (
              <span className="text-[11px]">Uploading…</span>
            ) : (
              <>
                <ImageIcon className="h-5 w-5" />
                <span className="flex items-center gap-1 text-[11px]">
                  <Upload className="h-3 w-3" /> Add
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
  );
}
