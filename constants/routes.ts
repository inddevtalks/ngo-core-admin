export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  PLATFORM: "/platform",
  ORGANIZATIONS: "/platform/organizations",
  ORGANIZATION_NEW: "/platform/organizations/new",
  BILLING: "/platform/billing",
  COMPLIANCE: "/platform/compliance-monitor",
  SUPPORT: "/platform/support",
  AUDIT: "/platform/audit",
} as const;

export function organizationDetail(orgId: string) {
  return `${ROUTES.ORGANIZATIONS}/${orgId}`;
}
