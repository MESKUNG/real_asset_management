"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { assets } from "@/data/asset";
import {
  borrowRequests as initialRequests,
  type BorrowRequest,
  type BorrowStatus,
} from "@/data/borrowRequests";
import { approvals } from "@/data/approvals";
import { branches } from "@/data/branches";

// TODO: แทนด้วย id ของผู้ใช้ที่ login จริง
const CURRENT_USER_ID = 102;

type DisplayStatus = BorrowStatus;
type Filter = "all" | DisplayStatus;

const STATUS: Record<DisplayStatus, { label: string; className: string }> = {
  pending: { label: "รออนุมัติ", className: "bg-amber-100 text-amber-800" },
  approved: { label: "อนุมัติแล้ว", className: "bg-sky-100 text-sky-800" },
  borrowed: { label: "กำลังยืม", className: "bg-indigo-100 text-indigo-800" },
  returned: { label: "คืนแล้ว", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "ไม่อนุมัติ", className: "bg-red-100 text-red-800" },
  overdue: { label: "เกินกำหนดคืน", className: "bg-orange-100 text-orange-800" },
};

const FILTERS: Filter[] = [
  "all",
  "pending",
  "approved",
  "borrowed",
  "overdue",
  "returned",
  "rejected",
];

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

function displayStatus(r: BorrowRequest): DisplayStatus {
  if (r.status === "borrowed" && r.expectedReturnDate < today()) {
    return "overdue";
  }
  return r.status;
}

const assetName = (id: string) =>
  assets.find((a) => a.id === id)?.name ?? id;

const branchName = (id: string) =>
  branches.find((b) => b.id === id)?.name ?? id;

const approvalComment = (requestId: string) =>
  approvals.find((a) => a.requestId === requestId)?.comment ?? "";

/* ---------- page ---------- */

export default function Page() {
  const role = useSyncExternalStore(subscribe, getRole, () => null);
  const canManage = role === "admin" || role === "president";

  const [requests, setRequests] = useState<BorrowRequest[]>(initialRequests);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: requests.length };
    for (const r of requests) {
      const s = displayStatus(r);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [requests]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests
      .filter((r) => filter === "all" || displayStatus(r) === filter)
      .filter(
        (r) =>
          !q ||
          r.id.toLowerCase().includes(q) ||
          assetName(r.assetId).toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [requests, filter, query]);

  function update(id: string, patch: Partial<BorrowRequest>) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRequest(data: {
    assetId: string;
    borrowDate: string;
    expectedReturnDate: string;
    purpose: string;
  }) {
    const asset = assets.find((a) => a.id === data.assetId);
    if (!asset) return;
    const next: BorrowRequest = {
      id: `BRQ-${String(requests.length + 1).padStart(4, "0")}`,
      borrowerId: CURRENT_USER_ID,
      branchId: asset.branchId,
      ...data,
      actualReturnDate: null,
      status: "pending",
      note: "",
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [next, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">ยืม / คืนทรัพย์สิน</h1>
          <p className="text-sm text-slate-500">
            ติดตามคำขอยืม สถานะการอนุมัติ และกำหนดคืน
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-blue-950 hover:bg-yellow-300"
        >
          {showForm ? "ปิดแบบฟอร์ม" : "สร้างคำขอยืม"}
        </button>
      </header>

      {showForm && (
        <BorrowForm onSubmit={addRequest} onCancel={() => setShowForm(false)} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              filter === f
                ? "border-blue-950 bg-blue-950 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-indigo-100"
            }`}
          >
            {f === "all" ? "ทั้งหมด" : STATUS[f].label}
            <span className="ml-1.5 opacity-70">{counts[f] ?? 0}</span>
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหารหัสคำขอ ชื่อทรัพย์สิน หรือวัตถุประสงค์"
          className="ml-auto w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-80"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 font-semibold">รหัส</th>
              <th className="p-3 font-semibold">ทรัพย์สิน</th>
              <th className="p-3 font-semibold">ผู้ยืม</th>
              <th className="p-3 font-semibold">ช่วงเวลายืม</th>
              <th className="p-3 font-semibold">วันที่คืนจริง</th>
              <th className="p-3 font-semibold">สถานะ</th>
              <th className="p-3 font-semibold">หมายเหตุ</th>
              {canManage && <th className="p-3 font-semibold">ดำเนินการ</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={canManage ? 8 : 7}
                  className="p-8 text-center text-slate-500"
                >
                  ไม่พบคำขอที่ตรงกับตัวกรอง
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const s = displayStatus(r);
              const note = r.note || approvalComment(r.id);
              return (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="p-3 font-medium text-blue-950">{r.id}</td>
                  <td className="p-3">
                    <div className="font-medium">{assetName(r.assetId)}</div>
                    <div className="text-xs text-slate-500">
                      {r.assetId} · {branchName(r.branchId)}
                    </div>
                  </td>
                  <td className="p-3">พนักงาน #{r.borrowerId}</td>
                  <td className="p-3">
                    <div>
                      {fmtDate(r.borrowDate)} – {fmtDate(r.expectedReturnDate)}
                    </div>
                    <div className="max-w-56 text-xs text-slate-500">
                      {r.purpose}
                    </div>
                  </td>
                  <td className="p-3">{fmtDate(r.actualReturnDate)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[s].className}`}
                    >
                      {STATUS[s].label}
                    </span>
                  </td>
                  <td className="max-w-56 p-3 text-slate-600">{note || "-"}</td>
                  {canManage && (
                    <td className="p-3">
                      <RowActions
                        status={s}
                        onApprove={() => update(r.id, { status: "approved" })}
                        onReject={() => update(r.id, { status: "rejected" })}
                        onHandover={() => update(r.id, { status: "borrowed" })}
                        onReturn={() =>
                          update(r.id, {
                            status: "returned",
                            actualReturnDate: today(),
                          })
                        }
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- sub components ---------- */

function RowActions({
  status,
  onApprove,
  onReject,
  onHandover,
  onReturn,
}: {
  status: DisplayStatus;
  onApprove: () => void;
  onReject: () => void;
  onHandover: () => void;
  onReturn: () => void;
}) {
  const base = "rounded-md px-3 py-1.5 text-xs font-semibold";

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <button onClick={onApprove} className={`${base} bg-emerald-600 text-white`}>
          อนุมัติ
        </button>
        <button onClick={onReject} className={`${base} bg-red-600 text-white`}>
          ไม่อนุมัติ
        </button>
      </div>
    );
  }
  if (status === "approved") {
    return (
      <button onClick={onHandover} className={`${base} bg-indigo-600 text-white`}>
        ส่งมอบทรัพย์สิน
      </button>
    );
  }
  if (status === "borrowed" || status === "overdue") {
    return (
      <button onClick={onReturn} className={`${base} bg-blue-950 text-white`}>
        รับคืน
      </button>
    );
  }
  return <span className="text-slate-400">-</span>;
}

function BorrowForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (d: {
    assetId: string;
    borrowDate: string;
    expectedReturnDate: string;
    purpose: string;
  }) => void;
  onCancel: () => void;
}) {
  const available = assets.filter((a) => a.status === "available");
  const [assetId, setAssetId] = useState(available[0]?.id ?? "");
  const [borrowDate, setBorrowDate] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [purpose, setPurpose] = useState("");

  const dateError =
    borrowDate && expectedReturnDate && expectedReturnDate < borrowDate
      ? "วันที่คืนต้องไม่ก่อนวันที่ยืม"
      : "";
  const ready =
    assetId && borrowDate && expectedReturnDate && purpose.trim() && !dateError;

  const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
  const label = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label}>ทรัพย์สินที่ต้องการยืม</label>
        {available.length === 0 ? (
          <p className="text-sm text-slate-500">
            ตอนนี้ไม่มีทรัพย์สินที่พร้อมให้ยืม
          </p>
        ) : (
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className={field}
          >
            {available.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id}) – {branchName(a.branchId)}
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label className={label}>วันที่ยืม</label>
        <input
          type="date"
          min={today()}
          value={borrowDate}
          onChange={(e) => setBorrowDate(e.target.value)}
          className={field}
        />
      </div>
      <div>
        <label className={label}>วันที่คาดว่าจะคืน</label>
        <input
          type="date"
          min={borrowDate || today()}
          value={expectedReturnDate}
          onChange={(e) => setExpectedReturnDate(e.target.value)}
          className={field}
        />
        {dateError && <p className="mt-1 text-xs text-red-600">{dateError}</p>}
      </div>
      <div className="sm:col-span-2">
        <label className={label}>วัตถุประสงค์</label>
        <textarea
          rows={2}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className={field}
        />
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          ยกเลิก
        </button>
        <button
          disabled={!ready}
          onClick={() =>
            onSubmit({ assetId, borrowDate, expectedReturnDate, purpose: purpose.trim() })
          }
          className="rounded-lg bg-blue-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          ส่งคำขอยืม
        </button>
      </div>
    </div>
  );
}
