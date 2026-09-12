import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { FaqForm } from "@/components/admin/FaqForm";
import { adminGetFaq } from "@/lib/cms";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const faq = await adminGetFaq(id);
  if (!faq) notFound();

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">Edit FAQ</h1>
      <p className="text-muted mb-6 text-sm line-clamp-1">{faq.question}</p>
      <FaqForm faq={faq} />
    </AdminShell>
  );
}
