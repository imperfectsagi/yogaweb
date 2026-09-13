import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListPackageReviews } from "@/lib/cms";
import { ReviewsListClient } from "./ReviewsListClient";

export default async function AdminReviewsPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const reviews = await adminListPackageReviews().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <ReviewsListClient initialReviews={reviews} />
    </AdminShell>
  );
}
