import { useSyncExternalStore } from "react";
import { assets as initialAssets, type Asset } from "@/data/asset";

const CUSTOM_ASSETS_KEY = "custom_assets";
const UPDATED_ASSETS_KEY = "updated_assets";
const DELETED_ASSETS_KEY = "deleted_assets";

let cachedStorageValue: string | null = null;
let cachedAssets: Asset[] = initialAssets;

function parseStoredValue<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getAssetSnapshot(): Asset[] {
  if (typeof window === "undefined") return initialAssets;

  let customRaw: string | null = null;
  let updatedRaw: string | null = null;
  let deletedRaw: string | null = null;
  try {
    customRaw = localStorage.getItem(CUSTOM_ASSETS_KEY);
    updatedRaw = localStorage.getItem(UPDATED_ASSETS_KEY);
    deletedRaw = localStorage.getItem(DELETED_ASSETS_KEY);
  } catch {
    return initialAssets;
  }

  const storageValue = JSON.stringify([customRaw, updatedRaw, deletedRaw]);
  if (storageValue === cachedStorageValue) return cachedAssets;
  cachedStorageValue = storageValue;

  const byId = new Map<string, Asset>(
    initialAssets.map(
      (asset): [string, Asset] => [asset.id, { ...asset, qrCode: asset.id, barcode: asset.id }],
    ),
  );
  const storedCustomAssets = parseStoredValue<unknown>(customRaw, []);
  const storedUpdates = parseStoredValue<unknown>(updatedRaw, {});
  const storedDeletedAssetIds = parseStoredValue<unknown>(deletedRaw, []);
  const updatedAssets =
    storedUpdates && typeof storedUpdates === "object" && !Array.isArray(storedUpdates)
      ? (storedUpdates as Record<string, Partial<Asset>>)
      : {};

  for (const asset of Array.isArray(storedCustomAssets) ? storedCustomAssets : []) {
    if (asset && typeof asset.id === "string") {
      byId.set(asset.id, { ...asset, qrCode: asset.id, barcode: asset.id });
    }
  }
  for (const [id, update] of Object.entries(updatedAssets)) {
    const current = byId.get(id);
    if (current && update) {
      byId.set(id, { ...current, ...update, id, qrCode: id, barcode: id });
    }
  }
  for (const id of Array.isArray(storedDeletedAssetIds) ? storedDeletedAssetIds : []) {
    if (typeof id === "string") byId.delete(id);
  }

  cachedAssets = Array.from(byId.values());
  return cachedAssets;
}

function subscribeToAssetChanges(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("assetdatachange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("assetdatachange", onChange);
  };
}

export function useAssets(): Asset[] {
  return useSyncExternalStore(subscribeToAssetChanges, getAssetSnapshot, () => initialAssets);
}

export function getAssets(): Asset[] {
  return getAssetSnapshot();
}

export function notifyAssetDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("assetdatachange"));
  }
}

export async function prepareAssetImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("กรุณาเลือกไฟล์รูปภาพ");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("รูปภาพต้องมีขนาดไม่เกิน 10 MB");
  }

  const bitmap = await createImageBitmap(file);
  const maxSide = 1200;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("เปิดรูปภาพไม่สำเร็จ");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const compressed = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.8),
  );
  if (!compressed) throw new Error("บันทึกรูปภาพไม่สำเร็จ");
  if (compressed.size > 1_200_000) {
    throw new Error("รูปภาพหลังย่อขนาดยังใหญ่เกินไป กรุณาเลือกรูปอื่น");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("อ่านรูปภาพไม่สำเร็จ"));
    };
    reader.onerror = () => reject(new Error("อ่านรูปภาพไม่สำเร็จ"));
    reader.readAsDataURL(compressed);
  });
}
