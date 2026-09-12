"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

const MAX_IMAGE_MB = 5;

/**
 * Simple upload-and-set image field used across Services, Blog, Testimonials,
 * etc. Uploads directly through /api/admin/media/upload and stores the
 * resulting public URL in the parent form's state via onChange.
 */
export function MediaPicker({
  value,
  onChange,
  label = "Image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

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
      onChange(data.media.url);
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-28 w-full max-w-xs rounded-card border border-border object-cover sm:h-32" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow border border-border hover:bg-red-50"
          >
            <X className="h-4 w-4 text-red-600" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-28 w-full max-w-xs flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-border text-muted hover:border-primary/40 hover:text-primary sm:h-32"
        >
          {uploading ? (
            <span className="text-xs">Uploading…</span>
          ) : (
            <>
              <ImageIcon className="h-6 w-6" />
              <span className="flex items-center gap-1 text-xs">
                <Upload className="h-3 w-3" /> Upload image
              </span>
            </>
          )}
        </button>
      )}
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
