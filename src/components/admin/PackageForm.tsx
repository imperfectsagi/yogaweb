"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard, AdminAlert, Field, TextInput, TextArea, Toggle, FormActions } from "@/components/admin/AdminUI";
import type { PackageRow } from "@/lib/cms";

export function PackageForm({ pkg }: { pkg?: PackageRow }) {
  const router = useRouter();
  const isEdit = !!pkg;

  const [name, setName] = useState(pkg?.name || "");
  const [description, setDescription] = useState(pkg?.description || "");
  const [price, setPrice] = useState(pkg?.price ?? 0);
  const [originalPrice, setOriginalPrice] = useState(pkg?.original_price ?? "");
  const [currency, setCurrency] = useState(pkg?.currency || "INR");
  const [numberOfClasses, setNumberOfClasses] = useState(pkg?.number_of_classes ?? "");
  const [classDuration, setClassDuration] = useState(pkg?.class_duration || "");
  const [packageDuration, setPackageDuration] = useState(pkg?.package_duration || "");
  const [onlineAvailable, setOnlineAvailable] = useState(pkg ? !!pkg.online_available : true);
  const [offlineAvailable, setOfflineAvailable] = useState(pkg ? !!pkg.offline_available : true);
  const [features, setFeatures] = useState(
    pkg?.features_json ? (JSON.parse(pkg.features_json) as string[]).join("\n") : ""
  );
  const [isPopular, setIsPopular] = useState(pkg ? !!pkg.is_popular : false);
  const [isActive, setIsActive] = useState(pkg ? !!pkg.is_active : true);
  const [sortOrder, setSortOrder] = useState(pkg?.sort_order ?? 0);
  const [ctaText, setCtaText] = useState(pkg?.cta_text || "Get Started");
  const [ctaUrl, setCtaUrl] = useState(pkg?.cta_url || "");
  const [showOnHomepage, setShowOnHomepage] = useState(pkg ? !!pkg.show_on_homepage : false);
  const [homepageSortOrder, setHomepageSortOrder] = useState(pkg?.homepage_sort_order ?? 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      description: description || null,
      price: Number(price) || 0,
      original_price: originalPrice === "" ? null : Number(originalPrice),
      currency,
      number_of_classes: numberOfClasses === "" ? null : Number(numberOfClasses),
      class_duration: classDuration || null,
      package_duration: packageDuration || null,
      online_available: onlineAvailable,
      offline_available: offlineAvailable,
      features: features.split("\n").map((f) => f.trim()).filter(Boolean),
      is_popular: isPopular,
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
      cta_text: ctaText || null,
      cta_url: ctaUrl || null,
      show_on_homepage: showOnHomepage,
      homepage_sort_order: Number(homepageSortOrder) || 0,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/packages/${pkg!.id}` : "/api/admin/packages", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save package.");
        setSaving(false);
        return;
      }
      router.push("/admin/pricing");
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
        <Field label="Package name" htmlFor="name" required>
          <TextInput id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Description" htmlFor="desc">
          <TextArea id="desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price" htmlFor="price" required>
            <TextInput id="price" type="number" min={0} step="0.01" required value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </Field>
          <Field label="Original price (optional)" htmlFor="orig-price" hint="Shown crossed out, for discounts.">
            <TextInput id="orig-price" type="number" min={0} step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))} />
          </Field>
          <Field label="Currency" htmlFor="currency">
            <TextInput id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </Field>
        </div>
      </AdminCard>

      <AdminCard className="space-y-4">
        <h2 className="font-medium">Details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Number of classes" htmlFor="classes">
            <TextInput id="classes" type="number" min={0} value={numberOfClasses} onChange={(e) => setNumberOfClasses(e.target.value === "" ? "" : Number(e.target.value))} />
          </Field>
          <Field label="Class duration" htmlFor="class-dur" hint="e.g. 60 min">
            <TextInput id="class-dur" value={classDuration} onChange={(e) => setClassDuration(e.target.value)} />
          </Field>
          <Field label="Package duration" htmlFor="pkg-dur" hint="e.g. 1 month">
            <TextInput id="pkg-dur" value={packageDuration} onChange={(e) => setPackageDuration(e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
          <Toggle checked={onlineAvailable} onChange={setOnlineAvailable} label="Available online" />
          <Toggle checked={offlineAvailable} onChange={setOfflineAvailable} label="Available offline" />
        </div>
        <Field label="Features" htmlFor="features" hint="One feature per line.">
          <TextArea id="features" rows={4} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder={"8 group classes\nFlexible timing\nBeginner friendly"} />
        </Field>
      </AdminCard>

      <AdminCard className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button text" htmlFor="cta-text">
            <TextInput id="cta-text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
          </Field>
          <Field label="Sort order" htmlFor="sort">
            <TextInput id="sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </Field>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
          <Toggle checked={isPopular} onChange={setIsPopular} label="Mark as popular" />
          <Toggle checked={isActive} onChange={setIsActive} label="Active (visible on the live site)" />
        </div>
      </AdminCard>

      <AdminCard className="space-y-4">
        <h2 className="font-medium">Homepage</h2>
        <p className="text-xs text-muted">
          Controls the &quot;Classes &amp; Packages&quot; section on the homepage only — the Pricing
          page always shows every active package regardless of this setting.
        </p>
        <Toggle checked={showOnHomepage} onChange={setShowOnHomepage} label="Show on Homepage" />
        {showOnHomepage && (
          <Field
            label="Homepage display order"
            htmlFor="homepage-sort"
            hint="Lower numbers appear first among the packages selected for the homepage. Independent of the Pricing page's sort order above."
          >
            <TextInput
              id="homepage-sort"
              type="number"
              value={homepageSortOrder}
              onChange={(e) => setHomepageSortOrder(Number(e.target.value))}
            />
          </Field>
        )}
      </AdminCard>

      <FormActions onCancelHref="/admin/pricing" saving={saving} saveLabel={isEdit ? "Save changes" : "Create package"} />
    </form>
  );
}
