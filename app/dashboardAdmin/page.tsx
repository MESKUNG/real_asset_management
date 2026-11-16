"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  CircleCheck,
  ClipboardList,
  Search,
  Wrench,
} from "lucide-react";
import { assets } from "@/data/asset";
import { branches } from "@/data/branches";
import { borrowRequests } from "@/data/borrowRequests";
import { inventorySessions } from "@/data/inventorySessions";
import { repairRequests } from "@/data/repairRequests";
import { assetHistories } from "@/data/assetHistories";

type Task = {
  id: string;
  type: string;
  asset: string;
  assetId?: string;
  branchId: string;
  date: string;
  status: string;
  href: string;
  category: "repair" | "transfer" | "inventory" | "borrow";
};
const branchName = (id: string) =>
  branches.find((item) => item.id === id)?.name ?? "Error: ไม่พบข้อมูลสาขา";
const assetName = (id: string) =>
  assets.find((item) => item.id === id)?.name ?? "Error: ไม่พบข้อมูล Asset";
const dateText = (date: string) =>
  date
    ? new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(date))
    : "Error: ไม่มีวันที่";
const statusNames: Record<string, string> = {
  pending: "รอดำเนินการ",
  revision: "รอแก้ไข",
  approved: "รออนุมัติ",
  in_progress: "กำลังดำเนินการ",
  planned: "รอตรวจนับ",
};
const categoryColors: Record<Task["category"], string> = {        //สีประเภทตาราง
  repair: "bg-amber-50 text-amber-600",
  transfer: "bg-indigo-50 text-indigo-600",
  borrow: "bg-blue-50 text-blue-600",
  inventory: "bg-emerald-50 text-emerald-600",
};

export default function Page() {
  const [type, setType] = useState("all");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const tasks = useMemo<Task[]>(
    () =>
      [
        ...repairRequests
          .filter(
            (item) =>
              item.status === "pending" || item.status === "in_progress",
          )
          .map((item) => ({
            id: item.id,
            type: "ซ่อมบำรุง",
            asset: assetName(item.assetId),
            assetId: item.assetId,
            branchId: item.branchId,
            date: item.reportedAt,
            status: item.status,
            href: "/repairs",
            category: "repair" as const,
          })),
        ...borrowRequests
          .filter(
            (item) => item.status === "pending" || item.status === "revision",
          )
          .map((item) => ({
            id: item.id,
            type:
              item.type === "transfer"
                ? "โอนย้าย"
                : item.type === "return"
                  ? "คืน Asset"
                  : "เบิก Asset",
            asset: assetName(item.assetId),
            assetId: item.assetId,
            branchId: item.branchId,
            date: item.createdAt,
            status: item.status,
            href: "/Borrow",
            category:
              item.type === "transfer"
                ? ("transfer" as const)
                : ("borrow" as const),
          })),
        ...inventorySessions
          .filter(
            (item) =>
              item.status === "planned" || item.status === "in_progress",
          )
          .map((item) => ({
            id: item.id,
            type: "ตรวจนับ",
            asset: item.name,
            branchId: item.branchId,
            date: item.endDate,
            status: item.status,
            href: "/inventories",
            category: "inventory" as const,
          })),
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [],
  );
  const matching = tasks.filter(
    (task) =>
      (type === "all" || task.category === type) &&
      (branch === "all" || task.branchId === branch) &&
      (status === "all" || task.status === status) &&
      `${task.id} ${task.type} ${task.asset} ${branchName(task.branchId)} ${task.date} ${dateText(task.date)}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
  const visible = matching.slice((page - 1) * pageSize, page * pageSize);
  const openRepairs = repairRequests.filter(
    (item) => item.status === "pending" || item.status === "in_progress",
  );
  const transferPending = borrowRequests.filter(
    (item) =>
      item.type === "transfer" &&
      (item.status === "pending" || item.status === "revision"),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const upcoming = inventorySessions
    .filter(
      (item) =>
        (item.status === "planned" || item.status === "in_progress") &&
        item.endDate >= todayKey,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);
  const repairAssets = [
    ...new Set(openRepairs.map((item) => item.assetId)),
  ].slice(0, 2);
  const recentRepairs = repairRequests
    .slice()
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
    .slice(0, 2);
  const recentTransfers = assetHistories
    .filter((item) => item.action === "transferred")
    .slice()
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-[#f1f2f7] px-4 py-7 text-[#1c2740] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-7">
        <section>
          <h1 className="mb-4 text-xl font-bold">สรุปงานที่ต้องติดตาม</h1>
          <div className="grid gap-4 md:grid-cols-3">
            <Summary
              title="คำร้องแจ้งซ่อมที่ต้องติดตาม"
              value={openRepairs.length}
              note="คำร้องที่รอดำเนินการหรือกำลังซ่อม"
              icon={<Wrench />}
              color="text-amber-600"
            />
            <Summary
              title="คำร้องเปลี่ยนการโอนย้าย"
              value={transferPending.length}
              note="คำขอโอนย้ายที่รอดำเนินการ"
              icon={<CircleCheck />}
              color="text-indigo-600"
            />
            <Summary
              title="รอบตรวจนับที่ใกล้ที่สุด"
              value={upcoming.length}
              note="แสดงสูงสุด 3 รอบ · เรียงตามวันเริ่มต้น"
              icon={<CalendarDays />}
              color="text-emerald-600"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">งานที่รอดำเนินการ</h2>
          <div className="mb-3 flex gap-2">
            <Filter icon={<ClipboardList />}>
              <select
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm text-slate-600 outline-none focus:border-indigo-400"
                aria-label="ประเภทงาน"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">ประเภทงานทั้งหมด</option>
                <option value="repair">ซ่อมบำรุง</option>
                <option value="transfer">โอนย้าย</option>
                <option value="borrow">เบิก/คืน Asset</option>
                <option value="inventory">ตรวจนับ</option>
              </select>
            </Filter>
            <Filter icon={<span className="text-sm">▦</span>}>
              <select
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm text-slate-600 outline-none focus:border-indigo-400"
                aria-label="สาขา"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">ทุกสาขา</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Filter>
            <Filter icon={<CircleCheck />}>
              <select
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm text-slate-600 outline-none focus:border-indigo-400"
                aria-label="สถานะ"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">ทุกสถานะ</option>
                {[...new Set(tasks.map((item) => item.status))].map((s) => (
                  <option key={s} value={s}>
                    {statusNames[s] ?? s}
                  </option>
                ))}
              </select>
            </Filter>
            <label className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาวันที่ / งาน / Asset"
                className="h-full min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
              />
            </label>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f1f2f7] text-xs text-slate-500">
                <tr>
                  {[
                    "เลขที่",
                    "ประเภทงาน",
                    "Asset",
                    "สาขา",
                    "วันที่",
                    "สถานะ",
                    "ดำเนินการ",
                  ].map((label) => (
                    <th key={label} className="px-4 py-3 font-semibold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((task) => (
                  <tr
                    key={`${task.category}-${task.id}`}
                    className="border-t border-slate-200"
                  >
                    <td className="px-4 py-4 font-medium">{task.id}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${categoryColors[task.category]}`}
                      >
                        {task.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>{task.asset}</div>
                      {task.assetId && (
                        <div className="text-xs text-slate-400">
                          {task.assetId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {branchName(task.branchId)}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {dateText(task.date)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                        ● {statusNames[task.status] ?? "Error: ไม่มีสถานะ"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={task.href}
                        className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                      >
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-9 text-center text-slate-500"
                    >
                      ไม่พบงานตามตัวกรอง
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                แสดง {matching.length ? (page - 1) * pageSize + 1 : 0}–
                {Math.min(page * pageSize, matching.length)} จาก {matching.length}{" "}
                งาน
              </span>
              <label className="flex items-center gap-2">
                รายการต่อหน้า
                <select
                  aria-label="จำนวนรายการต่อหน้า"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-indigo-400"
                >
                  {[5, 10, 15, 20].map((size) => (
                    <option key={size} value={size}>
                      {size} รายการ
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded px-2 py-1 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded px-2.5 py-1 ${page === n ? "bg-violet-100 text-violet-700" : "hover:bg-white"}`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded px-2 py-1 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">สถานะการซ่อมบำรุง & Asset</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="รายการ Asset ที่อยู่ระหว่างซ่อม">
              {repairAssets.length ? (
                repairAssets.map((id) => (
                  <InfoLine
                    key={id}
                    left={assetName(id)}
                    leftId={id}
                    right={
                      openRepairs.find((item) => item.assetId === id)
                        ?.status === "in_progress"
                        ? "กำลังซ่อม"
                        : "รอดำเนินการ"
                    }
                    accent
                  />
                ))
              ) : (
                <EmptyText>ไม่มีรายการซ่อมที่กำลังดำเนินการ</EmptyText>
              )}
            </InfoCard>
            <InfoCard title="ประวัติการแจ้งซ่อมล่าสุด">
              {recentRepairs.map((item) => (
                <InfoLine
                  key={item.id}
                  left={assetName(item.assetId)}
                  leftId={item.assetId}
                  right={dateText(item.reportedAt)}
                />
              ))}
            </InfoCard>
            <InfoCard title="รอบตรวจนับที่ใกล้ที่สุด">
              {upcoming.length ? (
                upcoming.map((item) => (
                  <InfoLine
                    key={item.id}
                    left={branchName(item.branchId)}
                    right={dateText(item.startDate)}
                    accent
                  />
                ))
              ) : (
                <EmptyText>ไม่มีรอบตรวจนับที่กำลังดำเนินการหรือวางแผนไว้</EmptyText>
              )}
            </InfoCard>
            <InfoCard title="รายการเปลี่ยนสาขาล่าสุด">
              {recentTransfers.length ? (
                recentTransfers.map((item) => (
                  <InfoLine
                    key={item.id}
                    left={assetName(item.assetId)}
                    leftId={item.assetId}
                    right={`${branchName(item.oldValue ?? "")} → ${branchName(item.newValue ?? "")}`}
                    accent
                  />
                ))
              ) : (
                <EmptyText>ไม่มีข้อมูลประวัติการโอนย้าย</EmptyText>
              )}
            </InfoCard>
          </div>
        </section>
      </div>
    </main>
  );
}

function Summary({
  title,
  value,
  note,
  icon,
  color,
}: {
  title: string;
  value: number;
  note: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex justify-between text-sm font-semibold text-slate-500">
        <span>{title}</span>
        <span className={color}>{icon}</span>
      </div>
      <strong className="mt-4 block text-3xl">{value}</strong>
      <p className={`mt-3 text-xs ${color}`}>{note}</p>
    </article>
  );
}
function Filter({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <label className="relative flex items-center">
      <span className="pointer-events-none absolute left-3 text-slate-500">
        {icon}
      </span>
      <span className="pointer-events-none absolute right-3 text-slate-500">
        <ChevronDown size={16} />
      </span>
      {children}
    </label>
  );
}
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-sm text-slate-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </article>
  );
}
function InfoLine({
  left,
  leftId,
  right,
  accent = false,
}: {
  left: string;
  leftId?: string;
  right: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="truncate">
        {left}
        {leftId && (
          <span className="ml-1 text-xs text-slate-400">{leftId}</span>
        )}
      </span>
      <span
        className={`text-right text-xs ${accent ? "text-amber-700" : "text-slate-500"}`}
      >
        {right}
      </span>
    </div>
  );
}
function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}
