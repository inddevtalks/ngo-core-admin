const DEFAULT_SUPERADMIN_EMAIL = "superadmin@ngocore.org";

/** Allowed platform superadmin emails (comma-separated). */
export function getSuperAdminEmails(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL ||
    process.env.SUPERADMIN_EMAILS ||
    process.env.SUPERADMIN_EMAIL ||
    DEFAULT_SUPERADMIN_EMAIL;

  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.trim().toLowerCase());
}

export const SUPERADMIN_DEFAULTS = {
  email: DEFAULT_SUPERADMIN_EMAIL,
  password: "SuperAdmin@123",
  fullName: "Platform Superadmin",
} as const;
