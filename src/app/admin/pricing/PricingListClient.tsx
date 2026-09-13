"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminAlert, AdminList, EditAction, DeleteAction, PublishBadge } from "@/components/admin/AdminUI";
import type { PackageRow } from "@/lib/cms";

export function PricingListClient({ initialPackages }: { initialPackages: PackageRow[] }) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this package? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete package.");
        return;
      }
      setPackages((p) => p.filter((pkg) => pkg.id !== id));
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
        title="Pricing & Packages"
        description="Manage class packages shown on the public pricing page."
        action={{ href: "/admin/pricing/new", label: "New Package" }}
      />
      {error && <AdminAlert type="error">{error}</AdminAlert>}

      <AdminList
        emptyMessage="No packages yet. Create your first one to get started."
        items={packages.map((p) => ({
          id: p.id,
          badge: <PublishBadge published={!!p.is_active} />,
          fields: [
            { label: "Name", value: p.name, primary: true },
            { label: "Price", value: `${p.currency} ${p.price}` },
            { label: "Classes", value: p.number_of_classes ?? "—" },
            { label: "Popular", value: p.is_popular ? "Yes" : "No" },
            { label: "On Homepage", value: p.show_on_homepage ? "Yes" : "No" },
          ],
        }))}
        renderActions={(id) => (
          <>
            <EditAction href={`/admin/pricing/${id}`} />
            <DeleteAction onClick={() => handleDelete(id)} disabled={deletingId === id} />
          </>
        )}
      />
    </div>
  );
}
