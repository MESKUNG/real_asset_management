import type { Asset } from "@/data/asset";

const storageKey = "asset-management-asset-requests";
const changeEvent = "asset-management-asset-requests-change";
const assetStatuses = new Set<string>([
  "available",
  "borrowed",
  "repair",
  "damaged",
  "disposed",
]);
const requestStatuses = new Set(["pending", "approved", "rejected"]);

export type AssetRequest = {
  id: string;
  asset: Asset;
  requesterId: number;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string;
  decidedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAsset(value: unknown): value is Asset {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    typeof value.status === "string" &&
    assetStatuses.has(value.status) &&
    typeof value.brand === "string" &&
    typeof value.model === "string" &&
    typeof value.serialNumber === "string" &&
    (value.assetImage === undefined || typeof value.assetImage === "string") &&
    typeof value.branchId === "string" &&
    typeof value.responsiblePersonId === "number" &&
    typeof value.purchasePrice === "number" &&
    typeof value.purchaseDate === "string" &&
    typeof value.warrantyEndDate === "string" &&
    typeof value.vendorId === "string" &&
    typeof value.qrCode === "string" &&
    typeof value.barcode === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    typeof value.createdBy === "number" &&
    typeof value.updatedBy === "number"
  );
}

function isAssetRequest(value: unknown): value is AssetRequest {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isAsset(value.asset) &&
    typeof value.requesterId === "number" &&
    Number.isSafeInteger(value.requesterId) &&
    typeof value.requestedAt === "string" &&
    typeof value.status === "string" &&
    requestStatuses.has(value.status) &&
    typeof value.adminNote === "string" &&
    (typeof value.decidedAt === "string" || value.decidedAt === null)
  );
}

function parseRequests(raw: string | null): AssetRequest[] {
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isAssetRequest)) {
    throw new Error("Stored asset requests have an invalid format");
  }
  return parsed;
}

function parseCustomAssets(raw: string | null): Asset[] {
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isAsset)) {
    throw new Error("Stored custom assets have an invalid format");
  }
  return parsed;
}

export function getAssetRequestsSnapshot() {
  try {
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error("Could not read asset requests:", error);
    return null;
  }
}

export function getServerAssetRequestsSnapshot() {
  return null;
}

export function subscribeToAssetRequests(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function parseAssetRequestsSnapshot(raw: string | null) {
  try {
    return parseRequests(raw);
  } catch (error) {
    console.error("Could not parse stored asset requests:", error);
    return [];
  }
}

function writeRequests(requests: AssetRequest[]) {
  localStorage.setItem(storageKey, JSON.stringify(requests));
  window.dispatchEvent(new Event(changeEvent));
}

export function saveAssetRequest(request: AssetRequest) {
  try {
    const requests = parseRequests(localStorage.getItem(storageKey));
    if (requests.some(({ id }) => id === request.id)) {
      throw new Error(`Asset request ${request.id} already exists`);
    }
    writeRequests([request, ...requests]);
  } catch (error) {
    console.error("Could not save asset request:", error);
    throw error;
  }
}

export function decideAssetRequest(
  request: AssetRequest,
  decision: "approved" | "rejected",
  adminNote: string,
  reviewerId: number,
  approvedAssetId?: string,
) {
  try {
    const requests = parseRequests(localStorage.getItem(storageKey));
    const storedRequest = requests.find(({ id }) => id === request.id);
    if (!storedRequest || storedRequest.status !== "pending") {
      throw new Error("Asset request is no longer pending");
    }

    if (decision === "approved") {
      if (!approvedAssetId) {
        throw new Error("An asset ID is required to approve this request");
      }

      const customAssets = parseCustomAssets(
        localStorage.getItem("custom_assets"),
      );
      const existingApprovedAsset = customAssets.find(
        (asset) =>
          "assetRequestId" in asset && asset.assetRequestId === request.id,
      );
      if (!existingApprovedAsset) {
        const now = new Date().toISOString();
        const approvedAsset = {
          ...request.asset,
          id: approvedAssetId,
          qrCode: approvedAssetId,
          barcode: approvedAssetId,
          createdAt: now,
          updatedAt: now,
          updatedBy: reviewerId,
          assetRequestId: request.id,
        };
        localStorage.setItem(
          "custom_assets",
          JSON.stringify([approvedAsset, ...customAssets]),
        );
        window.dispatchEvent(new Event("assetchange"));
      }
    }

    const updatedRequest: AssetRequest = {
      ...storedRequest,
      status: decision,
      adminNote,
      decidedAt: new Date().toISOString(),
    };
    writeRequests([
      updatedRequest,
      ...requests.filter(({ id }) => id !== request.id),
    ]);
    return updatedRequest;
  } catch (error) {
    console.error("Could not decide asset request:", error);
    throw error;
  }
}
