"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Registrations", icon: Users, href: "/admin/adminregister" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <Image
          src="/deeperlifelogo.png"
          alt="Soul Winners Retreat Logo"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
        />
        <div>
          <p className="text-sm font-semibold text-white leading-tight">
            Deeper Life
          </p>
          <p className="text-xs text-slate-400">Retreat 2026</p>
        </div>
      </div>

      <div className="h-px bg-[#ffffff20]" />

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2.5 h-9 transition-colors",
                isActive
                  ? "bg-[#0c1c2eab] text-white hover:bg-[#0c1c2eab] hover:text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#0c1c2eab] font-medium"
              )}
              asChild
            >
              <Link href={href} onClick={onNavigate}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="h-px bg-[#ffffff20]" />

      {/* Footer */}
      <div className="px-4 py-4">
        <p className="text-xs text-slate-500">Soul Winners Retreat 2026</p>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();

  // Derive page title from path
  const pageTitle =
    pathname === "/admin"
      ? "Admin Dashboard"
      : pathname.startsWith("/admin/adminregister")
      ? "Register Person"
      : "Admin";

  const pageSubtitle =
    pathname === "/admin"
      ? "Retreat Registration Overview"
      : pathname.startsWith("/admin/adminregister")
      ? "Add a new registration manually"
      : "";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-[#133358] border-r-0">
        <SidebarNav />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-3 bg-white  px-4 py-3 shadow-sm sm:px-6">
          {/* Mobile sheet trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 bg-[#133358]" showCloseButton={false}>
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarNav onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold leading-tight truncate">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {pageSubtitle}
              </p>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
