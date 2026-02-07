"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-card px-8 shadow-sm",
        className
      )}
    >
      {/* Search Bar */}
      <div className="flex flex-1 items-center gap-4">
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
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-text-muted" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-background">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatar-placeholder.png" alt="User" />
            <AvatarFallback className="bg-accent text-white font-semibold">
              KS
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-text">Krishna</p>
            <p className="text-xs text-text-muted">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
