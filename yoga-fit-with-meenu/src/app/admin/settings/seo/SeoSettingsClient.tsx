"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard, Field, TextInput, TextArea } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { SeoSettingsRow } from "@/lib/cms";

export function SeoSettingsClient({ initialSeo }: { initialSeo: SeoSettingsRow | null }) {
  const [siteName, setSiteName] = useState(initialSeo?.site_name || "Yoga Fit with Meenu");
  const [defaultTitle, setDefaultTitle] = useState(initialSeo?.default_title || "");
  const [defaultDescription, setDefaultDescription] = useState(initialSeo?.default_description || "");
  const [ogImage, setOgImage] = useState<string | null>(initialSeo?.default_og_image || null);
  const [orgName, setOrgName] = useState(initialSeo?.organization_name || "Yoga Fit with Meenu");
  const [logoUrl, setLogoUrl] = useState<string | null>(initialSeo?.logo_url || null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/settings/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName,
          default_title: defaultTitle,
          default_description: defaultDescription,
          default_og_image: ogImage,
          organization_name: orgName,
          logo_url: logoUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save SEO settings.");
        return;
      }
      setSuccess("SEO settings saved. New pages will use these defaults; existing pages with custom SEO keep their own values.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="SEO" description="Default search engine and social sharing settings." />
      {error && <AdminAlert type="error">{error}</AdminAlert>}
      {success && <AdminAlert type="success">{success}</AdminAlert>}

      <form onSubmit={handleSave} className="space-y-5">
        <AdminCard className="space-y-4">
          <Field label="Site name" htmlFor="site-name" required>
            <TextInput id="site-name" required value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </Field>
          <Field label="Default page title" htmlFor="default-title" hint="Used when a page doesn't set its own SEO title." required>
            <TextInput id="default-title" required value={defaultTitle} onChange={(e) => setDefaultTitle(e.target.value)} />
          </Field>
          <Field label="Default meta description" htmlFor="default-desc" required>
            <TextArea id="default-desc" rows={2} required value={defaultDescription} onChange={(e) => setDefaultDescription(e.target.value)} />
          </Field>
          <MediaPicker value={ogImage} onChange={setOgImage} label="Default social share image (Open Graph)" />
        </AdminCard>

        <AdminCard className="space-y-4">
          <h2 className="font-medium">Organization (structured data)</h2>
          <Field label="Organization name" htmlFor="org-name" required>
            <TextInput id="org-name" required value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </Field>
          <MediaPicker value={logoUrl} onChange={setLogoUrl} label="Organization logo" />
        </AdminCard>

        <div className="sticky bottom-0 -mx-4 border-t border-border bg-white px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? "Saving…" : "Save SEO settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
