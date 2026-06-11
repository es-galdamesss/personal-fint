"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          <Header />
          <main id="main-content" className="flex-1 p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
