import type { RepairRequest } from "@/data/repairRequests";

const storageKey = "asset-management-user-repair-requests";
const changeEvent = "asset-management-user-repair-requests-change";

const statuses = new Set(["pending", "in_progress", "completed", "rejected"]);
const priorities = new Set(["low", "medium", "high", "urgent"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRepairRequest(value: unknown): value is RepairRequest {
  if (!isRecord(value)) return false;
  const request = value;
  return (
    typeof request.id === "string" &&
    typeof request.assetId === "string" &&
    typeof request.reporterId === "number" &&
    Number.isFinite(request.reporterId) &&
    typeof request.branchId === "string" &&
    typeof request.issue === "string" &&
    typeof request.priority === "string" &&
    priorities.has(request.priority) &&
    typeof request.status === "string" &&
    statuses.has(request.status) &&
    typeof request.vendorId === "string" &&
    typeof request.reportedAt === "string" &&
    (typeof request.startedAt === "string" || request.startedAt === null) &&
    (typeof request.completedAt === "string" || request.completedAt === null) &&
    (typeof request.estimatedCost === "number" ||
      request.estimatedCost === null) &&
    (typeof request.actualCost === "number" || request.actualCost === null) &&
    typeof request.solution === "string" &&
    typeof request.adminNote === "string"
  );
}

function parseRequests(raw: string | null): RepairRequest[] {
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isRepairRequest)) {
    throw new Error("Stored repair requests have an invalid format");
  }
  return parsed;
}

export function getUserRepairRequestsSnapshot() {
  try {
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error("Could not read user repair requests:", error);
    return null;
  }
}

export function getServerUserRepairRequestsSnapshot() {
  return null;
}

export function subscribeToUserRepairRequests(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function parseUserRepairRequestsSnapshot(raw: string | null) {
  try {
    return parseRequests(raw);
  } catch (error) {
    console.error("Could not parse stored user repair requests:", error);
    return [];
  }
}

export function saveUserRepairRequest(request: RepairRequest) {
  try {
    const storedRequests = parseRequests(localStorage.getItem(storageKey));
    localStorage.setItem(
      storageKey,
      JSON.stringify([request, ...storedRequests]),
    );
    window.dispatchEvent(new Event(changeEvent));
  } catch (error) {
    console.error("Could not save user repair request:", error);
    throw error;
  }
}
