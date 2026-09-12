"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminAlert, AdminList, EditAction, DeleteAction, PublishBadge } from "@/components/admin/AdminUI";
import type { FaqRow } from "@/lib/cms";

export function FaqListClient({ initialFaqs }: { initialFaqs: FaqRow[] }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete FAQ.");
        return;
      }
      setFaqs((f) => f.filter((faq) => faq.id !== id));
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
        title="FAQ"
        description="Manage the questions and answers shown on the public FAQ page."
        action={{ href: "/admin/faq/new", label: "New FAQ" }}
      />
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      <AdminList
        emptyMessage="No FAQs yet. Create your first one to get started."
        items={faqs.map((f) => ({
          id: f.id,
          badge: <PublishBadge published={!!f.published} />,
          fields: [
            { label: "Question", value: f.question, primary: true },
            { label: "Homepage", value: f.show_on_homepage ? "Yes" : "No" },
            { label: "Order", value: f.sort_order },
          ],
        }))}
        renderActions={(id) => (
          <>
            <EditAction href={`/admin/faq/${id}`} />
            <DeleteAction onClick={() => handleDelete(id)} disabled={deletingId === id} />
          </>
        )}
      />
    </div>
  );
}
