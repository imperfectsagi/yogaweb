import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminGetPageBySlug } from "@/lib/cms";
import { PageEditorClient } from "./PageEditorClient";

export default async function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { slug } = await params;
  const page = await adminGetPageBySlug(slug);
  if (!page) notFound();

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">Edit Page</h1>
      <p className="text-muted mb-6 text-sm">{page.title}</p>
      <PageEditorClient page={page} />
    </AdminShell>
  );
}
