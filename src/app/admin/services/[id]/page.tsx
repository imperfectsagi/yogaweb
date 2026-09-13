import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { adminGetService } from "@/lib/cms";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const service = await adminGetService(id);
  if (!service) notFound();

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">Edit Service</h1>
      <p className="text-muted mb-6 text-sm">{service.name}</p>
      <ServiceForm service={service} />
    </AdminShell>
  );
}
