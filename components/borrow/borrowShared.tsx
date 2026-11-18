"use client";

// โค้ดที่ใช้ร่วมกันของหน้า Borrow / ภาพรวมคำขอ / อนุมัติโยกย้าย / ประวัติการโอนย้าย
// (ทุกหน้าอ่าน-เขียนคำขอชุดเดียวกันจาก localStorage key "borrowRequests")

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { assets } from "@/data/asset";
import {
  borrowRequests as initialRequests,
  type BorrowRequest,
  type BorrowRequestType,
  type BorrowStatus,
} from "@/data/borrowRequests";
import { approvals } from "@/data/approvals";
import { branches } from "@/data/branches";

/* ---------- types ---------- */

export type RequestType = BorrowRequestType;

export type Request = BorrowRequest & {
  decidedAt?: string; // เวลาที่แอดมิน/ประธานดำเนินการล่าสุด (ใช้แสดงใน timeline)
};

export type StatusFilter = "all" | BorrowStatus;
export type TypeFilter = "all" | RequestType;

export const TYPES: Record<RequestType, { label: string; hint: string }> = {
  withdraw: { label: "เบิก", hint: "ขอเบิกไปใช้งาน" },
  return: { label: "รับคืน", hint: "คืนทรัพย์สินที่ยืมไว้" },
  transfer: { label: "ขอโอนย้าย", hint: "ย้ายไปสาขาอื่น" },
};

export const STATUS: Record<BorrowStatus, { label: string; className: string }> = {
  pending: { label: "รออนุมัติ", className: "bg-amber-200 text-amber-950" },
  revision: { label: "ส่งกลับแก้ไข", className: "bg-violet-200 text-violet-950" },
  approved: { label: "อนุมัติแล้ว", className: "bg-sky-200 text-sky-950" },
  returned: { label: "คืนแล้ว", className: "bg-emerald-200 text-emerald-950" },
  rejected: { label: "ไม่อนุมัติ", className: "bg-red-200 text-red-950" },
  overdue: { label: "เกินกำหนดคืน", className: "bg-orange-200 text-orange-950" },
};

export const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "pending",
  "revision",
  "approved",
  "overdue",
  "returned",
  "rejected",
];

export const TYPE_FILTERS: TypeFilter[] = ["all", "withdraw", "return", "transfer"];

/* ---------- role (อ่านจาก localStorage แบบเดียวกับ Sidebar) ---------- */

export function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("credentialchange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

export function getRole(): string | null {
  try {
    const raw = localStorage.getItem("credential");
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "role" in parsed) {
      return typeof parsed.role === "string" ? parsed.role : null;
    }
  } catch {
    // ignore
  }
  return null;
}

/* ---------- helpers ---------- */

export const today = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : "-";

// เบิก / โอนย้ายไม่มีการคืนทรัพย์สิน จึงไม่มีสถานะ "เกินกำหนดคืน"
// ส่วนคำขอคืนที่อนุมัติแล้ว แต่เลยวันที่คาดว่าจะคืนและยังไม่ได้รับคืน = เกินกำหนด
export function displayStatus(r: Request): BorrowStatus {
  if (r.type !== "return") {
    return r.status === "overdue" ? "approved" : r.status;
  }
  if (
    r.status === "approved" &&
    r.expectedReturnDate &&
    r.expectedReturnDate < today()
  ) {
    return "overdue";
  }
  return r.status;
}

export const assetName = (id: string) => assets.find((a) => a.id === id)?.name ?? id;
export const branchName = (id?: string | null) =>
  branches.find((b) => b.id === id)?.name ?? id ?? "-";
export const approvalComment = (requestId: string) =>
  approvals.find((a) => a.requestId === requestId)?.comment ?? "";

export const initial: Request[] = initialRequests;

/* ---------- เก็บคำขอไว้ใน localStorage (รีเฟรชแล้วไม่หาย) ---------- */

export const STORAGE_KEY = "borrowRequests";
export const CHANGE_EVENT = "borrowrequestschange";

export function subscribeRequests(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function getRequestsRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseRequests(raw: string | null): Request[] {
  if (!raw) return initial; // ยังไม่เคยบันทึก ใช้ข้อมูลเริ่มต้น
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Request[]) : initial;
  } catch {
    return initial;
  }
}

export function saveRequests(list: Request[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("Save requests failed:", error);
    return false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

/* ---------- รายละเอียดคำขอ ---------- */

// วันที่แบบเต็ม (ปี พ.ศ. 4 หลัก) ถ้ามีเวลาในค่าจะแสดงเวลาด้วย
export function fmtDateTime(d: string | null | undefined): string {
  if (!d) return "-";
  const date = new Date(d);
  const day = date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!d.includes("T")) return day;
  const time = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} ${time} น.`;
}

export type StepTone = "done" | "current" | "wait" | "bad";
export type Step = { time: string; label: string; badge: string; tone: StepTone };

// สร้าง timeline "สถานะการดำเนินการ" จากสถานะของคำขอ + ข้อมูลใน approvals
export function buildTimeline(r: Request): Step[] {
  const s = displayStatus(r);
  const ap = approvals.find((a) => a.requestId === r.id);
  const receivedAt = fmtDateTime(ap?.requestedAt ?? r.createdAt);

  const steps: Step[] = [
    {
      time: fmtDateTime(r.createdAt),
      label: `แจ้งคำขอโดย พนักงาน #${r.borrowerId}`,
      badge: "ดำเนินการแล้ว",
      tone: "done",
    },
  ];

  if (s === "pending") {
    steps.push(
      { time: receivedAt, label: "รับเรื่องรออนุมัติ", badge: "รออนุมัติ", tone: "current" },
      { time: "-", label: "อยู่ระหว่างดำเนินการ", badge: "รอดำเนินการ", tone: "wait" },
    );
    return steps;
  }

  steps.push({
    time: receivedAt,
    label: "รับเรื่องรออนุมัติ",
    badge: "ดำเนินการแล้ว",
    tone: "done",
  });

  // ใช้ข้อมูลจาก approvals เฉพาะเมื่อผลตรงกับสถานะปัจจุบันของคำขอ
  const wantApproval = s === "rejected" ? "rejected" : "approved";
  const apMatches = !!ap && ap.status === wantApproval;
  const decidedAt = fmtDateTime(r.decidedAt ?? (apMatches ? ap.approvedAt : null));

  if (s === "revision") {
    steps.push({
      time: decidedAt,
      label: "ส่งกลับให้ผู้ขอแก้ไข",
      badge: "ส่งกลับแก้ไข",
      tone: "current",
    });
  } else if (s === "rejected") {
    steps.push({ time: decidedAt, label: "ไม่อนุมัติคำขอ", badge: "ไม่อนุมัติ", tone: "bad" });
  } else {
    const by = apMatches && ap.approverId ? ` โดย ผู้ดูแล #${ap.approverId}` : "";
    steps.push({
      time: decidedAt,
      label: `อนุมัติคำขอ${by}`,
      badge: "อนุมัติแล้ว",
      tone: "done",
    });
    if (r.type === "return") {
      if (s === "returned") {
        steps.push({
          time: fmtDateTime(r.actualReturnDate),
          label: "รับคืนทรัพย์สินแล้ว",
          badge: "คืนแล้ว",
          tone: "done",
        });
      } else if (s === "overdue") {
        steps.push({
          time: "-",
          label: `เกินกำหนดคืน (กำหนด ${fmtDateTime(r.expectedReturnDate)})`,
          badge: "เกินกำหนดคืน",
          tone: "bad",
        });
      } else {
        steps.push({
          time: "-",
          label: "รอรับคืนทรัพย์สิน",
          badge: "รอดำเนินการ",
          tone: "wait",
        });
      }
    }
  }
  return steps;
}

/* ---------- ส่งออกข้อมูล (President) ---------- */

export const EXPORT_HEADERS = [
  "รหัสคำขอ",
  "ประเภท",
  "ทรัพย์สิน",
  "รหัสทรัพย์สิน",
  "สาขาต้นทาง",
  "สาขาปลายทาง",
  "ผู้ขอ",
  "วันที่ต้องการ / กำหนดคืน",
  "วันที่คืนจริง",
  "สถานะ",
  "วัตถุประสงค์",
  "หมายเหตุ",
];

export function toTable(list: Request[]): string[][] {
  return list.map((r) => [
    r.id,
    TYPES[r.type].label,
    assetName(r.assetId),
    r.assetId,
    branchName(r.branchId),
    r.type === "transfer" ? branchName(r.toBranchId) : "-",
    `พนักงาน #${r.borrowerId}`,
    fmtDate(r.type === "return" ? r.expectedReturnDate : r.borrowDate),
    fmtDate(r.actualReturnDate),
    STATUS[displayStatus(r)].label,
    r.purpose,
    r.note || approvalComment(r.id) || "-",
  ]);
}

export async function exportExcel(list: Request[], filePrefix = "borrow-requests") {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const body = toTable(list);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("คำขอ");
    ws.columns = EXPORT_HEADERS.map((header, i) => ({
      header,
      key: String(i),
      width: Math.min(
        45,
        Math.max(header.length, ...body.map((row) => row[i].length)) + 4,
      ),
    }));
    body.forEach((row) => ws.addRow(row));
    ws.getRow(1).font = { bold: true };

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filePrefix}-${today()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export Excel failed:", error);
  }
}

// PDF: เปิดหน้าพิมพ์ของเบราว์เซอร์ แล้วเลือก "Save as PDF" (ภาษาไทยแสดงถูกต้อง)
export function exportPdf(
  list: Request[],
  subtitle: string,
  title = "รายงานคำขอเบิก / คืน / โอนย้ายทรัพย์สิน",
) {
  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const head = EXPORT_HEADERS.map((h) => `<th>${esc(h)}</th>`).join("");
  const rowsHtml = toTable(list)
    .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
    .join("");

  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: "Sarabun", "Noto Sans Thai", Tahoma, sans-serif; font-size: 11px; color: #111; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  p { margin: 0 0 10px; color: #333; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #777; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #e5e7eb; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
</style></head><body>
<h1>${esc(title)}</h1>
<p>${esc(subtitle)}</p>
<table><thead><tr>${head}</tr></thead><tbody>${rowsHtml}</tbody></table>
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  win.onafterprint = () => iframe.remove();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
}



/* ---------- hooks / ตัวช่วยที่ใช้ร่วมกัน ---------- */

export function useRole(): string | null {
  return useSyncExternalStore(subscribe, getRole, () => null);
}

export function useRequests(): Request[] {
  const raw = useSyncExternalStore(subscribeRequests, getRequestsRaw, () => null);
  return useMemo(() => parseRequests(raw), [raw]);
}

// วันที่ดำเนินการ (อนุมัติ / ไม่อนุมัติ / ส่งกลับ) ใช้เวลาที่บันทึกในหน้าก่อน ไม่มีค่อยใช้จาก approvals
export function decidedAtText(r: Request): string {
  const ap = approvals.find((a) => a.requestId === r.id);
  const s = displayStatus(r);
  const want = s === "rejected" ? "rejected" : "approved";
  return fmtDateTime(r.decidedAt ?? (ap && ap.status === want ? ap.approvedAt : null));
}

export function StatusBadge({ status }: { status: BorrowStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[status].className}`}
    >
      {STATUS[status].label}
    </span>
  );
}

export const pillClass = (active: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm font-semibold ${
    active
      ? "border-blue-950 bg-blue-950 text-white"
      : "border-slate-400 bg-white text-slate-900 hover:bg-indigo-100"
  }`;

export const inputClass =
  "rounded-lg border border-slate-400 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600";

// popup กรอกเหตุผล (ใช้ตอนส่งกลับแก้ไข / ไม่อนุมัติ)
export function ReasonModal({
  title,
  description,
  placeholder,
  confirmLabel,
  confirmClassName,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  placeholder: string;
  confirmLabel: string;
  confirmClassName: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl"
      >
        <h2 className="text-xl font-bold text-blue-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-800">{description}</p>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          className={`mt-3 w-full ${inputClass}`}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-400 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            ยกเลิก
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className={`rounded-lg px-6 py-2 text-sm font-bold text-white disabled:opacity-40 ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- popup รายละเอียดคำขอ (ทุก role เปิดดูได้) ---------- */

export const TONE: Record<StepTone, string> = {
  done: "bg-blue-200 text-blue-950",
  current: "bg-amber-200 text-amber-950",
  wait: "bg-slate-200 text-slate-900",
  bad: "bg-red-200 text-red-950",
};

export function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-0.5 size-5 shrink-0 text-slate-700"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const ICONS = {
  swap: (
    <Icon>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </Icon>
  ),
  box: (
    <Icon>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </Icon>
  ),
  pin: (
    <Icon>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  ),
  calendar: (
    <Icon>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
  ),
};

export function DetailModal({
  request: r,
  onClose,
}: {
  request: Request;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const s = displayStatus(r);
  const asset = assets.find((a) => a.id === r.assetId);
  const note = r.note || approvalComment(r.id);

  const info: { icon: ReactNode; label: string; value: string }[] = [
    { icon: ICONS.swap, label: "ประเภทคำขอ", value: TYPES[r.type].label },
    {
      icon: ICONS.box,
      label: "อุปกรณ์ / จำนวน",
      value: `${asset?.name ?? r.assetId} (${r.assetId}) serial ${asset?.serialNumber ?? "-"} / 1`,
    },
    {
      icon: ICONS.pin,
      label: "ผู้ขอ / สาขา",
      value: `พนักงาน #${r.borrowerId} / ${branchName(r.branchId)}`,
    },
  ];
  if (r.type === "transfer") {
    info.push({
      icon: ICONS.pin,
      label: "โอนย้าย",
      value: `${branchName(r.branchId)} → ${branchName(r.toBranchId)}`,
    });
  }
  info.push({
    icon: ICONS.calendar,
    label: "วันที่แจ้ง",
    value: fmtDateTime(r.createdAt),
  });
  if (r.type === "return") {
    info.push({
      icon: ICONS.calendar,
      label: "กำหนดคืน",
      value: fmtDateTime(r.expectedReturnDate),
    });
    if (r.actualReturnDate) {
      info.push({
        icon: ICONS.calendar,
        label: "วันที่คืนจริง",
        value: fmtDateTime(r.actualReturnDate),
      });
    }
  } else {
    info.push({
      icon: ICONS.calendar,
      label: r.type === "transfer" ? "วันที่ต้องการโอนย้าย" : "วันที่ต้องการใช้",
      value: fmtDateTime(r.borrowDate),
    });
  }

  const steps = buildTimeline(r);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-blue-950">รายละเอียดคำขอ</h2>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[s].className}`}
            >
              {STATUS[s].label}
            </span>
            <button
              onClick={onClose}
              aria-label="ปิด"
              className="rounded-md px-2 py-1 text-xl leading-none text-slate-800 hover:bg-slate-100"
            >
              ×
            </button>
          </div>
        </div>

        <p className="mt-4 text-2xl font-bold text-blue-950">{r.id}</p>

        <div className="mt-4 flex flex-col gap-3">
          {info.map((row) => (
            <div key={row.label} className="flex items-start gap-3 text-sm">
              {row.icon}
              <span className="w-40 shrink-0 text-slate-800">{row.label}</span>
              <span className="font-medium text-slate-900">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-bold text-slate-900">รายละเอียด</h3>
          <p className="mt-1 text-sm text-slate-900">{r.purpose || "-"}</p>
        </div>

        {note && (
          <div className="mt-4 rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm">
            <span className="font-bold">หมายเหตุจากผู้ดูแล:</span> {note}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-900">สถานะการดำเนินการ</h3>
          <ol className="relative ml-2 mt-4 flex flex-col gap-5 border-l-2 border-slate-300 pl-5">
            {steps.map((st, i) => (
              <li
                key={i}
                className="relative flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
              >
                <span
                  className={`absolute top-1/2 -left-[27px] size-3 -translate-y-1/2 rounded-full border-2 ${
                    st.tone === "wait"
                      ? "border-slate-400 bg-white"
                      : "border-blue-600 bg-blue-600"
                  }`}
                />
                <span className="w-44 text-slate-800">{st.time}</span>
                <span className="flex-1 font-medium text-slate-900">{st.label}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${TONE[st.tone]}`}
                >
                  {st.badge}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-950 px-8 py-2.5 text-sm font-bold text-white"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
