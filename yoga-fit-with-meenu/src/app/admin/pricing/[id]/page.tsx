import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PackageForm } from "@/components/admin/PackageForm";
import { adminGetPackage } from "@/lib/cms";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const pkg = await adminGetPackage(id);
  if (!pkg) notFound();

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">Edit Package</h1>
      <p className="text-muted mb-6 text-sm">{pkg.name}</p>
      <PackageForm pkg={pkg} />
    </AdminShell>
  );
}
