"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Pin, PinOff, X } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { signOutApp } from "@/lib/auth-session";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { NGOCoreLogo } from "@/components/ui/NGOCoreLogo";
import { cn } from "@/lib/utils";
import { APP_NAV, isNavItemActive } from "./nav";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "AD";
}

export function AppSidebar({
  open,
  pinned,
  onClose,
  onTogglePin,
}: {
  open: boolean;
  pinned: boolean;
  onClose: () => void;
  onTogglePin: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userLabel, setUserLabel] = useState("Superadmin");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email ?? "";
        const fullName =
          (typeof data.user?.user_metadata?.full_name === "string" &&
            data.user.user_metadata.full_name) ||
          email.split("@")[0] ||
          "Admin";
        if (!cancelled) {
          setUserEmail(email);
          setUserLabel(fullName);
        }
      } catch {
        // Keep fallback labels.
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pinned) onClose();
  }, [pathname, pinned, onClose]);

  async function handleSignOut() {
    await signOutApp();
    router.replace(ROUTES.LOGIN);
  }

return (
    <div>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#0f2d2a]/40 backdrop-blur-[2px] transition-opacity",
          open && !pinned ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-[#0f2d2a] text-white shadow-[12px_0_40px_rgba(15,45,42,0.18)] transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex min-w-0 flex-1 items-center rounded-2xl bg-white px-3 py-2.5">
            <NGOCoreLogo href={ROUTES.PLATFORM} width={132} height={32} />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onTogglePin}
              className={cn(
                "rounded-lg p-1.5 hover:bg-white/10 hover:text-white",
                pinned ? "text-[#7ee8d8]" : "text-white/70",
              )}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              title={pinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {pinned ? <Pin className="h-5 w-5" /> : <PinOff className="h-5 w-5" />}
            </button>
            {!pinned ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
          {APP_NAV.map((section) => (
            <div key={section.id} className="mb-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {section.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isNavItemActive(pathname, item);
                  const Icon = item.icon;
                  return (
                    <li key={section.id + ":" + item.id}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-[#2e8a7f] text-white shadow-[0_8px_18px_rgba(46,138,127,0.28)]"
                            : "text-white/70 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7ee8d8] text-xs font-bold text-[#0f2d2a]">
              {initials(userLabel)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{userLabel}</p>
              <p className="truncate text-xs text-white/45">{userEmail || "Platform operator"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>
    </div>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfeae7] bg-white text-[#0f2d2a] shadow-sm"
      aria-label="Open sidebar"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
