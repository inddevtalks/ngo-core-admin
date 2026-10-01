import { ApiClient } from "./client";
import { createBeneficiariesApi } from "./beneficiaries";
import { createCampaignsApi } from "./campaigns";
import { createDonationsApi } from "./donations";
import { createOrganizationsApi } from "./organizations";

export function createApiClient(options?: {
  getAccessToken?: () => Promise<string | null>;
  getOrgId?: () => string | null;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
  const client = new ApiClient(baseUrl, options?.getAccessToken, options?.getOrgId);

  return {
    client,
    organizations: createOrganizationsApi(client),
    beneficiaries: createBeneficiariesApi(client),
    campaigns: createCampaignsApi(client),
    donations: createDonationsApi(client),
  };
}

export type NgocoreApi = ReturnType<typeof createApiClient>;
