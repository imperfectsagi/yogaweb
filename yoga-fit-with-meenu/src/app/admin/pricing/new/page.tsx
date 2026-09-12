import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PackageForm } from "@/components/admin/PackageForm";

export default async function NewPackagePage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">New Package</h1>
      <p className="text-muted mb-6 text-sm">Add a new pricing package to the public site.</p>
      <PackageForm />
    </AdminShell>
  );
}
