// ข้อมูลกลางของหน้ารายงานทั้ง 3 แบบ (User สรุปรายงาน / Admin-President รับรายงาน / Admin ส่งรายงาน)
// ทุกตัวเลขคำนวณจากไฟล์ใน data/ และผลตรวจนับใน lib/inventory.ts ไม่มีตัวเลขพิมพ์ตายตัว
import { useMemo, useSyncExternalStore } from "react";
import { assets, type Asset, type AssetStatus } from "@/data/asset";
import { approvals, type ApprovalStatus } from "@/data/approvals";
import { assetHistories } from "@/data/assetHistories";
import {
  borrowRequests,
  type BorrowRequest,
  type BorrowRequestType,
  type BorrowStatus,
} from "@/data/borrowRequests";
import { repairRequests, type RepairRequest, type RepairStatus } from "@/data/repairRequests";
import {
  ASSET_STATUS_LABEL,
  RESULT_LABEL,
  formatThaiDate,
  formatThaiDateTime,
  getBranchName,
  getCategoryName,
  getCheckerName,
  getSessionProgress,
  getStaffName,
  findAsset,
  toDateValue,
  toLocalISO,
  type StoredCheck,
  type StoredSession,
} from "@/lib/inventory";
import type { ExcelSheet } from "@/lib/exportExcel";

/* ---------------- ช่วงเวลาของรายงาน ---------------- */
// เก็บเป็นวันที่แบบ "YYYY-MM-DD" เทียบกันแบบข้อความได้เลย

export type Period = { key: string; label: string; from: string; to: string };

const pad = (n: number) => String(n).padStart(2, "0");
const lastDayOfMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("th-TH", { month: "short", year: "numeric" });
}

function monthPeriod(year: number, month: number): Period {
  return {
    key: `${year}-${pad(month)}`,
    label: monthLabel(year, month),
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDayOfMonth(year, month))}`,
  };
}

// ตัวเลือกช่วงเวลา: ทั้งหมด, 3 เดือนล่าสุด, ปีนี้ และรายเดือนย้อนหลัง 6 เดือน
export function getPeriods(today = new Date()): Period[] {
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const back = (n: number) => {
    const d = new Date(y, m - 1 - n, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  };
  const start3 = back(2);
  const months = Array.from({ length: 6 }, (_, i) => back(i)).map((b) => monthPeriod(b.year, b.month));
  const shortMonth = (year: number, month: number) =>
    new Date(year, month - 1, 1).toLocaleDateString("th-TH", { month: "short" });
  return [
    {
      key: "last3",
      label: `${shortMonth(start3.year, start3.month)}–${monthLabel(y, m)}`,
      from: `${start3.year}-${pad(start3.month)}-01`,
      to: `${y}-${pad(m)}-${pad(lastDayOfMonth(y, m))}`,
    },
    ...months,
    { key: `year-${y}`, label: `ทั้งปี ${y + 543}`, from: `${y}-01-01`, to: `${y}-12-31` },
    { key: "all", label: "ทุกช่วงเวลา", from: "0000-01-01", to: "9999-12-31" },
  ];
}

export function inPeriod(value: string | null | undefined, period: Period) {
  if (!value) return false;
  const day = value.slice(0, 10);
  return day >= period.from && day <= period.to;
}

/* ---------------- ป้ายสถานะ ---------------- */

export const BORROW_TYPE_LABEL: Record<BorrowRequestType, string> = {
  withdraw: "เบิก",
  return: "คืน",
  transfer: "โอนย้าย",
};

export const BORROW_STATUS_LABEL: Record<BorrowStatus, string> = {
  pending: "รออนุมัติ",
  revision: "ส่งกลับแก้ไข",
  approved: "อนุมัติแล้ว",
  returned: "คืนแล้ว",
  rejected: "ไม่อนุมัติ",
  overdue: "เกินกำหนดคืน",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "รอพิจารณา",
  approved: "อนุมัติ",
  rejected: "ไม่อนุมัติ",
};

export const REPAIR_STATUS_LABEL: Record<RepairStatus, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังซ่อม",
  completed: "ซ่อมเสร็จ",
  rejected: "ไม่อนุมัติซ่อม",
};

// สีของป้าย: เขียว = จบดี, เหลือง = รออยู่, แดง = ไม่ผ่าน, ฟ้า = กำลังทำ
export type Tone = "good" | "wait" | "bad" | "info" | "plain";

export const TONE_STYLE: Record<Tone, string> = {
  good: "bg-emerald-100 text-emerald-800",
  wait: "bg-amber-100 text-amber-800",
  bad: "bg-rose-100 text-rose-800",
  info: "bg-indigo-100 text-indigo-800",
  plain: "bg-slate-200 text-slate-700",
};

export const BORROW_TONE: Record<BorrowStatus, Tone> = {
  pending: "wait",
  revision: "wait",
  approved: "good",
  returned: "info",
  rejected: "bad",
  overdue: "bad",
};

export const APPROVAL_TONE: Record<ApprovalStatus, Tone> = {
  pending: "wait",
  approved: "good",
  rejected: "bad",
};

export const ASSET_TONE: Record<AssetStatus, Tone> = {
  available: "good",
  borrowed: "info",
  repair: "wait",
  damaged: "bad",
  disposed: "plain",
};

/* ---------------- ตัวช่วยทั่วไป ---------------- */

export function assetLabel(id: string) {
  const asset = findAsset(id);
  return asset ? `${asset.id} · ${asset.name}` : id;
}

// ค่าซ่อม: ใช้ค่าจริงถ้ามี ถ้ายังไม่มีใช้ค่าประเมิน
export function repairCost(r: RepairRequest) {
  return r.actualCost ?? r.estimatedCost ?? 0;
}

// ระยะเวลาจากยื่นคำขอถึงวันที่พิจารณา เป็นข้อความอ่านง่าย
export function durationText(from: string, to: string | null) {
  if (!to) return "ยังไม่พิจารณา";
  const minutes = Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days} วัน ${hours} ชม.`;
  if (hours > 0) return `${hours} ชม. ${minutes % 60} นาที`;
  return `${minutes} นาที`;
}

/* ---------------- การเคลื่อนไหว (เบิก / คืน / โอนย้าย) ---------------- */

export type MovementRow = {
  request: BorrowRequest;
  from: string;
  to: string;
  date: string;
};

// ต้นทาง → ปลายทาง ของแต่ละคำขอ
function movementRoute(r: BorrowRequest) {
  const branch = getBranchName(r.branchId);
  const person = getStaffName(r.borrowerId);
  if (r.type === "transfer") return { from: branch, to: r.toBranchId ? getBranchName(r.toBranchId) : "-" };
  if (r.type === "return") return { from: person, to: branch };
  return { from: branch, to: person };
}

export function getMovementRows(options: { period: Period; branchId: string; status: string; type: string }) {
  return borrowRequests
    .filter(
      (r) =>
        inPeriod(r.createdAt, options.period) &&
        (options.branchId === "all" || r.branchId === options.branchId || r.toBranchId === options.branchId) &&
        (options.status === "all" || r.status === options.status) &&
        (options.type === "all" || r.type === options.type),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((request): MovementRow => ({ request, ...movementRoute(request), date: request.createdAt }));
}

export function movementSheet(rows: MovementRow[]): ExcelSheet {
  return {
    name: "การโยกย้าย",
    rows: rows.map(({ request: r, from, to }) => ({
      เลขที่คำขอ: r.id,
      ประเภท: BORROW_TYPE_LABEL[r.type],
      สถานะ: BORROW_STATUS_LABEL[r.status],
      ต้นทาง: from,
      ปลายทาง: to,
      ทรัพย์สิน: assetLabel(r.assetId),
      ผู้ขอ: getStaffName(r.borrowerId),
      วันที่ยื่น: formatThaiDate(r.createdAt),
      วัตถุประสงค์: r.purpose,
      หมายเหตุ: r.note,
    })),
  };
}

/* ---------------- ทะเบียนทรัพย์สิน ---------------- */

export function getRegisterRows(options: { branchId: string; status: string; category?: string; query?: string }) {
  const q = (options.query ?? "").trim().toLowerCase();
  return assets.filter(
    (a) =>
      (options.branchId === "all" || a.branchId === options.branchId) &&
      (options.status === "all" || a.status === options.status) &&
      (!options.category || options.category === "all" || a.category === options.category) &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q)),
  );
}

export function registerSheet(rows: Asset[]): ExcelSheet {
  return {
    name: "ทะเบียนทรัพย์สิน",
    rows: rows.map((a) => ({
      รหัส: a.id,
      ชื่อทรัพย์สิน: a.name,
      "ยี่ห้อ / รุ่น": `${a.brand} ${a.model}`,
      หมวดหมู่: getCategoryName(a.category),
      สาขา: getBranchName(a.branchId),
      ผู้รับผิดชอบ: getStaffName(a.responsiblePersonId),
      สถานะ: ASSET_STATUS_LABEL[a.status],
      "ราคาซื้อ (บาท)": a.purchasePrice,
      วันที่ซื้อ: formatThaiDate(a.purchaseDate),
      อัปเดตล่าสุด: formatThaiDate(a.updatedAt),
    })),
  };
}

/* ---------------- สรุปการอนุมัติ ---------------- */

export type ApprovalRow = {
  approval: (typeof approvals)[number];
  request: BorrowRequest | undefined;
  from: string;
  to: string;
};

export function getApprovalRows(options: { period: Period; branchId: string; status: string }) {
  return approvals
    .map((approval): ApprovalRow => {
      const request = borrowRequests.find((r) => r.id === approval.requestId);
      const route = request ? movementRoute(request) : { from: "-", to: "-" };
      return { approval, request, ...route };
    })
    .filter(
      (row) =>
        inPeriod(row.approval.requestedAt, options.period) &&
        (options.branchId === "all" ||
          row.request?.branchId === options.branchId ||
          row.request?.toBranchId === options.branchId) &&
        (options.status === "all" || row.approval.status === options.status),
    )
    .sort((a, b) => b.approval.requestedAt.localeCompare(a.approval.requestedAt));
}

export function approvalSheet(rows: ApprovalRow[]): ExcelSheet {
  return {
    name: "สรุปการอนุมัติ",
    rows: rows.map(({ approval: a, request, from, to }) => ({
      เลขที่อนุมัติ: a.id,
      เลขที่คำขอ: a.requestId,
      ประเภท: request ? BORROW_TYPE_LABEL[request.type] : "-",
      ต้นทาง: from,
      ปลายทาง: to,
      ผู้ขอ: getStaffName(a.requesterId),
      ผู้พิจารณา: a.approverId ? getStaffName(a.approverId) : "-",
      ผลพิจารณา: APPROVAL_STATUS_LABEL[a.status],
      วันที่ยื่น: formatThaiDateTime(a.requestedAt),
      วันที่พิจารณา: a.approvedAt ? formatThaiDateTime(a.approvedAt) : "-",
      ระยะเวลาพิจารณา: durationText(a.requestedAt, a.approvedAt),
      เหตุผล: a.comment,
    })),
  };
}

/* ---------------- งานซ่อม ---------------- */

export function getRepairRows(options: { period: Period; branchId: string }) {
  return repairRequests
    .filter(
      (r) =>
        inPeriod(r.reportedAt, options.period) &&
        (options.branchId === "all" || r.branchId === options.branchId),
    )
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
}

export function repairSheet(rows: RepairRequest[]): ExcelSheet {
  return {
    name: "งานซ่อม",
    rows: rows.map((r) => ({
      เลขที่: r.id,
      ทรัพย์สิน: assetLabel(r.assetId),
      สาขา: getBranchName(r.branchId),
      อาการ: r.issue,
      สถานะ: REPAIR_STATUS_LABEL[r.status],
      ผู้แจ้ง: getStaffName(r.reporterId),
      วันที่แจ้ง: formatThaiDate(r.reportedAt),
      "ค่าใช้จ่าย (บาท)": repairCost(r),
    })),
  };
}

/* ---------------- ตรวจนับ ---------------- */

// รอบที่ "อยู่ในช่วงเวลา" = รอบที่เริ่มนับในช่วงนั้น
export function getInventoryRows(
  sessions: StoredSession[],
  checks: StoredCheck[],
  options: { period: Period; branchId: string },
) {
  return sessions
    .filter(
      (s) =>
        inPeriod(s.startDate, options.period) &&
        (options.branchId === "all" || s.branchId === options.branchId),
    )
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((session) => ({ session, progress: getSessionProgress(session, checks) }));
}

export type InventoryRow = ReturnType<typeof getInventoryRows>[number];

export const issueCount = (row: InventoryRow) =>
  row.progress.damaged + row.progress.lost;

export function inventorySheet(rows: InventoryRow[]): ExcelSheet {
  return {
    name: "ตรวจนับ",
    rows: rows.map(({ session: s, progress: p }) => ({
      รหัสรอบ: s.id,
      ชื่อรอบ: s.name,
      สาขา: getBranchName(s.branchId),
      วันเริ่ม: formatThaiDate(s.startDate),
      วันสิ้นสุด: formatThaiDate(s.endDate),
      ตรวจแล้ว: p.checked,
      ต้องตรวจ: p.total,
      "ความคืบหน้า (%)": p.percent,
      ชำรุด: p.damaged,
      สูญหาย: p.lost,
    })),
  };
}

export function sessionResultSheet(session: StoredSession, checks: StoredCheck[]): ExcelSheet {
  return {
    name: session.id,
    rows: checks
      .filter((c) => c.sessionId === session.id)
      .map((c) => ({
        ทรัพย์สิน: assetLabel(c.assetId),
        ผลตรวจ: RESULT_LABEL[c.result],
        ผู้ตรวจ: getCheckerName(c),
        เวลาตรวจ: formatThaiDateTime(c.checkedAt),
        หมายเหตุ: c.note,
      })),
  };
}

/* ---------------- กิจกรรมล่าสุด (รวมจากทุกไฟล์ข้อมูล) ---------------- */

export type Activity = { id: string; at: string; who: string; text: string; ref: string; branchId: string };

export function getActivities(checks: StoredCheck[], options: { period: Period; branchId: string }) {
  const list: Activity[] = [
    ...assetHistories.map((h) => ({
      id: h.id,
      at: h.performedAt,
      who: getStaffName(h.performedBy),
      text: h.description,
      ref: h.assetId,
      branchId: findAsset(h.assetId)?.branchId ?? "",
    })),
    ...checks.map((c) => ({
      id: c.id,
      at: c.checkedAt,
      who: getCheckerName(c),
      text: `บันทึกผลตรวจนับ: ${RESULT_LABEL[c.result]}`,
      ref: `${c.sessionId} · ${c.assetId}`,
      branchId: c.branchId,
    })),
    ...repairRequests.map((r) => ({
      id: r.id,
      at: r.reportedAt,
      who: getStaffName(r.reporterId),
      text: `แจ้งซ่อม: ${r.issue}`,
      ref: `${r.id} · ${r.assetId}`,
      branchId: r.branchId,
    })),
    ...borrowRequests.map((r) => ({
      id: r.id,
      at: r.createdAt,
      who: getStaffName(r.borrowerId),
      text: `ขอ${BORROW_TYPE_LABEL[r.type]}ทรัพย์สิน`,
      ref: `${r.id} · ${r.assetId}`,
      branchId: r.branchId,
    })),
  ];
  return list
    .filter((a) => inPeriod(a.at, options.period) && (options.branchId === "all" || a.branchId === options.branchId))
    .sort((a, b) => b.at.localeCompare(a.at));
}

/* ---------------- รายงานที่ Admin ส่งให้ President ---------------- */
// เก็บใน localStorage แบบเดียวกับผลตรวจนับ President เปิดหน้ารายงานแล้วเห็นทันที

export type ReportPurpose = "inform" | "approve";

export type ReportSection = { label: string; value: string };

export type SentReport = {
  id: string;
  title: string;
  periodLabel: string;
  purpose: ReportPurpose;
  summary: string;
  message: string;
  sections: ReportSection[];
  issues: { title: string; detail: string }[];
  createdBy: number;
  createdByName: string;
  status: "draft" | "sent";
  updatedAt: string;
  sentAt: string | null;
  readAt: string | null;
};

export const PURPOSE_LABEL: Record<ReportPurpose, string> = {
  inform: "เพื่อทราบ",
  approve: "ขออนุมัติ",
};

const REPORT_KEY = "report-outbox-v1";
const REPORT_EVENT = "reportoutboxchange";
const EMPTY: SentReport[] = [];

function parseReports(raw: string | null): SentReport[] {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : EMPTY;
  } catch {
    return EMPTY;
  }
}

function subscribeReports(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(REPORT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(REPORT_EVENT, onChange);
  };
}

export function useReportStore() {
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeReports,
    () => localStorage.getItem(REPORT_KEY),
    () => undefined,
  );
  const reports = useMemo(() => parseReports(raw ?? null), [raw]);
  return { reports, ready: raw !== undefined };
}

function saveReports(list: SentReport[]) {
  localStorage.setItem(REPORT_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(REPORT_EVENT));
}

export type ReportInput = Omit<SentReport, "id" | "status" | "updatedAt" | "sentAt" | "readAt">;

// ฉบับร่างมีได้ 1 ฉบับต่อ Admin บันทึกซ้ำจะเขียนทับฉบับเดิม
export function saveDraft(input: ReportInput): SentReport {
  const list = parseReports(localStorage.getItem(REPORT_KEY));
  const existing = list.find((r) => r.status === "draft" && r.createdBy === input.createdBy);
  const draft: SentReport = {
    ...input,
    id: existing?.id ?? nextReportId(list),
    status: "draft",
    updatedAt: toLocalISO(new Date()),
    sentAt: null,
    readAt: null,
  };
  saveReports(existing ? list.map((r) => (r.id === existing.id ? draft : r)) : [...list, draft]);
  return draft;
}

// ส่งรายงาน: ถ้ามีฉบับร่างอยู่ จะเปลี่ยนฉบับร่างนั้นเป็นฉบับที่ส่งแล้ว
export function sendReport(input: ReportInput): SentReport {
  const list = parseReports(localStorage.getItem(REPORT_KEY));
  const draft = list.find((r) => r.status === "draft" && r.createdBy === input.createdBy);
  const now = toLocalISO(new Date());
  const report: SentReport = {
    ...input,
    id: draft?.id ?? nextReportId(list),
    status: "sent",
    updatedAt: now,
    sentAt: now,
    readAt: null,
  };
  saveReports(draft ? list.map((r) => (r.id === draft.id ? report : r)) : [...list, report]);
  return report;
}

export function markReportRead(id: string) {
  const list = parseReports(localStorage.getItem(REPORT_KEY));
  saveReports(list.map((r) => (r.id === id && !r.readAt ? { ...r, readAt: toLocalISO(new Date()) } : r)));
}

function nextReportId(list: SentReport[]) {
  const year = new Date().getFullYear() + 543;
  const max = Math.max(0, ...list.map((r) => Number(r.id.split("-").pop()) || 0));
  return `RPT-${year}-${String(max + 1).padStart(3, "0")}`;
}

export function reportSheet(report: SentReport): ExcelSheet {
  return {
    name: "รายงานเสนอ President",
    rows: [
      { หัวข้อ: "ชื่อรายงาน", รายละเอียด: report.title },
      { หัวข้อ: "รอบรายงาน", รายละเอียด: report.periodLabel },
      { หัวข้อ: "วัตถุประสงค์", รายละเอียด: PURPOSE_LABEL[report.purpose] },
      { หัวข้อ: "ผู้จัดทำ", รายละเอียด: report.createdByName },
      { หัวข้อ: "สรุปผู้บริหาร", รายละเอียด: report.summary },
      ...report.sections.map((s) => ({ หัวข้อ: s.label, รายละเอียด: s.value })),
      ...report.issues.map((i, n) => ({ หัวข้อ: `ประเด็นที่ ${n + 1}: ${i.title}`, รายละเอียด: i.detail })),
      { หัวข้อ: "ข้อความถึง President", รายละเอียด: report.message },
    ],
  };
}

export const todayText = () => formatThaiDate(toDateValue(new Date()));
