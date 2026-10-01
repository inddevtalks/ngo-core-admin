import type {
  Beneficiary,
  CreateBeneficiaryInput,
  PaginatedResponse,
} from "@ngocore/types";
import type { ApiClient } from "./client";

export function createBeneficiariesApi(client: ApiClient) {
  return {
    list(orgId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<Beneficiary>> {
      return client.get(
        `/organizations/${orgId}/beneficiaries?page=${page}&pageSize=${pageSize}`,
      );
    },

    create(orgId: string, input: Omit<CreateBeneficiaryInput, "orgId">): Promise<Beneficiary> {
      return client.post(`/organizations/${orgId}/beneficiaries`, input);
    },
  };
}
