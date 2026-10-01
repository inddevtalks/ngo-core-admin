import type { CreateDonationInput, Donation } from "@ngocore/types";
import type { ApiClient } from "./client";

export function createDonationsApi(client: ApiClient) {
  return {
    create(orgId: string, input: Omit<CreateDonationInput, "orgId">): Promise<Donation> {
      return client.post(`/organizations/${orgId}/donations`, input);
    },

    get(orgId: string, donationId: string): Promise<Donation> {
      return client.get(`/organizations/${orgId}/donations/${donationId}`);
    },
  };
}
