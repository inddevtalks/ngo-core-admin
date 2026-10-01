import { getAccessToken } from "@/lib/auth-session";
import { ApiClient } from "./client";
import { createPlatformApi } from "./platform";

const defaultBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function createApiClient(options?: {
  getAccessToken?: () => Promise<string | null>;
}) {
  const client = new ApiClient(defaultBaseUrl, options?.getAccessToken);

  return {
    client,
    platform: createPlatformApi(client),
  };
}

export function createAuthedApi() {
  return createApiClient({ getAccessToken });
}

export type NgocoreApi = ReturnType<typeof createApiClient>;
