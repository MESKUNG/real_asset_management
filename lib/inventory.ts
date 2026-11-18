import { tx, localized, dateLocale, inThai } from "@/lib/i18n";
import { assets, borrowRequests, branches, categories, repairRequests, vendors } from "@/lib/localizedData";
// ข้อมูลและฟังก์ชันกลางของระบบตรวจนับ ใช้ร่วมกันทุกหน้าใน /inventories และ /reports
import { useMemo, useSyncExternalStore } from "react";
import { type Asset, type AssetStatus } from "@/data/asset";
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

import { PLACEHOLDER_FIRST_NAMES, staffDirectory } from "@/lib/staffDirectory";

/* ---------------- ผู้ใช้ที่ login อยู่ ---------------- */

export type Role = "user" | "admin" | "president" | "superadmin";

export type Credential = {
  id: number;
  username: string;
  role: Role;
  branchId: string | null;
};

const ROLES: Role[] = ["user", "admin", "president", "superadmin"];

// แปลงข้อความใน localStorage เป็นข้อมูลผู้ใช้ ถ้าข้อมูลเสียหรือ role ไม่ถูกต้องจะได้ null
function parseCredential(raw: string | null): Credential | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!ROLES.includes(data?.role)) return null;
    return {
      id: Number(data.id) || 0,
      username: data.username ?? tx("ผู้ใช้"),
      role: data.role,
      branchId: data.branch_id ?? null,
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
// ตอน render บนเซิร์ฟเวอร์ยังไม่มี localStorage จึงได้ undefined แล้ว ready เป็น false
// หน้าจะแสดง "กำลังโหลด" ก่อน ไม่ขึ้น "ไม่มีสิทธิ์" ชั่วขณะ
export function useCredential() {
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeCredential,
    () => localStorage.getItem("credential"),
    () => undefined,
  );
  const credential = useMemo(() => (raw === undefined ? null : parseCredential(raw)), [raw]);
  return { credential, ready: raw !== undefined };
}

/* ---------------- ชื่อพนักงานจาก Account บน MockAPI ---------------- */
// ไฟล์ใน data/ เก็บแค่รหัสพนักงาน (101, 102, ...) ชื่อจริงอยู่ใน Account (ช่อง staff_id)
// เริ่มจากรายชื่อสำรองใน lib/staffDirectory.ts (เปิดเว็บแล้วมีชื่อทันที แม้ยังโหลด MockAPI ไม่เสร็จหรือเน็ตหลุด)
// แล้วอัปเดตด้วยชื่อจาก MockAPI ยกเว้นบัญชีที่ยังเป็นชื่อตัวอย่าง (Employee / Manager / Director)

const staffNames: Record<number, string> = {};
// ชื่อตามรหัสบัญชี (id ของ Account) ใช้เป็นชื่อผู้ตรวจ เพราะบัญชีที่ล็อกอินเก็บ id ไม่ใช่ staff_id
const accountNames: Record<number, string> = {};
for (const entry of staffDirectory) {
  staffNames[entry.staffId] = entry.name;
  accountNames[entry.accountId] = entry.name;
}
let staffLoadStarted = false;
let staffVersion = 0;

function loadStaffNames() {
  if (staffLoadStarted) return;
  staffLoadStarted = true;
  const baseUrl = process.env.NEXT_PUBLIC_MOCKAPI_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) return;

  fetch(`${baseUrl}/Account`)
    .then((response) => (response.ok ? response.json() : []))
    .then((accounts) => {
      if (!Array.isArray(accounts)) return;
      for (const account of accounts) {
        // ชื่อตัวอย่าง เช่น "Manager SixtyOne" ไม่เอามาแสดง ใช้ชื่อจากรายชื่อสำรองแทน
        if (PLACEHOLDER_FIRST_NAMES.includes(account.first_name)) continue;
        const staffId = Number(account.staff_id);
        const fullName = [account.first_name, account.last_name].filter(Boolean).join(" ") || account.username;
        if (staffId) staffNames[staffId] = fullName;
        if (Number(account.id)) accountNames[Number(account.id)] = fullName;
      }
      staffVersion++;
      window.dispatchEvent(new Event("staffnamesloaded"));
    })
    .catch(() => {});
}

function subscribeStaff(onChange: () => void) {
  loadStaffNames();
  window.addEventListener("staffnamesloaded", onChange);
  return () => window.removeEventListener("staffnamesloaded", onChange);
}

// เรียกในหน้าที่แสดงชื่อพนักงาน หน้าจะวาดใหม่เองเมื่อโหลดชื่อเสร็จ
export function useStaffNames() {
  return useSyncExternalStore(subscribeStaff, () => staffVersion, () => 0);
}

export function getStaffName(id?: number | null): string {
  if (id === undefined || id === null) return tx("ยังไม่มอบหมาย");
  const name = staffNames[id];
  return name ? tx(name) : tx("พนักงาน #{0}", id);
}

// ชื่อจริงของคนที่ล็อกอินอยู่ (จาก MockAPI) ถ้ายังโหลดไม่ได้ใช้ username แทน
function checkerNameOf(user: Credential): string {
  return accountNames[user.id] ?? user.username;
}

/* ---------------- ที่เก็บข้อมูลรอบตรวจนับและผลตรวจ ---------------- */
// ตั้งต้นจากไฟล์ใน data/ แล้วบันทึกการเปลี่ยนแปลงลง localStorage
// ทำให้ผลสแกนอยู่ต่อแม้เปลี่ยนหน้าหรือรีเฟรช

export type StoredSession = InventorySession & { assigneeId?: number };
export type StoredCheck = InventoryCheck & { checkerName?: string };
type InventoryStore = { sessions: StoredSession[]; checks: StoredCheck[] };

// เปลี่ยนชื่อ key เมื่อข้อมูลกลางเปลี่ยนรูปแบบ ข้อมูลเก่าในเบราว์เซอร์จะได้ไม่ปนกัน
const STORE_KEY = "inventory-store-v3";
const STORE_EVENT = "inventorystorechange";

function seedStore(): InventoryStore {
  return { sessions: [...inventorySessions], checks: [...inventoryChecks] };
}

// รอบที่ประกาศไว้ (รอเริ่ม) จะเปลี่ยนเป็น "กำลังนับ" เองเมื่อถึงวันเริ่ม ไม่ต้องให้ Admin กดเปิดรอบ
function autoStart(store: InventoryStore): InventoryStore {
  const today = toDateValue(new Date());
  return {
    ...store,
    sessions: store.sessions.map((s) =>
      s.status === "planned" && s.startDate <= today ? { ...s, status: "in_progress" } : s,
    ),
  };
}

function parseStore(raw: string | null): InventoryStore {
  if (!raw) return autoStart(seedStore());
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data.sessions) || !Array.isArray(data.checks)) return autoStart(seedStore());
    return autoStart({ sessions: data.sessions, checks: data.checks });
  } catch {
    return autoStart(seedStore());
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
  useStaffNames();
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeStore,
    () => localStorage.getItem(STORE_KEY),
    () => undefined,
  );
  const store = useMemo(() => parseStore(raw ?? null), [raw]);
  // ห่อด้วย localized() ให้ชื่อรอบ / หมายเหตุ แปลตามภาษาที่เลือกตอนแสดงผล
  return { sessions: localized(store.sessions), checks: localized(store.checks), ready: raw !== undefined };
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

export function getCheckerName(check: StoredCheck): string {
  return check.checkerName ?? getStaffName(check.checkerId);
}

export function getBranchName(id: string): string {
  return branches.find((b) => b.id === id)?.name ?? id;
}

export function getCategoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}

export function getVendorName(id: string): string {
  return vendors.find((v) => v.id === id)?.name ?? id;
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

// ทรัพย์สินที่ต้องตรวจในรอบนี้ = ทรัพย์สินของสาขาที่ตรวจ ยกเว้นของที่จำหน่ายแล้ว
export function getSessionAssets(session: InventorySession): Asset[] {
  return assets.filter((a) => a.branchId === session.branchId && a.status !== "disposed");
}

// ของที่ถูกเบิก/ยืม หรือส่งซ่อมแล้ว ไม่อยู่ในสาขาตอนตรวจนับ จึงไม่ต้องสแกน
// ดูจากสถานะใน asset.ts แล้วหาเลขที่เอกสารจากใบเบิก (borrowRequests) หรืองานซ่อม (repairRequests)
export type AwayReason = { text: string; documentId: string | null };

function activeRepair(asset: Asset) {
  return repairRequests.find(
    (r) => r.assetId === asset.id && (r.status === "in_progress" || r.status === "pending"),
  );
}

export function getAwayReason(asset: Asset): AwayReason | null {
  if (asset.status === "borrowed") {
    const borrow = borrowRequests.find(
      (r) =>
        r.assetId === asset.id &&
        r.type === "withdraw" &&
        (r.status === "approved" || r.status === "overdue"),
    );
    return { text: tx("ถูกเบิก/ยืมอยู่"), documentId: borrow?.id ?? null };
  }
  // สถานะซ่อมที่มีใบแจ้งซ่อม = ส่งออกไปซ่อมแล้ว ไม่อยู่ในสาขา
  const repair = asset.status === "repair" ? activeRepair(asset) : undefined;
  if (repair) {
    return { text: tx("ส่งซ่อมที่ {0}", getVendorName(repair.vendorId)), documentId: repair.id };
  }
  return null;
}

// สถานะซ่อมแต่ยังไม่มีใบแจ้งซ่อม = ของยังอยู่ในสาขา ต้องตรวจนับ แต่บอกผู้ตรวจไว้ก่อน
export function getConditionHint(asset: Asset): string | null {
  if (asset.status === "repair" && !activeRepair(asset)) return tx("ชำรุดแต่ยังไม่ได้ส่งซ่อม");
  return null;
}

export const SESSION_STATUS_LABEL: Record<InventorySessionStatus, string> = localized({
  planned: "รอเริ่ม",
  in_progress: "กำลังนับ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
});

export const RESULT_LABEL: Record<InventoryResult, string> = localized({
  found: "ปกติ",
  damaged: "ชำรุด",
  missing: "สูญหาย",
  mismatch: "สูญหาย",
});

export const ASSET_STATUS_LABEL: Record<AssetStatus, string> = localized({
  available: "พร้อมใช้งาน",
  borrowed: "ถูกยืม",
  repair: "ซ่อมบำรุง",
  damaged: "ชำรุด",
  disposed: "จำหน่ายแล้ว",
});

/* ---------------- วันที่และตัวเลข ---------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const ONE_DAY = 24 * 60 * 60 * 1000;

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
  return d.toLocaleDateString(dateLocale(), {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export function formatThaiDateTime(value: string): string {
  const d = parseDate(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString(dateLocale(), {
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
  return Math.round((parseDate(value).getTime() - today.getTime()) / ONE_DAY);
}

export function formatBaht(n: number): string {
  return tx("฿{0}", n.toLocaleString("th-TH"));
}

/* ---------------- ความคืบหน้าของรอบ ---------------- */
// total = ของที่ต้องอยู่ในสาขา (ไม่นับของที่ถูกเบิก/ยืม หรือส่งซ่อมแล้ว)
// checked = ของในสาขาที่มีผลตรวจแล้ว ไม่ว่าจะเป็น ปกติ ชำรุด หรือสูญหาย
// lost = สูญหาย (ไม่พบตอนตรวจ + ไม่ตรงทะเบียน)

export function getSessionProgress(session: InventorySession, checks: StoredCheck[]) {
  const onSite = getSessionAssets(session).filter((a) => !getAwayReason(a));
  const onSiteIds = new Set(onSite.map((a) => a.id));
  const sessionChecks = checks.filter((c) => c.sessionId === session.id);
  const checkedIds = new Set(
    sessionChecks.filter((c) => onSiteIds.has(c.assetId)).map((c) => c.assetId),
  );
  const total = onSite.length;
  const checked = checkedIds.size;
  return {
    total,
    checked,
    away: getSessionAssets(session).length - total,
    percent: total > 0 ? Math.round((checked / total) * 100) : 0,
    damaged: sessionChecks.filter((c) => c.result === "damaged").length,
    missing: sessionChecks.filter((c) => c.result === "missing").length,
    mismatch: sessionChecks.filter((c) => c.result === "mismatch").length,
    lost: sessionChecks.filter((c) => c.result === "missing" || c.result === "mismatch").length,
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
    totalAssets: 0,
    checkedAssets: 0,
    createdBy: input.createdBy,
    createdAt: toLocalISO(new Date()),
    completedBy: null,
    completedAt: null,
    note: "",
    assigneeId: input.assigneeId,
  };
  session.totalAssets = getSessionAssets(session).length;
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
// ยกเว้นของที่ถูกยืมหรือส่งซ่อม จะบันทึกว่า "ปกติ" พร้อมเหตุผลและเลขที่เอกสาร
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
    const away = getAwayReason(asset);
    checks.push({
      id: nextId("IC", checks.map((c) => c.id)),
      sessionId,
      assetId: asset.id,
      branchId: session.branchId,
      checkerId: by.id,
      checkerName: checkerNameOf(by),
      result: away ? "found" : "missing",
      checkedAt: now,
      // เก็บหมายเหตุเป็นภาษาไทยเสมอ ตอนแสดงผลจะแปลตามภาษาที่เลือก
      note: inThai(() =>
        away
          ? tx("ไม่อยู่ในสาขาขณะตรวจ: {0}{1}", getAwayReason(asset)?.text ?? "", away.documentId ? ` (${away.documentId})` : "")
          : tx("ไม่พบระหว่างตรวจนับ (บันทึกอัตโนมัติตอนปิดรอบ)"),
      ),
    });
  }

  const closedSession: StoredSession = {
    ...session,
    status: "completed",
    completedAt: now,
    completedBy: by.id,
    checkedAssets: getSessionProgress(session, checks).checked,
  };
  const sessions = store.sessions.map((s) => (s.id === sessionId ? closedSession : s));
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
  // ของผิดสาขา หรือของที่จำหน่ายไปแล้วแต่ยังเจอ = ข้อมูลไม่ตรงทะเบียน
  if (asset.branchId !== session.branchId || asset.status === "disposed") return { type: "mismatch", asset };
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
    checkerName: checkerNameOf(input.checker),
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

// เปลี่ยนสภาพของรายการที่ตรวจแล้ว (ปกติ / ชำรุด / สูญหาย) ทำได้เฉพาะตอนรอบยังเปิดอยู่
export function updateCheck(checkId: string, result: InventoryResult, checker: Credential): boolean {
  const store = readStore();
  const check = store.checks.find((c) => c.id === checkId);
  const session = store.sessions.find((s) => s.id === check?.sessionId);
  if (!check || !session || session.status !== "in_progress") return false;
  const checks = store.checks.map((c) =>
    c.id === checkId
      ? { ...c, result, checkerId: checker.id, checkerName: checkerNameOf(checker), checkedAt: toLocalISO(new Date()) }
      : c,
  );
  saveStore({ ...store, checks });
  return true;
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
