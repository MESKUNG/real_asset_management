"use client";

import { tx, useT } from "@/lib/i18n";
// หน้าติดตามการนับของ Admin: ดูความคืบหน้าทุกรอบ เริ่ม/ปิด/ยกเลิกรอบ และส่งออก Excel
import Link from "next/link";
import { useState } from "react";
import type { InventorySessionStatus } from "@/data/inventorySessions";
import { exportExcel } from "@/lib/exportExcel";
import {
  SESSION_STATUS_LABEL,
  cancelSession,
  completeSession,
  formatDateRange,
  formatThaiDate,
  getBranchName,
  getSessionProgress,
  getStaffName,
  resetInventoryStore,
  useCredential,
  useInventoryStore,
  type StoredSession,
} from "@/lib/inventory";
import {
  EmptyState,
  Loading,
  PageHeader,
  ProgressBar,
  StatusPill,
  Toast,
  buttonStyle,
  useToast,
} from "./ui";

type Filter = "all" | InventorySessionStatus;

// รอบที่ต้องสนใจขึ้นก่อน: กำลังนับ → รอเริ่ม → เสร็จสิ้น → ยกเลิก
const STATUS_ORDER: Record<InventorySessionStatus, number> = {
  in_progress: 0,
  planned: 1,
  completed: 2,
  cancelled: 3,
};

const FILTERS: Filter[] = ["all", "in_progress", "planned", "completed", "cancelled"];

export default function AdminTracking() {
  useT();
  const { credential } = useCredential();
  const { sessions, checks, ready } = useInventoryStore();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");

  if (!ready) return <Loading />;

  const sorted = [...sessions].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.startDate.localeCompare(b.startDate),
  );
  const visible = filter === "all" ? sorted : sorted.filter((s) => s.status === filter);
  const countOf = (f: Filter) =>
    f === "all" ? sessions.length : sessions.filter((s) => s.status === f).length;

  const activeProgress = sessions
    .filter((s) => s.status === "in_progress")
    .map((s) => getSessionProgress(s, checks));
  const activeChecked = activeProgress.reduce((sum, p) => sum + p.checked, 0);
  const activeTotal = activeProgress.reduce((sum, p) => sum + p.total, 0);
  const issueCount = checks.filter((c) => c.result !== "found").length;


  const handleCancel = (session: StoredSession) => {
    if (!window.confirm(tx("ยกเลิกรอบ {0} ใช่ไหม?", session.id))) return;
    toast.show(cancelSession(session.id) ? tx("ยกเลิกรอบ {0} แล้ว", session.id) : tx("ยกเลิกไม่สำเร็จ"));
  };

  const handleComplete = (session: StoredSession) => {
    if (!credential) return;
    const progress = getSessionProgress(session, checks);
    const remaining = progress.total - progress.checked;
    const message =
      remaining > 0
        ? tx("ยังเหลือ {0} รายการที่ไม่ได้สแกน ระบบจะบันทึกว่า \"ไม่พบ\" ยืนยันปิดรอบไหม?", remaining)
        : tx("ปิดรอบ {0} ใช่ไหม?", session.id);
    if (!window.confirm(message)) return;
    toast.show(completeSession(session.id, credential) ? tx("ปิดรอบ {0} แล้ว", session.id) : tx("ปิดรอบไม่สำเร็จ"));
  };

  const handleExport = async () => {
    const rows = sorted.map((s) => {
      const p = getSessionProgress(s, checks);
      return {
        รหัสรอบ: s.id,
        ชื่อรอบ: s.name,
        สาขา: getBranchName(s.branchId),
        วันเริ่ม: formatThaiDate(s.startDate),
        วันสิ้นสุด: formatThaiDate(s.endDate),
        ผู้รับผิดชอบ: s.assigneeId ? getStaffName(s.assigneeId) : "-",
        สถานะ: SESSION_STATUS_LABEL[s.status],
        ตรวจแล้ว: p.checked,
        ทั้งหมด: p.total,
        "ความคืบหน้า (%)": p.percent,
        ชำรุด: p.damaged,
        สูญหาย: p.lost,
      };
    });
    await exportExcel(tx("ติดตามการตรวจนับ"), [{ name: tx("รอบตรวจนับ"), rows }]);
    toast.show(tx("ดาวน์โหลดไฟล์ Excel แล้ว"));
  };

  const handleReset = () => {
    if (!window.confirm(tx("ล้างข้อมูลที่บันทึกไว้ทั้งหมด แล้วกลับไปใช้ข้อมูลตั้งต้นใช่ไหม?"))) return;
    resetInventoryStore();
    toast.show(tx("กลับไปใช้ข้อมูลตั้งต้นแล้ว"));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <Toast message={toast.message} />
      <PageHeader
        title={tx("ติดตามการนับ / มอบหมายงาน")}
        subtitle={tx("ดูความคืบหน้าของทุกรอบตรวจนับ")}
        actions={
          <>
            <button type="button" onClick={handleExport} className={buttonStyle.secondary}>
              {tx("ส่งออก Excel")}
            </button>
            <Link href="/inventories/schedule" className={buttonStyle.primary}>
              {tx("+ มอบหมายรอบตรวจนับ")}
            </Link>
          </>
        }
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-5 lg:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label={tx("กำลังนับ")} value={tx("{0} รอบ", countOf("in_progress"))} note={tx("สแกนแล้ว {0}/{1} ชิ้น", activeChecked, activeTotal)} />
          <StatCard label={tx("รอเริ่ม")} value={tx("{0} รอบ", countOf("planned"))} note={tx("เริ่มเองเมื่อถึงวันตรวจ")} />
          <StatCard label={tx("เสร็จสิ้น")} value={tx("{0} รอบ", countOf("completed"))} note={tx("ปิดรอบแล้ว")} />
          <StatCard label={tx("พบปัญหา")} value={tx("{0} รายการ", issueCount)} note={tx("ชำรุด / สูญหาย")} tone="warn" />
        </div>

        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`min-h-11 rounded-full px-4 text-base font-semibold ${
                  filter === f
                    ? "bg-blue-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700"
                }`}
              >
                {f === "all" ? tx("ทั้งหมด") : SESSION_STATUS_LABEL[f]} ({countOf(f)})
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState text={tx("ไม่มีรอบตรวจนับในสถานะนี้")} />
        ) : (
          <ul className="space-y-3">
            {visible.map((session) => {
              const p = getSessionProgress(session, checks);
              return (
                <li key={session.id} className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-500">{session.id}</p>
                      <h3 className="text-lg font-bold text-slate-900">{session.name}</h3>
                      <p className="text-base text-slate-600">
                        {getBranchName(session.branchId)} ·{" "}
                        {formatDateRange(session.startDate, session.endDate)}
                        {session.assigneeId ? tx(" · ผู้รับผิดชอบ {0}", getStaffName(session.assigneeId)) : ""}
                      </p>
                    </div>
                    <StatusPill status={session.status} />
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar percent={p.percent} />
                    </div>
                    <span className="shrink-0 text-base font-semibold">
                      {p.checked}/{p.total} ({p.percent}%)
                    </span>
                  </div>

                  {(p.damaged > 0 || p.lost > 0) && (
                    <p className="mt-2 text-sm font-semibold text-amber-700">
                      {tx("ชำรุด")} {p.damaged} {tx("· สูญหาย")} {p.lost}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/inventories/audit?session=${session.id}`} className={buttonStyle.secondary}>
                      {tx("ดูรายละเอียด")}
                    </Link>
                    {session.status === "planned" && (
                      <>
                        <span className="inline-flex min-h-11 items-center rounded-xl bg-violet-50 px-4 text-base font-semibold text-violet-800">
                          {tx("เริ่มตรวจนับอัตโนมัติ")} {formatThaiDate(session.startDate)}
                        </span>
                        <button type="button" onClick={() => handleCancel(session)} className={buttonStyle.danger}>
                          {tx("ยกเลิกรอบ")}
                        </button>
                      </>
                    )}
                    {session.status === "in_progress" && (
                      <button type="button" onClick={() => handleComplete(session)} className={buttonStyle.primary}>
                        {tx("ปิดรอบ")}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-slate-200 pt-4 text-right">
          <button type="button" onClick={handleReset} className="text-sm text-slate-500 underline">
            {tx("รีเซ็ตข้อมูลตัวอย่าง (สำหรับสาธิต)")}
          </button>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "warn";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${tone === "warn" ? "text-amber-600" : "text-slate-900"}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  );
}
