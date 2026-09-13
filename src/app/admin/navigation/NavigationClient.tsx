"use client";

import { useState } from "react";
import { AdminPageHeader, AdminAlert, AdminCard, Field, TextInput, Select, Toggle } from "@/components/admin/AdminUI";
import type { NavigationRow } from "@/lib/cms";
import { Trash2, Plus, GripVertical } from "lucide-react";

type DraftItem = Omit<NavigationRow, "id"> & { id: string | null };

const EMPTY: DraftItem = {
  id: null,
  location: "main",
  label: "",
  url: "",
  sort_order: 0,
  is_external: 0,
  parent_id: null,
  is_active: 1,
};

export function NavigationClient({ initialItems }: { initialItems: NavigationRow[] }) {
  const [items, setItems] = useState<NavigationRow[]>(initialItems);
  const [draft, setDraft] = useState<DraftItem>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const grouped = {
    main: items.filter((i) => i.location === "main").sort((a, b) => a.sort_order - b.sort_order),
    footer: items.filter((i) => i.location === "footer").sort((a, b) => a.sort_order - b.sort_order),
    mobile: items.filter((i) => i.location === "mobile").sort((a, b) => a.sort_order - b.sort_order),
  };

  function startEdit(item: NavigationRow) {
    setEditingId(item.id);
    setDraft({ ...item });
    setError(null);
  }

  function startNew(location: NavigationRow["location"]) {
    setEditingId(null);
    setDraft({ ...EMPTY, location, sort_order: (grouped[location].at(-1)?.sort_order ?? 0) + 10 });
    setError(null);
  }

  async function handleSave() {
    if (!draft.label.trim() || !draft.url.trim()) {
      setError("Label and URL are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        location: draft.location,
        label: draft.label,
        url: draft.url,
        sort_order: draft.sort_order,
        is_external: !!draft.is_external,
        is_active: !!draft.is_active,
        parent_id: draft.parent_id,
      };
      if (editingId) {
        const res = await fetch(`/api/admin/navigation/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error);
        setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, ...payload, is_external: payload.is_external ? 1 : 0, is_active: payload.is_active ? 1 : 0 } : i)));
      } else {
        const res = await fetch("/api/admin/navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error);
        setItems((prev) => [
          ...prev,
          { id: data.id, ...payload, is_external: payload.is_external ? 1 : 0, is_active: payload.is_active ? 1 : 0 },
        ]);
      }
      setSuccess("Navigation updated.");
      setDraft(EMPTY);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save navigation item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this navigation item?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/navigation/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraft(EMPTY);
      }
    } catch {
      setError("Could not delete navigation item.");
    }
  }

  function renderGroup(location: NavigationRow["location"], title: string) {
    return (
      <AdminCard key={location} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{title}</h2>
          <button type="button" onClick={() => startNew(location)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus className="h-3.5 w-3.5" /> Add link
          </button>
        </div>
        {grouped[location].length === 0 ? (
          <p className="text-sm text-muted">No links yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {grouped[location].map((item) => (
              <li key={item.id} className="flex items-center gap-2 py-2.5">
                <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-medium truncate">
                    {item.label} {!item.is_active && <span className="text-muted font-normal">(hidden)</span>}
                  </p>
                  <p className="text-xs text-muted truncate">{item.url}</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-button text-red-600 hover:bg-red-50 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Navigation" description="Manage the links shown in the header and footer." />
      {error && <AdminAlert type="error">{error}</AdminAlert>}
      {success && <AdminAlert type="success">{success}</AdminAlert>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {renderGroup("main", "Main navigation (header)")}
          {renderGroup("footer", "Footer links")}
        </div>

        <AdminCard className="h-fit space-y-4">
          <h2 className="font-medium">{editingId ? "Edit link" : "New link"}</h2>
          <Field label="Location" htmlFor="nav-location">
            <Select
              id="nav-location"
              value={draft.location}
              onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value as NavigationRow["location"] }))}
            >
              <option value="main">Main navigation (header)</option>
              <option value="footer">Footer</option>
              <option value="mobile">Mobile only</option>
            </Select>
          </Field>
          <Field label="Label" htmlFor="nav-label" required>
            <TextInput id="nav-label" value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} />
          </Field>
          <Field label="URL" htmlFor="nav-url" required hint="Internal path (e.g. /services) or full external URL.">
            <TextInput id="nav-url" value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} placeholder="/services" />
          </Field>
          <Field label="Sort order" htmlFor="nav-sort">
            <TextInput
              id="nav-sort"
              type="number"
              value={draft.sort_order}
              onChange={(e) => setDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))}
            />
          </Field>
          <div className="flex flex-col gap-1">
            <Toggle checked={!!draft.is_external} onChange={(v) => setDraft((d) => ({ ...d, is_external: v ? 1 : 0 }))} label="Opens in new tab (external link)" />
            <Toggle checked={!!draft.is_active} onChange={(v) => setDraft((d) => ({ ...d, is_active: v ? 1 : 0 }))} label="Visible on site" />
          </div>
          <div className="flex gap-2 pt-2">
            {(editingId || draft.label || draft.url) && (
              <button
                type="button"
                onClick={() => {
                  setDraft(EMPTY);
                  setEditingId(null);
                }}
                className="btn-secondary flex-1"
              >
                Clear
              </button>
            )}
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving…" : editingId ? "Save changes" : "Add link"}
            </button>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
