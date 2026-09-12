"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard, AdminAlert, Field, TextInput, TextArea, Toggle, FormActions } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { ServiceRow } from "@/lib/cms";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ServiceForm({ service }: { service?: ServiceRow }) {
  const router = useRouter();
  const isEdit = !!service;

  const [name, setName] = useState(service?.name || "");
  const [slug, setSlug] = useState(service?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [shortDescription, setShortDescription] = useState(service?.short_description || "");
  const [fullDescription, setFullDescription] = useState(service?.full_description || "");
  const [featuredImage, setFeaturedImage] = useState<string | null>(service?.featured_image || null);
  const [whoItIsFor, setWhoItIsFor] = useState(service?.who_it_is_for || "");
  const [duration, setDuration] = useState(service?.duration || "");
  const [onlineAvailable, setOnlineAvailable] = useState(service ? !!service.online_available : true);
  const [offlineAvailable, setOfflineAvailable] = useState(service ? !!service.offline_available : true);
  const [serviceArea, setServiceArea] = useState(service?.service_area || "Delhi NCR");
  const [priceFrom, setPriceFrom] = useState(service?.price_starting_from || "");
  const [ctaText, setCtaText] = useState(service?.cta_text || "Book a Class");
  const [ctaUrl, setCtaUrl] = useState(service?.cta_url || "");
  const [seoTitle, setSeoTitle] = useState(service?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(service?.seo_description || "");
  const [published, setPublished] = useState(service ? !!service.published : false);
  const [sortOrder, setSortOrder] = useState(service?.sort_order ?? 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      slug,
      short_description: shortDescription || null,
      full_description: fullDescription || null,
      featured_image: featuredImage,
      who_it_is_for: whoItIsFor || null,
      duration: duration || null,
      online_available: onlineAvailable,
      offline_available: offlineAvailable,
      service_area: serviceArea || null,
      price_starting_from: priceFrom || null,
      cta_text: ctaText || null,
      cta_url: ctaUrl || null,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      published,
      sort_order: Number(sortOrder) || 0,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/services/${service!.id}` : "/api/admin/services", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save service.");
        setSaving(false);
        return;
      }
      router.push("/admin/services");
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
        <Field label="Name" htmlFor="name" required>
          <TextInput id="name" required value={name} onChange={(e) => handleNameChange(e.target.value)} />
        </Field>
        <Field label="Slug" htmlFor="slug" hint="Used in the URL: /services/your-slug" required>
          <TextInput
            id="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </Field>
        <Field label="Short description" htmlFor="short-desc" hint="Shown on the services list page.">
          <TextArea id="short-desc" rows={2} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        </Field>
        <Field label="Full description" htmlFor="full-desc" hint="Shown on the service detail page.">
          <TextArea id="full-desc" rows={5} value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} />
        </Field>
        <MediaPicker value={featuredImage} onChange={setFeaturedImage} label="Featured image" />
      </AdminCard>

      <AdminCard className="space-y-4">
        <h2 className="font-medium">Details</h2>
        <Field label="Who it's for" htmlFor="who">
          <TextArea id="who" rows={2} value={whoItIsFor} onChange={(e) => setWhoItIsFor(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Duration" htmlFor="duration">
            <TextInput id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 60 min" />
          </Field>
          <Field label="Service area" htmlFor="area">
            <TextInput id="area" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
          <Toggle checked={onlineAvailable} onChange={setOnlineAvailable} label="Available online" />
          <Toggle checked={offlineAvailable} onChange={setOfflineAvailable} label="Available offline" />
        </div>
      </AdminCard>

      <AdminCard className="space-y-4">
        <h2 className="font-medium">Call to action & pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starting price text" htmlFor="price" hint="Free text, e.g. 'Contact for details'">
            <TextInput id="price" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} />
          </Field>
          <Field label="Button text" htmlFor="cta-text">
            <TextInput id="cta-text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
          </Field>
        </div>
        <Field label="Button link (optional)" htmlFor="cta-url" hint="Leave blank to use the default WhatsApp enquiry link.">
          <TextInput id="cta-url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/pricing" />
        </Field>
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

      <AdminCard className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <Field label="Sort order" htmlFor="sort" hint="Lower numbers appear first.">
            <TextInput
              id="sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </Field>
          <Toggle checked={published} onChange={setPublished} label="Published (visible on the live site)" />
        </div>
      </AdminCard>

      <FormActions onCancelHref="/admin/services" saving={saving} saveLabel={isEdit ? "Save changes" : "Create service"} />
    </form>
  );
}
