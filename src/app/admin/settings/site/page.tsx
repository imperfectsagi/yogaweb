import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAllSiteSettings } from "@/lib/cms";
import { SiteSettingsClient } from "./SiteSettingsClient";

export default async function AdminSiteSettingsPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const settings = await getAllSiteSettings().catch(() => ({}));

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <SiteSettingsClient initialSettings={settings} />
    </AdminShell>
  );
}
