"use client";

// หน้าสรุปรายงาน: ตัวเลขทุกจุดคำนวณจากไฟล์ใน data/ และผลตรวจนับที่บันทึกไว้
import { useState } from "react";
import { assets, type AssetStatus } from "@/data/asset";
import { branches } from "@/data/branches";
import { categories } from "@/data/catagories";
import { repairRequests, type RepairStatus } from "@/data/repairRequests";
import { borrowRequests, type BorrowRequestType, type BorrowStatus } from "@/data/borrowRequests";
import { assetHistories } from "@/data/assetHistories";
import { exportExcel } from "@/lib/exportExcel";
import {
  ASSET_STATUS_LABEL,
  RESULT_LABEL,
  SESSION_STATUS_LABEL,
  findAsset,
  formatBaht,
  formatDateRange,
  formatThaiDate,
  formatThaiDateTime,
  getBranchName,
  getCategoryName,
  getCheckerName,
  getSessionProgress,
  getStaffName,
  getVendorName,
  toDateValue,
  useInventoryStore,
} from "@/lib/inventory";
import {
  EmptyState,
  Loading,
  PageHeader,
  ProgressBar,
  RoleGate,
  StatusPill,
  Toast,
  buttonStyle,
  useToast,
} from "../inventories/_components/ui";

const ASSET_STATUSES = Object.keys(ASSET_STATUS_LABEL) as AssetStatus[];

const ASSET_STATUS_COLOR: Record<AssetStatus, string> = {
  available: "bg-emerald-500",
  borrowed: "bg-blue-500",
  repair: "bg-amber-500",
  damaged: "bg-rose-500",
  disposed: "bg-slate-400",
};

const REPAIR_STATUS_LABEL: Record<RepairStatus, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังซ่อม",
  completed: "ซ่อมเสร็จ",
  rejected: "ไม่อนุมัติ",
};

const BORROW_STATUS_LABEL: Record<BorrowStatus, string> = {
  pending: "รออนุมัติ",
  revision: "ส่งกลับแก้ไข",
  approved: "อนุมัติแล้ว",
  returned: "คืนแล้ว",
  rejected: "ไม่อนุมัติ",
  overdue: "เกินกำหนดคืน",
};

const BORROW_TYPE_LABEL: Record<BorrowRequestType, string> = {
  withdraw: "เบิก",
  return: "คืน",
  transfer: "โอนย้าย",
};

// รายการยาวแสดงทีละ 10 แถว กด "แสดงเพิ่ม" เพื่อดูต่อ
const LIST_STEP = 10;

// ค่าซ่อม: ใช้ค่าจริงถ้ามี ถ้ายังไม่มีใช้ค่าประเมิน
function repairCost(r: { actualCost: number | null; estimatedCost: number | null }) {
  return r.actualCost ?? r.estimatedCost ?? 0;
}

function assetName(id: string) {
  return findAsset(id)?.name ?? id;
}

type Activity = { id: string; at: string; who: string; text: string; kind: string; branchId: string };

export default function ReportsPage() {
  return (
    <RoleGate allow={["user", "admin", "president"]}>
      <ReportContent />
    </RoleGate>
  );
}

function ReportContent() {
  const { sessions, checks, ready } = useInventoryStore();
  const toast = useToast();
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AssetStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [assetLimit, setAssetLimit] = useState(LIST_STEP);
  const [repairLimit, setRepairLimit] = useState(LIST_STEP);
  const [borrowLimit, setBorrowLimit] = useState(LIST_STEP);

  if (!ready) return <Loading />;

  // ตัวกรองทั้ง 4 ช่องต้องผ่านพร้อมกัน
  const q = query.trim().toLowerCase();
  const filtered = assets.filter(
    (a) =>
      (branchFilter === "all" || a.branchId === branchFilter) &&
      (statusFilter === "all" || a.status === statusFilter) &&
      (categoryFilter === "all" || a.category === categoryFilter) &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q)),
  );

  const totalValue = filtered.reduce((sum, a) => sum + a.purchasePrice, 0);
  const statusCounts = ASSET_STATUSES.map((status) => ({
    status,
    count: filtered.filter((a) => a.status === status).length,
  }));
  const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s.count));

  const branchSummary = branches.map((b) => {
    const list = filtered.filter((a) => a.branchId === b.id);
    return { branch: b, count: list.length, value: list.reduce((sum, a) => sum + a.purchasePrice, 0) };
  });

  // รอบตรวจนับและกิจกรรมล่าสุดกรองตามสาขาเท่านั้น
  const reportSessions = sessions
    .filter((s) => branchFilter === "all" || s.branchId === branchFilter)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  const activeSessions = reportSessions.filter((s) => s.status === "in_progress");
  const activeProgress = activeSessions.map((s) => getSessionProgress(s, checks));
  const activeChecked = activeProgress.reduce((sum, p) => sum + p.checked, 0);
  const activeTotal = activeProgress.reduce((sum, p) => sum + p.total, 0);

  // งานซ่อมและการยืมจากข้อมูลกลางของกลุ่ม กรองตามสาขา
  const inBranch = (branchId: string) => branchFilter === "all" || branchId === branchFilter;
  const repairs = repairRequests
    .filter((r) => inBranch(r.branchId))
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  const openRepairs = repairs.filter((r) => r.status === "pending" || r.status === "in_progress");
  const repairTotal = repairs
    .filter((r) => r.status === "completed" || r.status === "in_progress")
    .reduce((sum, r) => sum + repairCost(r), 0);
  const borrows = borrowRequests
    .filter((r) => inBranch(r.branchId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // กำลังเบิกอยู่ = ใบเบิกที่อนุมัติแล้วหรือเกินกำหนดคืน
  const activeBorrows = borrows.filter(
    (r) => r.type === "withdraw" && (r.status === "approved" || r.status === "overdue"),
  );
  const overdueBorrows = borrows.filter((r) => r.status === "overdue");

  // รวมกิจกรรมจากทุกไฟล์ข้อมูล แล้วเรียงจากล่าสุด
  const activities: Activity[] = [
    ...assetHistories.map((h) => ({
      id: h.id,
      at: h.performedAt,
      who: getStaffName(h.performedBy),
      text: `${h.description} (${assetName(h.assetId)})`,
      kind: "ประวัติ",
      branchId: findAsset(h.assetId)?.branchId ?? "",
    })),
    ...checks.map((c) => ({
      id: c.id,
      at: c.checkedAt,
      who: getCheckerName(c),
      text: `ตรวจนับ ${assetName(c.assetId)}: ${RESULT_LABEL[c.result]}`,
      kind: "ตรวจนับ",
      branchId: c.branchId,
    })),
    ...repairRequests.map((r) => ({
      id: r.id,
      at: r.reportedAt,
      who: getStaffName(r.reporterId),
      text: `แจ้งซ่อม ${assetName(r.assetId)}: ${r.issue}`,
      kind: "ซ่อม",
      branchId: r.branchId,
    })),
    ...borrowRequests.map((r) => ({
      id: r.id,
      at: r.createdAt,
      who: getStaffName(r.borrowerId),
      text: `ขอ${BORROW_TYPE_LABEL[r.type]} ${assetName(r.assetId)}: ${r.purpose}`,
      kind: "ยืม",
      branchId: r.branchId,
    })),
  ];
  const latestActivities = activities
    .filter((a) => inBranch(a.branchId))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);

  const handleExport = async () => {
    await exportExcel(`รายงานทรัพย์สิน_${toDateValue(new Date())}`, [
      {
        name: "ทรัพย์สิน",
        rows: filtered.map((a) => ({
          รหัส: a.id,
          ชื่อ: a.name,
          หมวดหมู่: getCategoryName(a.category),
          ยี่ห้อ: a.brand,
          รุ่น: a.model,
          "Serial Number": a.serialNumber,
          สาขา: getBranchName(a.branchId),
          สถานะ: ASSET_STATUS_LABEL[a.status],
          "ราคาซื้อ (บาท)": a.purchasePrice,
          วันที่ซื้อ: formatThaiDate(a.purchaseDate),
          หมดประกัน: formatThaiDate(a.warrantyEndDate),
        })),
      },
      {
        name: "สรุปตามสาขา",
        rows: branchSummary.map((r) => ({ สาขา: r.branch.name, "จำนวน (ชิ้น)": r.count, "มูลค่า (บาท)": r.value })),
      },
      {
        name: "รอบตรวจนับ",
        rows: reportSessions.map((s) => {
          const p = getSessionProgress(s, checks);
          return {
            รหัสรอบ: s.id,
            ชื่อรอบ: s.name,
            สาขา: getBranchName(s.branchId),
            ช่วงวันที่: formatDateRange(s.startDate, s.endDate),
            สถานะ: SESSION_STATUS_LABEL[s.status],
            ตรวจแล้ว: p.checked,
            ทั้งหมด: p.total,
            ชำรุด: p.damaged,
            ไม่พบ: p.missing,
            ไม่ตรงสาขา: p.mismatch,
          };
        }),
      },
      {
        name: "ผลตรวจนับ",
        rows: checks
          .filter((c) => branchFilter === "all" || c.branchId === branchFilter)
          .map((c) => ({
            รหัสรอบ: c.sessionId,
            รหัสทรัพย์สิน: c.assetId,
            ชื่อทรัพย์สิน: findAsset(c.assetId)?.name ?? "-",
            ผลตรวจ: RESULT_LABEL[c.result],
            ผู้ตรวจ: getCheckerName(c),
            เวลา: formatThaiDateTime(c.checkedAt),
            หมายเหตุ: c.note,
          })),
      },
      {
        name: "งานซ่อม",
        rows: repairs.map((r) => ({
          เลขที่: r.id,
          ทรัพย์สิน: `${r.assetId} ${assetName(r.assetId)}`,
          อาการ: r.issue,
          ผู้แจ้ง: getStaffName(r.reporterId),
          ร้านซ่อม: getVendorName(r.vendorId),
          สถานะ: REPAIR_STATUS_LABEL[r.status],
          วันที่แจ้ง: formatThaiDate(r.reportedAt),
          "ค่าซ่อม (บาท)": repairCost(r),
        })),
      },
      {
        name: "เบิก-คืน-โอนย้าย",
        rows: borrows.map((r) => ({
          เลขที่: r.id,
          ประเภท: BORROW_TYPE_LABEL[r.type],
          ทรัพย์สิน: `${r.assetId} ${assetName(r.assetId)}`,
          ผู้ขอ: getStaffName(r.borrowerId),
          วัตถุประสงค์: r.purpose,
          วันที่: formatThaiDate(r.borrowDate || r.expectedReturnDate),
          สถานะ: BORROW_STATUS_LABEL[r.status],
        })),
      },
    ]);
    toast.show("ดาวน์โหลดรายงาน Excel แล้ว (6 ชีต)");
  };

  const selectStyle =
    "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <Toast message={toast.message} />
      <PageHeader
        title="สรุปรายงานทั้งหมด"
        subtitle={`ข้อมูล ณ วันที่ ${formatThaiDate(toDateValue(new Date()))}`}
        actions={
          <button type="button" onClick={handleExport} className={buttonStyle.primary}>
            ส่งออก Excel
          </button>
        }
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-5 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select aria-label="กรองตามสาขา" value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setAssetLimit(LIST_STEP); }} className={selectStyle}>
            <option value="all">ทุกสาขา</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            aria-label="กรองตามสถานะ"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | AssetStatus)}
            className={selectStyle}
          >
            <option value="all">ทุกสถานะ</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select aria-label="กรองตามหมวดหมู่" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setAssetLimit(LIST_STEP); }} className={selectStyle}>
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="search"
            aria-label="ค้นหาทรัพย์สิน"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setAssetLimit(LIST_STEP); }}
            placeholder="ค้นหาชื่อหรือรหัส"
            className={selectStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="ทรัพย์สินทั้งหมด" value={`${filtered.length} ชิ้น`} note={`จากทั้งระบบ ${assets.length} ชิ้น`} />
          <Kpi label="มูลค่ารวม (ราคาซื้อ)" value={formatBaht(totalValue)} note="รวมตามตัวกรอง" />
          <Kpi
            label="งานซ่อมที่ยังไม่เสร็จ"
            value={`${openRepairs.length} งาน`}
            note={`ค่าซ่อมรวม ${formatBaht(repairTotal)}`}
            tone="warn"
          />
          <Kpi
            label="ตรวจนับรอบปัจจุบัน"
            value={activeTotal > 0 ? `${activeChecked}/${activeTotal}` : "-"}
            note={`${activeSessions.length} รอบกำลังนับ`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">จำนวนตามสถานะ</h2>
            <ul className="space-y-3">
              {statusCounts.map(({ status, count }) => (
                <li key={status} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-base">
                  <span>{ASSET_STATUS_LABEL[status]}</span>
                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${ASSET_STATUS_COLOR[status]}`} style={{ width: `${(count / maxStatusCount) * 100}%` }} />
                  </div>
                  <span className="text-right font-bold">{count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">สรุปตามสาขา</h2>
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                  <th className="py-2 font-semibold">สาขา</th>
                  <th className="py-2 text-right font-semibold">จำนวน</th>
                  <th className="py-2 text-right font-semibold">มูลค่า</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchSummary.map((r) => (
                  <tr key={r.branch.id}>
                    <td className="py-2">{r.branch.name}</td>
                    <td className="py-2 text-right">{r.count}</td>
                    <td className="py-2 text-right font-semibold">{formatBaht(r.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold">รายการทรัพย์สิน ({filtered.length})</h2>
          {filtered.length === 0 ? (
            <EmptyState text="ไม่พบทรัพย์สินที่ตรงกับตัวกรอง" />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                      <th className="py-2 font-semibold">รหัส</th>
                      <th className="py-2 font-semibold">ชื่อ</th>
                      <th className="py-2 font-semibold">หมวดหมู่</th>
                      <th className="py-2 font-semibold">สาขา</th>
                      <th className="py-2 font-semibold">สถานะ</th>
                      <th className="py-2 text-right font-semibold">ราคาซื้อ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.slice(0, assetLimit).map((a) => (
                      <tr key={a.id}>
                        <td className="py-3 font-semibold">{a.id}</td>
                        <td className="py-3">{a.name}</td>
                        <td className="py-3 text-slate-600">{getCategoryName(a.category)}</td>
                        <td className="py-3 text-slate-600">{getBranchName(a.branchId)}</td>
                        <td className="py-3">{ASSET_STATUS_LABEL[a.status]}</td>
                        <td className="py-3 text-right">{formatBaht(a.purchasePrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-slate-100 lg:hidden">
                {filtered.slice(0, assetLimit).map((a) => (
                  <li key={a.id} className="py-3">
                    <div className="flex justify-between gap-3">
                      <p className="text-base font-semibold">{a.name}</p>
                      <p className="shrink-0 text-base">{formatBaht(a.purchasePrice)}</p>
                    </div>
                    <p className="text-sm text-slate-600">
                      {a.id} · {getBranchName(a.branchId)} · {ASSET_STATUS_LABEL[a.status]}
                    </p>
                  </li>
                ))}
              </ul>
              <ShowMore shown={assetLimit} total={filtered.length} onClick={() => setAssetLimit((n) => n + LIST_STEP)} />
            </>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">ผลการตรวจนับแต่ละรอบ</h2>
            {reportSessions.length === 0 ? (
              <EmptyState text="ไม่มีรอบตรวจนับของสาขานี้" />
            ) : (
              <ul className="space-y-4">
                {reportSessions.map((s) => {
                  const p = getSessionProgress(s, checks);
                  return (
                    <li key={s.id}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-base font-semibold">{s.name}</p>
                          <p className="text-sm text-slate-500">
                            {s.id} · {formatDateRange(s.startDate, s.endDate)} · ชำรุด {p.damaged} · ไม่พบ {p.missing}
                          </p>
                        </div>
                        <StatusPill status={s.status} />
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1">
                          <ProgressBar percent={p.percent} />
                        </div>
                        <span className="text-sm font-semibold">
                          {p.checked}/{p.total}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">กิจกรรมล่าสุด</h2>
            {latestActivities.length === 0 ? (
              <EmptyState text="ยังไม่มีกิจกรรม" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {latestActivities.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-base">
                        <strong>{a.who}</strong> {a.text}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatThaiDateTime(a.at)} · {a.id}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {a.kind}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-1 text-lg font-bold">งานซ่อม ({repairs.length})</h2>
            <p className="mb-4 text-sm text-slate-500">
              ยังไม่เสร็จ {openRepairs.length} งาน · ค่าซ่อมรวม {formatBaht(repairTotal)}
            </p>
            {repairs.length === 0 ? (
              <EmptyState text="ไม่มีงานซ่อมของสาขานี้" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {repairs.slice(0, repairLimit).map((r) => (
                  <li key={r.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-semibold">{assetName(r.assetId)}</p>
                      <span className="shrink-0 text-base font-semibold">
                        {repairCost(r) > 0 ? formatBaht(repairCost(r)) : "-"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{r.issue}</p>
                    <p className="text-sm text-slate-500">
                      {r.id} · {getVendorName(r.vendorId)} · {REPAIR_STATUS_LABEL[r.status]}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <ShowMore shown={repairLimit} total={repairs.length} onClick={() => setRepairLimit((n) => n + LIST_STEP)} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-1 text-lg font-bold">เบิก / คืน / โอนย้าย ({borrows.length})</h2>
            <p className="mb-4 text-sm text-slate-500">
              กำลังเบิกอยู่ {activeBorrows.length} รายการ · เกินกำหนดคืน {overdueBorrows.length} รายการ
            </p>
            {borrows.length === 0 ? (
              <EmptyState text="ไม่มีรายการของสาขานี้" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {borrows.slice(0, borrowLimit).map((r) => (
                  <li key={r.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-semibold">
                        {BORROW_TYPE_LABEL[r.type]} {assetName(r.assetId)}
                      </p>
                      <span
                        className={`shrink-0 text-sm font-semibold ${r.status === "overdue" ? "text-rose-700" : "text-slate-700"}`}
                      >
                        {BORROW_STATUS_LABEL[r.status]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {getStaffName(r.borrowerId)} · {formatThaiDate(r.borrowDate || r.expectedReturnDate)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {r.id} · {r.purpose}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <ShowMore shown={borrowLimit} total={borrows.length} onClick={() => setBorrowLimit((n) => n + LIST_STEP)} />
          </section>
        </div>
      </main>
    </div>
  );
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "warn" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold lg:text-3xl ${tone === "warn" ? "text-amber-600" : "text-slate-900"}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function ShowMore({ shown, total, onClick }: { shown: number; total: number; onClick: () => void }) {
  if (shown >= total) return null;
  return (
    <button type="button" onClick={onClick} className={`${buttonStyle.secondary} mt-3 w-full`}>
      แสดงเพิ่ม (เหลืออีก {total - shown} รายการ)
    </button>
  );
}
