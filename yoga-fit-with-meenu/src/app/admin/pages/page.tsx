import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader, AdminList, EditAction, PublishBadge } from "@/components/admin/AdminUI";
import { adminListPages } from "@/lib/cms";

export default async function AdminPagesPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const pages = await adminListPages().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <AdminPageHeader title="Pages" description="Edit static content pages like About, Contact and legal pages." />
      <AdminList
        emptyMessage="No pages found."
        items={pages.map((p) => ({
          id: p.slug,
          badge: <PublishBadge published={!!p.published} />,
          fields: [
            { label: "Title", value: p.title, primary: true },
            { label: "Slug", value: `/${p.slug}` },
          ],
        }))}
        renderActions={(slug) => <EditAction href={`/admin/pages/${slug}`} />}
      />
    </AdminShell>
  );
}
