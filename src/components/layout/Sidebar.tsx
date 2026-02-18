"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileUp,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    name: "Bulk Upload",
    href: "/bulk-upload",
    icon: FileUp,
  },
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  // Phase 2 - Commented out for now
  // {
  //   name: "Talent Pool",
  //   href: "/talent-pool",
  //   icon: Briefcase,
  // },
  // {
  //   name: "Interviews",
  //   href: "/interviews",
  //   icon: Calendar,
  // },
  // {
  //   name: "Analytics",
  //   href: "/analytics",
  //   icon: BarChart3,
  // },
  // {
  //   name: "Templates",
  //   href: "/templates",
  //   icon: Mail,
  // },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-52 bg-primary border-r border-primary-light hidden md:flex md:flex-col",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-primary-light px-4">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-extrabold tracking-tight font-heading text-white">
            Duti<span className="text-accent">ent</span>
          </span>
          <span className="ml-1 text-xs font-semibold text-accent">HRS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-accent text-white shadow-lg"
                  : "text-gray-300 hover:bg-primary-light hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout at Bottom */}
      <div className="border-t border-primary-light p-2 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
            pathname === "/settings"
              ? "bg-accent text-white"
              : "text-gray-300 hover:bg-primary-light hover:text-white"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-300 hover:bg-primary-light hover:text-white transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
