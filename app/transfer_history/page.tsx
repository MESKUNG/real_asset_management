"use client";

import { useMemo, useState } from "react";
import { branches } from "@/data/branches";
import {
  DetailModal,
  StatusBadge,
  approvalComment,
  assetName,
  branchName,
  decidedAtText,
  displayStatus,
  exportExcel,
  exportPdf,
  fmtDate,
  inputClass,
  pillClass,
  useRequests,
} from "@/components/borrow/borrowShared";

type HistoryFilter = "all" | "approved" | "rejected";

const FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ไม่อนุมัติ" },
];

export default function Page() {
  const requests = useRequests();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [branchId, setBranchId] = useState("all");
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = requests.find((r) => r.id === detailId) ?? null;

  // ประวัติ = คำขอโอนย้ายที่ได้รับการตัดสินแล้ว (อนุมัติ / ไม่อนุมัติ)
  const history = useMemo(
    () =>
      requests.filter((r) => {
        const s = displayStatus(r);
        return r.type === "transfer" && (s === "approved" || s === "rejected");
      }),
    [requests],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history
      .filter((r) => filter === "all" || displayStatus(r) === filter)
      .filter(
        (r) =>
          branchId === "all" || r.branchId === branchId || r.toBranchId === branchId,
      )
      .filter(
        (r) =>
          !q ||
          r.id.toLowerCase().includes(q) ||
          assetName(r.assetId).toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q),
      )
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [history, filter, branchId, query]);

  const countOf = (k: HistoryFilter) =>
    k === "all"
      ? history.length
      : history.filter((r) => displayStatus(r) === k).length;

  const subtitle = `ออกรายงานวันที่ ${new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} · ${FILTERS.find((f) => f.key === filter)?.label} · สาขา: ${
    branchId === "all" ? "ทุกสาขา" : branchName(branchId)
  } · ${rows.length} รายการ`;

  return (
    <div className="flex flex-col gap-5 p-6 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">ประวัติการโอนย้าย</h1>
          <p className="text-sm text-slate-700">
            คำขอโอนย้ายทรัพย์สินที่ได้รับการอนุมัติหรือไม่อนุมัติแล้ว
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void exportExcel(rows, "transfer-history")}
            disabled={rows.length === 0}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            ส่งออก Excel
          </button>
          <button
            onClick={() => exportPdf(rows, subtitle, "ประวัติการโอนย้ายทรัพย์สิน")}
            disabled={rows.length === 0}
            className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            ส่งออก PDF
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold">สถานะ</span>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={pillClass(filter === f.key)}
          >
            {f.label}
            <span className="ml-1.5 font-normal opacity-80">{countOf(f.key)}</span>
          </button>
        ))}
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className={`ml-auto ${inputClass}`}
          aria-label="สาขา"
        >
          <option value="all">ทุกสาขา (ต้นทางหรือปลายทาง)</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหารหัสคำขอ ชื่อทรัพย์สิน หรือเหตุผล"
          className={`w-full sm:w-72 ${inputClass}`}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="w-full min-w-[1040px] text-left text-sm text-slate-900">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 font-bold">รหัส</th>
              <th className="p-3 font-bold">ทรัพย์สิน</th>
              <th className="p-3 font-bold">จากสาขา</th>
              <th className="p-3 font-bold">ไปยังสาขา</th>
              <th className="p-3 font-bold">ผู้ขอ</th>
              <th className="p-3 font-bold">วันที่ต้องการโอนย้าย</th>
              <th className="p-3 font-bold">วันที่ดำเนินการ</th>
              <th className="p-3 font-bold">สถานะ</th>
              <th className="p-3 font-bold">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-700">
                  ไม่พบประวัติการโอนย้ายที่ตรงกับตัวกรอง
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.id}
                tabIndex={0}
                onClick={() => setDetailId(r.id)}
                onKeyDown={(e) => e.key === "Enter" && setDetailId(r.id)}
                title="คลิกเพื่อดูรายละเอียด"
                className="cursor-pointer border-t border-slate-200 align-top hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
              >
                <td className="p-3 font-semibold text-blue-950">{r.id}</td>
                <td className="p-3">
                  <div className="font-semibold">{assetName(r.assetId)}</div>
                  <div className="text-xs text-slate-700">{r.assetId}</div>
                </td>
                <td className="p-3">{branchName(r.branchId)}</td>
                <td className="p-3">{branchName(r.toBranchId)}</td>
                <td className="p-3">พนักงาน #{r.borrowerId}</td>
                <td className="p-3">{fmtDate(r.borrowDate)}</td>
                <td className="p-3">{decidedAtText(r)}</td>
                <td className="p-3">
                  <StatusBadge status={displayStatus(r)} />
                </td>
                <td className="max-w-56 p-3 text-slate-800">
                  {r.note || approvalComment(r.id) || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && <DetailModal request={detail} onClose={() => setDetailId(null)} />}
    </div>
  );
}
