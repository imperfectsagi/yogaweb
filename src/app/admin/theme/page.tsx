import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { getTheme } from "@/lib/db";
import { DEFAULT_THEME } from "@/lib/cms";
import { ThemeClient } from "./ThemeClient";

export default async function AdminThemePage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const theme = (await getTheme().catch(() => null)) || { id: 1, ...DEFAULT_THEME, updated_at: "" };

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <ThemeClient initialTheme={theme} />
    </AdminShell>
  );
}
