import type { OrgType, Organization } from "@ngocore/types";
import type { ApiClient } from "./client";

export type PlatformOrgStatus =
  | "draft"
  | "active"
  | "verified"
  | "compliant"
  | "suspended";

export type PlatformBillingPlan = "free" | "starter" | "growth" | "enterprise";

export type PlatformOrganization = Organization & {
  memberCount?: number;
  ownerEmail?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  registrationNo?: string | null;
  plan?: PlatformBillingPlan;
  planLabel?: string;
};

export type PlatformOrgDetail = PlatformOrganization & {
  members: Array<{
    id: string;
    userId: string;
    orgId: string;
    role: string;
    email: string;
    fullName?: string | null;
    joinedAt?: string;
    isActive?: boolean;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt?: string;
    createdAt?: string;
  }>;
  complianceIssues: string[];
  allowedStatusTransitions: PlatformOrgStatus[];
};

export type PlatformOrgListResponse = {
  data: PlatformOrganization[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type PlatformOverview = {
  total: number;
  active: number;
  draft: number;
  suspended: number;
  verified: number;
  compliant: number;
  complianceGaps: number;
  missingPan: number;
  missingEightyG: number;
};

export type PlatformComplianceAlerts = {
  totalOrganizations: number;
  alertCount: number;
  alerts: Array<{
    orgId: string;
    name: string;
    status: string;
    issues: string[];
  }>;
};

export type PlatformExportReadiness = {
  totalNonDraft: number;
  form10bdReady: number;
  form10bdBlocked: number;
  missingEightyG: number;
  missingPan: number;
  fcraRegistered: number;
  dpdpConsentNote: string;
  form10bdNote: string;
};

export type PlatformBillingSummary = {
  plans: Array<{
    id: PlatformBillingPlan;
    label: string;
    seats: number;
    monthlyInr: number;
    highlights: string[];
    tenantCount: number;
  }>;
  totals: {
    tenants: number;
    free: number;
    paid: number;
    members: number;
    donations: number;
    beneficiaries: number;
  };
  upgradeTriggers: Array<{ id: string; label: string; action: string }>;
  tenants: Array<{
    orgId: string;
    name: string;
    status: string;
    plan: PlatformBillingPlan;
    planLabel: string;
    memberCount: number;
    donationCount: number;
    beneficiaryCount: number;
    billingEmail: string | null;
    notes: string | null;
    createdAt: string;
  }>;
};

export type PlatformAuditLog = {
  id: string;
  orgId: string | null;
  orgName: string | null;
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeState: unknown;
  afterState: unknown;
  createdAt: string;
};

export type PlatformAuditLogResponse = {
  data: PlatformAuditLog[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type PlatformSupportLookup = {
  organization: PlatformOrgDetail;
  plan: PlatformBillingPlan;
  planLabel: string;
  usage: {
    donationCount: number;
    beneficiaryCount: number;
    receiptCount: number;
    auditCount: number;
  };
  recentAudits: PlatformAuditLog[];
  supportActions: string[];
};

export type PlatformCreateOrgInput = {
  name: string;
  orgType?: OrgType;
  pan?: string;
  fcraRegistrationNo?: string;
  eightyGRegistrationNo?: string;
  receiptPrefix?: string;
  status?: "draft" | "active";
  ownerEmail: string;
  ownerFullName?: string;
  address?: string;
  phone?: string;
  contactEmail?: string;
  registrationNo?: string;
};

export type PlatformUpdateOrgInput = {
  name?: string;
  orgType?: OrgType;
  pan?: string;
  fcraRegistrationNo?: string;
  eightyGRegistrationNo?: string;
  receiptPrefix?: string;
  address?: string;
  phone?: string;
  contactEmail?: string;
  registrationNo?: string;
};

export type PlatformUpdateBillingInput = {
  plan: PlatformBillingPlan;
  billingEmail?: string;
  notes?: string;
};

export function createPlatformApi(client: ApiClient) {
  return {
    overview(): Promise<PlatformOverview> {
      return client.get("/platform/overview");
    },

    billingSummary(): Promise<PlatformBillingSummary> {
      return client.get("/platform/billing");
    },

    listAuditLogs(params?: {
      orgId?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    }): Promise<PlatformAuditLogResponse> {
      const query = new URLSearchParams();
      if (params?.orgId) query.set("orgId", params.orgId);
      if (params?.search) query.set("search", params.search);
      if (params?.page) query.set("page", String(params.page));
      if (params?.pageSize) query.set("pageSize", String(params.pageSize));
      const suffix = query.toString() ? `?${query}` : "";
      return client.get(`/platform/audit-logs${suffix}`);
    },

    supportLookup(params: {
      orgId?: string;
      search?: string;
    }): Promise<PlatformSupportLookup> {
      const query = new URLSearchParams();
      if (params.orgId) query.set("orgId", params.orgId);
      if (params.search) query.set("search", params.search);
      return client.get(`/platform/support/lookup?${query}`);
    },

    requestSupportAccess(
      orgId: string,
      input: { reason: string; ticketRef?: string },
    ): Promise<Record<string, unknown>> {
      return client.post(`/platform/organizations/${orgId}/support/access-request`, input);
    },

    exportAssist(
      orgId: string,
      input?: { format?: "summary" | "json"; reason?: string },
    ): Promise<Record<string, unknown>> {
      return client.post(`/platform/organizations/${orgId}/support/export-assist`, input ?? {});
    },

    listOrganizations(params?: {
      search?: string;
      status?: PlatformOrgStatus | "";
      page?: number;
      pageSize?: number;
    }): Promise<PlatformOrgListResponse> {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.status) query.set("status", params.status);
      if (params?.page) query.set("page", String(params.page));
      if (params?.pageSize) query.set("pageSize", String(params.pageSize));
      const suffix = query.toString() ? `?${query}` : "";
      return client.get(`/platform/organizations${suffix}`);
    },

    getOrganization(orgId: string): Promise<PlatformOrgDetail> {
      return client.get(`/platform/organizations/${orgId}`);
    },

    createOrganization(input: PlatformCreateOrgInput): Promise<PlatformOrganization> {
      return client.post("/platform/organizations", input);
    },

    updateOrganization(
      orgId: string,
      input: PlatformUpdateOrgInput,
    ): Promise<PlatformOrganization> {
      return client.patch(`/platform/organizations/${orgId}`, input);
    },

    updateStatus(
      orgId: string,
      status: PlatformOrgStatus,
    ): Promise<PlatformOrganization> {
      return client.patch(`/platform/organizations/${orgId}/status`, { status });
    },

    updateBilling(
      orgId: string,
      input: PlatformUpdateBillingInput,
    ): Promise<PlatformOrganization & { plan: PlatformBillingPlan }> {
      return client.patch(`/platform/organizations/${orgId}/billing`, input);
    },

    inviteOwner(
      orgId: string,
      input: { email: string; fullName?: string },
    ): Promise<Record<string, unknown>> {
      return client.post(`/platform/organizations/${orgId}/owner`, input);
    },

    complianceAlerts(): Promise<PlatformComplianceAlerts> {
      return client.get("/platform/compliance/alerts");
    },

    exportReadiness(): Promise<PlatformExportReadiness> {
      return client.get("/platform/compliance/export-readiness");
    },
  };
}
