import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PasswordChangeForm } from "@/components/admin/PasswordChangeForm";

export default async function AdminSettingsPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-2xl font-semibold mb-1">Account & Security</h1>
      <p className="text-muted mb-8">
        Signed in as {session.email}. Change your password regularly and never share it.
      </p>

      <div className="max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="font-medium mb-4">Change Password</h2>
        <PasswordChangeForm />
      </div>
    </AdminShell>
  );
}
