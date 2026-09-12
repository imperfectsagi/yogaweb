import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { getDb } from "@/lib/db";
import { LeadsClient } from "./LeadsClient";

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  interested_service: string | null;
  preferred_mode: string | null;
  preferred_time: string | null;
  message: string | null;
  source: string | null;
  status: string;
  created_at: string;
};

export default async function AdminLeadsPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  let leads: Lead[] = [];
  try {
    const db = getDb();
    const { results } = await db.prepare(`SELECT * FROM leads ORDER BY created_at DESC LIMIT 200`).all<Lead>();
    leads = results || [];
  } catch {
    leads = [];
  }

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <LeadsClient initialLeads={leads} />
    </AdminShell>
  );
}
