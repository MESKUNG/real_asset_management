"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { assets } from "@/data/asset";
import { branches } from "@/data/branches";
import {
  inventorySessions,
  type InventorySession,
  type InventorySessionStatus,
} from "@/data/inventorySessions";

//โครงสร้างตาราง
interface AdminScheduleRow {
  id: string;
  title: string;
  branchId: string;
  branchName: string;
  subLocation: string;
  itemCount: number;
  assigneeName: string;
  department: string;
  dateLabel: string;
  startDate: string;
  fullDateRange: string;
  status: InventorySessionStatus;
  checked: boolean;
}

const CURRENT_YEAR = 2569;
const PER_PAGE = 3;

const THAI_MONTHS: string[] = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.",
  "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
  "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const DAYS_IN_MONTH: Record<string, number> = {
  "ม.ค.": 31, "ก.พ.": 28, "มี.ค.": 31, "เม.ย.": 30,
  "พ.ค.": 31, "มิ.ย.": 30, "ก.ค.": 31, "ส.ค.": 31,
  "ก.ย.": 30, "ต.ค.": 31, "พ.ย.": 30, "ธ.ค.": 31,
};


const BRANCH_ASSIGNEE_MAP: Record<string, { assignee: string; dept: string; sub: string }> = {
  "BR-001": { assignee: "กานต์ พิพัฒน์", dept: "ผู้รับผิดชอบ", sub: "ชั้น 3" },
  "BR-002": { assignee: "มาลี ใจดี", dept: "ฝ่ายธุรการ", sub: "อาคาร A" },
  "BR-003": { assignee: "ปิยะ วัฒนา", dept: "ฝ่ายไอที", sub: "คลังอุปกรณ์" },
  "BR-004": { assignee: "ธนกร ศรีสวัสดิ์", dept: "ฝ่ายไอที", sub: "ชั้น 2" },
  "BR-005": { assignee: "ศิริพร วงศ์สวัสดิ์", dept: "ฝ่ายธุรการ", sub: "ชั้น 1" },
};


const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "24 ต.ค.";
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
};

const formatThaiYear = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`);
  return String(date.getFullYear() + 543);
};


const buildInitialAdminSchedules = (): AdminScheduleRow[] => {
  return inventorySessions.map((session: InventorySession) => {
    const branchObj = branches.find((b) => b.id === session.branchId);
    const meta = BRANCH_ASSIGNEE_MAP[session.branchId] ?? BRANCH_ASSIGNEE_MAP["BR-001"];
    const startText = formatShortDate(session.startDate);
    const endText = formatShortDate(session.endDate);

    return {
      id: session.id,
      title: session.name,
      branchId: session.branchId,
      branchName: branchObj ? branchObj.name : "สำนักงานใหญ่",
      subLocation: meta.sub,
      itemCount: session.totalAssets,
      assigneeName: meta.assignee,
      department: meta.dept,
      dateLabel: startText,
      startDate: session.startDate,
      fullDateRange: `${startText} – ${endText} ${formatThaiYear(session.startDate)}`,
      status: session.status,
      checked: false,
    };
  });
};

// Main Component
export default function SchedulePage() {
  const router = useRouter();

  const [schedules, setSchedules] = useState<AdminScheduleRow[]>(buildInitialAdminSchedules);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mockupNotice, setMockupNotice] = useState<string | null>(null);

  // State เปิด/ปิด Overlay สร้างกำหนดการตรวจ
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // State ฟอร์มสร้างกำหนดการ 
  const [startDay, setStartDay] = useState<string>("24");
  const [endDay, setEndDay] = useState<string>("31");
  const [selectedMonth, setSelectedMonth] = useState<string>("ต.ค.");
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id ?? "BR-001");
  const [customTitle, setCustomTitle] = useState<string>("");

  const showNotice = (message: string) => {
    setMockupNotice(message);
    setTimeout(() => {
      setMockupNotice(null);
    }, 2500);
  };

  // การตรวจสอบวันที่ในฟอร์ม 
  const maxDay = DAYS_IN_MONTH[selectedMonth] ?? 31;
  const startNum = Number(startDay);
  const endNum = Number(endDay);

  let dateError: string | null = null;
  if (!startDay.trim() || !endDay.trim()) {
    dateError = "กรุณากรอกวันที่เริ่มต้นและสิ้นสุดให้ครบ";
  } else if (startNum < 1 || startNum > maxDay || endNum < 1 || endNum > maxDay) {
    dateError = `เดือน ${selectedMonth} มีได้ไม่เกิน ${maxDay} วัน`;
  } else if (endNum < startNum) {
    dateError = "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น";
  }

  const durationDays = !dateError ? endNum - startNum + 1 : 0;

  // ฟังก์ชันจัดการตารางและฟอร์ม 
  const handleConfirmSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dateError) return;

    const branchObj = branches.find((b) => b.id === selectedBranchId) ?? branches[0];
    const branchName = branchObj ? branchObj.name : "สำนักงานใหญ่";
    const meta = BRANCH_ASSIGNEE_MAP[selectedBranchId] ?? BRANCH_ASSIGNEE_MAP["BR-001"];

    // หาเลขรหัส 
    const existingNums = schedules.map((s) => Number(s.id.replace(/\D/g, "")) || 0);
    const nextNum = Math.max(5, ...existingNums) + 1;
    const newCode = `IS-${String(nextNum).padStart(4, "0")}`;

    const newRow: AdminScheduleRow = {
      id: newCode,
      title:
        customTitle.trim() ||
        `ตรวจนับทรัพย์สินประจำเดือน ${selectedMonth} ${CURRENT_YEAR} - ${branchName}`,
      branchId: selectedBranchId,
      branchName: branchName,
      subLocation: meta.sub,
      itemCount: assets.filter((asset) => asset.branchId === selectedBranchId).length,
      assigneeName: meta.assignee,
      department: meta.dept,
      dateLabel: `${startNum} ${selectedMonth}`,
      startDate: `${CURRENT_YEAR - 543}-${String(THAI_MONTHS.indexOf(selectedMonth) + 1).padStart(2, "0")}-${String(startNum).padStart(2, "0")}`,
      fullDateRange: `${startNum}–${endNum} ${selectedMonth} ${CURRENT_YEAR}`,
      status: "planned",
      checked: false,
    };

    setSchedules([newRow, ...schedules]);
    setCurrentPage(1);
    setCustomTitle("");
    setIsCreateOpen(false);
    showNotice(`สร้างกำหนดการ ${newCode} (${branchName}) สำเร็จ!`);
  };

  const toggleCheckItem = (id: string) => {
    setSchedules(
      schedules.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const selectedCount = schedules.filter((item) => item.checked).length;
  const handleDeleteSelected = () => {
    setSchedules(schedules.filter((item) => !item.checked));
    showNotice(`ลบกำหนดการที่เลือก ${selectedCount} รายการเรียบร้อย`);
  };

  // สลับสถานะ รอเริ่ม <-> กำลังนับ
  const toggleItemStatus = (id: string) => {
    setSchedules(
      schedules.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "planned" ? "in_progress" : "planned",
            }
          : item
      )
    );
    showNotice("อัปเดตสถานะรอบตรวจนับเรียบร้อย (Mockup)");
  };

  const nextSession = schedules
    .filter((item) => (item.status === "planned" || item.status === "in_progress") && item.startDate >= new Date().toISOString().slice(0, 10))
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const topDateRangeText = nextSession?.fullDateRange ?? "ไม่มีรอบตรวจนับที่กำลังจะมาถึง";
  const topLocationText = nextSession?.branchName ?? "ทุกสาขา";

  const repairInDataCount = assets.filter(
    (a) => a.status === "repair" || a.status === "damaged"
  ).length;
  const availableAssetCount = assets.filter((asset) => asset.status === "available").length;

  const totalPages = Math.max(1, Math.ceil(schedules.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PER_PAGE;
  const pagedSchedules = schedules.slice(startIndex, startIndex + PER_PAGE);
  const startItem = schedules.length === 0 ? 0 : startIndex + 1;
  const endItem = startIndex + pagedSchedules.length;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#f4f5f9] text-slate-800 font-sans pb-12">
      {mockupNotice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          <span>✅</span>
          <span>{mockupNotice}</span>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="ย้อนกลับ"
          className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 font-bold"
        >
          ‹
        </button>
        <h1 className="text-sm lg:text-lg font-bold text-slate-900">
          กำหนดการตรวจนับทรัพย์สิน
        </h1>
      </div>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 pt-4 lg:pt-6 relative">
        <p className="text-xs lg:text-sm text-slate-500 mb-3.5 font-medium">
          วางแผนรอบตรวจนับและมอบหมายผู้รับผิดชอบ
        </p>

        {/* ส่วนบน: ช่วงวันที่/สถานที่ และ overlay สร้างกำหนดการ */}
        <div className="relative mb-6">
          {isCreateOpen && (
            <div
              onClick={() => setIsCreateOpen(false)}
              className="hidden lg:block fixed inset-0 bg-slate-900/15 backdrop-blur-[2px] z-20"
            />
          )}

          {!isCreateOpen && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-4">
                <div className="bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-4 lg:px-5 py-3 lg:py-3.5">
                  <p className="text-[11px] lg:text-xs text-slate-400 mb-1">ช่วงวันที่</p>
                  <p className="text-xs lg:text-sm font-bold text-slate-900">{topDateRangeText}</p>
                </div>
                <div className="bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-4 lg:px-5 py-3 lg:py-3.5">
                  <p className="text-[11px] lg:text-xs text-slate-400 mb-1">สถานที่</p>
                  <p className="text-xs lg:text-sm font-bold text-slate-900">{topLocationText}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="w-full lg:w-auto min-w-[210px] bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
              >
                <span className="text-base leading-none">+</span>
                <span>สร้างกำหนดการตรวจนับ</span>
              </button>
            </div>
          )}

          {/* overlay สร้างกำหนดการ */}
          {isCreateOpen && (
            <form
              onSubmit={handleConfirmSchedule}
              className="relative z-30 bg-white border border-indigo-100 rounded-2xl p-4 lg:p-6 shadow-xl"
            >
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                    📅
                  </div>
                  <div>
                    <h2 className="text-sm lg:text-base font-bold text-slate-900">
                      สร้างกำหนดการตรวจนับ
                    </h2>
                    <p className="hidden sm:block text-[11px] text-slate-400">
                      เลือกวันที่ เดือน และสาขาจากฐานข้อมูลระบบ ({branches.length} สาขา)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  aria-label="ปิดหน้าต่าง"
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* ช่วงวันที่ */}
                <div className="lg:col-span-5 bg-[#eff0fe]/70 border border-indigo-100/80 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">ช่วงวันที่</span>
                    <span className="text-[10px] text-slate-500">
                      (1–{maxDay} {selectedMonth})
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-3 my-auto py-2">
                    <input
                      type="number"
                      min={1}
                      max={maxDay}
                      value={startDay}
                      onChange={(e) => setStartDay(e.target.value)}
                      aria-label="วันที่เริ่มต้น"
                      className="w-full max-w-[110px] lg:max-w-[76px] bg-white border border-indigo-200/80 rounded-lg px-3 py-2 text-center text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                    />
                    <span className="text-slate-400 font-bold">–</span>
                    <input
                      type="number"
                      min={1}
                      max={maxDay}
                      value={endDay}
                      onChange={(e) => setEndDay(e.target.value)}
                      aria-label="วันที่สิ้นสุด"
                      className="w-full max-w-[110px] lg:max-w-[76px] bg-white border border-indigo-200/80 rounded-lg px-3 py-2 text-center text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                    />
                  </div>

                  {dateError ? (
                    <p className="text-[11px] text-center text-rose-600 font-semibold mt-1">
                      ⚠️ {dateError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-center text-indigo-600/80 font-medium mt-1">
                      รวมระยะเวลา {durationDays} วัน
                    </p>
                  )}
                </div>

                {/* ช่วงเดือน */}
                <div className="lg:col-span-7 bg-[#eff0fe]/70 border border-indigo-100/80 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-600 mb-2.5">
                    ช่วงเดือน (พ.ศ. {CURRENT_YEAR})
                  </p>

                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {THAI_MONTHS.map((m) => {
                      const isSelected = selectedMonth === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMonth(m)}
                          className={`py-2 px-1 rounded-lg text-xs font-bold transition shadow-sm ${
                            isSelected
                              ? "bg-[#4f46e5] text-white ring-2 ring-indigo-300"
                              : "bg-white text-slate-700 hover:bg-indigo-50/80 border border-indigo-100/60"
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* สถานที่ */}
                <div className="lg:col-span-6 bg-[#eff0fe]/70 border border-indigo-100/80 rounded-xl p-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    สถานที่ (ดึงจากไฟล์ branches.ts)
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    aria-label="เลือกสถานที่"
                    className="w-full bg-white border border-indigo-200/80 rounded-lg px-3.5 py-2.5 text-xs font-bold text-emerald-700 lg:text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code} · {b.address})
                      </option>
                    ))}
                  </select>
                </div>

                {/* ชื่อประกาศตรวจนับ */}
                <div className="lg:col-span-6 bg-[#eff0fe]/70 border border-indigo-100/80 rounded-xl p-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    ชื่อรอบตรวจนับ (เว้นว่างเพื่อใช้ชื่ออัตโนมัติได้)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={`เช่น ตรวจนับประจำเดือน ${selectedMonth}`}
                    className="w-full bg-white border border-indigo-200/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                  />
                </div>
              </div>

              {/* สรุปและปุ่มยืนยัน */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {dateError ? (
                    <span className="text-rose-600 font-medium">{dateError}</span>
                  ) : (
                    <span>
                      สรุปประกาศ:{" "}
                      <strong className="text-slate-800">
                        {startNum}–{endNum} {selectedMonth} {CURRENT_YEAR}
                      </strong>{" "}
                      ณ{" "}
                      <strong className="text-[#4f46e5]">
                        {branches.find((b) => b.id === selectedBranchId)?.name}
                      </strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={!!dateError}
                    className="w-full sm:w-auto min-w-[130px] bg-[#4f46e5] hover:bg-[#4338ca] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition"
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ส่วนล่าง: เบลอเฉพาะบน Desktop ตอนเปิด overlay */}
        <div
          className={
            isCreateOpen
              ? "lg:blur-[1.5px] lg:pointer-events-none lg:select-none transition"
              : "transition"
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 lg:gap-5 mb-7">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">ทรัพย์สินทั้งหมด</span>
                <span className="text-[#4f46e5]">
                  <CubeIcon />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-2">{assets.length.toLocaleString("th-TH")}</p>
              <p className="text-xs font-medium text-[#4f46e5]">
                ทรัพย์สินใน 5 สาขา
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">พร้อมใช้งาน</span>
                <span className="text-emerald-600">
                  <CheckCircleIcon />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-2">{availableAssetCount.toLocaleString("th-TH")}</p>
              <p className="text-xs font-medium text-emerald-600">พร้อมสำหรับการมอบหมาย</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">อยู่ระหว่างซ่อมบำรุง</span>
                <span className="text-amber-600">
                  <WrenchIcon />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-2">{repairInDataCount.toLocaleString("th-TH")}</p>
              <p className="text-xs font-medium text-amber-600">
                รายการที่ชำรุดหรืออยู่ระหว่างซ่อม
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base lg:text-lg font-bold text-slate-900">
              รายการกำหนดการตรวจนับ
            </h2>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                ลบที่เลือก ({selectedCount})
              </button>
            )}
          </div>

          {pagedSchedules.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-xs text-slate-400 shadow-sm">
              ยังไม่มีรอบตรวจนับที่กำลังจะมาถึง
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block space-y-3">
                {pagedSchedules.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm transition"
                  >
                    <div className="flex items-center gap-4 min-w-[290px]">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCheckItem(item.id)}
                        aria-label={`เลือก ${item.title}`}
                        className="w-4 h-4 rounded border-slate-300 text-[#4f46e5]"
                      />
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 shrink-0">
                        <LaptopIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.id} · {item.itemCount} รายการ
                        </p>
                      </div>
                    </div>

                    <div className="min-w-[140px]">
                      <p className="text-xs font-semibold text-slate-800">{item.assigneeName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.department}</p>
                    </div>

                    <div className="min-w-[150px] text-xs text-slate-500 font-medium">
                      {item.branchName}
                    </div>

                    <div className="min-w-[100px] flex justify-center">
                      <StatusPill status={item.status} />
                    </div>

                    <div className="min-w-[90px] text-right text-xs font-semibold text-slate-700">
                      {item.dateLabel}
                    </div>

                    {item.status !== "completed" && <button
                      type="button"
                      onClick={() => toggleItemStatus(item.id)}
                      title="คลิกเพื่อจำลองสลับสถานะ"
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
                    >
                      •••
                    </button>}
                  </div>
                ))}
              </div>

              {/* Mobile */}
              <div className="lg:hidden space-y-3.5">
                {pagedSchedules.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleCheckItem(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#4f46e5]"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {item.dateLabel}
                        </span>
                      </label>
                      {item.status !== "completed" && <button
                        type="button"
                        onClick={() => toggleItemStatus(item.id)}
                        className="text-slate-500 hover:text-slate-800 px-1"
                      >
                        •••
                      </button>}
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-600 shrink-0">
                          <LaptopIcon />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.id} · {item.itemCount} รายการ
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-slate-600">
                          {item.assigneeName} · {item.department}
                        </p>
                        <StatusPill status={item.status} />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>📍</span>
                        <span>
                          {item.branchName} · {item.subLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs text-slate-500">
            <div>
              แสดง {startItem}–{endItem} จาก {schedules.length} รายการ
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                className="w-8 h-8 rounded-lg bg-white lg:bg-transparent border border-slate-200 lg:border-none flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                ‹
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                    safePage === page
                      ? "bg-[#e0e0ff] text-[#4f46e5] border border-[#c7c7fe]"
                      : "bg-white lg:bg-transparent border border-slate-200 lg:border-none text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                className="w-8 h-8 rounded-lg bg-white lg:bg-transparent border border-slate-200 lg:border-none flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: InventorySessionStatus }) {
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#e0e7ff] text-[#3730a3] text-[11px] font-bold px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
        <span>กำลังนับ</span>
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        <span>เสร็จสิ้น</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#ede9fe] text-[#5b21b6] text-[11px] font-bold px-3 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#6d28d9]" />
      <span>รอเริ่ม</span>
    </span>
  );
}

function LaptopIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 18h20" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
    </svg>
  );
}
