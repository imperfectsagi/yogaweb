import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { BannerManager } from "@/components/admin/BannerManager";

export default async function AdminBannerPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-2xl font-semibold mb-1">Homepage Banner</h1>
      <p className="text-muted mb-8">
        Upload an image or a short video for the hero banner at the top of the homepage.
      </p>

      <div className="max-w-xl rounded-lg border bg-white p-6 shadow-sm">
        <BannerManager />
      </div>
    </AdminShell>
  );
}
