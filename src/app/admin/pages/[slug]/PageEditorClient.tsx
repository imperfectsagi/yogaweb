"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard, AdminAlert, Field, TextInput, TextArea, Toggle, FormActions } from "@/components/admin/AdminUI";
import type { PageRow } from "@/lib/cms";

const FIELD_LABELS: Record<string, { label: string; multiline: boolean; hint?: string }> = {
  intro: { label: "Intro text", multiline: true },
  body: { label: "Body content", multiline: true, hint: "Plain text. Use a blank line for a new paragraph, or start a line with '## ' for a subheading." },
};

export function PageEditorClient({ page }: { page: PageRow }) {
  const router = useRouter();

  let initialContent: Record<string, string> = {};
  try {
    initialContent = page.content ? JSON.parse(page.content) : {};
  } catch {
    initialContent = {};
  }

  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState<Record<string, string>>(initialContent);
  const [seoTitle, setSeoTitle] = useState(page.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(page.seo_description || "");
  const [published, setPublished] = useState(!!page.published);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateContentField(key: string, value: string) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/pages/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
          published,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save page.");
        setSaving(false);
        return;
      }
      router.push("/admin/pages");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  const contentKeys = Object.keys(content).length ? Object.keys(content) : ["body"];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      <AdminCard className="space-y-4">
        <Field label="Page title" htmlFor="title" required>
          <TextInput id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        {contentKeys.map((key) => {
          const meta = FIELD_LABELS[key] || { label: key, multiline: true };
          return (
            <Field key={key} label={meta.label} htmlFor={`content-${key}`} hint={meta.hint}>
              <TextArea
                id={`content-${key}`}
                rows={meta.multiline ? 8 : 2}
                value={content[key] || ""}
                onChange={(e) => updateContentField(key, e.target.value)}
              />
            </Field>
          );
        })}
      </AdminCard>

      <AdminCard className="space-y-4">
        <h2 className="font-medium">SEO</h2>
        <Field label="SEO title" htmlFor="seo-title">
          <TextInput id="seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </Field>
        <Field label="SEO description" htmlFor="seo-desc">
          <TextArea id="seo-desc" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </Field>
      </AdminCard>

      <AdminCard>
        <Toggle checked={published} onChange={setPublished} label="Published (visible on the live site)" />
      </AdminCard>

      <FormActions onCancelHref="/admin/pages" saving={saving} saveLabel="Save changes" />
    </form>
  );
}
