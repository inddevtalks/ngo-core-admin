"use client";

import { useEffect } from "react";
import { NGOCoreLogo } from "@/components/ui/NGOCoreLogo";

const HEADLINE = "Platform superadmin console for NGOCore.";
const SUBHEADLINE =
  "Onboard tenants, monitor compliance signals, and manage billing from one operator console.";

export function AuthFormShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full items-center">
      <div className="mx-auto w-full max-w-[480px] rounded-2xl border border-[#e8eeec] bg-white px-4 py-4 shadow-[0_24px_70px_rgba(15,45,42,0.12)] sm:rounded-[40px] sm:px-8 sm:py-5">
        <div className="mb-4 sm:mb-5">
          <NGOCoreLogo />
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    html.classList.add("auth-lock");
    body.classList.add("auth-lock");
    return () => {
      html.classList.remove("auth-lock");
      body.classList.remove("auth-lock");
    };
  }, []);

  return (
    <div className="grid min-h-screen grid-rows-1 md:grid-cols-2">
      <div className="relative hidden min-h-0 overflow-hidden md:flex">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#0f2d2a_0%,#1a4a44_40%,#2e8a7f_100%)]" />
        <div className="relative z-10 flex w-full flex-col justify-between px-8 py-8 md:px-10 md:py-10 xl:px-14 xl:py-14">
          <div className="mt-3 max-w-[560px]">
            <h1 className="m-0 text-[2.75rem] font-bold leading-[1.05] tracking-[-0.04em] text-white xl:text-[3.5rem]">
              {HEADLINE}
            </h1>
          </div>
          <p className="max-w-[520px] text-base font-medium leading-relaxed text-white/90 xl:text-[1.08rem]">
            {SUBHEADLINE}
          </p>
          <div className="grid max-w-[520px] grid-cols-2 gap-8 border-t border-white/20 pt-6">
            <div>
              <div className="text-[2.1rem] font-bold leading-none tracking-[-0.04em] text-[#7ee8d8]">
                Multi-tenant
              </div>
              <div className="mt-2 text-sm font-medium text-white/90">
                Isolated org data with RLS
              </div>
            </div>
            <div>
              <div className="text-[2.1rem] font-bold leading-none tracking-[-0.04em] text-[#7ee8d8]">
                Compliance
              </div>
              <div className="mt-2 text-sm font-medium text-white/90">
                80G, FCRA, and audit trails
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-4 py-8 md:min-h-0 md:py-10">
        <AuthFormShell>{children}</AuthFormShell>
      </div>
    </div>
  );
}
