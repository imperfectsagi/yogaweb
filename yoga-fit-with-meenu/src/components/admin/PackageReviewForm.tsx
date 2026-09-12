"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard, AdminAlert, Field, TextInput, TextArea, Select, FormActions } from "@/components/admin/AdminUI";
import { MultiMediaPicker } from "@/components/admin/MultiMediaPicker";
import { StarRatingInput } from "@/components/StarRating";
import type { PackageReviewRow, PackageRow } from "@/lib/cms";

export function PackageReviewForm({
  review,
  packages,
}: {
  review?: PackageReviewRow;
  packages: Pick<PackageRow, "id" | "name">[];
}) {
  const router = useRouter();
  const isEdit = !!review;

  const [packageId, setPackageId] = useState(review?.package_id || packages[0]?.id || "");
  const [customerName, setCustomerName] = useState(review?.customer_name || "");
  const [rating, setRating] = useState(review?.rating || 5);
  const [reviewText, setReviewText] = useState(review?.review_text || "");
  const [images, setImages] = useState<string[]>(review?.images_json ? JSON.parse(review.images_json) : []);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(review?.status || "approved");
  const [adminNote, setAdminNote] = useState(review?.admin_note || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!packageId) {
      setError("Please choose a package.");
      return;
    }

    setSaving(true);
    const payload = {
      package_id: packageId,
      customer_name: customerName,
      rating,
      review_text: reviewText,
      images,
      status,
      admin_note: adminNote || null,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/package-reviews/${review!.id}` : "/api/admin/package-reviews", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save review.");
        setSaving(false);
        return;
      }
      router.push("/admin/reviews");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <AdminAlert type="error">{error}</AdminAlert>}
      {!isEdit && (
        <AdminAlert type="success">
          Reviews added here are marked as admin-added and default to Approved, since they&apos;re assumed to be
          real feedback you&apos;re entering on a customer&apos;s behalf (e.g. from WhatsApp or in person).
        </AdminAlert>
      )}

      <AdminCard className="space-y-4">
        <Field label="Package" htmlFor="package_id" required>
          <Select id="package_id" required value={packageId} onChange={(e) => setPackageId(e.target.value)}>
            {packages.length === 0 && <option value="">No packages available</option>}
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Customer name" htmlFor="customer_name" required>
          <TextInput
            id="customer_name"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </Field>

        <Field label="Rating" htmlFor="rating" required>
          <StarRatingInput value={rating} onChange={setRating} />
        </Field>

        <Field label="Review" htmlFor="review_text" required>
          <TextArea
            id="review_text"
            rows={4}
            required
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </Field>

        <MultiMediaPicker value={images} onChange={setImages} label="Photos (optional)" />
      </AdminCard>

      <AdminCard className="space-y-4">
        <Field label="Status" htmlFor="status" hint="Only Approved reviews are visible on the public pricing page.">
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="pending">Pending (awaiting review)</option>
            <option value="approved">Approved (visible on site)</option>
            <option value="rejected">Rejected (hidden)</option>
          </Select>
        </Field>
        <Field label="Internal note (optional)" htmlFor="admin_note" hint="Never shown publicly.">
          <TextArea id="admin_note" rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
        </Field>
      </AdminCard>

      <FormActions onCancelHref="/admin/reviews" saving={saving} saveLabel={isEdit ? "Save changes" : "Add review"} />
    </form>
  );
}
