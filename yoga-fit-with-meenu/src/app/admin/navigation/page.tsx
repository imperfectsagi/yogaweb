import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListNavigation } from "@/lib/cms";
import { NavigationClient } from "./NavigationClient";

export default async function AdminNavigationPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const navigation = await adminListNavigation().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <NavigationClient initialItems={navigation} />
    </AdminShell>
  );
}
