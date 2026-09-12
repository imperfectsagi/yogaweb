import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default async function NewBlogPostPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">New Blog Post</h1>
      <p className="text-muted mb-6 text-sm">Write a new article for the public blog.</p>
      <BlogPostForm />
    </AdminShell>
  );
}
