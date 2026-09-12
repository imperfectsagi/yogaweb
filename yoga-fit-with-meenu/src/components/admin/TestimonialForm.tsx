"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard, AdminAlert, Field, TextInput, TextArea, Toggle, FormActions } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { TestimonialRow } from "@/lib/cms";

export function TestimonialForm({ testimonial }: { testimonial?: TestimonialRow }) {
  const router = useRouter();
  const isEdit = !!testimonial;

  const [name, setName] = useState(testimonial?.name || "");
  const [review, setReview] = useState(testimonial?.review || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(testimonial?.photo_url || null);
  const [location, setLocation] = useState(testimonial?.location || "");
  const [published, setPublished] = useState(testimonial ? !!testimonial.published : false);
  const [sortOrder, setSortOrder] = useState(testimonial?.sort_order ?? 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      review,
      photo_url: photoUrl,
      location: location || null,
      published,
      sort_order: Number(sortOrder) || 0,
      service_id: testimonial?.service_id || null,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/testimonials/${testimonial!.id}` : "/api/admin/testimonials", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save testimonial.");
        setSaving(false);
        return;
      }
      router.push("/admin/testimonials");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <AdminAlert type="error">{error}</AdminAlert>}
      <AdminAlert type="success">
        Only add reviews from real students who have agreed to be featured. Do not invent testimonials.
      </AdminAlert>

      <AdminCard className="space-y-4">
        <Field label="Student name" htmlFor="name" required>
          <TextInput id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Review" htmlFor="review" required>
          <TextArea id="review" rows={4} required value={review} onChange={(e) => setReview(e.target.value)} />
        </Field>
        <Field label="Location (optional)" htmlFor="location">
          <TextInput id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Badarpur, Delhi" />
        </Field>
        <MediaPicker value={photoUrl} onChange={setPhotoUrl} label="Photo (optional)" />
      </AdminCard>

      <AdminCard className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <Field label="Sort order" htmlFor="sort">
            <TextInput id="sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </Field>
        </div>
        <Toggle checked={published} onChange={setPublished} label="Published (visible on the live site)" />
      </AdminCard>

      <FormActions onCancelHref="/admin/testimonials" saving={saving} saveLabel={isEdit ? "Save changes" : "Add testimonial"} />
    </form>
  );
}
