"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminAlert, AdminList, EditAction, DeleteAction, PublishBadge } from "@/components/admin/AdminUI";
import type { ServiceRow } from "@/lib/cms";

export function ServicesListClient({ initialServices }: { initialServices: ServiceRow[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete service.");
        return;
      }
      setServices((s) => s.filter((svc) => svc.id !== id));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Create, edit and publish the yoga services shown on the public site."
        action={{ href: "/admin/services/new", label: "New Service" }}
      />
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      <AdminList
        emptyMessage="No services yet. Create your first one to get started."
        items={services.map((s) => ({
          id: s.id,
          badge: <PublishBadge published={!!s.published} />,
          fields: [
            { label: "Name", value: s.name, primary: true },
            { label: "Slug", value: s.slug },
            { label: "Price", value: s.price_starting_from || "—" },
            { label: "Order", value: s.sort_order },
          ],
        }))}
        renderActions={(id) => (
          <>
            <EditAction href={`/admin/services/${id}`} />
            <DeleteAction onClick={() => handleDelete(id)} disabled={deletingId === id} />
          </>
        )}
      />
    </div>
  );
}
