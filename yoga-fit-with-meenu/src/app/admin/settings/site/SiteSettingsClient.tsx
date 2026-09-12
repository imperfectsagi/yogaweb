"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard, Field, TextInput, TextArea } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { SettingsMap } from "@/lib/cms";

export function SiteSettingsClient({ initialSettings }: { initialSettings: Partial<SettingsMap> }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialSettings.site_logo_url || null);
  const [whatsappMessage, setWhatsappMessage] = useState(initialSettings.site_whatsapp_message || "");
  const [instagram, setInstagram] = useState(initialSettings.social_instagram || "");
  const [facebook, setFacebook] = useState(initialSettings.social_facebook || "");
  const [youtube, setYoutube] = useState(initialSettings.social_youtube || "");
  const [businessHours, setBusinessHours] = useState(initialSettings.business_hours || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_logo_url: logoUrl || "",
          site_whatsapp_message: whatsappMessage,
          social_instagram: instagram,
          social_facebook: facebook,
          social_youtube: youtube,
          business_hours: businessHours,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save settings.");
        return;
      }
      setSuccess("Settings saved.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Global settings used across the website." />
      {error && <AdminAlert type="error">{error}</AdminAlert>}
      {success && <AdminAlert type="success">{success}</AdminAlert>}

      <form onSubmit={handleSave} className="space-y-5">
        <AdminCard className="space-y-4">
          <h2 className="font-medium">Branding</h2>
          <MediaPicker value={logoUrl} onChange={setLogoUrl} label="Site logo" />
          <p className="text-xs text-muted">
            Contact phone, WhatsApp and email are configured via environment variables at deploy
            time (NEXT_PUBLIC_PHONE, NEXT_PUBLIC_WHATSAPP, NEXT_PUBLIC_EMAIL) since they affect
            tel:/mailto: links baked into the site. Ask your developer to update these in
            wrangler.toml if they change.
          </p>
        </AdminCard>

        <AdminCard className="space-y-4">
          <h2 className="font-medium">WhatsApp</h2>
          <Field label="Default WhatsApp message" htmlFor="wa-msg" hint="Pre-filled when visitors tap the Free Class button.">
            <TextArea id="wa-msg" rows={2} value={whatsappMessage} onChange={(e) => setWhatsappMessage(e.target.value)} />
          </Field>
        </AdminCard>

        <AdminCard className="space-y-4">
          <h2 className="font-medium">Social links</h2>
          <Field label="Instagram URL" htmlFor="ig">
            <TextInput id="ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="Facebook URL" htmlFor="fb">
            <TextInput id="fb" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
          </Field>
          <Field label="YouTube URL" htmlFor="yt">
            <TextInput id="yt" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
          </Field>
        </AdminCard>

        <AdminCard className="space-y-4">
          <h2 className="font-medium">Business hours</h2>
          <Field label="Business hours" htmlFor="hours" hint="Free text, e.g. 'Mon–Sat, 6am–8pm'.">
            <TextArea id="hours" rows={2} value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} />
          </Field>
        </AdminCard>

        <div className="sticky bottom-0 -mx-4 border-t border-border bg-white px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
