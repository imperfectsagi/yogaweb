"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard } from "@/components/admin/AdminUI";
import { Trash2, Copy, Check } from "lucide-react";

type MediaRow = {
  id: string;
  filename: string;
  original_filename: string;
  r2_key: string;
  url: string;
  mime_type: string;
  file_size: number | null;
  created_at: string;
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryClient({ initialMedia }: { initialMedia: MediaRow[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleDelete(item: MediaRow) {
    setError(null);
    setDeletingId(item.id);
    try {
      let res = await fetch(`/api/admin/media?id=${item.id}&url=${encodeURIComponent(item.url)}`, {
        method: "DELETE",
      });
      if (res.status === 409) {
        const data = await res.json();
        const usageList = (data.usages || []).join(", ");
        const confirmed = confirm(
          `This file is currently used in: ${usageList}.\n\nDeleting it will break those references. Delete anyway?`
        );
        if (!confirmed) {
          setDeletingId(null);
          return;
        }
        res = await fetch(`/api/admin/media?id=${item.id}&url=${encodeURIComponent(item.url)}&force=1`, {
          method: "DELETE",
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete file.");
        return;
      }
      setMedia((m) => m.filter((f) => f.id !== item.id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCopy(item: MediaRow) {
    navigator.clipboard?.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="All images and videos uploaded through the admin panel. Upload new files from any content form (services, blog, testimonials, banner)."
      />
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      {media.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-muted text-center py-6">
            No media uploaded yet. Files you upload from Services, Blog, Testimonials or the
            Homepage Banner will appear here.
          </p>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => {
            const isVideo = item.mime_type.startsWith("video/");
            return (
              <AdminCard key={item.id} className="p-2">
                <div className="aspect-square overflow-hidden rounded-button bg-gray-100">
                  {isVideo ? (
                    <video src={item.url} className="h-full w-full object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.original_filename} className="h-full w-full object-cover" />
                  )}
                </div>
                <p className="mt-2 truncate text-xs font-medium" title={item.original_filename}>
                  {item.original_filename}
                </p>
                <p className="text-[10px] text-muted">
                  {formatBytes(item.file_size)} · {item.mime_type.split("/")[1]?.toUpperCase()}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="flex h-8 flex-1 items-center justify-center gap-1 rounded-button border border-border text-xs hover:bg-primary/5"
                  >
                    {copiedId === item.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedId === item.id ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    aria-label="Delete"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
