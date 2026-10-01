import type { Campaign, CreateCampaignInput, PaginatedResponse } from "@ngocore/types";
import type { ApiClient } from "./client";

export function createCampaignsApi(client: ApiClient) {
  return {
    list(orgId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<Campaign>> {
      return client.get(`/organizations/${orgId}/campaigns?page=${page}&pageSize=${pageSize}`);
    },

    create(orgId: string, input: Omit<CreateCampaignInput, "orgId">): Promise<Campaign> {
      return client.post(`/organizations/${orgId}/campaigns`, input);
    },
  };
}
