import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { Layers, DollarSign, HelpCircle, Newspaper, Users, MessageSquareQuote } from "lucide-react";

async function getCounts() {
  const db = getDb();
  const [services, packages, faqs, posts, leads, testimonials] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as c FROM services`).first<{ c: number }>(),
    db.prepare(`SELECT COUNT(*) as c FROM packages`).first<{ c: number }>(),
    db.prepare(`SELECT COUNT(*) as c FROM faqs`).first<{ c: number }>(),
    db.prepare(`SELECT COUNT(*) as c FROM blog_posts`).first<{ c: number }>(),
    db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status = 'new'`).first<{ c: number }>(),
    db.prepare(`SELECT COUNT(*) as c FROM testimonials`).first<{ c: number }>(),
  ]);
  return {
    services: services?.c ?? 0,
    packages: packages?.c ?? 0,
    faqs: faqs?.c ?? 0,
    posts: posts?.c ?? 0,
    newLeads: leads?.c ?? 0,
    testimonials: testimonials?.c ?? 0,
  };
}

export default async function AdminDashboard() {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/admin/login");

  let counts = { services: 0, packages: 0, faqs: 0, posts: 0, newLeads: 0, testimonials: 0 };
  try {
    counts = await getCounts();
  } catch {
    // D1 not reachable — show zeros rather than crash the dashboard
  }

  const cards = [
    { title: "Services", value: counts.services, href: "/admin/services", icon: Layers },
    { title: "Packages", value: counts.packages, href: "/admin/pricing", icon: DollarSign },
    { title: "FAQs", value: counts.faqs, href: "/admin/faq", icon: HelpCircle },
    { title: "Blog Posts", value: counts.posts, href: "/admin/blog", icon: Newspaper },
    { title: "Testimonials", value: counts.testimonials, href: "/admin/testimonials", icon: MessageSquareQuote },
    { title: "New Leads", value: counts.newLeads, href: "/admin/leads", icon: Users, highlight: counts.newLeads > 0 },
  ];

  return (
    <AdminShell userName={`${session.name} (${session.role})`}>
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-muted mb-8">Welcome back, {session.name}.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={
                "rounded-lg border bg-white p-4 shadow-sm hover:border-primary/40 transition-colors " +
                (item.highlight ? "border-primary/50 ring-1 ring-primary/20" : "border-border")
              }
            >
              <Icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-semibold">{item.value}</p>
              <p className="text-xs text-muted mt-0.5">{item.title}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="font-medium mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/services/new" className="btn-secondary text-sm">+ New Service</Link>
            <Link href="/admin/blog/new" className="btn-secondary text-sm">+ New Blog Post</Link>
            <Link href="/admin/faq/new" className="btn-secondary text-sm">+ New FAQ</Link>
            <Link href="/admin/banner" className="btn-secondary text-sm">Edit Banner</Link>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="font-medium mb-3">Appearance & Settings</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/theme" className="btn-secondary text-sm">Theme Colors</Link>
            <Link href="/admin/navigation" className="btn-secondary text-sm">Navigation</Link>
            <Link href="/admin/settings/site" className="btn-secondary text-sm">Site Settings</Link>
            <Link href="/admin/settings/seo" className="btn-secondary text-sm">SEO</Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
