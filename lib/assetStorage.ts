import { assets as initialAssets, Asset } from "@/data/asset";

let cachedKey = "";
let cachedAssets: Asset[] = initialAssets;

export function getMergedAssets(): Asset[] {
  if (typeof window === "undefined") return initialAssets;

  const customRaw = localStorage.getItem("custom_assets") || "[]";
  const updatedRaw = localStorage.getItem("updated_assets") || "{}";
  const deletedRaw = localStorage.getItem("deleted_assets") || "[]";

  const key = `${customRaw}|${updatedRaw}|${deletedRaw}`;
  if (key === cachedKey) return cachedAssets;
  cachedKey = key;

  try {
    const customAssets: Asset[] = JSON.parse(customRaw);
    const updatedMap: Record<string, Asset> = JSON.parse(updatedRaw);
    const deletedIds = new Set<string>(JSON.parse(deletedRaw));

    const combined = [...customAssets, ...initialAssets];
    cachedAssets = combined
      .filter((item) => !deletedIds.has(item.id))
      .map((item) => updatedMap[item.id] ?? item);

    return cachedAssets;
  } catch {
    return initialAssets;
  }
}

export function getServerAssets(): Asset[] {
  return initialAssets;
}

export function subscribeAssets(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("assetchange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("assetchange", onChange);
  };
}