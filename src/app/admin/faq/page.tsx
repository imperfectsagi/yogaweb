import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListFaqs } from "@/lib/cms";
import { FaqListClient } from "./FaqListClient";

export default async function AdminFaqPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const faqs = await adminListFaqs().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <FaqListClient initialFaqs={faqs} />
    </AdminShell>
  );
}
