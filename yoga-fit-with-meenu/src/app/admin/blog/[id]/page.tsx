import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { adminGetPost } from "@/lib/cms";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const post = await adminGetPost(id);
  if (!post) notFound();

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-xl font-semibold mb-1 sm:text-2xl">Edit Blog Post</h1>
      <p className="text-muted mb-6 text-sm">{post.title}</p>
      <BlogPostForm post={post} />
    </AdminShell>
  );
}
