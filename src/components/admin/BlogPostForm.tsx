"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminCard, AdminAlert, Field, TextInput, TextArea, Select, Toggle, FormActions } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { BlogPostRow, BlogCategoryRow } from "@/lib/cms";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function BlogPostForm({ post }: { post?: BlogPostRow }) {
  const router = useRouter();
  const isEdit = !!post;

  const [categories, setCategories] = useState<BlogCategoryRow[]>([]);
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [featuredImage, setFeaturedImage] = useState<string | null>(post?.featured_image || null);
  const [categoryId, setCategoryId] = useState(post?.category_id || "");
  const [published, setPublished] = useState(post ? !!post.published : false);
  const [seoTitle, setSeoTitle] = useState(post?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(post?.seo_description || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/blog/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      featured_image: featuredImage,
      category_id: categoryId || null,
      published,
      reading_time: content ? estimateReadingTime(content) : null,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/blog/posts/${post!.id}` : "/api/admin/blog/posts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save post.");
        setSaving(false);
        return;
      }
      router.push("/admin/blog");
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
        <Field label="Title" htmlFor="title" required>
          <TextInput id="title" required value={title} onChange={(e) => handleTitleChange(e.target.value)} />
        </Field>
        <Field label="Slug" htmlFor="slug" hint="Used in the URL: /blog/your-slug" required>
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
        <Field label="Excerpt" htmlFor="excerpt" hint="Shown on the blog list page.">
          <TextArea id="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </Field>
        <MediaPicker value={featuredImage} onChange={setFeaturedImage} label="Featured image" />
      </AdminCard>

      <AdminCard className="space-y-4">
        <Field label="Category" htmlFor="category">
          <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Content" htmlFor="content" hint="Plain text or simple HTML (e.g. <p>, <h2>). Reading time is calculated automatically.">
          <TextArea id="content" rows={12} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-xs" />
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

      <AdminCard>
        <Toggle checked={published} onChange={setPublished} label="Published (visible on the live site)" />
      </AdminCard>

      <FormActions onCancelHref="/admin/blog" saving={saving} saveLabel={isEdit ? "Save changes" : "Create post"} />
    </form>
  );
}
