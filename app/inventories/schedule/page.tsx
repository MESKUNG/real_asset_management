"use client";

// หน้ามอบหมายรอบตรวจนับ (Admin): เลือกสาขา วันที่ และผู้รับผิดชอบ
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { assets } from "@/data/asset";
import { branches } from "@/data/branches";
import {
  createSession,
  deleteSession,
  formatDateRange,
  getBranchName,
  getStaffName,
  toDateValue,
  useCredential,
  useInventoryStore,
} from "@/lib/inventory";
import { EmptyState, Loading, PageHeader, RoleGate, Toast, buttonStyle, useToast } from "../_components/ui";

const activeBranches = branches.filter((b) => b.status === "active");

export default function SchedulePage() {
  return (
    <RoleGate allow={["admin"]}>
      <ScheduleForm />
    </RoleGate>
  );
}

function ScheduleForm() {
  const { credential } = useCredential();
  const { sessions, ready } = useInventoryStore();
  const toast = useToast();

  const [today] = useState(() => toDateValue(new Date()));
  const [branchId, setBranchId] = useState(activeBranches[0]?.id ?? "");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [assigneeId, setAssigneeId] = useState(0);
  const [name, setName] = useState("");

  if (!ready) return <Loading />;

  const branchName = getBranchName(branchId);
  const branchAssets = assets.filter((a) => a.branchId === branchId && a.status !== "disposed");
  const assetCount = branchAssets.length;
  // ผู้รับผิดชอบเลือกได้จากพนักงานที่ดูแลทรัพย์สินของสาขานั้น (responsiblePersonId ใน asset.ts)
  const staffIds = [...new Set(branchAssets.map((a) => a.responsiblePersonId))].sort((a, b) => a - b);
  const selectedAssignee = staffIds.includes(assigneeId) ? assigneeId : staffIds[0];

  // สาขาเดียวกันห้ามมีรอบที่ยังไม่ปิดซ้อนช่วงวันที่กัน
  const overlap = sessions.find(
    (s) =>
      s.branchId === branchId &&
      (s.status === "planned" || s.status === "in_progress") &&
      s.startDate <= endDate &&
      startDate <= s.endDate,
  );

  // วันที่รูปแบบ YYYY-MM-DD เทียบกันแบบข้อความได้เลย
  let error: string | null = null;
  if (!branchId) error = "กรุณาเลือกสาขา";
  else if (!startDate || !endDate) error = "กรุณาเลือกวันที่เริ่มและวันที่สิ้นสุด";
  else if (startDate < today) error = "วันที่เริ่มต้องไม่ย้อนหลัง";
  else if (endDate < startDate) error = "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม";
  else if (overlap) error = `สาขานี้มีรอบ ${overlap.id} ในช่วงวันที่นี้อยู่แล้ว`;

  const days = !error
    ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1
    : 0;
  const monthText = startDate
    ? new Date(`${startDate}T00:00:00`).toLocaleDateString("th-TH", { month: "long", year: "numeric" })
    : "";
  const autoName = `ตรวจนับทรัพย์สินประจำเดือน${monthText} - ${branchName}`;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error || !credential) return;
    const session = createSession({
      name: name.trim() || autoName,
      branchId,
      startDate,
      endDate,
      assigneeId: selectedAssignee,
      createdBy: credential.id,
    });
    setName("");
    toast.show(
      startDate <= today
        ? `ประกาศรอบ ${session.id} แล้ว ผู้ใช้เริ่มตรวจนับได้ทันที`
        : `ประกาศรอบ ${session.id} แล้ว จะเริ่มให้ตรวจนับอัตโนมัติ ${formatDateRange(startDate, endDate)}`,
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(`ลบรอบ ${id} ใช่ไหม? ลบแล้วกู้คืนไม่ได้`)) return;
    toast.show(deleteSession(id) ? `ลบรอบ ${id} แล้ว` : "ลบได้เฉพาะรอบที่ยังไม่เริ่ม");
  };

  const planned = sessions
    .filter((s) => s.status === "planned")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const fieldStyle =
    "mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <Toast message={toast.message} />
      <PageHeader title="มอบหมายรอบตรวจนับ" subtitle="กำหนดสาขา ช่วงวันที่ และผู้รับผิดชอบ" backHref="/inventories" />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pt-5 lg:grid-cols-5 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <h2 className="text-lg font-bold text-slate-900">สร้างรอบใหม่</h2>

          <label className="block text-base font-medium text-slate-700">
            สาขาที่ตรวจนับ
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={fieldStyle}>
              {activeBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            <span className="mt-1 block text-sm text-slate-500">ทรัพย์สินในสาขานี้ {assetCount} รายการ</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-base font-medium text-slate-700">
              วันที่เริ่ม
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
                className={fieldStyle}
              />
            </label>
            <label className="block text-base font-medium text-slate-700">
              วันที่สิ้นสุด
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                className={fieldStyle}
              />
            </label>
          </div>

          <label className="block text-base font-medium text-slate-700">
            ผู้รับผิดชอบ
            <select
              value={selectedAssignee}
              onChange={(e) => setAssigneeId(Number(e.target.value))}
              className={fieldStyle}
            >
              {staffIds.map((id) => (
                <option key={id} value={id}>
                  {getStaffName(id)} (รหัส {id})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-base font-medium text-slate-700">
            ชื่อรอบ (เว้นว่างได้ ระบบตั้งให้)
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={autoName} className={fieldStyle} />
          </label>

          <div
            className={`rounded-xl px-4 py-3 text-base ${error ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-800"}`}
            aria-live="polite"
          >
            {error ? (
              <>{error}</>
            ) : (
              <>
                ตรวจนับ <strong>{branchName}</strong> {formatDateRange(startDate, endDate)} ({days} วัน) ·
                ผู้รับผิดชอบ <strong>{getStaffName(selectedAssignee)}</strong>
              </>
            )}
          </div>

          <button type="submit" disabled={!!error} className={`${buttonStyle.primary} min-h-12 w-full text-lg`}>
            ยืนยันสร้างรอบ
          </button>
        </form>

        <section className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-slate-900">รอบที่รอเริ่ม ({planned.length})</h2>
          {planned.length === 0 ? (
            <EmptyState text="ยังไม่มีรอบที่วางแผนไว้" />
          ) : (
            <ul className="space-y-3">
              {planned.map((s) => (
                <li key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">{s.id}</p>
                  <p className="text-base font-semibold text-slate-900">{s.name}</p>
                  <p className="text-sm text-slate-600">
                    {formatDateRange(s.startDate, s.endDate)} · {getStaffName(s.assigneeId)}
                  </p>
                  <button type="button" onClick={() => handleDelete(s.id)} className={`${buttonStyle.danger} mt-3`}>
                    ลบรอบนี้
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link href="/inventories" className={`${buttonStyle.secondary} mt-4 w-full`}>
            ไปหน้าติดตามการนับ ›
          </Link>
        </section>
      </main>
    </div>
  );
}
