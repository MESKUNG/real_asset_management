import { branches, type Branch } from "@/data/branches";

const STORAGE_KEY = "managed_branches";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBranch(value: unknown, index: number): Branch {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.code !== "string" ||
    typeof value.address !== "string" ||
    (value.province !== undefined && typeof value.province !== "string") ||
    (value.postalCode !== undefined && typeof value.postalCode !== "string") ||
    typeof value.phone !== "string" ||
    (value.status !== "active" && value.status !== "inactive") ||
    typeof value.createdAt !== "string"
  ) {
    throw new Error(`ข้อมูลสาขารายการที่ ${index + 1} มีรูปแบบไม่ถูกต้อง`);
  }

  return {
    id: value.id,
    name: value.name,
    code: value.code,
    address: value.address,
    ...(typeof value.province === "string" ? { province: value.province } : {}),
    ...(typeof value.postalCode === "string"
      ? { postalCode: value.postalCode }
      : {}),
    phone: value.phone,
    status: value.status,
    createdAt: value.createdAt,
  };
}

export function getManagedBranches(): Branch[] {
  if (typeof window === "undefined") return branches;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return branches;

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error("ข้อมูลสาขาในเบราว์เซอร์เสียหาย");
  }

  if (!Array.isArray(payload)) {
    throw new Error("รูปแบบข้อมูลสาขาในเบราว์เซอร์ไม่ถูกต้อง");
  }

  return payload.map(parseBranch);
}

export function saveManagedBranches(nextBranches: Branch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBranches));
  window.dispatchEvent(new Event("branchchange"));
}

export function subscribeManagedBranches(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) onChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener("branchchange", onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("branchchange", onChange);
  };
}
