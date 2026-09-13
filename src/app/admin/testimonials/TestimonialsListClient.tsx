"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminAlert, AdminList, EditAction, DeleteAction, PublishBadge } from "@/components/admin/AdminUI";
import type { TestimonialRow } from "@/lib/cms";

export function TestimonialsListClient({ initialTestimonials }: { initialTestimonials: TestimonialRow[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete testimonial.");
        return;
      }
      setTestimonials((t) => t.filter((item) => item.id !== id));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        description="Only add real testimonials from real students — never invented reviews."
        action={{ href: "/admin/testimonials/new", label: "New Testimonial" }}
      />
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      <AdminList
        emptyMessage="No testimonials yet. Add a real student review to get started."
        items={testimonials.map((t) => ({
          id: t.id,
          badge: <PublishBadge published={!!t.published} />,
          fields: [
            { label: "Name", value: t.name, primary: true },
            { label: "Review", value: t.review },
            { label: "Location", value: t.location || "—" },
          ],
        }))}
        renderActions={(id) => (
          <>
            <EditAction href={`/admin/testimonials/${id}`} />
            <DeleteAction onClick={() => handleDelete(id)} disabled={deletingId === id} />
          </>
        )}
      />
    </div>
  );
}
