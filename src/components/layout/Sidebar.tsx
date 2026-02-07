"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  FileUp,
  Settings,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    name: "Talent Pool",
    href: "/talent-pool",
    icon: Briefcase,
  },
  {
    name: "Interviews",
    href: "/interviews",
    icon: Calendar,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Bulk Upload",
    href: "/bulk-upload",
    icon: FileUp,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-primary border-r border-primary-light hidden md:flex md:flex-col",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-primary-light px-6">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-extrabold tracking-tight font-heading text-white">
            Duti<span className="text-accent">ent</span>
          </span>
          <span className="ml-1 text-xs font-semibold text-accent">HRS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
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

      {/* Settings at Bottom */}
      <div className="border-t border-primary-light p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            pathname === "/settings"
              ? "bg-accent text-white"
              : "text-gray-300 hover:bg-primary-light hover:text-white"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
