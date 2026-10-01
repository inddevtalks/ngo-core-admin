import type { OrgType } from "@ngocore/types";
import type { PlatformOrgStatus } from "@/lib/api/platform";

export function orgTypeLabel(type?: OrgType | string) {
  switch (type) {
    case "trust":
      return "Trust";
    case "society":
      return "Society";
    case "section8":
      return "Section 8";
    case "other":
      return "Other";
    default:
      return type ?? "—";
  }
}

export function orgStatusBadgeClass(status?: string) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "verified":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "compliant":
      return "bg-teal-50 text-teal-800 ring-teal-200";
    case "suspended":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    case "draft":
      return "bg-neutral-100 text-neutral-700 ring-neutral-200";
    default:
      return "bg-neutral-100 text-neutral-600 ring-neutral-200";
  }
}

export function orgStatusLabel(status?: string) {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const ORG_STATUS_FILTERS: Array<PlatformOrgStatus | "all"> = [
  "all",
  "draft",
  "active",
  "verified",
  "compliant",
  "suspended",
];
