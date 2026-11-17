// ข้อมูลและฟังก์ชันกลางของระบบตรวจนับ ใช้ร่วมกันทุกหน้าใน /inventories และ /reports
import { useMemo, useSyncExternalStore } from "react";
import { assets, type Asset, type AssetStatus } from "@/data/asset";
import { branches } from "@/data/branches";
import { categories } from "@/data/catagories";
import {
  inventorySessions,
  type InventorySession,
  type InventorySessionStatus,
} from "@/data/inventorySessions";
import {
  inventoryChecks,
  type InventoryCheck,
  type InventoryResult,
} from "@/data/inventoryCheck";

/* ---------------- ผู้ใช้ที่ login อยู่ ---------------- */

export type Role = "user" | "admin" | "president" | "superadmin";

export type Credential = {
  id: number;
  username: string;
  role: Role;
};

const ROLES: Role[] = ["user", "admin", "president", "superadmin"];

function parseCredential(raw: string | null): Credential | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const record = data as Record<string, unknown>;
    if (typeof record.role !== "string" || !ROLES.includes(record.role as Role)) return null;
    return {
      id: Number(record.id) || 0,
      username: typeof record.username === "string" ? record.username : "ผู้ใช้",
      role: record.role as Role,
    };
  } catch {
    return null;
  }
}

function subscribeCredential(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("credentialchange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

// อ่านบัญชีที่ login จาก localStorage (วิธีเดียวกับ sideNavbar ของกลุ่ม)
// ready = false คือยังโหลดไม่เสร็จ ป้องกันหน้ากระพริบเป็น "ไม่มีสิทธิ์" ชั่วขณะ
export function useCredential() {
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeCredential,
    () => localStorage.getItem("credential"),
    () => undefined,
  );
  const credential = useMemo(() => (raw === undefined ? null : parseCredential(raw)), [raw]);
  return { credential, ready: raw !== undefined };
}

/* ---------------- ที่เก็บข้อมูลรอบตรวจนับและผลตรวจ ---------------- */
// ตั้งต้นจากไฟล์ใน data/ แล้วบันทึกการเปลี่ยนแปลงลง localStorage
// ทำให้ผลสแกนอยู่ต่อแม้เปลี่ยนหน้าหรือรีเฟรช

export type StoredSession = InventorySession & { assigneeId?: number };
export type StoredCheck = InventoryCheck & { checkerName?: string };
type InventoryStore = { sessions: StoredSession[]; checks: StoredCheck[] };

const STORE_KEY = "inventory-store-v1";
const STORE_EVENT = "inventorystorechange";

function seedStore(): InventoryStore {
  return { sessions: [...inventorySessions], checks: [...inventoryChecks] };
}

function parseStore(raw: string | null): InventoryStore {
  if (!raw) return seedStore();
  try {
    const data = JSON.parse(raw) as Partial<InventoryStore>;
    if (!Array.isArray(data.sessions) || !Array.isArray(data.checks)) return seedStore();
    return { sessions: data.sessions, checks: data.checks };
  } catch {
    return seedStore();
  }
}

function subscribeStore(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORE_EVENT, onChange);
  };
}

export function useInventoryStore() {
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeStore,
    () => localStorage.getItem(STORE_KEY),
    () => undefined,
  );
  const store = useMemo(() => parseStore(raw ?? null), [raw]);
  return { sessions: store.sessions, checks: store.checks, ready: raw !== undefined };
}

function readStore(): InventoryStore {
  return parseStore(localStorage.getItem(STORE_KEY));
}

function saveStore(store: InventoryStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(STORE_EVENT));
}

// ล้างข้อมูลที่บันทึกไว้ กลับไปใช้ข้อมูลตั้งต้นจากโฟลเดอร์ data
export function resetInventoryStore() {
  localStorage.removeItem(STORE_KEY);
  window.dispatchEvent(new Event(STORE_EVENT));
}

/* ---------------- ข้อมูลอ้างอิง ---------------- */

export const STAFF: { id: number; name: string; dept: string }[] = [
  { id: 101, name: "กานต์ พิพัฒน์", dept: "ฝ่ายบริหารทรัพย์สิน" },
  { id: 102, name: "พัฒพงศ์ จันทร์กระจ่าง", dept: "ฝ่ายไอที" },
  { id: 103, name: "ปิยะ วัฒนา", dept: "ฝ่ายไอที" },
  { id: 104, name: "มาลี ใจดี", dept: "ฝ่ายธุรการ" },
  { id: 112, name: "สมชาย ใจดี", dept: "หัวหน้าฝ่ายไอที" },
];

export function getStaffName(id?: number | null): string {
  if (id === undefined || id === null) return "ยังไม่มอบหมาย";
  return STAFF.find((s) => s.id === id)?.name ?? `พนักงาน #${id}`;
}

export function getCheckerName(check: StoredCheck): string {
  return check.checkerName ?? getStaffName(check.checkerId);
}

export function getBranchName(id: string): string {
  return branches.find((b) => b.id === id)?.name ?? id;
}

export function getCategoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}

// หาทรัพย์สินจากรหัสที่สแกน (รองรับทั้งรหัสทรัพย์สิน, QR และ Barcode)
export function findAsset(code: string): Asset | undefined {
  const key = code.trim().toUpperCase();
  return assets.find(
    (a) =>
      a.id.toUpperCase() === key ||
      a.qrCode.toUpperCase() === key ||
      a.barcode.toUpperCase() === key,
  );
}

// ทรัพย์สินที่ต้องตรวจในรอบนี้ = ทรัพย์สินทุกชิ้นของสาขาที่ตรวจ
export function getSessionAssets(session: InventorySession): Asset[] {
  return assets.filter((a) => a.branchId === session.branchId);
}

export const SESSION_STATUS_LABEL: Record<InventorySessionStatus, string> = {
  planned: "รอเริ่ม",
  in_progress: "กำลังนับ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

export const RESULT_LABEL: Record<InventoryResult, string> = {
  found: "ปกติ",
  damaged: "ชำรุด",
  missing: "ไม่พบ",
  mismatch: "ไม่ตรงสาขา",
};

export const ASSET_STATUS_LABEL: Record<AssetStatus, string> = {
  available: "พร้อมใช้งาน",
  borrowed: "ถูกยืม",
  repair: "ซ่อมบำรุง",
  damaged: "ชำรุด",
  disposed: "จำหน่ายแล้ว",
};

/* ---------------- วันที่และตัวเลข ---------------- */

const pad = (n: number) => String(n).padStart(2, "0");

// วันที่รูปแบบ "2026-11-16" ตามเวลาเครื่อง (ใช้กับ <input type="date">)
export function toDateValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toLocalISO(d: Date): string {
  return `${toDateValue(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// "2026-11-05" ต้องเติมเวลาเอง ไม่งั้นเบราว์เซอร์จะอ่านเป็นเวลา UTC
function parseDate(value: string): Date {
  return new Date(value.length === 10 ? `${value}T00:00:00` : value);
}

export function formatThaiDate(value: string, withYear = true): string {
  const d = parseDate(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export function formatThaiDateTime(value: string): string {
  const d = parseDate(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateRange(start: string, end: string): string {
  return `${formatThaiDate(start, false)} – ${formatThaiDate(end)}`;
}

// จำนวนวันจากวันนี้ถึงวันที่กำหนด (ติดลบ = เลยมาแล้ว)
export function daysFromToday(value: string): number {
  const today = parseDate(toDateValue(new Date()));
  return Math.round((parseDate(value).getTime() - today.getTime()) / 86_400_000);
}

export function formatBaht(n: number): string {
  return `฿${n.toLocaleString("th-TH")}`;
}

/* ---------------- ความคืบหน้าของรอบ ---------------- */

export function getSessionProgress(session: InventorySession, checks: StoredCheck[]) {
  const sessionAssets = getSessionAssets(session);
  const assetIds = new Set(sessionAssets.map((a) => a.id));
  const sessionChecks = checks.filter((c) => c.sessionId === session.id);
  const checkedIds = new Set(
    sessionChecks
      .filter((c) => assetIds.has(c.assetId) && c.result !== "missing")
      .map((c) => c.assetId),
  );
  const total = sessionAssets.length;
  const checked = checkedIds.size;
  return {
    total,
    checked,
    percent: total > 0 ? Math.round((checked / total) * 100) : 0,
    damaged: sessionChecks.filter((c) => c.result === "damaged").length,
    missing: sessionChecks.filter((c) => c.result === "missing").length,
    mismatch: sessionChecks.filter((c) => c.result === "mismatch").length,
  };
}

/* ---------------- จัดการรอบตรวจนับ (Admin) ---------------- */

function nextId(prefix: string, ids: string[]): string {
  const max = Math.max(0, ...ids.map((id) => Number(id.replace(/\D/g, "")) || 0));
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

export type NewSessionInput = {
  name: string;
  branchId: string;
  startDate: string;
  endDate: string;
  assigneeId: number;
  createdBy: number;
};

export function createSession(input: NewSessionInput): StoredSession {
  const store = readStore();
  const session: StoredSession = {
    id: nextId("IS", store.sessions.map((s) => s.id)),
    name: input.name,
    branchId: input.branchId,
    startDate: input.startDate,
    endDate: input.endDate,
    status: "planned",
    totalAssets: assets.filter((a) => a.branchId === input.branchId).length,
    checkedAssets: 0,
    createdBy: input.createdBy,
    createdAt: toLocalISO(new Date()),
    completedBy: null,
    completedAt: null,
    note: "",
    assigneeId: input.assigneeId,
  };
  saveStore({ ...store, sessions: [...store.sessions, session] });
  return session;
}

// ลบได้เฉพาะรอบที่ยังไม่เริ่ม เพราะรอบที่เริ่มแล้วมีผลตรวจผูกอยู่
export function deleteSession(sessionId: string): boolean {
  const store = readStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== "planned") return false;
  saveStore({ ...store, sessions: store.sessions.filter((s) => s.id !== sessionId) });
  return true;
}

export function startSession(sessionId: string): boolean {
  return updateStatus(sessionId, "planned", "in_progress");
}

export function cancelSession(sessionId: string): boolean {
  return updateStatus(sessionId, "planned", "cancelled");
}

function updateStatus(
  sessionId: string,
  from: InventorySessionStatus,
  to: InventorySessionStatus,
): boolean {
  const store = readStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== from) return false;
  saveStore({
    ...store,
    sessions: store.sessions.map((s) => (s.id === sessionId ? { ...s, status: to } : s)),
  });
  return true;
}

// ปิดรอบ: ทรัพย์สินที่ยังไม่ถูกสแกนจะถูกบันทึกเป็น "ไม่พบ"
export function completeSession(sessionId: string, by: Credential): boolean {
  const store = readStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== "in_progress") return false;

  const now = toLocalISO(new Date());
  const checkedIds = new Set(
    store.checks.filter((c) => c.sessionId === sessionId).map((c) => c.assetId),
  );
  const checks = [...store.checks];
  for (const asset of getSessionAssets(session)) {
    if (checkedIds.has(asset.id)) continue;
    checks.push({
      id: nextId("IC", checks.map((c) => c.id)),
      sessionId,
      assetId: asset.id,
      branchId: session.branchId,
      checkerId: by.id,
      checkerName: by.username,
      result: "missing",
      checkedAt: now,
      note: "ไม่พบระหว่างตรวจนับ (บันทึกอัตโนมัติตอนปิดรอบ)",
    });
  }

  const sessions = store.sessions.map((s) =>
    s.id === sessionId
      ? {
          ...s,
          status: "completed" as const,
          completedAt: now,
          completedBy: by.id,
          checkedAssets: getSessionProgress(s, checks).checked,
        }
      : s,
  );
  saveStore({ sessions, checks });
  return true;
}

/* ---------------- สแกนและบันทึกผล (User) ---------------- */

export type ScanOutcome =
  | { type: "ready"; asset: Asset }
  | { type: "duplicate"; asset: Asset; check: StoredCheck }
  | { type: "mismatch"; asset: Asset }
  | { type: "not_found"; code: string }
  | { type: "closed" };

// ตรวจรหัสที่สแกนก่อนบันทึก ยังไม่เขียนข้อมูล
export function previewScan(
  session: InventorySession,
  code: string,
  checks: StoredCheck[],
): ScanOutcome {
  if (session.status !== "in_progress") return { type: "closed" };
  const asset = findAsset(code);
  if (!asset) return { type: "not_found", code: code.trim() };
  const existing = checks.find((c) => c.sessionId === session.id && c.assetId === asset.id);
  if (existing) return { type: "duplicate", asset, check: existing };
  if (asset.branchId !== session.branchId) return { type: "mismatch", asset };
  return { type: "ready", asset };
}

export type SaveCheckInput = {
  sessionId: string;
  asset: Asset;
  result: InventoryResult;
  checker: Credential;
  note?: string;
};

export function saveCheck(input: SaveCheckInput): StoredCheck | null {
  const store = readStore();
  const session = store.sessions.find((s) => s.id === input.sessionId);
  if (!session || session.status !== "in_progress") return null;
  const isDuplicate = store.checks.some(
    (c) => c.sessionId === input.sessionId && c.assetId === input.asset.id,
  );
  if (isDuplicate) return null;

  const check: StoredCheck = {
    id: nextId("IC", store.checks.map((c) => c.id)),
    sessionId: input.sessionId,
    assetId: input.asset.id,
    branchId: session.branchId,
    checkerId: input.checker.id,
    checkerName: input.checker.username,
    result: input.result,
    checkedAt: toLocalISO(new Date()),
    note: input.note ?? "",
  };
  const checks = [...store.checks, check];
  const sessions = store.sessions.map((s) =>
    s.id === session.id ? { ...s, checkedAssets: getSessionProgress(s, checks).checked } : s,
  );
  saveStore({ sessions, checks });
  return check;
}

// ยกเลิกผลที่บันทึกผิด ทำได้เฉพาะตอนรอบยังเปิดอยู่
export function removeCheck(checkId: string): boolean {
  const store = readStore();
  const check = store.checks.find((c) => c.id === checkId);
  const session = store.sessions.find((s) => s.id === check?.sessionId);
  if (!check || !session || session.status !== "in_progress") return false;
  const checks = store.checks.filter((c) => c.id !== checkId);
  const sessions = store.sessions.map((s) =>
    s.id === session.id ? { ...s, checkedAssets: getSessionProgress(s, checks).checked } : s,
  );
  saveStore({ sessions, checks });
  return true;
}
