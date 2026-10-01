"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { getSidebarPinned, setSidebarPinned } from "@/lib/sidebar-session";
import { AppSidebar, SidebarToggle } from "./app-sidebar";

interface AppShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AppShell({ title, description, children }: AppShellProps) {
  const [sidebarPinned, setPinned] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const pinned = getSidebarPinned();
    setPinned(pinned);
    setSidebarOpen(pinned);
  }, []);

  function togglePin() {
    const next = !sidebarPinned;
    setPinned(next);
    setSidebarPinned(next);
    if (next) setSidebarOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#f3f5f4]">
      <AppSidebar open={sidebarOpen} pinned={sidebarPinned} onClose={closeSidebar} onTogglePin={togglePin} />

      <div className={sidebarPinned && sidebarOpen ? "lg:pl-[272px]" : ""}>
        <header className="sticky top-0 z-30 border-b border-[#dfeae7] bg-[#f3f5f4]/90 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            {!sidebarOpen ? <SidebarToggle onClick={() => setSidebarOpen(true)} /> : null}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-[-0.03em] text-neutral-900 sm:text-2xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-0.5 truncate text-sm text-neutral-500">{description}</p>
              ) : null}
            </div>
            <div className="ml-auto flex max-w-[46%] shrink-0 items-center gap-2 rounded-full border border-[#dfeae7] bg-white px-3 py-1.5 shadow-sm sm:max-w-none sm:px-3.5 sm:py-2">
              <Shield className="h-4 w-4 shrink-0 text-primary-700" />
              <span className="truncate text-sm font-semibold text-[#0f2d2a]">Platform admin</span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export const PlatformShell = AppShell;
