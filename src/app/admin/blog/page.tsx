import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListPosts, adminListCategories } from "@/lib/cms";
import { BlogListClient } from "./BlogListClient";

export default async function AdminBlogPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const [posts, categories] = await Promise.all([
    adminListPosts().catch(() => []),
    adminListCategories().catch(() => []),
  ]);

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <BlogListClient initialPosts={posts} categories={categories} />
    </AdminShell>
  );
}
