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
import { useLanguage, useTranslate } from "@/lib/language";

type HistoryFilter = "all" | "approved" | "rejected";

const FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ไม่อนุมัติ" },
];

export default function Page() {
  const translateText = useTranslate();
  const language = useLanguage();
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

  const subtitle = `${translateText("ออกรายงานวันที่")} ${new Date().toLocaleDateString(
    language === "en" ? "en-US" : "th-TH",
    {
    day: "numeric",
    month: "long",
    year: "numeric",
    },
  )} · ${translateText(FILTERS.find((f) => f.key === filter)?.label ?? "")} · ${translateText("สาขา")}: ${
    branchId === "all" ? translateText("ทุกสาขา") : branchName(branchId)
  } · ${rows.length} ${translateText("รายการ")}`;

  return (
    <div className="flex flex-col gap-5 p-6 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">{translateText("ประวัติการโอนย้าย")}</h1>
          <p className="text-sm text-slate-700">

            {translateText("คำขอโอนย้ายทรัพย์สินที่ได้รับการอนุมัติหรือไม่อนุมัติแล้ว")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void exportExcel(rows, "transfer-history", language)}
            disabled={rows.length === 0}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >

            {translateText("ส่งออก Excel")}
          </button>
          <button
            onClick={() =>
              exportPdf(rows, subtitle, "ประวัติการโอนย้ายทรัพย์สิน", language)
            }
            disabled={rows.length === 0}
            className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >

            {translateText("ส่งออก PDF")}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold">{translateText("สถานะ")}</span>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={pillClass(filter === f.key)}
          >
            {translateText(f.label)}
            <span className="ml-1.5 font-normal opacity-80">{countOf(f.key)}</span>
          </button>
        ))}
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className={`ml-auto ${inputClass}`}
          aria-label={translateText("สาขา")}
        >
          <option value="all">{translateText("ทุกสาขา (ต้นทางหรือปลายทาง)")}</option>
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
              <th className="p-3 font-bold">{translateText("รหัส")}</th>
              <th className="p-3 font-bold">{translateText("ทรัพย์สิน")}</th>
              <th className="p-3 font-bold">{translateText("จากสาขา")}</th>
              <th className="p-3 font-bold">{translateText("ไปยังสาขา")}</th>
              <th className="p-3 font-bold">{translateText("ผู้ขอ")}</th>
              <th className="p-3 font-bold">{translateText("วันที่ต้องการโอนย้าย")}</th>
              <th className="p-3 font-bold">{translateText("วันที่ดำเนินการ")}</th>
              <th className="p-3 font-bold">{translateText("สถานะ")}</th>
              <th className="p-3 font-bold">{translateText("หมายเหตุ")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-700">

                  {translateText("ไม่พบประวัติการโอนย้ายที่ตรงกับตัวกรอง")}
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
                <td className="p-3">{translateText("พนักงาน #")}{r.borrowerId}</td>
                <td className="p-3">{fmtDate(r.borrowDate, language)}</td>
                <td className="p-3">{decidedAtText(r, language)}</td>
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
