"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard, Field, TextInput } from "@/components/admin/AdminUI";
import type { ThemeRow } from "@/lib/cms";
import { DEFAULT_THEME } from "@/lib/cms";

type ThemeFields = Omit<ThemeRow, "id" | "updated_at">;

const COLOR_FIELDS: { key: keyof ThemeFields; label: string; hint?: string }[] = [
  { key: "primary_color", label: "Primary color", hint: "Buttons, links, headings accents" },
  { key: "secondary_color", label: "Secondary color" },
  { key: "accent_color", label: "Accent color" },
  { key: "background_color", label: "Background color", hint: "Page background" },
  { key: "foreground_color", label: "Text color" },
  { key: "muted_color", label: "Muted text color" },
  { key: "border_color", label: "Border color" },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ThemeClient({ initialTheme }: { initialTheme: ThemeRow }) {
  const [theme, setTheme] = useState<ThemeFields>({
    primary_color: initialTheme.primary_color,
    secondary_color: initialTheme.secondary_color,
    accent_color: initialTheme.accent_color,
    background_color: initialTheme.background_color,
    foreground_color: initialTheme.foreground_color,
    muted_color: initialTheme.muted_color,
    border_color: initialTheme.border_color,
    button_radius: initialTheme.button_radius,
    card_radius: initialTheme.card_radius,
  });
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update(key: keyof ThemeFields, value: string) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  const invalidFields = COLOR_FIELDS.filter((f) => !HEX_RE.test(theme[f.key]));

  async function handleSave() {
    if (invalidFields.length) {
      setError(`Invalid hex color for: ${invalidFields.map((f) => f.label).join(", ")}`);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save theme.");
        return;
      }
      setSuccess("Theme updated. Changes are now live on the website.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset to the default Yoga Fit with Meenu theme colors?")) return;
    setResetting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/theme", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTheme(DEFAULT_THEME);
      setSuccess("Theme reset to defaults.");
    } catch {
      setError("Could not reset theme.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Theme" description="Control the colors used across the public website." />
      {error && <AdminAlert type="error">{error}</AdminAlert>}
      {success && <AdminAlert type="success">{success}</AdminAlert>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <AdminCard className="space-y-4">
          {COLOR_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={f.key} hint={f.hint}>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label={`${f.label} picker`}
                  value={HEX_RE.test(theme[f.key]) ? theme[f.key] : "#000000"}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded border border-border"
                />
                <TextInput
                  id={f.key}
                  value={theme[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#000000"
                />
              </div>
            </Field>
          ))}

          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
            <Field label="Button roundness" htmlFor="btn-radius" hint="e.g. 0.5rem">
              <TextInput id="btn-radius" value={theme.button_radius} onChange={(e) => update("button_radius", e.target.value)} />
            </Field>
            <Field label="Card roundness" htmlFor="card-radius" hint="e.g. 0.75rem">
              <TextInput id="card-radius" value={theme.card_radius} onChange={(e) => update("card_radius", e.target.value)} />
            </Field>
          </div>

          <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-border bg-white px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <button type="button" onClick={handleReset} disabled={resetting} className="btn-secondary flex-1 sm:flex-none">
              {resetting ? "Resetting…" : "Reset to default"}
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1 sm:flex-none">
              {saving ? "Saving…" : "Save theme"}
            </button>
          </div>
        </AdminCard>

        {/* Live preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <p className="mb-2 text-sm font-medium">Preview</p>
          <div
            className="rounded-lg border p-5 space-y-4"
            style={{
              backgroundColor: theme.background_color,
              borderColor: theme.border_color,
              color: theme.foreground_color,
            }}
          >
            <p className="text-lg font-semibold" style={{ color: theme.foreground_color }}>
              Yoga Fit with Meenu
            </p>
            <p className="text-sm" style={{ color: theme.muted_color }}>
              Improve movement, flexibility, strength and mindfulness.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: theme.primary_color, borderRadius: theme.button_radius }}
              >
                Book a Free Class
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium border"
                style={{ borderColor: theme.border_color, color: theme.foreground_color, borderRadius: theme.button_radius }}
              >
                Learn More
              </button>
            </div>
            <div
              className="p-3 text-sm"
              style={{
                backgroundColor: theme.accent_color + "20",
                border: `1px solid ${theme.border_color}`,
                borderRadius: theme.card_radius,
                color: theme.foreground_color,
              }}
            >
              Sample card using accent, border and card-radius settings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
