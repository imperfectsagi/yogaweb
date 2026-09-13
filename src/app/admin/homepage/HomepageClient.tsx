"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard, Field, TextInput, TextArea } from "@/components/admin/AdminUI";
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
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateLocal(id: string, patch: Partial<HomepageSectionRow>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function persistSection(section: HomepageSectionRow) {
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
    if (!res.ok) throw new Error(data.error || "Could not save section.");
  }

  // The visibility switch on the collapsed row saves immediately on its
  // own — an admin flipping "show/hide this section" shouldn't have to
  // also expand the row and press a separate "Save section" button to
  // make that stick. Editing heading/description/CTA still uses the
  // explicit Save button below, since those are multi-field edits.
  async function handleToggleEnabled(section: HomepageSectionRow) {
    const next = { ...section, enabled: section.enabled ? 0 : 1 };
    setTogglingId(section.id);
    setError(null);
    setSuccess(null);
    updateLocal(section.id, { enabled: next.enabled });
    try {
      await persistSection(next);
      setSuccess(
        `"${SECTION_LABELS[section.section_key] || section.section_key}" is now ${
          next.enabled ? "visible" : "hidden"
        } on the homepage.`
      );
    } catch (e) {
      // Roll back the optimistic UI update if the save failed.
      updateLocal(section.id, { enabled: section.enabled });
      setError(e instanceof Error ? e.message : "Could not update visibility.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSave(section: HomepageSectionRow) {
    setSaving(section.id);
    setError(null);
    setSuccess(null);
    try {
      await persistSection(section);
      setSuccess(`"${SECTION_LABELS[section.section_key] || section.section_key}" saved.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save section.");
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
          const label = SECTION_LABELS[section.section_key] || section.section_key;
          return (
            <AdminCard key={section.id} className="p-0 overflow-hidden">
              <div className="flex w-full items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : section.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted truncate">Order {section.sort_order}</p>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>

                {/* Visible ON/OFF switch right on the row — saves immediately,
                    with an explicit ON/OFF text label so the current state
                    is never ambiguous, independent of the accordion. */}
                <div className="flex shrink-0 items-center gap-2 border-l border-border pl-3">
                  <span
                    className={`text-xs font-semibold ${section.enabled ? "text-primary" : "text-muted"}`}
                  >
                    {section.enabled ? "ON" : "OFF"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!section.enabled}
                    aria-label={`${section.enabled ? "Hide" : "Show"} ${label} on the homepage`}
                    onClick={() => handleToggleEnabled(section)}
                    disabled={togglingId === section.id}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                      section.enabled ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        section.enabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-4 border-t border-border p-4">
                  <p className="text-xs text-muted -mt-1">
                    Visibility is controlled by the ON/OFF switch above — it saves
                    instantly. The fields below are extra content for this section.
                  </p>
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
