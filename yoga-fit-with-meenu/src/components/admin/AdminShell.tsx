"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/banner", label: "Homepage Banner" },
  { href: "/admin/settings", label: "Account & Security" },
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

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-semibold text-primary">
            Yoga Fit with Meenu — Admin
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted hidden sm:inline">{userName}</span>
            <button onClick={handleLogout} className="text-primary hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-2 border-b bg-white">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm px-3 py-1.5 rounded-button",
              pathname === item.href
                ? "bg-primary text-white"
                : "text-muted hover:bg-primary/5"
            )}
          >
            {item.label}
          </Link>
        ))}
        <Link href="/" className="ml-auto text-sm text-muted hover:text-foreground px-3 py-1.5">
          ← Back to site
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
