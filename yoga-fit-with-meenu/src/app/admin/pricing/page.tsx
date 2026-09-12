import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListPackages } from "@/lib/cms";
import { PricingListClient } from "./PricingListClient";

export default async function AdminPricingPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const packages = await adminListPackages().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <PricingListClient initialPackages={packages} />
    </AdminShell>
  );
}
