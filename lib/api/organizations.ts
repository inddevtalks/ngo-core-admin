import type {
  CreateOrganizationInput,
  Organization,
  PaginatedResponse,
} from "@ngocore/types";
import type { ApiClient } from "./client";

export function createOrganizationsApi(client: ApiClient) {
  return {
    list(page = 1, pageSize = 20): Promise<PaginatedResponse<Organization>> {
      return client.get(`/organizations?page=${page}&pageSize=${pageSize}`);
    },

    get(id: string): Promise<Organization> {
      return client.get(`/organizations/${id}`);
    },

    create(input: CreateOrganizationInput): Promise<Organization> {
      return client.post("/organizations", input);
    },
  };
}
