import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listMedia } from "@/lib/db";
import { MediaLibraryClient } from "./MediaLibraryClient";

type MediaRow = {
  id: string;
  filename: string;
  original_filename: string;
  r2_key: string;
  url: string;
  mime_type: string;
  file_size: number | null;
  created_at: string;
};

export default async function AdminMediaPage() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");
  const media = (await listMedia(200).catch(() => [])) as unknown as MediaRow[];

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <MediaLibraryClient initialMedia={media} />
    </AdminShell>
  );
}
