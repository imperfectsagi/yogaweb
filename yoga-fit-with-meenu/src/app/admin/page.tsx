import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  const cards = [
    {
      title: "Homepage Banner",
      desc: "Upload the banner image or video shown at the top of the homepage.",
      href: "/admin/banner",
      ready: true,
    },
    {
      title: "Account & Security",
      desc: "Change your admin password.",
      href: "/admin/settings",
      ready: true,
    },
    {
      title: "Leads",
      desc: "View free-class and contact form submissions.",
      href: null,
      ready: false,
    },
    {
      title: "Services",
      desc: "Edit service listings and pricing.",
      href: null,
      ready: false,
    },
    {
      title: "Blog",
      desc: "Publish and edit blog posts.",
      href: null,
      ready: false,
    },
    {
      title: "SEO",
      desc: "Manage page titles, meta descriptions and redirects.",
      href: null,
      ready: false,
    },
  ];

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-muted mb-8">Welcome back, {session.name}.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((item) => {
          const content = (
            <div
              className={
                "rounded-lg border bg-white p-4 shadow-sm h-full " +
                (item.ready ? "hover:border-primary/40 transition-colors" : "opacity-60")
              }
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{item.title}</h2>
                {!item.ready && (
                  <span className="text-xs rounded-full bg-gray-100 text-muted px-2 py-0.5">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="text-sm text-muted mt-1">{item.desc}</p>
            </div>
          );
          return item.href ? (
            <Link key={item.title} href={item.href}>
              {content}
            </Link>
          ) : (
            <div key={item.title}>{content}</div>
          );
        })}
      </div>
    </AdminShell>
  );
}
