"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bell,
  Search,
  Menu,
  LayoutDashboard,
  Users,
  FileUp,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface HeaderProps {
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

export function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between border-b border-border bg-card px-4 md:px-8 shadow-sm",
        className
      )}
    >
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-text" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-primary p-0">
            <SheetHeader className="border-b border-primary-light p-6">
              <SheetTitle className="text-left">
                <Link
                  href="/"
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl font-extrabold tracking-tight font-heading text-white">
                    Duti<span className="text-accent">ent</span>
                  </span>
                  <span className="ml-1 text-xs font-semibold text-accent">HRS</span>
                </Link>
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-1 p-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
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

              {/* Settings */}
              <div className="border-t border-primary-light pt-3 mt-3">
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
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

              {/* Logout */}
              <div className="border-t border-primary-light pt-3 mt-3">
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-primary-light hover:text-white transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </form>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <Link href="/" className="flex items-center md:hidden">
          <span className="text-xl font-extrabold tracking-tight font-heading text-primary">
            Duti<span className="text-accent">ent</span>
          </span>
        </Link>
      </div>

      {/* Search Bar - Hidden on Mobile, Visible on Tablet+ */}
      <div className="hidden md:flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search candidates, roles, or use AI commands..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Right Section - Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-text-muted" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-2 md:gap-3 rounded-lg border border-border px-2 md:px-3 py-1.5 md:py-2 transition-colors hover:bg-background">
          <Avatar className="h-8 w-8 md:h-9 md:w-9">
            <AvatarFallback className="bg-accent text-white font-semibold text-sm">
              KS
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-text">Krishna</p>
            <p className="text-xs text-text-muted">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
