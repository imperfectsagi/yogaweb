"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard, Field, TextInput, TextArea, Toggle } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { HomepageSectionRow } from "@/lib/cms";
import { ChevronDown, ChevronUp } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero / Banner text",
  benefits: "Why Practice Yoga?",
  services: "Our Services",
  about: "Meet Meenu",
  packages: "Classes & Packages",
  "why-us": "Why Yoga Fit with Meenu",
  testimonials: "What Students Say",
  faq: "Frequently Asked Questions",
  blog: "From the Blog",
  location: "Serving Delhi NCR",
  "contact-cta": "Ready to Start?",
};

export function HomepageClient({ initialSections }: { initialSections: HomepageSectionRow[] }) {
  const [sections, setSections] = useState(
    [...initialSections].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateLocal(id: string, patch: Partial<HomepageSectionRow>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handleSave(section: HomepageSectionRow) {
    setSaving(section.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/homepage/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: !!section.enabled,
          sort_order: section.sort_order,
          heading: section.heading,
          description: section.description,
          image_url: section.image_url,
          cta_text: section.cta_text,
          cta_url: section.cta_url,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save section.");
        return;
      }
      setSuccess(`"${SECTION_LABELS[section.section_key] || section.section_key}" saved.`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        description="Edit each section's heading, text and call-to-action shown on the homepage."
      />
      {error && <AdminAlert type="error">{error}</AdminAlert>}
      {success && <AdminAlert type="success">{success}</AdminAlert>}

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openId === section.id;
          return (
            <AdminCard key={section.id} className="p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {SECTION_LABELS[section.section_key] || section.section_key}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {section.enabled ? "Visible" : "Hidden"} · Order {section.sort_order}
                  </p>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-border p-4">
                  <Toggle
                    checked={!!section.enabled}
                    onChange={(v) => updateLocal(section.id, { enabled: v ? 1 : 0 })}
                    label="Show this section on the homepage"
                  />
                  <Field label="Heading" htmlFor={`heading-${section.id}`}>
                    <TextInput
                      id={`heading-${section.id}`}
                      value={section.heading || ""}
                      onChange={(e) => updateLocal(section.id, { heading: e.target.value })}
                    />
                  </Field>
                  <Field label="Description" htmlFor={`desc-${section.id}`}>
                    <TextArea
                      id={`desc-${section.id}`}
                      rows={2}
                      value={section.description || ""}
                      onChange={(e) => updateLocal(section.id, { description: e.target.value })}
                    />
                  </Field>
                  {(section.section_key === "hero" || section.section_key === "about") && (
                    <MediaPicker
                      value={section.image_url}
                      onChange={(url) => updateLocal(section.id, { image_url: url })}
                      label="Section image (optional)"
                    />
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Button text" htmlFor={`cta-text-${section.id}`}>
                      <TextInput
                        id={`cta-text-${section.id}`}
                        value={section.cta_text || ""}
                        onChange={(e) => updateLocal(section.id, { cta_text: e.target.value })}
                      />
                    </Field>
                    <Field label="Button link" htmlFor={`cta-url-${section.id}`}>
                      <TextInput
                        id={`cta-url-${section.id}`}
                        value={section.cta_url || ""}
                        onChange={(e) => updateLocal(section.id, { cta_url: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label="Sort order" htmlFor={`sort-${section.id}`} hint="Lower numbers appear first on the page.">
                    <TextInput
                      id={`sort-${section.id}`}
                      type="number"
                      value={section.sort_order}
                      onChange={(e) => updateLocal(section.id, { sort_order: Number(e.target.value) })}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => handleSave(section)}
                    disabled={saving === section.id}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {saving === section.id ? "Saving…" : "Save section"}
                  </button>
                </div>
              )}
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
