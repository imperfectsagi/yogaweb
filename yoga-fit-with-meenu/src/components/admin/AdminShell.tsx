"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Layers,
  DollarSign,
  HelpCircle,
  MessageSquareQuote,
  Newspaper,
  FileText,
  Palette,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Search,
  Users,
  Lock,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";

type NavGroup = {
  label: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
};

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Layers },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
    ],
  },
  {
    label: "Media",
    items: [
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
      { href: "/admin/banner", label: "Homepage Banner", icon: ImageIcon },
    ],
  },
  {
    label: "Appearance",
    items: [
      { href: "/admin/theme", label: "Theme", icon: Palette },
      { href: "/admin/navigation", label: "Navigation", icon: MenuIcon },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/settings/site", label: "Site Settings", icon: SettingsIcon },
      { href: "/admin/settings/seo", label: "SEO", icon: Search },
      { href: "/admin/leads", label: "Leads", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/admin/settings", label: "Password", icon: Lock }],
  },
];

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const activeLabel =
    navGroups.flatMap((g) => g.items).find((item) => item.href === pathname)?.label || "Admin";

  const sidebarContent = (
    <nav className="flex flex-col gap-1 p-3">
      {navGroups.map((group, i) => (
        <div key={i} className="mb-2">
          {group.label && (
            <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-white" : "text-foreground hover:bg-primary/5"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-2 border-t border-border pt-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-button px-3 py-2.5 text-sm text-muted hover:bg-primary/5"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-button px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-button hover:bg-gray-100"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-primary">{activeLabel}</span>
        <div className="w-10" />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-semibold text-primary">Admin Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-button hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
        <div className="sticky top-0 max-h-screen overflow-y-auto">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/admin" className="font-semibold text-primary text-sm leading-tight">
              Yoga Fit with Meenu
              <br />
              <span className="text-xs font-normal text-muted">Admin</span>
            </Link>
          </div>
          {sidebarContent}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Desktop top bar */}
        <header className="hidden h-14 items-center justify-end gap-4 border-b bg-white px-6 lg:flex">
          <span className="text-sm text-muted">{userName}</span>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
