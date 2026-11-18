"use client";

import { useMemo, useState } from "react";
import {
  DetailModal,
  STATUS_FILTERS,
  STATUS,
  StatusBadge,
  TYPES,
  TYPE_FILTERS,
  approvalComment,
  assetName,
  branchName,
  displayStatus,
  exportExcel,
  exportPdf,
  fmtDate,
  inputClass,
  pillClass,
  useRequests,
  type RequestType,
  type StatusFilter,
  type TypeFilter,
} from "@/components/borrow/borrowShared";
import { useLanguage, useTranslate } from "@/lib/language";

// จำนวนรายการต่อหน้า (เลือกแสดง 5 / 10 / ทั้งหมด)
type PageSize = 5 | 10 | "all";
const PAGE_SIZES: PageSize[] = [5, 10, "all"];

export default function Page() {
  const translateText = useTranslate();
  const language = useLanguage();
  const requests = useRequests();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [pageState, setPageState] = useState({ key: "", page: 1 });
  const detail = requests.find((r) => r.id === detailId) ?? null;

  // การ์ดสรุปแยกตามประเภท (รออนุมัติ / ส่งกลับแก้ไข / อนุมัติแล้ว / ไม่อนุมัติ)
  const summary = useMemo(() => {
    return (Object.keys(TYPES) as RequestType[]).map((t) => {
      const list = requests.filter((r) => r.type === t);
      const count = (...st: string[]) =>
        list.filter((r) => st.includes(displayStatus(r))).length;
      return {
        type: t,
        total: list.length,
        pending: count("pending"),
        revision: count("revision"),
        approved: count("approved", "returned", "overdue"),
        rejected: count("rejected"),
      };
    });
  }, [requests]);

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
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [byType, statusFilter, query]);

  // แบ่งหน้า: ถ้าตัวกรอง/ค้นหา/จำนวนต่อหน้าเปลี่ยน จะกลับไปหน้า 1 อัตโนมัติ
  const filterKey = `${typeFilter}|${statusFilter}|${query}|${pageSize}`;
  const totalPages =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(
    pageState.key === filterKey ? pageState.page : 1,
    totalPages,
  );
  const pagedRows =
    pageSize === "all"
      ? rows
      : rows.slice((page - 1) * pageSize, page * pageSize);
  const rangeFrom =
    rows.length === 0 ? 0 : pageSize === "all" ? 1 : (page - 1) * pageSize + 1;
  const rangeTo =
    pageSize === "all" ? rows.length : Math.min(page * pageSize, rows.length);
  const goPage = (p: number) => setPageState({ key: filterKey, page: p });

  const subtitle = `${translateText("ออกรายงานวันที่")} ${new Date().toLocaleDateString(
    language === "en" ? "en-US" : "th-TH",
    {
    day: "numeric",
    month: "long",
    year: "numeric",
    },
  )} · ${translateText("ประเภท")}: ${
    typeFilter === "all" ? translateText("ทั้งหมด") : translateText(TYPES[typeFilter].label)
  } · ${translateText("สถานะ")}: ${
    statusFilter === "all" ? translateText("ทั้งหมด") : translateText(STATUS[statusFilter].label)
  } · ${rows.length} ${translateText("รายการ")}`;

  return (
    <div className="flex flex-col gap-5 p-6 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">{translateText("ภาพรวมคำขอ")}</h1>
          <p className="text-sm text-slate-700">

            {translateText("สรุปคำขอเบิก รับคืน และขอโอนย้ายทรัพย์สินทั้งหมด")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void exportExcel(rows, "request-overview", language)}
            disabled={rows.length === 0}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >

            {translateText("ส่งออก Excel")}
          </button>
          <button
            onClick={() =>
              exportPdf(
                rows,
                subtitle,
                "ภาพรวมคำขอเบิก / รับคืน / โอนย้ายทรัพย์สิน",
                language,
              )
            }
            disabled={rows.length === 0}
            className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >

            {translateText("ส่งออก PDF")}
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {summary.map((c) => (
          <button
            key={c.type}
            onClick={() => setTypeFilter(c.type)}
            className="rounded-xl border border-slate-300 bg-white p-4 text-left hover:bg-indigo-50"
          >
            <div className="text-sm font-semibold text-slate-900">

              {translateText("คำขอ")}{translateText(TYPES[c.type].label)}
            </div>
            <div className="my-1 text-3xl font-bold text-blue-950">
              {c.total}
              <span className="ml-1 text-sm font-medium text-slate-800">{translateText("รายการ")}</span>
            </div>
            <div className="text-xs text-slate-800">

              {translateText("รออนุมัติ")} {c.pending}  {translateText("· ส่งกลับแก้ไข")} {c.revision}  {translateText("· อนุมัติแล้ว")}{" "}
              {c.approved}  {translateText("· ไม่อนุมัติ")} {c.rejected}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold">{translateText("ประเภท")}</span>
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={pillClass(typeFilter === t)}
          >
            {t === "all" ? translateText("ทั้งหมด") : translateText(TYPES[t].label)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold">{translateText("สถานะ")}</span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={pillClass(statusFilter === f)}
          >
            {f === "all" ? translateText("ทั้งหมด") : translateText(STATUS[f].label)}
            <span className="ml-1.5 font-normal opacity-80">{counts[f] ?? 0}</span>
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={translateText("ค้นหารหัสคำขอ ชื่อทรัพย์สิน หรือวัตถุประสงค์")}
          className={`ml-auto w-full sm:w-80 ${inputClass}`}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="w-full min-w-[960px] text-left text-sm text-slate-900">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 font-bold">{translateText("รหัส")}</th>
              <th className="p-3 font-bold">{translateText("ประเภท")}</th>
              <th className="p-3 font-bold">{translateText("ทรัพย์สิน")}</th>
              <th className="p-3 font-bold">{translateText("ผู้ขอ")}</th>
              <th className="p-3 font-bold">{translateText("รายละเอียด")}</th>
              <th className="p-3 font-bold">{translateText("สถานะ")}</th>
              <th className="p-3 font-bold">{translateText("หมายเหตุ")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-700">

                  {translateText("ไม่พบคำขอที่ตรงกับตัวกรอง")}
                </td>
              </tr>
            )}
            {pagedRows.map((r) => {
              const note = r.note || approvalComment(r.id);
              return (
                <tr
                  key={r.id}
                  tabIndex={0}
                  onClick={() => setDetailId(r.id)}
                  onKeyDown={(e) => e.key === "Enter" && setDetailId(r.id)}
                  title="คลิกเพื่อดูรายละเอียด"
                  className="cursor-pointer border-t border-slate-200 align-top hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                >
                  <td className="p-3 font-semibold text-blue-950">{r.id}</td>
                  <td className="p-3 font-medium">{translateText(TYPES[r.type].label)}</td>
                  <td className="p-3">
                    <div className="font-semibold">{assetName(r.assetId)}</div>
                    <div className="text-xs text-slate-700">
                      {r.assetId} · {branchName(r.branchId)}
                    </div>
                  </td>
                  <td className="p-3">{translateText("พนักงาน #")}{r.borrowerId}</td>
                  <td className="p-3">
                    <div className="font-medium">
                      {r.type === "transfer"
                        ? `${branchName(r.branchId)} → ${branchName(r.toBranchId)}`
                        : r.type === "return"
                          ? `กำหนดคืน ${fmtDate(r.expectedReturnDate)}`
                          : `ต้องการวันที่ ${fmtDate(r.borrowDate)}`}
                    </div>
                    <div className="max-w-56 text-xs text-slate-700">{r.purpose}</div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={displayStatus(r)} />
                  </td>
                  <td className="max-w-56 p-3 text-slate-800">{note || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* เลือกจำนวนรายการที่แสดง + เปลี่ยนหน้า */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-slate-900">{translateText("แสดง")}</span>
          {PAGE_SIZES.map((n) => (
            <button
              key={n}
              onClick={() => setPageSize(n)}
              className={pillClass(pageSize === n)}
            >
              {n === "all" ? "ทั้งหมด" : n}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-900">
          <span>
            {rangeFrom}–{rangeTo}  {translateText("จาก")} {rows.length}  {translateText("รายการ")}
          </span>
          {pageSize !== "all" && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                aria-label={translateText("หน้าก่อนหน้า")}
                className="rounded-lg border border-slate-400 bg-white px-3 py-1.5 font-semibold hover:bg-indigo-100 disabled:opacity-40"
              >
                ‹
              </button>
              <span className="min-w-12 text-center font-semibold">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= totalPages}
                aria-label={translateText("หน้าถัดไป")}
                className="rounded-lg border border-slate-400 bg-white px-3 py-1.5 font-semibold hover:bg-indigo-100 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {detail && <DetailModal request={detail} onClose={() => setDetailId(null)} />}
    </div>
  );
}
