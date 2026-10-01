import type { ApiError } from "@ngocore/types";
import { redirectToLoginOnExpiry } from "@/lib/auth-session";

export type TokenProvider = () => Promise<string | null>;

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.status = error.status;
    this.code = error.code;
  }
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getAccessToken?: TokenProvider,
    private readonly getOrgId?: () => string | null,
  ) {}

  private async buildHeaders(extra?: HeadersInit): Promise<Headers> {
    const headers = new Headers(extra);
    headers.set("Content-Type", "application/json");

    const token = this.getAccessToken ? await this.getAccessToken() : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const orgId = this.getOrgId?.();
    if (orgId) {
      headers.set("X-Org-Id", orgId);
    }

    return headers;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = await this.buildHeaders(init.headers);
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let message = response.statusText;
      let code: string | undefined;

      try {
        const body = (await response.json()) as {
          message?: string | string[];
          code?: string;
          error?: string;
        };
        if (Array.isArray(body.message)) {
          message = body.message.join(", ");
        } else if (typeof body.message === "string" && body.message) {
          message = body.message;
        } else if (body.error) {
          message = body.error;
        }
        code = body.code;
      } catch {
        // ignore parse errors
      }

      if (response.status === 401) {
        void redirectToLoginOnExpiry("unauthorized");
      }

      throw new ApiClientError({ message, code, status: response.status });
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}
