"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminAlert, AdminList, EditAction, DeleteAction, PublishBadge, AdminCard, TextInput, Field } from "@/components/admin/AdminUI";
import type { BlogPostRow, BlogCategoryRow } from "@/lib/cms";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function BlogListClient({
  initialPosts,
  categories,
}: {
  initialPosts: BlogPostRow[];
  categories: BlogCategoryRow[];
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [cats, setCats] = useState(categories);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  const categoryName = (id: string | null) => cats.find((c) => c.id === id)?.name || "—";

  async function handleDelete(id: string) {
    if (!confirm("Delete this blog post? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete post.");
        return;
      }
      setPosts((p) => p.filter((post) => post.id !== id));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, slug: slugify(newCatName) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not add category.");
        return;
      }
      setCats((c) => [...c, { id: data.id, name: newCatName, slug: slugify(newCatName), description: null, created_at: "" }]);
      setNewCatName("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSavingCat(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description="Manage blog posts shown on the public blog."
        action={{ href: "/admin/blog/new", label: "New Post" }}
      />
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      <AdminCard className="mb-6">
        <h2 className="font-medium mb-3">Categories</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {cats.length ? (
            cats.map((c) => (
              <span key={c.id} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                {c.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted">No categories yet.</span>
          )}
        </div>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <div className="flex-1">
            <Field label="New category" htmlFor="new-cat">
              <TextInput id="new-cat" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Yoga Tips" />
            </Field>
          </div>
          <button type="submit" disabled={savingCat} className="btn-secondary self-end text-sm">
            Add
          </button>
        </form>
      </AdminCard>

      <AdminList
        emptyMessage="No blog posts yet. Write your first one to get started."
        items={posts.map((p) => ({
          id: p.id,
          badge: <PublishBadge published={!!p.published} />,
          fields: [
            { label: "Title", value: p.title, primary: true },
            { label: "Category", value: categoryName(p.category_id) },
            { label: "Slug", value: p.slug },
          ],
        }))}
        renderActions={(id) => (
          <>
            <EditAction href={`/admin/blog/${id}`} />
            <DeleteAction onClick={() => handleDelete(id)} disabled={deletingId === id} />
          </>
        )}
      />
    </div>
  );
}
