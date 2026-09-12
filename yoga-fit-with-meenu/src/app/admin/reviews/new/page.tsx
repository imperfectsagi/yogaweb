import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PackageReviewForm } from "@/components/admin/PackageReviewForm";
import { adminListPackages } from "@/lib/cms";

export default async function NewPackageReviewPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const packages = await adminListPackages().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">New Review</h1>
      <p className="text-muted mb-6 text-sm">Add a review on behalf of a customer.</p>
      <PackageReviewForm packages={packages.map((p) => ({ id: p.id, name: p.name }))} />
    </AdminShell>
  );
}
