import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { FaqForm } from "@/components/admin/FaqForm";

export default async function NewFaqPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">New FAQ</h1>
      <p className="text-muted mb-6 text-sm">Add a new question and answer.</p>
      <FaqForm />
    </AdminShell>
  );
}
