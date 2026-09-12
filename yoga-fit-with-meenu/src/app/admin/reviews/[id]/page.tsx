import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PackageReviewForm } from "@/components/admin/PackageReviewForm";
import { adminGetPackageReview, adminListPackages } from "@/lib/cms";

export default async function EditPackageReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const [review, packages] = await Promise.all([
    adminGetPackageReview(id),
    adminListPackages().catch(() => []),
  ]);
  if (!review) notFound();

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">Edit Review</h1>
      <p className="text-muted mb-6 text-sm">{review.customer_name}</p>
      <PackageReviewForm review={review} packages={packages.map((p) => ({ id: p.id, name: p.name }))} />
    </AdminShell>
  );
}
