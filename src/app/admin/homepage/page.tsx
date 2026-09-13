import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListHomepageSections } from "@/lib/cms";
import { HomepageClient } from "./HomepageClient";

export default async function AdminHomepagePage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const sections = await adminListHomepageSections().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <HomepageClient initialSections={sections} />
    </AdminShell>
  );
}
