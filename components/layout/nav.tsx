import type { LucideIcon } from "lucide-react";
import { Building2, CreditCard, LayoutDashboard, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: "exact" | "prefix";
};

export type AppNavSection = {
  label: string;
  items: AppNavItem[];
};

export const APP_NAV: AppNavSection[] = [
  {
    label: "Platform",
    items: [
      { href: ROUTES.PLATFORM, label: "Overview", icon: LayoutDashboard, match: "exact" },
      { href: ROUTES.ORGANIZATIONS, label: "Organizations", icon: Building2, match: "prefix" },
      { href: ROUTES.BILLING, label: "Billing", icon: CreditCard, match: "prefix" },
      { href: ROUTES.COMPLIANCE, label: "Compliance", icon: ShieldCheck, match: "prefix" },
    ],
  },
];

export function isNavItemActive(pathname: string, item: AppNavItem) {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
