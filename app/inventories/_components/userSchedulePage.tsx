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

interface UserScheduleRow {
  id: string;
  order: number;
  title: string;
  branchName: string;
  subLocation: string;
  itemCount: number;
  assigneeName: string;
  department: string;
  dateLabel: string;
  fullDateText: string;
  status: InventorySessionStatus;
  checked: boolean;
}

// ชื่อและแผนกของผู้รับผิดชอบ
const ASSIGNEE_MAP: Record<string, { name: string; dept: string; subLoc: string }> = {
  "BR-001": { name: "กานต์ พิพัฒน์", dept: "ฝ่ายบริหารทรัพย์สิน", subLoc: "ชั้น 3" },
  "BR-002": { name: "มาลี ใจดี", dept: "ฝ่ายธุรการ", subLoc: "อาคาร A" },
  "BR-003": { name: "ปิยะ วัฒนา", dept: "ฝ่ายไอที", subLoc: "คลังกลาง" },
};

// "2026-11-05" -> "5 พ.ย." หรือ "5 พ.ย. 2569"
const formatThaiDate = (dateStr: string, includeYear: boolean = false): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "27 ต.ค.";
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
};

const buildUserScheduleRows = (): UserScheduleRow[] => {
  // เรียงตามวันที่เริ่ม เพื่อให้เห็นลำดับการตรวจ
  const sessionsByDate = [...inventorySessions].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  return sessionsByDate.map((session: InventorySession, index: number) => {
    const branchObj = branches.find((b) => b.id === session.branchId);
    const assigneeInfo = ASSIGNEE_MAP[session.branchId] ?? {
      name: "ปิยะ วัฒนา",
      dept: "ฝ่ายไอที",
      subLoc: "คลังกลาง",
    };

    const branchAssetCount = assets.filter((a) => a.branchId === session.branchId).length;
    const displayCount = branchAssetCount;

    return {
      id: session.id,
      order: index + 1,
      title: session.name,
      branchName: branchObj ? branchObj.name : "สาขาปิ่นเกล้า",
      subLocation: assigneeInfo.subLoc,
      itemCount: displayCount,
      assigneeName: assigneeInfo.name,
      department: assigneeInfo.dept,
      dateLabel: formatThaiDate(session.startDate, false),
      fullDateText: `${formatThaiDate(session.startDate, false)} – ${formatThaiDate(
        session.endDate,
        true
      )}`,
      status: session.status,
      checked: false,
    };
  });
};

export default function UserSchedulePage() {
  const router = useRouter();

  const [rows, setRows] = useState<UserScheduleRow[]>(buildUserScheduleRows);
  const [showAllBranches, setShowAllBranches] = useState<boolean>(true);
  const [mockupNotice, setMockupNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setMockupNotice(message);
    setTimeout(() => {
      setMockupNotice(null);
    }, 2500);
  };

  const visibleRows = showAllBranches
    ? rows
    : rows.filter((r) => r.status === "in_progress");

  // การ์ดด้านบนยึดรอบที่กำลังนับก่อน
  const activeRow = rows.find((r) => r.status === "in_progress") ?? visibleRows[0] ?? rows[0];

  const toggleCheckItem = (id: string) => {
    setRows(
      rows.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // ปุ่ม ••• สลับสถานะ กำลังนับ <-> รอเริ่ม
  const toggleRowStatus = (id: string) => {
    setRows(
      rows.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "in_progress" ? "planned" : "in_progress",
            }
          : item
      )
    );
    showNotice("สลับสถานะการตรวจนับเรียบร้อย (Mockup)");
  };

  const handleOpenAuditPage = (id: string) => {
    showNotice(`กำลังเปิดหน้าตรวจนับรหัส ${id}...`);
    router.push("/inventories/audit");
  };

  return (
    <div className="min-h-screen bg-[#f4f5f9] text-slate-800 font-sans pb-12">
      {mockupNotice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          <span>✓</span>
          <span>{mockupNotice}</span>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
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

        <button
          type="button"
          onClick={() => setShowAllBranches(!showAllBranches)}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
        >
          {showAllBranches
            ? "แสดงเฉพาะรอบที่กำลังนับ (1 รายการ)"
            : `แสดงทุกรอบจากระบบ (${rows.length} รายการ)`}
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 pt-4 lg:pt-6">
        <p className="text-xs lg:text-sm text-slate-500 mb-3.5 font-medium">
          กำหนดการนับจำนวนทรัพย์สิน {activeRow?.branchName ?? "สาขาปิ่นเกล้า"}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-5 lg:mb-6">
          <div className="bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-4 lg:px-5 py-3.5">
            <p className="text-[11px] lg:text-xs text-slate-400 mb-1">ช่วงวันที่</p>
            <p className="text-xs lg:text-sm font-bold text-slate-900">
              {activeRow?.fullDateText ?? "27 ต.ค. 2569"}
            </p>
          </div>
          <div className="bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-4 lg:px-5 py-3.5">
            <p className="text-[11px] lg:text-xs text-slate-400 mb-1">สถานที่</p>
            <p className="text-xs lg:text-sm font-bold text-slate-900">
              {activeRow?.branchName ?? "สาขาปิ่นเกล้า"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 lg:gap-5 mb-7">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">ทรัพย์สินทั้งหมด</span>
              <span className="text-[#4f46e5]">
                <CubeIcon />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-2">115</p>
            <p className="text-xs font-medium text-[#4f46e5]">
              +{assets.length} รายการหลักในฐานข้อมูล
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">ตรวจนับเวลา</span>
              <span className="text-emerald-600">
                <CheckCircleIcon />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-2">13:00 น.</p>
            <p className="text-xs font-medium text-emerald-600">เวลาเริ่มนับทรัพย์สิน</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">คนที่ได้รับมอบหมาย</span>
              <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
                <UserIcon />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2">
              {activeRow?.assigneeName ?? "ปิยะ วัฒนา"}
            </p>
            <p className="text-xs font-medium text-amber-600">
              {activeRow?.department ?? "ฝ่ายไอที"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <h2 className="text-base lg:text-lg font-bold text-slate-900">ลำดับรอบตรวจนับ</h2>
          {activeRow && (
            <button
              type="button"
              onClick={() => handleOpenAuditPage(activeRow.id)}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
            >
              ดูรายการที่ต้องสแกน ›
            </button>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block space-y-3">
          {visibleRows.map((item) => (
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
                <button
                  type="button"
                  onClick={() => handleOpenAuditPage(item.id)}
                  className="flex items-center gap-3.5 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 group-hover:border-indigo-200 shrink-0">
                    <LaptopIcon />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#4f46e5] transition">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ลำดับที่ {item.order} · {item.id} · {item.itemCount} รายการ
                    </p>
                  </div>
                </button>
              </div>

              <div className="min-w-[140px]">
                <p className="text-xs font-semibold text-slate-800">{item.assigneeName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.department}</p>
              </div>

              <div className="min-w-[120px] text-xs text-slate-500 font-medium">
                {item.subLocation}
              </div>

              <div className="min-w-[100px] flex justify-center">
                <StatusPill status={item.status} />
              </div>

              <div className="min-w-[70px] text-right text-xs font-semibold text-slate-700">
                {item.dateLabel}
              </div>

              <button
                type="button"
                onClick={() => toggleRowStatus(item.id)}
                title="คลิกเพื่อจำลองสลับสถานะ"
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                •••
              </button>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="lg:hidden space-y-3.5">
          {visibleRows.map((item) => (
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
                  <span className="text-xs font-medium text-slate-700">{item.dateLabel}</span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleRowStatus(item.id)}
                  className="text-slate-500 hover:text-slate-800 px-1"
                >
                  •••
                </button>
              </div>

              <div className="p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => handleOpenAuditPage(item.id)}
                  className="flex items-center gap-3 text-left w-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-600 shrink-0">
                    <LaptopIcon />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ลำดับที่ {item.order} · {item.id} · {item.itemCount} รายการ
                    </p>
                  </div>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-slate-600">
                    {item.assigneeName} · {item.department}
                  </p>
                  <StatusPill status={item.status} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <PinIcon />
                  <span>
                    {item.branchName} · {item.subLocation}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 18h20" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-slate-400 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="w-4 h-4 lg:w-5 lg:h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}
