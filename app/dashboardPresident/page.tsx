"use client";
import { useLanguage, useTranslate } from "@/lib/language";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Download,
  FileBarChart2,
  Search,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { assets } from "@/data/asset";
import { assetHistories } from "@/data/assetHistories";
import { branches } from "@/data/branches";
import { borrowRequests } from "@/data/borrowRequests";
import { inventorySessions } from "@/data/inventorySessions";
import { repairRequests } from "@/data/repairRequests";

const palette = { available: "#168765", repair: "#b26b05", other: "#5746ed" };
const fmt = (n: number, language: "th" | "en") =>
  new Intl.NumberFormat(language === "en" ? "en-US" : "th-TH").format(n);
const dateFmt = (date: string, language: "th" | "en") =>
  new Intl.DateTimeFormat(language === "en" ? "en-US" : "th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
const branchName = (id: string) =>
  branches.find((branch) => branch.id === id)?.name.replace("สาขา", "") ??
  "ไม่พบข้อมูลสาขา";
const assetName = (id: string) =>
  assets.find((asset) => asset.id === id)?.name ?? "ไม่พบข้อมูลทรัพย์สิน";
const statusText = (status: string) =>
  ({
    pending: "รออนุมัติ",
    revision: "รอแก้ไข",
    approved: "อนุมัติแล้ว",
    returned: "คืนแล้ว",
    rejected: "ไม่อนุมัติ",
    overdue: "เกินกำหนด",
  })[status] ?? "ไม่พบข้อมูลสถานะ";

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {children}
    </div>
  );
}

function downloadCsv() {
  const rows = [
    ["สาขา", "ทรัพย์สินทั้งหมด", "พร้อมใช้", "ชำรุด/ซ่อม", "สถานะ"],
    ...branches.map((branch) => {
      const own = assets.filter((asset) => asset.branchId === branch.id);
      const available = own.filter(
        (asset) => asset.status === "available",
      ).length;
      const repair = own.filter(
        (asset) => asset.status === "repair" || asset.status === "damaged",
      ).length;
      return [
        branch.name,
        own.length,
        available,
        repair,
        branch.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน",
      ];
    }),
  ];
  const csv =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "executive-branch-summary.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
function Metric({
  label,
  value,
  note,
  color,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-slate-500 sm:text-lg">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <strong className="mt-3 block text-3xl font-bold tracking-tight sm:text-5xl">
        {value}
      </strong>
      <p className={`mt-2 text-xs sm:mt-3 sm:text-sm ${color}`}>{note}</p>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const translateText = useTranslate();
  const style =
    status === "รออนุมัติ"
      ? "bg-violet-50 text-violet-700"
      : status === "รอแก้ไข"
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700";
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
    >
      <Check className="mr-1 inline size-3" />
      {translateText(status)}
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <i className="size-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export default function Page() {
  const language = useLanguage();
  const translateText = useTranslate();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("ทั้งหมด");
  const rows = useMemo(
    () =>
      branches
        .filter(
          (branch) => selectedBranch === "all" || branch.id === selectedBranch,
        )
        .map((branch) => {
          const own = assets.filter((asset) => asset.branchId === branch.id);
          const available = own.filter(
            (asset) => asset.status === "available",
          ).length;
          const repair = own.filter(
            (asset) => asset.status === "repair" || asset.status === "damaged",
          ).length;
          const other = own.length - available - repair;
          return {
            id: branch.id,
            branch: branch.name.replace("สาขา", ""),
            total: own.length,
            available,
            repair,
            other,
            active: branch.status === "active",
          };
        }),
    [selectedBranch],
  );
  const filteredRows = rows.filter((row) =>
    row.branch.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const ready = rows.reduce((sum, row) => sum + row.available, 0);
  const inRepair = rows.reduce((sum, row) => sum + row.repair, 0);
  const other = rows.reduce((sum, row) => sum + row.other, 0);
  const readyPct = total ? ((ready / total) * 100).toFixed(1) : "0.0";
  const pending = borrowRequests.filter(
    (request) => request.status === "pending" || request.status === "revision",
  );
  const repairOpen = repairRequests.filter(
    (request) =>
      request.status === "pending" || request.status === "in_progress",
  );
  const latestTransfers = assetHistories
    .filter((history) => history.action === "transferred")
    .slice()
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
    .slice(0, 2);
  const latestPending = pending
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);
  const completedInventories = inventorySessions.filter(
    (session) => session.status === "completed",
  ).length;
  const unfinishedInventories = inventorySessions.filter(
    (session) =>
      session.status === "planned" || session.status === "in_progress",
  ).length;
  const latestAssetUpdate = assets.reduce(
    (latest, asset) => (asset.updatedAt > latest ? asset.updatedAt : latest),
    "",
  );

  return (
    <div className="min-h-screen bg-[#f1f2f7] px-3 py-5 text-[#1c2740] sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 sm:gap-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              {translateText("ภาพรวมองค์กร")}
            </h1>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <Metric
            label={translateText("Asset ทั้งองค์กร")}
            value={fmt(total, language)}
            note={`${assets.length ? translateText("ข้อมูลตัวอย่าง") : translateText("ไม่มีข้อมูล")} · ${latestAssetUpdate ? dateFmt(latestAssetUpdate.slice(0, 10), language) : "—"}`}
            color="text-indigo-600"
            icon={<Boxes />}
          />
          <Metric
            label={translateText("จำนวนสาขา")}
            value={fmt(branches.length, language)}
            note={`${branches.filter((branch) => branch.status === "active").length} สาขาเปิดใช้งาน`}
            color="text-emerald-600"
            icon={<CircleCheck />}
          />
          <Metric
            label={translateText("Asset พร้อมใช้งาน")}
            value={`${readyPct}%`}
            note={`${translateText("พร้อมใช้งาน")} ${fmt(ready, language)} ${translateText("รายการ")}`}
            color="text-amber-600"
            icon={<Wrench />}
          />
          <Metric
            label={translateText("คำขอรออนุมัติ")}
            value={fmt(pending.length, language)}
            note={translateText("คำขอเบิก/โอนที่ยังรอดำเนินการ")}
            color="text-cyan-600"
            icon={<CircleCheck />}
          />
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{translateText("ภาพรวมสาขา")}</h2>
            <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:flex sm:flex-wrap">
              <label className="relative min-w-0">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <select
                  aria-label={translateText("เลือกสาขา")}
                  value={selectedBranch}
                  onChange={(event) => setSelectedBranch(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-600 sm:w-auto"
                >
                  <option value="all">{translateText("ทุกสาขา")}</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </label>
                  
            </div>
          </div>
          <Card className="p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-500">
                {translateText("จำนวน Asset แยกตามสาขา")}
              </h3>
              <span className="text-xs text-slate-400">
                {translateText("ข้อมูลจำนวนรายการจาก Asset ในระบบ")}
              </span>
            </div>
            <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <Legend
                color={palette.available}
                label={translateText("พร้อมใช้")}
              />
              <Legend
                color={palette.repair}
                label={translateText("ชำรุด/ซ่อม")}
              />
              <Legend
                color={palette.other}
                label={translateText("สถานะอื่น")}
              />
            </div>
            {rows.length ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rows}
                    margin={{ top: 16, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid vertical={false} stroke="#e1e6f0" />
                    <XAxis
                      dataKey="branch"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#53617d", fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#8792a9", fontSize: 11 }}
                      width={38}
                    />
                    <Tooltip
                      cursor={{ fill: "#f5f6fa" }}
                      formatter={(value, name) => [
                        value,
                        name === "available"
                          ? "พร้อมใช้"
                          : name === "repair"
                            ? "ชำรุด/ซ่อม"
                            : "สถานะอื่น",
                      ]}
                    />
                    <Bar
                      dataKey="available"
                      stackId="asset"
                      fill={palette.available}
                      radius={[0, 0, 0, 0]}
                      maxBarSize={58}
                    />
                    <Bar
                      dataKey="repair"
                      stackId="asset"
                      fill={palette.repair}
                      maxBarSize={58}
                    />
                    <Bar
                      dataKey="other"
                      stackId="asset"
                      fill={palette.other}
                      radius={[5, 5, 0, 0]}
                      maxBarSize={58}
                      label={{ position: "top", fill: "#53617d", fontSize: 11 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="grid h-[260px] place-items-center text-sm text-slate-400">
                {translateText("ไม่พบข้อมูลสาขา")}
              </div>
            )}
            <div className="mt-4 space-y-3 sm:hidden">
              {filteredRows.map((row) => (
                <article
                  key={row.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="min-w-0 break-words font-semibold">{row.branch}</h4>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${row.active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      ● {row.active ? "เปิดใช้งาน" : "ไม่ใช้งาน"}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-400">{translateText("ทั้งหมด")}</dt>
                      <dd>{fmt(row.total, language)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">{translateText("พร้อมใช้")}</dt>
                      <dd className="text-emerald-700">{fmt(row.available, language)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">{translateText("ชำรุด/ซ่อม")}</dt>
                      <dd className="text-amber-700">{fmt(row.repair, language)}</dd>
                    </div>
                  </dl>
                  <Link
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-slate-50"
                    href="/reports"
                  >
                    {translateText("ดูรายงานสาขา")}
                  </Link>
                </article>
              ))}
              {filteredRows.length === 0 && (
                <p className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
                  {translateText("ไม่พบสาขาที่ค้นหา")}
                </p>
              )}
            </div>
            <div className="mt-4 hidden overflow-x-auto rounded-lg border border-slate-200 sm:block">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-[#f1f2f7] text-xs text-slate-500">
                  <tr>
                    {[
                      "สาขา",
                      "ทั้งหมด",
                      "พร้อมใช้",
                      "ชำรุด/ซ่อม",
                      "ผลตรวจนับ",
                      "รายงานสาขา",
                    ].map((heading) => (
                      <th key={heading} className="px-4 py-3 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200">
                      <td className="px-4 py-3.5 font-medium">{row.branch}</td>
                      <td className="px-4 py-3.5">{fmt(row.total, language)}</td>
                      <td className="px-4 py-3.5 text-emerald-700">
                        {fmt(row.available, language)}
                      </td>
                      <td className="px-4 py-3.5 text-amber-700">
                        {fmt(row.repair, language)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${row.active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                        >
                          ● {row.active ? "เปิดใช้งาน" : "ไม่ใช้งาน"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          className="font-semibold text-indigo-600 hover:underline"
                          href="/reports"
                        >
                          {translateText("ดูรายงานสาขา")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        {translateText("ไม่พบสาขาที่ค้นหา")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {translateText("พร้อมใช้งาน")} {fmt(ready, language)}{" "}
              {translateText("· ชำรุด/ซ่อม")} {fmt(inRepair, language)}{" "}
              {translateText("· สถานะอื่น")} {fmt(other, language)}{" "}
              {translateText("รายการ")}
            </p>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              {translateText("คำขอโอนย้ายและเบิกทรัพย์สิน")}
            </h2>
            <button
              onClick={downloadCsv}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
            >
              <Download size={17} />

              {translateText("ส่งออก Excel")}
            </button>
          </div>
          <div className="space-y-3 sm:hidden">
            {latestPending.map((request) => (
              <article
                key={request.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{request.id}</p>
                    <p className="mt-1 break-words text-sm">{assetName(request.assetId)}</p>
                  </div>
                  <StatusPill status={statusText(request.status)} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-400">{translateText("ต้นทาง → ปลายทาง")}</dt>
                    <dd className="break-words text-slate-600">
                      {branchName(request.branchId)} →{" "}
                      {request.toBranchId
                        ? branchName(request.toBranchId)
                        : "ไม่พบข้อมูลปลายทาง"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-400">{translateText("ผู้ยื่น")}</dt>
                      <dd className="break-words text-slate-600">User {request.borrowerId}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">{translateText("วันที่")}</dt>
                      <dd className="text-slate-600">{dateFmt(request.createdAt, language)}</dd>
                    </div>
                  </div>
                </dl>
                <Link
                  href="/Borrow"
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  <ClipboardCheck size={16} />
                  {translateText("ตรวจสอบคำขอ")}
                </Link>
              </article>
            ))}
            {!latestPending.length && (
              <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
                {translateText("ไม่มีคำขอรออนุมัติ")}
              </p>
            )}
          </div>
          <Card className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[#f1f2f7] text-xs text-slate-500">
                <tr>
                  {[
                    "เลขที่คำขอ",
                    "Asset",
                    "ต้นทาง → ปลายทาง",
                    "ผู้ยื่น",
                    "วันที่",
                    "สถานะ",
                    "ดำเนินการ",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestPending.map((request) => (
                  <tr key={request.id} className="border-t border-slate-200">
                    <td className="px-4 py-4 font-medium">{request.id}</td>
                    <td className="px-4 py-4">{assetName(request.assetId)}</td>
                    <td className="px-4 py-4 text-slate-500">
                      {branchName(request.branchId)} →{" "}
                      {request.toBranchId
                        ? branchName(request.toBranchId)
                        : "ไม่พบข้อมูลปลายทาง"}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      User {request.borrowerId}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {dateFmt(request.createdAt, language)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill status={statusText(request.status)} />
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href="/Borrow"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-semibold hover:bg-slate-50"
                      >
                        <ClipboardCheck size={16} />

                        {translateText("ตรวจสอบคำขอ")}
                      </Link>
                    </td>
                  </tr>
                ))}
                {!latestPending.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      {translateText("ไม่มีคำขอรออนุมัติ")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              {translateText("รายงานและสถิติ")}
            </h2>
            <Link
              href="/reports"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
            >
              <FileBarChart2 size={17} />

              {translateText("เข้าสู่หน้ารายงาน")}
            </Link>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-500">
                {translateText("จำนวน Asset แยกตามสถานะ")}
              </h3>
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  ["พร้อมใช้งาน", ready, "text-emerald-700"],
                  ["กำลังซ่อม", inRepair, "text-amber-700"],
                  ["สถานะอื่น", other, "text-rose-600"],
                ].map(([label, value, color]) => (
                  <div key={String(label)}>
                    <strong className={`block text-2xl font-bold sm:text-3xl ${color}`}>
                      {fmt(Number(value), language)}
                    </strong>
                    <span className="text-sm text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-slate-500">
                {translateText("ผลการตรวจนับทรัพย์สิน")}
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <strong className="block text-3xl font-bold text-indigo-600">
                    {completedInventories}
                  </strong>
                  <span className="text-sm text-slate-500">
                    {translateText("รอบที่เสร็จแล้ว")}
                  </span>
                </div>
                <div>
                  <strong className="block text-3xl font-bold text-amber-600">
                    {unfinishedInventories}
                  </strong>
                  <span className="text-sm text-slate-500">
                    {translateText("รอบที่ต้องติดตาม")}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                {translateText("อ้างอิงรอบตรวจนับ")} {inventorySessions.length}{" "}
                {translateText("รายการที่มีในระบบ")}
              </p>
            </Card>
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2 font-semibold">
                <ChartNoAxesCombined size={18} className="text-indigo-600" />

                {translateText("ประวัติการเคลื่อนย้าย Asset")}
              </div>
              <div className="space-y-3">
                {latestTransfers.length ? (
                  latestTransfers.map((history) => {
                    const asset = assets.find(
                      (item) => item.id === history.assetId,
                    );
                    return (
                      <div
                        key={history.id}
                        className="rounded-lg bg-[#f1f2f7] p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">
                              {history.assetId} ·{" "}
                              {asset?.name ?? "ไม่พบข้อมูลทรัพย์สิน"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {history.description}
                            </p>
                          </div>
                          <StatusPill status={translateText("บันทึกแล้ว")} />
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {dateFmt(history.performedAt, language)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    {translateText(
                      "Error: ไม่มีข้อมูลประวัติการโอนย้ายทรัพย์สินใน Data",
                    )}
                  </p>
                )}
              </div>
              <Link
                href="/transfer_history"
                className="mt-4 inline-block text-sm font-semibold text-indigo-600"
              >
                {translateText("ดูประวัติการเคลื่อนย้ายทั้งหมด")}
              </Link>
            </Card>
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="font-semibold">
                  {translateText("สรุปงานซ่อมบำรุง")}
                </h3>
                
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  [
                    "กำลังซ่อม",
                    repairOpen.filter((item) => item.status === "in_progress")
                      .length,
                    "text-amber-700",
                  ],
                  [
                    "รอตรวจสอบ",
                    repairOpen.filter((item) => item.status === "pending")
                      .length,
                    "text-rose-600",
                  ],
                  [
                    "สาขาที่ติดตาม",
                    new Set(repairOpen.map((item) => item.branchId)).size,
                    "text-indigo-600",
                  ],
                ].map(([label, value, color]) => (
                  <div
                    key={String(label)}
                    className="rounded-lg bg-[#f1f2f7] p-3"
                  >
                    <span className="block text-sm text-slate-500">
                      {label}
                    </span>
                    <strong className={`mt-1 block text-xl ${color}`}>
                      {fmt(Number(value), language)}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-[#f1f2f7] p-3">
                <p className="text-sm font-semibold">
                  {translateText("รายการซ่อมที่ยังเปิดอยู่")}
                </p>
                {repairOpen[0] ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {assetName(repairOpen[0].assetId)} · {repairOpen[0].issue}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    {translateText("ไม่มีรายการซ่อมค้าง")}
                  </p>
                )}
              </div>
            </Card>
          </div>
          <button
            onClick={downloadCsv}
            className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-slate-50"
          >
            <Download size={15} className="mr-2 inline" />

            {translateText("ส่งออก Excel")}
          </button>
        </section>
      </div>
    </div>
  );
}
