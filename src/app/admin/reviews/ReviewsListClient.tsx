"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X as XIcon } from "lucide-react";
import { AdminPageHeader, AdminAlert, AdminList, EditAction, DeleteAction } from "@/components/admin/AdminUI";
import { StarRating } from "@/components/StarRating";
import { cn } from "@/lib/utils";
import type { PackageReviewWithPackage } from "@/lib/cms";

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-gray-100 text-gray-500",
  } as const;
  const labels = { pending: "Pending", approved: "Approved", rejected: "Rejected" } as const;
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium", styles[status])}>
      {labels[status]}
    </span>
  );
}

export function ReviewsListClient({ initialReviews }: { initialReviews: PackageReviewWithPackage[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  async function setStatus(id: string, status: "approved" | "rejected" | "pending") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/package-reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not update review.");
        return;
      }
      setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/package-reviews/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete review.");
        return;
      }
      setReviews((rs) => rs.filter((r) => r.id !== id));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Package Reviews"
        description="Moderate customer reviews left on pricing packages, or add one yourself."
        action={{ href: "/admin/reviews/new", label: "New Review" }}
      />
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize",
              filter === f ? "border-primary bg-primary text-white" : "border-border text-muted hover:bg-primary/5"
            )}
          >
            {f}
            {f === "pending" && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      <AdminList
        emptyMessage="No reviews in this view yet."
        items={filtered.map((r) => ({
          id: r.id,
          badge: <StatusBadge status={r.status} />,
          fields: [
            { label: "Customer", value: r.customer_name, primary: true },
            { label: "Package", value: r.package_name || "—" },
            { label: "Rating", value: <StarRating rating={r.rating} size={3} /> },
            { label: "Review", value: r.review_text },
          ],
        }))}
        renderActions={(id) => {
          const r = reviews.find((x) => x.id === id);
          const disabled = busyId === id;
          return (
            <>
              {r?.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => setStatus(id, "approved")}
                  disabled={disabled}
                  className="inline-flex h-9 items-center gap-1 rounded-button border border-green-200 px-3 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 sm:h-8"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve
                </button>
              )}
              {r?.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => setStatus(id, "rejected")}
                  disabled={disabled}
                  className="inline-flex h-9 items-center gap-1 rounded-button border border-border px-3 text-xs font-medium text-muted hover:bg-gray-50 disabled:opacity-50 sm:h-8"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Reject
                </button>
              )}
              <EditAction href={`/admin/reviews/${id}`} />
              <DeleteAction onClick={() => handleDelete(id)} disabled={disabled} />
            </>
          );
        }}
      />
    </div>
  );
}
