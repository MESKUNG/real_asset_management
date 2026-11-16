"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// ชื่อไฟล์ในโปรเจกต์สะกดว่า catagories.ts
import { assets } from "@/data/asset";
import { assetHistories } from "@/data/assetHistories";
import { branches } from "@/data/branches";
import { categories } from "@/data/catagories";
import { inventoryChecks } from "@/data/inventoryCheck";
import { inventorySessions } from "@/data/inventorySessions";
import { repairRequests } from "@/data/repairRequests";

type BadgeTone = "green" | "purple" | "amber";

interface ReportCardItem {
  id: string;
  title: string;
  badgeText: string;
  badgeTone: BadgeTone;
  branchName: string;
  period: string;
  box1Label: string;
  box1Value: string;
  box2Label: string;
  box2Value: string;
  keywords: string;
}

interface ActivityItem {
  id: number;
  time: string;
  operator: string;
  action: string;
  reference: string;
  branchName: string;
  period: string;
  statusCategory: string;
}

// ข้อมูลการ์ดรายงาน 4 ประเภท
const buildReportCards = (): ReportCardItem[] => {
  const itCategoryName = categories[0]?.name ?? "อุปกรณ์ไอที";
  const availableAssets = assets.filter((asset) => asset.status === "available");
  const availableValue = availableAssets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
  const movementCount = assetHistories.filter((history) => history.action === "assigned" || history.action === "transferred").length;
  const completedSessions = inventorySessions.filter((session) => session.status === "completed");
  const completedCheckCount = inventoryChecks.filter((check) => completedSessions.some((session) => session.id === check.sessionId)).length;
  const repairCost = repairRequests.reduce((sum, request) => sum + (request.actualCost ?? 0), 0);

  return [
    {
      id: "asset",
      title: "รายงาน Asset",
      badgeText: "พร้อมใช้งาน",
      badgeTone: "green",
      branchName: branches[0]?.name ?? "สำนักงานใหญ่",
      period: "ทุกช่วงเวลา",
      box1Label: "รายการ",
      box1Value: `${availableAssets.length} รายการจาก ${assets.length}`,
      box2Label: "มูลค่ารวม",
      box2Value: `฿${availableValue.toLocaleString("th-TH")}`,
      keywords: `asset ทรัพย์สิน พร้อมใช้งาน ${availableAssets.length} มูลค่ารวม ${availableValue} ${assets.map((a) => a.id).join(" ")}`,
    },
    {
      id: "movement",
      title: "รายงาน Movement",
      badgeText: "มอบหมายแล้ว",
      badgeTone: "purple",
      branchName: branches[1]?.name ?? "สาขาเชียงใหม่",
      period: "ทุกช่วงเวลา",
      box1Label: "การเคลื่อนไหว",
      box1Value: `${movementCount} รายการ`,
      box2Label: "รายการทรัพย์สิน",
      box2Value: `${new Set(assetHistories.filter((history) => history.action === "assigned" || history.action === "transferred").map((history) => history.assetId)).size} ชิ้น`,
      keywords: "movement การเคลื่อนไหว โอนย้าย เบิก ยืมคืน IS-0001 CNT-2026-010",
    },
    {
      id: "inventory",
      title: "รายงาน Inventory",
      badgeText: "ตรวจนับแล้ว",
      badgeTone: "green",
      branchName: branches[0]?.name ?? "สำนักงานใหญ่",
      period: "ทุกช่วงเวลา",
      box1Label: "รอบที่เสร็จแล้ว",
      box1Value: `${completedSessions.length} รอบ`,
      box2Label: "ผลตรวจนับ",
      box2Value: `${completedCheckCount} รายการ`,
      keywords: `inventory ตรวจนับ ${completedSessions.length} sessions ${completedCheckCount} checks ${itCategoryName}`,
    },
    {
      id: "repair",
      title: "รายงาน Repair",
      badgeText: "ซ่อมบำรุง",
      badgeTone: "amber",
      branchName: branches[0]?.name ?? "สำนักงานใหญ่",
      period: "ทุกช่วงเวลา",
      box1Label: "งานซ่อม",
      box1Value: `${repairRequests.length} งานซ่อม`,
      box2Label: "ค่าใช้จ่ายรวม",
      box2Value: `฿${repairCost.toLocaleString("th-TH")}`,
      keywords: `repair งานซ่อม ซ่อมบำรุง ${repairRequests.length} ${repairCost} ${repairRequests.map((request) => request.assetId).join(" ")}`,
    },
  ];
};

const reportActivities: ActivityItem[] = assetHistories
  .slice()
  .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
  .slice(0, 3)
  .map((history) => {
    const asset = assets.find((item) => item.id === history.assetId);
    const branch = branches.find((item) => item.id === asset?.branchId);
    const actionCategory = history.action === "assigned" || history.action === "transferred"
      ? "มอบหมายแล้ว"
      : history.action === "disposed"
        ? "จำหน่ายแล้ว"
        : history.action === "status_changed"
        ? "ซ่อมบำรุง"
        : "พร้อมใช้งาน";

    return {
      id: Number(history.id.replace(/\D/g, "")),
      time: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(history.performedAt)),
      operator: `Admin #${history.performedBy}`,
      action: history.description,
      reference: `${history.assetId}${asset ? ` (${asset.name})` : ""}`,
      branchName: branch?.name ?? "ไม่ระบุสาขา",
      period: "ทุกช่วงเวลา",
      statusCategory: actionCategory,
    };
  });

export default function ReportSummaryPage() {
  const router = useRouter();

  const reportCards = buildReportCards();
  const latestCompletedSession = inventorySessions
    .filter((session) => session.status === "completed")
    .slice()
    .sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
  const latestCompletedMonth = latestCompletedSession
    ? new Intl.DateTimeFormat("th-TH", { month: "short", year: "numeric" }).format(new Date(`${latestCompletedSession.endDate}T00:00:00`))
    : "ยังไม่มีรอบตรวจที่เสร็จแล้ว";

  const [locationFilter, setLocationFilter] = useState<string>("ทุกสถานที่");
  const [periodFilter, setPeriodFilter] = useState<string>("ทุกช่วงเวลา");
  const [statusFilter, setStatusFilter] = useState<string>("ทุกสถานะ");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [columnCount, setColumnCount] = useState<number>(6);
  const [mockupNotice, setMockupNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setMockupNotice(message);
    setTimeout(() => {
      setMockupNotice(null);
    }, 2500);
  };

  // จำลองการ export Excel
  const handleMockExportExcel = (fileName: string) => {
    showNotice(`กำลังดาวน์โหลดไฟล์ ${fileName}.xlsx (${columnCount} คอลัมน์) สำเร็จ! (Mockup)`);
  };

  const handleCycleColumnCount = () => {
    const nextCount = columnCount === 6 ? 8 : columnCount === 8 ? 10 : 6;
    setColumnCount(nextCount);
    showNotice(`เปลี่ยนการตั้งค่าส่งออกเป็น ${nextCount} คอลัมน์เรียบร้อย`);
  };

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredCards = reportCards.filter((card) => {
    const matchLocation =
      locationFilter === "ทุกสถานที่" || card.branchName === locationFilter;
    const matchPeriod =
      periodFilter === "ทุกช่วงเวลา" || card.period === periodFilter;
    const matchStatus =
      statusFilter === "ทุกสถานะ" || card.badgeText === statusFilter;
    const matchSearch =
      !cleanQuery ||
      card.title.toLowerCase().includes(cleanQuery) ||
      card.box1Value.toLowerCase().includes(cleanQuery) ||
      card.box2Value.toLowerCase().includes(cleanQuery) ||
      card.keywords.toLowerCase().includes(cleanQuery);

    return matchLocation && matchPeriod && matchStatus && matchSearch;
  });

  const filteredActivities = reportActivities.filter((act) => {
    const matchLocation =
      locationFilter === "ทุกสถานที่" || act.branchName === locationFilter;
    const matchPeriod =
      periodFilter === "ทุกช่วงเวลา" || act.period === periodFilter;
    const matchStatus =
      statusFilter === "ทุกสถานะ" || act.statusCategory === statusFilter;
    const matchSearch =
      !cleanQuery ||
      act.operator.toLowerCase().includes(cleanQuery) ||
      act.action.toLowerCase().includes(cleanQuery) ||
      act.reference.toLowerCase().includes(cleanQuery);

    return matchLocation && matchPeriod && matchStatus && matchSearch;
  });

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

      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="ย้อนกลับ"
          className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 font-bold"
        >
          ‹
        </button>
        <h1 className="text-sm lg:text-lg font-bold text-slate-900">สรุปรายงานทั้งหมด</h1>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 lg:pt-6 space-y-5">
        {/* การ์ดสรุป KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 lg:gap-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">มูลค่าทรัพย์สิน</span>
              <span className="text-[#4f46e5]">
                <CubeIcon />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-2">฿{assets.reduce((sum, asset) => sum + asset.purchasePrice, 0).toLocaleString("th-TH")}</p>
            <p className="text-xs font-medium text-[#4f46e5]">
              มูลค่าตามราคาซื้อของ Asset {assets.length} ชิ้น
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">รอบตรวจนับที่เสร็จแล้ว</span>
              <span className="text-emerald-600">
                <CheckCircleIcon />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-2">{inventorySessions.filter((session) => session.status === "completed").length} รอบ</p>
            <p className="text-xs font-medium text-emerald-600">ผลตรวจ {inventoryChecks.filter((check) => inventorySessions.some((session) => session.id === check.sessionId && session.status === "completed")).length.toLocaleString("th-TH")} รายการ</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">ค่าใช้จ่ายซ่อม</span>
              <span className="text-amber-600">
                <WrenchIcon />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-2">฿{repairRequests.reduce((sum, request) => sum + (request.actualCost ?? 0), 0).toLocaleString("th-TH")}</p>
            <p className="text-xs font-medium text-amber-600">ค่าใช้จ่ายจริงจากคำขอซ่อม {repairRequests.length} งาน</p>
          </div>
        </div>

        {/* ตัวกรอง */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              ⚲
            </span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label="กรองตามสถานที่"
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-8 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            >
              <option value="ทุกสถานที่">ทุกสถานที่</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              🗓
            </span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              aria-label="กรองตามช่วงเวลา"
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-8 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            >
              <option value="ส.ค.–ต.ค. 2569">ส.ค.–ต.ค. 2569</option>
              <option value="ทุกช่วงเวลา">ทุกช่วงเวลา</option>
            </select>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              ✓
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="กรองตามสถานะ"
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-8 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            >
              <option value="ทุกสถานะ">ทุกสถานะ</option>
              <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
              <option value="มอบหมายแล้ว">มอบหมายแล้ว</option>
              <option value="ซ่อมบำรุง">ซ่อมบำรุง</option>
              <option value="ตรวจนับแล้ว">ตรวจนับแล้ว</option>
              <option value="จำหน่ายแล้ว">จำหน่ายแล้ว</option>
            </select>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              ⌕
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ หรือรหัสทรัพย์สิน"
              aria-label="ค้นหาชื่อ หรือรหัสทรัพย์สิน"
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            />
          </div>
        </div>

        {/* รายงานรวม 4 ประเภท */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm lg:text-base font-bold text-slate-900">รายงานรวม 4 ประเภท</h2>
              <p className="text-[11px] lg:text-xs text-slate-400 mt-0.5">
                รวม Asset · Movement · Inventory · Repair พร้อมแยกชิ้นการส่งออกเดียว
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleMockExportExcel("all_reports_20261024")}
              className="w-full lg:w-auto bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm flex items-center justify-center gap-2 transition"
            >
              <span>↓</span>
              <span>ส่งออกรายงานทั้งหมด</span>
            </button>
          </div>

          {filteredCards.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              ไม่พบประเภทรายงานที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <h3 className="text-xs font-bold text-slate-900">{card.title}</h3>
                    <ReportBadge text={card.badgeText} tone={card.badgeTone} />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#f8f9fc] border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 mb-1">{card.box1Label}</p>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {card.box1Value}
                      </p>
                    </div>
                    <div className="bg-[#f8f9fc] border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 mb-1">{card.box2Label}</p>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {card.box2Value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Export Excel และประวัติตรวจนับ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 lg:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-sm font-bold text-slate-900">Export Excel</h3>
                <ReportBadge text="พร้อมใช้งาน" tone="green" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#f8f9fc] border border-slate-100 rounded-xl p-3.5">
                  <p className="text-[11px] text-slate-400 mb-1">คอลัมน์</p>
                  <p className="text-xs font-bold text-slate-900">{columnCount} คอลัมน์</p>
                </div>
                <div className="bg-[#f8f9fc] border border-slate-100 rounded-xl p-3.5">
                  <p className="text-[11px] text-slate-400 mb-1">รูปแบบ</p>
                  <p className="text-xs font-bold text-slate-900">.xlsx</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleMockExportExcel("asset_20261024")}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition"
              >
                <span>↓</span>
                <span>ส่งออก Excel</span>
              </button>
              <button
                type="button"
                onClick={handleCycleColumnCount}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>+</span>
                <span>ตั้งค่าข้อมูล</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 lg:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-sm font-bold text-slate-900">ประวัติตรวจนับ</h3>
                <ReportBadge text="พร้อมใช้งาน" tone="green" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#f8f9fc] border border-slate-100 rounded-xl p-3.5">
                  <p className="text-[11px] text-slate-400 mb-1">รอบล่าสุด</p>
                  <p className="text-xs font-bold text-slate-900">{latestCompletedMonth}</p>
                </div>
                <div className="bg-[#f8f9fc] border border-slate-100 rounded-xl p-3.5">
                  <p className="text-[11px] text-slate-400 mb-1">สถานะ</p>
                  <p className="text-xs font-bold text-slate-900">ปิดรอบแล้ว</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleMockExportExcel("audit_history_sep2569")}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition"
              >
                <span>↓</span>
                <span>ส่งออก Excel</span>
              </button>
              <button
                type="button"
                onClick={() => showNotice("เปิดดูรายละเอียดประวัติตรวจนับ (Mockup)")}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>+</span>
                <span>ดูรายละเอียด</span>
              </button>
            </div>
          </div>
        </div>

        {/* กิจกรรมล่าสุด */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm lg:text-base font-bold text-slate-900">กิจกรรมล่าสุด</h2>
            <ReportBadge text={`${filteredActivities.length} กิจกรรม`} tone="amber" />
          </div>

          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              ไม่พบรายการกิจกรรมที่ตรงกับตัวกรอง
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-[#f8f9fc] text-[11px] font-semibold text-slate-400">
                      <th className="py-2.5 px-4 rounded-l-lg">เวลา</th>
                      <th className="py-2.5 px-4">ผู้ดำเนินการ</th>
                      <th className="py-2.5 px-4">กิจกรรม</th>
                      <th className="py-2.5 px-4 rounded-r-lg">รายการที่เกี่ยวข้อง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{act.time}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-medium">{act.operator}</td>
                        <td className="py-3.5 px-4 text-slate-700">{act.action}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{act.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y divide-slate-100">
                {filteredActivities.map((act) => (
                  <div key={act.id} className="py-3 first:pt-1 last:pb-1 space-y-0.5">
                    <p className="text-[11px] text-slate-400">{act.time}</p>
                    <p className="text-xs font-bold text-slate-900">{act.action}</p>
                    <p className="text-[11px] text-slate-500">ผู้ดำเนินการ · {act.operator}</p>
                    <p className="text-xs font-semibold text-[#4f46e5] pt-0.5">{act.reference}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function ReportBadge({ text, tone }: { text: string; tone: BadgeTone }) {
  if (tone === "purple") {
    return (
      <span className="inline-flex items-center gap-1 bg-[#ede9fe] text-[#4f46e5] text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
        <span>•</span>
        <span>{text}</span>
      </span>
    );
  }
  if (tone === "amber") {
    return (
      <span className="inline-flex items-center gap-1 bg-[#fef3c7] text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
        <span>•</span>
        <span>{text}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
      <span>•</span>
      <span>{text}</span>
    </span>
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
