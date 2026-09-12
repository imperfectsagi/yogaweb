import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export default async function NewTestimonialPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">New Testimonial</h1>
      <p className="text-muted mb-6 text-sm">Add a review from a real student.</p>
      <TestimonialForm />
    </AdminShell>
  );
}
