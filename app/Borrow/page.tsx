"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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

// BorrowRequest + ฟิลด์ที่ใช้เฉพาะหน้านี้
type Request = BorrowRequest & {
  returnRequested?: boolean; // แอดมินส่งคำขอคืนไปแล้ว
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
  approved: { label: "อนุมัติแล้ว", className: "bg-sky-200 text-sky-950" },
  returned: { label: "คืนแล้ว", className: "bg-emerald-200 text-emerald-950" },
  rejected: { label: "ไม่อนุมัติ", className: "bg-red-200 text-red-950" },
  overdue: { label: "เกินกำหนดคืน", className: "bg-orange-200 text-orange-950" },
};

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "pending",
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

// คำขอคืนที่อนุมัติแล้ว แต่เลยวันที่คาดว่าจะคืน และยังไม่ได้รับคืน = เกินกำหนด
function displayStatus(r: Request): BorrowStatus {
  if (
    r.type === "return" &&
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

/* ---------- page ---------- */

export default function Page() {
  const role = useSyncExternalStore(subscribe, getRole, () => null);
  // สิทธิ์ตาม role
  const isAdmin = role === "admin" || role === "superadmin";
  const isPresident = role === "president";
  const canApprove = isAdmin || isPresident; // อนุมัติ / ไม่อนุมัติ
  const canManageReturn = isAdmin; // ส่งคำขอคืน / รับคืน
  const canCreate = !isPresident; // president ดูภาพรวมและอนุมัติเท่านั้น

  const [requests, setRequests] = useState<Request[]>(initial);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

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
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
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
    setRequests((prev) => [next, ...prev]);
    return id;
  }

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
              {canApprove && <th className="p-3 font-bold">ดำเนินการ</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={canApprove ? 9 : 8}
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
                <tr key={r.id} className="border-t border-slate-200 align-top">
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
                  {canApprove && (
                    <td className="p-3">
                      <RowActions
                        type={r.type}
                        status={s}
                        canReturn={canManageReturn}
                        returnRequested={!!r.returnRequested}
                        onRequestReturn={() =>
                          update(r.id, { returnRequested: true })
                        }
                        onApprove={() => update(r.id, { status: "approved" })}
                        onReject={() => update(r.id, { status: "rejected" })}
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

      {showModal && (
        <RequestModal onSubmit={addRequest} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

/* ---------- sub components ---------- */

function RowActions({
  type,
  status,
  canReturn,
  returnRequested,
  onApprove,
  onReject,
  onRequestReturn,
  onReturn,
}: {
  type: RequestType;
  status: BorrowStatus;
  canReturn: boolean;
  returnRequested: boolean;
  onApprove: () => void;
  onReject: () => void;
  onRequestReturn: () => void;
  onReturn: () => void;
}) {
  const base = "rounded-md px-3 py-1.5 text-xs font-bold text-white";

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <button onClick={onApprove} className={`${base} bg-emerald-700`}>
          อนุมัติ
        </button>
        <button onClick={onReject} className={`${base} bg-red-700`}>
          ไม่อนุมัติ
        </button>
      </div>
    );
  }

  const isOverdue = status === "overdue";
  const readyToReceive = isOverdue || (type === "return" && status === "approved");

  if (canReturn && readyToReceive) {
    return (
      <div className="flex flex-wrap gap-2">
        {isOverdue && (
          <button
            disabled={returnRequested}
            onClick={onRequestReturn}
            className={`${base} bg-indigo-700 disabled:opacity-50`}
          >
            {returnRequested ? "ส่งคำขอคืนแล้ว" : "ส่งคำขอคืน"}
          </button>
        )}
        <button onClick={onReturn} className={`${base} bg-blue-950`}>
          รับคืน
        </button>
      </div>
    );
  }

  return <span className="text-slate-700">-</span>;
}

function RequestModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (d: NewRequest) => string;
  onClose: () => void;
}) {
  const [type, setType] = useState<RequestType>("withdraw");
  const [assetId, setAssetId] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // เบิก/โอนย้าย เลือกจากของที่พร้อมใช้งาน, คืน เลือกจากของที่กำลังถูกยืมอยู่
  const options = assets.filter(
    (a) => a.status === (type === "return" ? "borrowed" : "available"),
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
            <h2 className="text-xl font-bold text-blue-950">ส่งคำขอเรียบร้อย</h2>
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
              <h2 className="text-xl font-bold text-blue-950">สร้างคำขอ</h2>
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="rounded-md px-2 py-1 text-xl leading-none text-slate-800 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

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
                ส่งคำขอ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
