import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { adminGetTestimonial } from "@/lib/cms";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const testimonial = await adminGetTestimonial(id);
  if (!testimonial) notFound();

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">Edit Testimonial</h1>
      <p className="text-muted mb-6 text-sm">{testimonial.name}</p>
      <TestimonialForm testimonial={testimonial} />
    </AdminShell>
  );
}
