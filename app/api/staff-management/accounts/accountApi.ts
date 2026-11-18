const accountFields = [
  "id",
  "username",
  "email",
  "first_name",
  "last_name",
  "profile_image",
  "phone",
  "role_id",
  "staff_id",
  "branch_id",
  "status",
  "created_at",
  "last_login",
] as const;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeAccount(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;

  const account: Record<string, unknown> = {};
  for (const field of accountFields) {
    if (field in value) account[field] = value[field];
  }
  return account;
}

export function getMockApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_MOCKAPI_URL?.trim();
  return baseUrl ? baseUrl.replace(/\/+$/, "") : null;
}
