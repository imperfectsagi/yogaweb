import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSeoSettings } from "@/lib/cms";
import { SeoSettingsClient } from "./SeoSettingsClient";

export default async function AdminSeoSettingsPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const seo = await getSeoSettings().catch(() => null);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <SeoSettingsClient initialSeo={seo} />
    </AdminShell>
  );
}
