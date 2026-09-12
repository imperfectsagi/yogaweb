import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListServices } from "@/lib/cms";
import { ServicesListClient } from "./ServicesListClient";

export default async function AdminServicesPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const services = await adminListServices().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <ServicesListClient initialServices={services} />
    </AdminShell>
  );
}
