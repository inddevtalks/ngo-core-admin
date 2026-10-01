import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export type AppNavItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  match?: "exact" | "prefix";
};

export type AppNavSection = {
  id: string;
  label: string;
  items: AppNavItem[];
};

export const APP_NAV: AppNavSection[] = [
  {
    id: "platform",
    label: "Platform",
    items: [
      {
        id: "overview",
        href: ROUTES.PLATFORM,
        label: "Overview",
        icon: LayoutDashboard,
        match: "exact",
      },
      {
        id: "organizations",
        href: ROUTES.ORGANIZATIONS,
        label: "Organizations",
        icon: Building2,
        match: "prefix",
      },
      {
        id: "billing",
        href: ROUTES.BILLING,
        label: "Billing",
        icon: CreditCard,
        match: "prefix",
      },
      {
        id: "compliance",
        href: ROUTES.COMPLIANCE,
        label: "Compliance",
        icon: ShieldCheck,
        match: "prefix",
      },
      {
        id: "support",
        href: ROUTES.SUPPORT,
        label: "Support",
        icon: LifeBuoy,
        match: "prefix",
      },
      {
        id: "audit",
        href: ROUTES.AUDIT,
        label: "Audit log",
        icon: ScrollText,
        match: "prefix",
      },
    ],
  },
];

export function isNavItemActive(pathname: string, item: AppNavItem) {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
