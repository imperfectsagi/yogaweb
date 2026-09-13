"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard, Field, TextInput, TextArea } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { HexColorField } from "@/components/admin/HexColorField";
import type { SettingsMap } from "@/lib/cms";

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function SiteSettingsClient({ initialSettings }: { initialSettings: Partial<SettingsMap> }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialSettings.site_logo_url || null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(initialSettings.site_favicon_url || null);
  const [whatsappMessage, setWhatsappMessage] = useState(initialSettings.site_whatsapp_message || "");
  const [instagram, setInstagram] = useState(initialSettings.social_instagram || "");
  const [facebook, setFacebook] = useState(initialSettings.social_facebook || "");
  const [youtube, setYoutube] = useState(initialSettings.social_youtube || "");
  const [businessHours, setBusinessHours] = useState(initialSettings.business_hours || "");

  // Homepage text colors — each independent, each optional (empty =
  // "use the site's built-in default for this text"). See the Homepage
  // Text Colors card below.
  const [headerNavColor, setHeaderNavColor] = useState(initialSettings.header_nav_text_color || "");
  const [heroEyebrowColor, setHeroEyebrowColor] = useState(initialSettings.hero_eyebrow_text_color || "");
  const [heroHeadingColor, setHeroHeadingColor] = useState(initialSettings.hero_heading_text_color || "");
  const [heroDescriptionColor, setHeroDescriptionColor] = useState(initialSettings.hero_description_text_color || "");
  const [heroCtaColor, setHeroCtaColor] = useState(initialSettings.hero_cta_text_color || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side HEX validation up front, mirroring the server's own
    // check — catches mistakes immediately without a round-trip, while
    // the API route remains the actual source of truth (it re-validates
    // and rejects independently, since this client check is only a
    // convenience).
    const colorFields: [string, string][] = [
      ["Header navigation text color", headerNavColor],
      ["Hero eyebrow text color", heroEyebrowColor],
      ["Hero heading text color", heroHeadingColor],
      ["Hero description text color", heroDescriptionColor],
      ["Hero CTA text color", heroCtaColor],
    ];
    for (const [label, value] of colorFields) {
      if (value && !HEX_RE.test(value)) {
        setError(`${label} must be a valid HEX code, e.g. #2F6657.`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_logo_url: logoUrl || "",
          site_favicon_url: faviconUrl || "",
          site_whatsapp_message: whatsappMessage,
          social_instagram: instagram,
          social_facebook: facebook,
          social_youtube: youtube,
          business_hours: businessHours,
          header_nav_text_color: headerNavColor,
          hero_eyebrow_text_color: heroEyebrowColor,
          hero_heading_text_color: heroHeadingColor,
          hero_description_text_color: heroDescriptionColor,
          hero_cta_text_color: heroCtaColor,
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
          <MediaPicker value={faviconUrl} onChange={setFaviconUrl} label="Favicon" />
          <p className="text-xs text-muted">
            Favicon shows in the browser tab, independently of the site logo above — updating one
            never changes the other. Square images work best (e.g. 512×512 PNG).
          </p>
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

        <AdminCard className="space-y-4">
          <h2 className="font-medium">Homepage Text Colors</h2>
          <p className="text-xs text-muted">
            Controls the header navigation and hero text colors on the homepage banner. Each field
            is independent — changing one never affects the others. Leave a field blank to use the
            site&apos;s default color for that text. These do not change any button background
            colors or other pages.
          </p>
          <HexColorField
            id="color-header-nav"
            label="Header Navigation Text Color"
            value={headerNavColor}
            onChange={setHeaderNavColor}
          />
          <HexColorField
            id="color-hero-eyebrow"
            label="Hero Eyebrow Text Color"
            hint="The small uppercase line above the heading, e.g. 'Yoga Classes in Delhi NCR'."
            value={heroEyebrowColor}
            onChange={setHeroEyebrowColor}
          />
          <HexColorField
            id="color-hero-heading"
            label="Hero Heading Text Color"
            value={heroHeadingColor}
            onChange={setHeroHeadingColor}
          />
          <HexColorField
            id="color-hero-description"
            label="Hero Description Text Color"
            value={heroDescriptionColor}
            onChange={setHeroDescriptionColor}
          />
          <HexColorField
            id="color-hero-cta"
            label="Hero CTA Text Color"
            hint="Text color of the 'Book a Free Class' button on the hero banner only."
            value={heroCtaColor}
            onChange={setHeroCtaColor}
          />
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
