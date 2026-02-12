import type { Metadata } from "next";
import { DM_Sans, Archivo } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { UploadProvider } from "@/context/UploadContext";
import { FloatingUploadWidget } from "@/components/FloatingUploadWidget";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dutient HR Management System",
  description: "Production-grade Applicant Tracking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${archivo.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}
