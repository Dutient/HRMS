"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { UploadProvider } from "@/context/UploadContext";
import { FloatingUploadWidget } from "@/components/FloatingUploadWidget";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // If on login page, render children without navigation
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Normal layout with navigation
  return (
    <UploadProvider>
      <div className="flex min-h-screen">
        {/* Sidebar - Dark Theme (Hidden on Mobile) */}
        <Sidebar />

        {/* Main Content Area - Light Theme */}
        <div className="flex flex-1 flex-col md:pl-64">
          <Header />
          <main className="flex-1 bg-background p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Upload Widget - Persists across navigation */}
      <FloatingUploadWidget />
    </UploadProvider>
  );
}
