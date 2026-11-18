"use client";

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

// TODO: แทนด้วย id ของผู้ใช้ที่ login จริง
const CURRENT_USER_ID = 102;

/* ---------- types ---------- */

type RequestType = BorrowRequestType;

type Request = BorrowRequest & {
  decidedAt?: string; // เวลาที่แอดมิน/ประธานดำเนินการล่าสุด (ใช้แสดงใน timeline)
};

type NewRequest = {
  type: RequestType;
  assetId: string;
  borrowDate: string;
  expectedReturnDate: string;
  toBranchId?: string;
  purpose: string;
};

type StatusFilter = "all" | BorrowStatus;
type TypeFilter = "all" | RequestType;

const TYPES: Record<RequestType, { label: string; hint: string }> = {
  withdraw: { label: "เบิก", hint: "ขอเบิกไปใช้งาน" },
  return: { label: "คืน", hint: "คืนทรัพย์สินที่ยืมไว้" },
  transfer: { label: "ขอโอนย้าย", hint: "ย้ายไปสาขาอื่น" },
};

const STATUS: Record<BorrowStatus, { label: string; className: string }> = {
  pending: { label: "รออนุมัติ", className: "bg-amber-200 text-amber-950" },
  revision: { label: "ส่งกลับแก้ไข", className: "bg-violet-200 text-violet-950" },
  approved: { label: "อนุมัติแล้ว", className: "bg-sky-200 text-sky-950" },
  returned: { label: "คืนแล้ว", className: "bg-emerald-200 text-emerald-950" },
  rejected: { label: "ไม่อนุมัติ", className: "bg-red-200 text-red-950" },
  overdue: { label: "เกินกำหนดคืน", className: "bg-orange-200 text-orange-950" },
};

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "pending",
  "revision",
  "approved",
  "overdue",
  "returned",
  "rejected",
];

const TYPE_FILTERS: TypeFilter[] = ["all", "withdraw", "return", "transfer"];

/* ---------- role (อ่านจาก localStorage แบบเดียวกับ Sidebar) ---------- */

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("credentialchange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

function getRole(): string | null {
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

const today = () => new Date().toISOString().slice(0, 10);

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : "-";

// เบิก / โอนย้ายไม่มีการคืนทรัพย์สิน จึงไม่มีสถานะ "เกินกำหนดคืน"
// ส่วนคำขอคืนที่อนุมัติแล้ว แต่เลยวันที่คาดว่าจะคืนและยังไม่ได้รับคืน = เกินกำหนด
function displayStatus(r: Request): BorrowStatus {
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

const assetName = (id: string) => assets.find((a) => a.id === id)?.name ?? id;
const branchName = (id?: string | null) =>
  branches.find((b) => b.id === id)?.name ?? id ?? "-";
const approvalComment = (requestId: string) =>
  approvals.find((a) => a.requestId === requestId)?.comment ?? "";

const initial: Request[] = initialRequests;

/* ---------- เก็บคำขอไว้ใน localStorage (รีเฟรชแล้วไม่หาย) ---------- */

const STORAGE_KEY = "borrowRequests";
const CHANGE_EVENT = "borrowrequestschange";

function subscribeRequests(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getRequestsRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseRequests(raw: string | null): Request[] {
  if (!raw) return initial; // ยังไม่เคยบันทึก ใช้ข้อมูลเริ่มต้น
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Request[]) : initial;
  } catch {
    return initial;
  }
}

function saveRequests(list: Request[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("Save requests failed:", error);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/* ---------- รายละเอียดคำขอ ---------- */

// วันที่แบบเต็ม (ปี พ.ศ. 4 หลัก) ถ้ามีเวลาในค่าจะแสดงเวลาด้วย
function fmtDateTime(d: string | null | undefined): string {
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

type StepTone = "done" | "current" | "wait" | "bad";
type Step = { time: string; label: string; badge: string; tone: StepTone };

// สร้าง timeline "สถานะการดำเนินการ" จากสถานะของคำขอ + ข้อมูลใน approvals
function buildTimeline(r: Request): Step[] {
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

const EXPORT_HEADERS = [
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

function toTable(list: Request[]): string[][] {
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

async function exportExcel(list: Request[]) {
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
    a.download = `borrow-requests-${today()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export Excel failed:", error);
  }
}

// PDF: เปิดหน้าพิมพ์ของเบราว์เซอร์ แล้วเลือก "Save as PDF" (ภาษาไทยแสดงถูกต้อง)
function exportPdf(list: Request[], subtitle: string) {
  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const head = EXPORT_HEADERS.map((h) => `<th>${esc(h)}</th>`).join("");
  const rowsHtml = toTable(list)
    .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
    .join("");

  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<title>รายงานคำขอ</title>
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
<h1>รายงานคำขอเบิก / คืน / โอนย้ายทรัพย์สิน</h1>
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

/* ---------- page ---------- */

export default function Page() {
  const role = useSyncExternalStore(subscribe, getRole, () => null);
  // สิทธิ์ตาม role
  const isAdmin = role === "admin" || role === "superadmin";
  const isPresident = role === "president";
  const canApprove = isAdmin || isPresident; // อนุมัติ / ไม่อนุมัติ
  const canSendBack = isAdmin; // ส่งกลับแก้ไข
  const canReceive = isAdmin; // รับคืนทรัพย์สิน
  const canCreate = !isPresident; // president ดูภาพรวมและอนุมัติเท่านั้น

  const rawRequests = useSyncExternalStore(
    subscribeRequests,
    getRequestsRaw,
    () => null,
  );
  const requests = useMemo(() => parseRequests(rawRequests), [rawRequests]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Request | null>(null); // คำขอที่ถูกส่งกลับมาแก้
  const [sendBackId, setSendBackId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = requests.find((r) => r.id === detailId) ?? null;

  // ตัวเลขบนปุ่มสถานะ นับตามประเภทที่เลือกอยู่
  const byType = useMemo(
    () => requests.filter((r) => typeFilter === "all" || r.type === typeFilter),
    [requests, typeFilter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: byType.length };
    for (const r of byType) {
      const s = displayStatus(r);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [byType]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byType
      .filter((r) => statusFilter === "all" || displayStatus(r) === statusFilter)
      .filter(
        (r) =>
          !q ||
          r.id.toLowerCase().includes(q) ||
          assetName(r.assetId).toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [byType, statusFilter, query]);

  function update(id: string, patch: Partial<Request>) {
    const decidedAt = new Date().toISOString();
    saveRequests(
      requests.map((r) => (r.id === id ? { ...r, decidedAt, ...patch } : r)),
    );
  }

  // คืนรหัสคำขอใหม่ เพื่อให้ popup แสดงหลังส่งสำเร็จ
  function addRequest(data: NewRequest): string {
    const asset = assets.find((a) => a.id === data.assetId);
    const id = `BRQ-${String(requests.length + 1).padStart(4, "0")}`;
    const next: Request = {
      id,
      borrowerId: CURRENT_USER_ID,
      branchId: asset?.branchId ?? "",
      ...data,
      toBranchId: data.toBranchId ?? null,
      actualReturnDate: null,
      status: "pending",
      note: "",
      createdAt: new Date().toISOString(),
    };
    saveRequests([next, ...requests]);
    return id;
  }

  // ผู้ขอแก้ไขคำขอที่ถูกส่งกลับ แล้วส่งใหม่ -> กลับไปรออนุมัติ
  function resubmit(id: string, data: NewRequest): string {
    const asset = assets.find((a) => a.id === data.assetId);
    update(id, {
      ...data,
      toBranchId: data.toBranchId ?? null,
      branchId: asset?.branchId ?? "",
      status: "pending",
      note: "",
    });
    return id;
  }

  // แอดมินส่งกลับแก้ไข พร้อมเหตุผล (เก็บไว้ใน note)
  function confirmSendBack(reason: string) {
    if (sendBackId) update(sendBackId, { status: "revision", note: reason });
    setSendBackId(null);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
  }

  const exportSubtitle = `ออกรายงานวันที่ ${new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} · ประเภท: ${typeFilter === "all" ? "ทั้งหมด" : TYPES[typeFilter].label} · สถานะ: ${
    statusFilter === "all" ? "ทั้งหมด" : STATUS[statusFilter].label
  } · ${rows.length} รายการ`;

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-semibold ${
      active
        ? "border-blue-950 bg-blue-950 text-white"
        : "border-slate-400 bg-white text-slate-900 hover:bg-indigo-100"
    }`;

  return (
    <div className="flex flex-col gap-5 p-6 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">
            เบิก / ยืมคืน / ขอโอนย้ายทรัพย์สิน
          </h1>
          <p className="text-sm text-slate-700">
            ติดตามคำขอ สถานะการอนุมัติ และกำหนดคืน
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-yellow-400 px-5 py-2.5 font-bold text-blue-950 hover:bg-yellow-300"
          >
            + สร้างคำขอ
          </button>
        )}
        {isPresident && (
          <div className="flex gap-2">
            <button
              onClick={() => void exportExcel(rows)}
              disabled={rows.length === 0}
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            >
              ส่งออก Excel
            </button>
            <button
              onClick={() => exportPdf(rows, exportSubtitle)}
              disabled={rows.length === 0}
              className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            >
              ส่งออก PDF
            </button>
          </div>
        )}
      </header>

      {/* ภาพรวม (President) */}
      {isPresident && (
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(TYPES) as RequestType[]).map((t) => {
            const list = requests.filter((r) => r.type === t);
            const n = (st: BorrowStatus) =>
              list.filter((r) => r.status === st).length;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="rounded-xl border border-slate-300 bg-white p-4 text-left hover:bg-indigo-50"
              >
                <div className="text-sm font-semibold text-slate-900">
                  คำขอ{TYPES[t].label}
                </div>
                <div className="my-1 text-3xl font-bold text-blue-950">
                  {list.length}
                  <span className="ml-1 text-sm font-medium text-slate-800">
                    รายการ
                  </span>
                </div>
                <div className="text-xs text-slate-800">
                  รออนุมัติ {n("pending")} · อนุมัติแล้ว {n("approved")} ·
                  ไม่อนุมัติ {n("rejected")}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ตัวกรองประเภทคำขอ */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-slate-900">ประเภท</span>
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={pill(typeFilter === t)}
          >
            {t === "all" ? "ทั้งหมด" : TYPES[t].label}
          </button>
        ))}
      </div>

      {/* ตัวกรองสถานะ + ค้นหา */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-slate-900">สถานะ</span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={pill(statusFilter === f)}
          >
            {f === "all" ? "ทั้งหมด" : STATUS[f].label}
            <span className="ml-1.5 font-normal opacity-80">{counts[f] ?? 0}</span>
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหารหัสคำขอ ชื่อทรัพย์สิน หรือวัตถุประสงค์"
          className="ml-auto w-full rounded-lg border border-slate-400 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 sm:w-80"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="w-full min-w-[1040px] text-left text-sm text-slate-900">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th className="p-3 font-bold">รหัส</th>
              <th className="p-3 font-bold">ประเภท</th>
              <th className="p-3 font-bold">ทรัพย์สิน</th>
              <th className="p-3 font-bold">ผู้ขอ</th>
              <th className="p-3 font-bold">รายละเอียด</th>
              <th className="p-3 font-bold">วันที่คืนจริง</th>
              <th className="p-3 font-bold">สถานะ</th>
              <th className="p-3 font-bold">หมายเหตุ</th>
              <th className="p-3 font-bold">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="p-8 text-center text-slate-700"
                >
                  ไม่พบคำขอที่ตรงกับตัวกรอง
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const s = displayStatus(r);
              const note = r.note || approvalComment(r.id);
              return (
                <tr
                  key={r.id}
                  tabIndex={0}
                  onClick={() => setDetailId(r.id)}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && e.key === "Enter") {
                      setDetailId(r.id);
                    }
                  }}
                  title="คลิกเพื่อดูรายละเอียด"
                  className="cursor-pointer border-t border-slate-200 align-top hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                >
                  <td className="p-3 font-semibold text-blue-950">{r.id}</td>
                  <td className="p-3 font-medium">{TYPES[r.type].label}</td>
                  <td className="p-3">
                    <div className="font-semibold">{assetName(r.assetId)}</div>
                    <div className="text-xs text-slate-700">
                      {r.assetId} · {branchName(r.branchId)}
                    </div>
                  </td>
                  <td className="p-3">พนักงาน #{r.borrowerId}</td>
                  <td className="p-3">
                    {r.type === "transfer" ? (
                      <div className="font-medium">
                        {branchName(r.branchId)} → {branchName(r.toBranchId)}
                      </div>
                    ) : r.type === "return" ? (
                      <div className="font-medium">
                        กำหนดคืน {fmtDate(r.expectedReturnDate)}
                      </div>
                    ) : (
                      <div className="font-medium">
                        ต้องการวันที่ {fmtDate(r.borrowDate)}
                      </div>
                    )}
                    <div className="max-w-56 text-xs text-slate-700">{r.purpose}</div>
                  </td>
                  <td className="p-3">{fmtDate(r.actualReturnDate)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[s].className}`}
                    >
                      {STATUS[s].label}
                    </span>
                  </td>
                  <td className="max-w-56 p-3 text-slate-800">{note || "-"}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <RowActions
                      type={r.type}
                      status={s}
                      canApprove={canApprove}
                      canSendBack={canSendBack}
                      canReceive={canReceive}
                      canEdit={canCreate && r.borrowerId === CURRENT_USER_ID}
                      onApprove={() => update(r.id, { status: "approved" })}
                      onReject={() => update(r.id, { status: "rejected" })}
                      onSendBack={() => setSendBackId(r.id)}
                      onReceive={() =>
                        update(r.id, {
                          status: "returned",
                          actualReturnDate: today(),
                        })
                      }
                      onEdit={() => setEditing(r)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(showModal || editing) && (
        <RequestModal
          key={editing?.id ?? "new"}
          editing={editing ?? undefined}
          onSubmit={editing ? (d) => resubmit(editing.id, d) : addRequest}
          onClose={closeModal}
        />
      )}

      {sendBackId && (
        <ReasonModal
          onConfirm={confirmSendBack}
          onClose={() => setSendBackId(null)}
        />
      )}

      {detail && <DetailModal request={detail} onClose={() => setDetailId(null)} />}
    </div>
  );
}

/* ---------- sub components ---------- */

function RowActions({
  type,
  status,
  canApprove,
  canSendBack,
  canReceive,
  canEdit,
  onApprove,
  onReject,
  onSendBack,
  onReceive,
  onEdit,
}: {
  type: RequestType;
  status: BorrowStatus;
  canApprove: boolean;
  canSendBack: boolean;
  canReceive: boolean;
  canEdit: boolean;
  onApprove: () => void;
  onReject: () => void;
  onSendBack: () => void;
  onReceive: () => void;
  onEdit: () => void;
}) {
  const base = "rounded-md px-3 py-1.5 text-xs font-bold text-white";

  // รออนุมัติ: Admin / SuperAdmin / President อนุมัติหรือไม่อนุมัติ, Admin ส่งกลับแก้ไขได้
  if (status === "pending" && canApprove) {
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={onApprove} className={`${base} bg-emerald-700`}>
          อนุมัติ
        </button>
        <button onClick={onReject} className={`${base} bg-red-700`}>
          ไม่อนุมัติ
        </button>
        {canSendBack && (
          <button onClick={onSendBack} className={`${base} bg-violet-700`}>
            ส่งกลับแก้ไข
          </button>
        )}
      </div>
    );
  }

  // ถูกส่งกลับ: ผู้ขอกดแก้ไขแล้วส่งใหม่
  if (status === "revision" && canEdit) {
    return (
      <button onClick={onEdit} className={`${base} bg-blue-950`}>
        แก้ไขคำขอ
      </button>
    );
  }

  // เฉพาะคำขอ "คืน" ที่อนุมัติแล้วหรือเกินกำหนด: Admin รับคืนทรัพย์สิน
  if (
    canReceive &&
    type === "return" &&
    (status === "overdue" || status === "approved")
  ) {
    return (
      <button onClick={onReceive} className={`${base} bg-blue-950`}>
        รับคืน
      </button>
    );
  }

  return <span className="text-slate-700">-</span>;
}

function RequestModal({
  editing,
  onSubmit,
  onClose,
}: {
  editing?: Request; // มีค่า = โหมดแก้ไขคำขอที่ถูกส่งกลับ
  onSubmit: (d: NewRequest) => string;
  onClose: () => void;
}) {
  const [type, setType] = useState<RequestType>(editing?.type ?? "withdraw");
  const [assetId, setAssetId] = useState(editing?.assetId ?? "");
  const [borrowDate, setBorrowDate] = useState(editing?.borrowDate ?? "");
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    editing?.expectedReturnDate ?? "",
  );
  const [toBranchId, setToBranchId] = useState(editing?.toBranchId ?? "");
  const [purpose, setPurpose] = useState(editing?.purpose ?? "");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // เบิก/โอนย้าย เลือกจากของที่พร้อมใช้งาน, คืน เลือกจากของที่กำลังถูกยืมอยู่
  const options = assets.filter(
    (a) =>
      a.status === (type === "return" ? "borrowed" : "available") ||
      a.id === editing?.assetId,
  );
  const selectedAssetId = options.some((a) => a.id === assetId)
    ? assetId
    : (options[0]?.id ?? "");
  const asset = assets.find((a) => a.id === selectedAssetId);
  const destinations = branches.filter(
    (b) => b.status === "active" && b.id !== asset?.branchId,
  );
  // ถ้าเปลี่ยนทรัพย์สินแล้วสาขาปลายทางเดิมใช้ไม่ได้ ให้ถือว่ายังไม่ได้เลือก
  const toBranch = destinations.some((b) => b.id === toBranchId) ? toBranchId : "";

  const ready =
    !!selectedAssetId &&
    !!purpose.trim() &&
    (type === "return" ? !!expectedReturnDate : !!borrowDate) &&
    (type !== "transfer" || !!toBranch);

  const dateLabel =
    type === "withdraw" ? "วันที่ต้องการเบิก" : "วันที่ต้องการโอนย้าย";
  const purposeLabel =
    type === "transfer"
      ? "เหตุผลการโอนย้าย"
      : type === "return"
        ? "หมายเหตุการคืน"
        : "วัตถุประสงค์";

  function submit() {
    const id = onSubmit({
      type,
      assetId: selectedAssetId,
      borrowDate: type === "return" ? "" : borrowDate,
      expectedReturnDate: type === "return" ? expectedReturnDate : "",
      toBranchId: type === "transfer" ? toBranch : undefined,
      purpose: purpose.trim(),
    });
    setSubmittedId(id);
  }

  const field =
    "w-full rounded-lg border border-slate-400 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600";
  const label = "mb-1 block text-sm font-semibold text-slate-900";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-xl"
      >
        {submittedId ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
              <svg
                viewBox="0 0 24 24"
                className="size-9 text-emerald-700"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-950">
              {editing ? "ส่งคำขอแก้ไขเรียบร้อย" : "ส่งคำขอเรียบร้อย"}
            </h2>
            <p className="text-sm text-slate-800">
              คำขอ{TYPES[type].label} รหัส {submittedId} อยู่ในสถานะรออนุมัติ
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-lg bg-blue-950 px-8 py-2.5 text-sm font-bold text-white"
            >
              ปิด
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-950">
                {editing ? "แก้ไขคำขอ" : "สร้างคำขอ"}
              </h2>
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="rounded-md px-2 py-1 text-xl leading-none text-slate-800 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            {editing?.note && (
              <div className="rounded-lg border border-violet-300 bg-violet-50 p-3 text-sm text-violet-950">
                <span className="font-bold">เหตุผลที่ส่งกลับ:</span> {editing.note}
              </div>
            )}

            {editing ? (
              <p className="text-sm font-semibold text-slate-900">
                ประเภทคำขอ: {TYPES[type].label} ({editing.id})
              </p>
            ) : (
            <div>
              <span className={label}>ประเภทคำขอ</span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TYPES) as RequestType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-lg border p-3 text-left ${
                      type === t
                        ? "border-blue-950 bg-blue-950 text-white"
                        : "border-slate-400 bg-white text-slate-900 hover:bg-indigo-100"
                    }`}
                  >
                    <div className="text-sm font-bold">{TYPES[t].label}</div>
                    <div className="text-xs">{TYPES[t].hint}</div>
                  </button>
                ))}
              </div>
            </div>
            )}

            <div>
              <label className={label}>ทรัพย์สิน</label>
              {options.length === 0 ? (
                <p className="text-sm text-slate-800">
                  {type === "return"
                    ? "ตอนนี้ไม่มีทรัพย์สินที่ถูกยืมอยู่"
                    : "ตอนนี้ไม่มีทรัพย์สินที่พร้อมใช้งาน"}
                </p>
              ) : (
                <select
                  value={selectedAssetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className={field}
                >
                  {options.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.id}) – {branchName(a.branchId)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {type === "transfer" && (
              <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <div>
                  <label className={label}>จากสาขา</label>
                  <input
                    disabled
                    value={branchName(asset?.branchId)}
                    className={`${field} bg-slate-100`}
                  />
                </div>
                <span className="hidden pb-2 text-lg font-bold sm:block">→</span>
                <div>
                  <label className={label}>ไปยังสาขา</label>
                  <select
                    value={toBranch}
                    onChange={(e) => setToBranchId(e.target.value)}
                    className={field}
                  >
                    <option value="">เลือกสาขาปลายทาง</option>
                    {destinations.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className={label}>
                {type === "return" ? "วันที่คาดว่าจะคืน" : dateLabel}
              </label>
              <input
                type="date"
                min={today()}
                value={type === "return" ? expectedReturnDate : borrowDate}
                onChange={(e) =>
                  type === "return"
                    ? setExpectedReturnDate(e.target.value)
                    : setBorrowDate(e.target.value)
                }
                className={field}
              />
            </div>

            <div>
              <label className={label}>{purposeLabel}</label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={field}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-400 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                ยกเลิก
              </button>
              <button
                disabled={!ready}
                onClick={submit}
                className="rounded-lg bg-blue-950 px-6 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                {editing ? "ส่งคำขอแก้ไข" : "ส่งคำขอ"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReasonModal({
  onConfirm,
  onClose,
}: {
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
        <h2 className="text-xl font-bold text-blue-950">ส่งกลับแก้ไข</h2>
        <p className="mt-1 text-sm text-slate-800">
          ระบุสิ่งที่ผู้ขอต้องแก้ไข คำขอจะถูกส่งกลับให้ผู้ขอแก้ไขแล้วส่งใหม่
        </p>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="เช่น ระบุวันที่คืนไม่ชัดเจน กรุณาแก้ไข"
          className="mt-3 w-full rounded-lg border border-slate-400 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600"
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
            className="rounded-lg bg-violet-700 px-6 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            ส่งกลับแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- popup รายละเอียดคำขอ (ทุก role เปิดดูได้) ---------- */

const TONE: Record<StepTone, string> = {
  done: "bg-blue-200 text-blue-950",
  current: "bg-amber-200 text-amber-950",
  wait: "bg-slate-200 text-slate-900",
  bad: "bg-red-200 text-red-950",
};

function Icon({ children }: { children: ReactNode }) {
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

const ICONS = {
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

function DetailModal({
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
