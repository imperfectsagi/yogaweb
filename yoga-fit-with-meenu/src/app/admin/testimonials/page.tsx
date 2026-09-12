import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListTestimonials } from "@/lib/cms";
import { TestimonialsListClient } from "./TestimonialsListClient";

export default async function AdminTestimonialsPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const testimonials = await adminListTestimonials().catch(() => []);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <TestimonialsListClient initialTestimonials={testimonials} />
    </AdminShell>
  );
}
