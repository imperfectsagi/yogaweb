"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard, AdminAlert, Field, TextInput, TextArea, Toggle, FormActions } from "@/components/admin/AdminUI";
import type { FaqRow } from "@/lib/cms";

export function FaqForm({ faq }: { faq?: FaqRow }) {
  const router = useRouter();
  const isEdit = !!faq;

  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");
  const [published, setPublished] = useState(faq ? !!faq.published : true);
  const [showOnHomepage, setShowOnHomepage] = useState(faq ? !!faq.show_on_homepage : true);
  const [sortOrder, setSortOrder] = useState(faq?.sort_order ?? 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      question,
      answer,
      published,
      show_on_homepage: showOnHomepage,
      sort_order: Number(sortOrder) || 0,
      service_id: faq?.service_id || null,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/faqs/${faq!.id}` : "/api/admin/faqs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save FAQ.");
        setSaving(false);
        return;
      }
      router.push("/admin/faq");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      <AdminCard className="space-y-4">
        <Field label="Question" htmlFor="question" required>
          <TextInput id="question" required value={question} onChange={(e) => setQuestion(e.target.value)} />
        </Field>
        <Field label="Answer" htmlFor="answer" required>
          <TextArea id="answer" rows={4} required value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </Field>
      </AdminCard>

      <AdminCard className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <Field label="Sort order" htmlFor="sort" hint="Lower numbers appear first.">
            <TextInput id="sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </Field>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
          <Toggle checked={published} onChange={setPublished} label="Published" />
          <Toggle checked={showOnHomepage} onChange={setShowOnHomepage} label="Show on homepage" />
        </div>
      </AdminCard>

      <FormActions onCancelHref="/admin/faq" saving={saving} saveLabel={isEdit ? "Save changes" : "Create FAQ"} />
    </form>
  );
}
