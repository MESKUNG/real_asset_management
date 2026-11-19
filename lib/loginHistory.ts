export type LoginHistoryEntry = {
  id?: string | number;
  account_id: number;
  username: string;
  login_time: string;
  status: "success";
  device: string;
  ip_address?: string;
  location?: string;
};

const simulatedIpPrefixes = ["192.0.2", "198.51.100", "203.0.113"] as const;

export function createSimulatedIpAddress() {
  const prefix =
    simulatedIpPrefixes[Math.floor(Math.random() * simulatedIpPrefixes.length)];
  const host = Math.floor(Math.random() * 254) + 1;
  return `${prefix}.${host}`;
}

function getEndpoint() {
  const baseUrl = process.env.NEXT_PUBLIC_LOGIN_HISTORY_API_URL?.trim();
  if (!baseUrl)
    throw new Error("ไม่พบการตั้งค่า NEXT_PUBLIC_LOGIN_HISTORY_API_URL");
  return `${baseUrl.replace(/\/+$/, "")}/dataOfHistoryLogin`;
}

export async function createLoginHistory(entry: Omit<LoginHistoryEntry, "id">) {
  const response = await fetch(getEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok)
    throw new Error(`บันทึกประวัติไม่สำเร็จ (HTTP ${response.status})`);
  return (await response.json()) as LoginHistoryEntry;
}

export async function fetchLoginHistory(
  accountId: number,
): Promise<LoginHistoryEntry[]> {
  const query = new URLSearchParams({ account_id: String(accountId) });
  const response = await fetch(`${getEndpoint()}?${query}`, {
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`โหลดประวัติไม่สำเร็จ (HTTP ${response.status})`);
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isLoginHistoryEntry)) {
    throw new Error("รูปแบบข้อมูล LoginHistory ไม่ถูกต้อง");
  }
  return data;
}

function isLoginHistoryEntry(value: unknown): value is LoginHistoryEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "account_id" in value &&
    typeof value.account_id === "number" &&
    "username" in value &&
    typeof value.username === "string" &&
    "login_time" in value &&
    typeof value.login_time === "string" &&
    "status" in value &&
    value.status === "success" &&
    "device" in value &&
    typeof value.device === "string" &&
    (!("id" in value) ||
      typeof value.id === "string" ||
      typeof value.id === "number") &&
    (!("ip_address" in value) || typeof value.ip_address === "string") &&
    (!("location" in value) || typeof value.location === "string")
  );
}
