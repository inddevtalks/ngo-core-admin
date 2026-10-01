/** Platform-admin subset of shared domain types (aligned with NestJS API). */

export type OrgType = "trust" | "society" | "section8" | "other";

export interface Organization {
  id: string;
  name: string;
  logo?: string | null;
  signature?: string | null;
  pan?: string | null;
  fcraRegistrationNo?: string | null;
  eightyGRegistrationNo?: string | null;
  receiptPrefix?: string | null;
  orgType: OrgType;
  status?: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}
