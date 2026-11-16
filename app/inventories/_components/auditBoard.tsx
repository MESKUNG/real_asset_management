"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { assets as rawAssets, type Asset } from "@/data/asset";
import { branches } from "@/data/branches";
import { inventorySessions } from "@/data/inventorySessions";
import { inventoryChecks } from "@/data/inventoryCheck";

type AuditStatus = "checked" | "unchecked";

interface AuditAssetItem {
  id: string;
  name: string;
  brandModel: string;
  branchName: string;
  ownerName: string;
  timestamp: string;
  status: AuditStatus;
}

interface PaginationFooterProps {
  totalItems: number;
  perPage: number;
  setPerPage: (val: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  isMobile?: boolean;
}

// รหัสพนักงาน -> ชื่อ-นามสกุล
const STAFF_NAME_MAP: Record<number, string> = {
  101: "กานต์ พิพัฒน์",
  102: "พัฒพงศ์ จันทร์กระจ่าง",
  103: "ปิยะ วัฒนา",
  104: "มาลี ใจดี",
  112: "สมชาย ใจดี (หัวหน้าฝ่ายไอที)",
};

// "2026-11-05T13:00:00" -> "5 พ.ย. 13:00"
const formatShortThaiDate = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "24 ต.ค. 10:30";
  return date.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCurrentThaiTime = (): string => {
  return new Date().toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildInitialAuditList = (sessionId: string, branchId: string): AuditAssetItem[] => {
  const sessionChecks = new Map(
    inventoryChecks
      .filter((check) => check.sessionId === sessionId)
      .map((check) => [check.assetId, check]),
  );

  return rawAssets
    .filter((item: Asset) => item.branchId === branchId)
    .map((item: Asset) => {
      const check = sessionChecks.get(item.id);
      const foundBranch = branches.find((branch) => branch.id === item.branchId);
      const owner = STAFF_NAME_MAP[item.responsiblePersonId] ?? `พนักงาน #${item.responsiblePersonId}`;

      return {
        id: item.id,
        name: item.name,
        brandModel: `${item.brand} ${item.model}`,
        branchName: foundBranch?.name ?? "สำนักงานใหญ่",
        ownerName: owner,
        timestamp: formatShortThaiDate(check?.checkedAt ?? item.updatedAt),
        status: check ? "checked" : "unchecked",
      };
    });
};

// canScan = false คือมุมมองติดตามการนับของ admin (ไม่มีปุ่มสแกน)
export default function AuditBoard({ canScan }: { canScan: boolean }) {
  const router = useRouter();

  // ใช้รอบที่เสร็จแล้วเป็นค่าเริ่มต้น เพื่อแสดงผลตรวจจากข้อมูลจริง
  const currentSession = inventorySessions.find((session) => session.status === "completed") ?? inventorySessions[0];
  const sessionBranch =
    branches.find((b) => b.id === currentSession?.branchId)?.name ?? "สำนักงานใหญ่";
  const approverName =
    STAFF_NAME_MAP[currentSession?.createdBy ?? 112] ?? "หัวหน้าฝ่ายไอที";

  const [auditItems, setAuditItems] = useState<AuditAssetItem[]>(() =>
    currentSession ? buildInitialAuditList(currentSession.id, currentSession.branchId) : [],
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mockupNotice, setMockupNotice] = useState<string | null>(null);

  // แบ่งหน้าฝั่งตรวจแล้ว
  const [checkedPage, setCheckedPage] = useState<number>(1);
  const [checkedPerPage, setCheckedPerPage] = useState<number>(3);

  // แบ่งหน้าฝั่งยังไม่ตรวจ
  const [uncheckedPage, setUncheckedPage] = useState<number>(1);
  const [uncheckedPerPage, setUncheckedPerPage] = useState<number>(3);

  const showNotice = (message: string) => {
    setMockupNotice(message);
    setTimeout(() => {
      setMockupNotice(null);
    }, 2500);
  };

  // สแกนสำเร็จแล้วย้ายรายการไปฝั่งตรวจแล้ว
  const handleScanAsset = (assetId: string) => {
    const targetItem = auditItems.find((item) => item.id === assetId);
    if (!targetItem || targetItem.status === "checked") return;

    const updatedItem: AuditAssetItem = {
      ...targetItem,
      status: "checked",
      ownerName: "กานต์ พิพัฒน์",
      timestamp: getCurrentThaiTime(),
    };

    const remainingItems = auditItems.filter((item) => item.id !== assetId);
    setAuditItems([updatedItem, ...remainingItems]);

    showNotice(`สแกนสำเร็จ: ย้าย ${targetItem.id} (${targetItem.name}) มาฝั่งตรวจแล้ว`);
  };

  // ปุ่มทดสอบ: สแกนรายการถัดไปที่ยังไม่ตรวจ
  const handleSimulateNextScan = () => {
    const nextUnchecked = auditItems.find((item) => item.status === "unchecked");
    if (nextUnchecked) {
      handleScanAsset(nextUnchecked.id);
    } else {
      showNotice("ตรวจนับทรัพย์สินครบทุกรายการแล้ว 🎉");
    }
  };

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredAssets = auditItems.filter((item) => {
    if (!cleanQuery) return true;
    return (
      item.name.toLowerCase().includes(cleanQuery) ||
      item.id.toLowerCase().includes(cleanQuery) ||
      item.ownerName.toLowerCase().includes(cleanQuery)
    );
  });

  const checkedList = filteredAssets.filter((item) => item.status === "checked");
  const uncheckedList = filteredAssets.filter((item) => item.status === "unchecked");

  const totalCount = auditItems.length;
  const totalCheckedCount = auditItems.filter((item) => item.status === "checked").length;
  const progressPercent = totalCount > 0 ? (totalCheckedCount / totalCount) * 100 : 0;

  // กันเลขหน้าเกิน เช่นตอนค้นหาแล้วผลลัพธ์เหลือน้อยลง
  const totalCheckedPages = Math.max(1, Math.ceil(checkedList.length / checkedPerPage));
  const safeCheckedPage = Math.min(checkedPage, totalCheckedPages);
  const paginatedChecked = checkedList.slice(
    (safeCheckedPage - 1) * checkedPerPage,
    safeCheckedPage * checkedPerPage
  );

  const totalUncheckedPages = Math.max(1, Math.ceil(uncheckedList.length / uncheckedPerPage));
  const safeUncheckedPage = Math.min(uncheckedPage, totalUncheckedPages);
  const paginatedUnchecked = uncheckedList.slice(
    (safeUncheckedPage - 1) * uncheckedPerPage,
    safeUncheckedPage * uncheckedPerPage
  );

  return (
    <div className="min-h-screen bg-[#f4f5f9] text-slate-800 font-sans pb-10">
      {mockupNotice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          <span>✓</span>
          <span>{mockupNotice}</span>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
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
            {canScan ? "บันทึกผลและสรุปผลการตรวจนับ" : "ติดตามการนับ"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {canScan ? (
            <>
              <button
                type="button"
                onClick={() => router.push("/inventories/scan")}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                เปิดหน้าสแกน QR
              </button>
              <button
                type="button"
                onClick={handleSimulateNextScan}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                จำลองสแกน QR ถัดไป
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/inventories/schedule")}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              มอบหมายวันที่ตรวจนับ ›
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 pt-4 lg:pt-6">
        <div className="mb-3.5">
          <p className="lg:hidden text-xs font-bold text-[#4f46e5]">
            {currentSession?.id ?? "IS-0001"} (CNT-2026-010)
          </p>
          <p className="lg:hidden text-xs text-slate-500 mt-0.5">
            {currentSession?.name ?? "รอบตรวจนับประจำเดือน ต.ค. 2569"}
          </p>

          <p className="hidden lg:block text-sm text-slate-500 font-medium">
            {currentSession?.id ?? "IS-0001"} ·{" "}
            {currentSession?.name ?? "รอบตรวจนับประจำเดือน ต.ค. 2569"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-8">
          <div className="bg-white lg:bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-4 lg:px-5 py-3 lg:py-3.5 shadow-sm lg:shadow-none">
            <p className="text-[11px] lg:text-xs text-slate-400 mb-0.5 lg:mb-1">สาขา</p>
            <p className="text-xs lg:text-sm font-bold text-slate-800">{sessionBranch}</p>
          </div>
          <div className="bg-white lg:bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-4 lg:px-5 py-3 lg:py-3.5 shadow-sm lg:shadow-none">
            <p className="text-[11px] lg:text-xs text-slate-400 mb-0.5 lg:mb-1">ผู้อนุมัติ</p>
            <p className="text-xs lg:text-sm font-bold text-slate-800">{approverName}</p>
          </div>
        </div>

        <div className="bg-white lg:bg-transparent border border-slate-200/80 lg:border-none rounded-2xl p-4 lg:p-0 mb-4 lg:mb-5 shadow-sm lg:shadow-none">
          <p className="lg:hidden text-xs font-semibold text-slate-500 mb-1">จำนวนที่ตรวจแล้ว</p>
          <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 lg:gap-4">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 whitespace-nowrap">
              <span className="hidden lg:inline">จำนวนที่ตรวจแล้ว </span>
              {totalCheckedCount} / {totalCount}
            </h2>
            <div className="w-full lg:max-w-2xl bg-slate-100 lg:bg-white rounded-full h-2.5 lg:h-4 lg:p-0.5 lg:shadow-inner lg:border lg:border-slate-100 overflow-hidden">
              <div
                className="bg-[#5848e5] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-5 lg:mb-7">
          <div className="relative w-full lg:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              ⌕
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCheckedPage(1);
                setUncheckedPage(1);
              }}
              placeholder="ค้นหาชื่อ หรือรหัสทรัพย์สิน (เช่น AST-0001)"
              aria-label="ค้นหาชื่อ หรือรหัสทรัพย์สิน"
              className="w-full bg-white border border-slate-200 lg:border-slate-300 rounded-xl lg:rounded-lg pl-9 pr-3 py-2.5 lg:py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm lg:shadow-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ฝั่งซ้าย: ตรวจแล้ว */}
          <div>
            <div className="flex items-center justify-between mb-2.5 lg:mb-3">
              <h3 className="text-base lg:text-xl font-bold text-slate-900">รายการ ตรวจแล้ว</h3>
              <span className="hidden lg:inline-block bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 shadow-sm">
                ตรวจแล้ว {checkedList.length} รายการ
              </span>
            </div>

            <div className="lg:hidden bg-white border border-slate-200/90 rounded-xl py-2.5 px-4 text-center text-xs font-bold text-slate-800 mb-2.5 shadow-sm">
              ตรวจแล้ว {checkedList.length} รายการ
            </div>

            {/* มุมมอง Mobile */}
            <div className="lg:hidden space-y-2.5">
              {paginatedChecked.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200/80">
                  {cleanQuery ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีรายการที่ตรวจแล้ว"}
                </div>
              ) : (
                paginatedChecked.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#e8faed] border border-[#b7efc5] rounded-2xl p-3.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-sm shrink-0">
                        <LaptopIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">{item.id}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-medium text-slate-700">{item.ownerName}</p>
                        <p className="text-[11px] text-slate-500">{item.timestamp}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-[#a8f5b8] text-emerald-950 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        <span>•</span>
                        <span>ตรวจแล้ว</span>
                      </span>
                    </div>
                  </div>
                ))
              )}

              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm">
                <PaginationFooter
                  totalItems={checkedList.length}
                  perPage={checkedPerPage}
                  setPerPage={(val: number) => {
                    setCheckedPerPage(val);
                    setCheckedPage(1);
                  }}
                  currentPage={safeCheckedPage}
                  setCurrentPage={setCheckedPage}
                  totalPages={totalCheckedPages}
                  isMobile
                />
              </div>
            </div>

            {/* มุมมอง Desktop */}
            <div className="hidden lg:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex justify-between px-10 py-3 bg-[#f8f9fc] border-b border-slate-100 text-xs font-semibold text-slate-500">
                <span>ชื่อรายการ</span>
                <span>ผู้รับผิดชอบ</span>
              </div>

              <div className="p-2.5 space-y-2.5 min-h-[260px]">
                {paginatedChecked.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                    {cleanQuery ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีรายการที่ตรวจแล้ว"}
                  </div>
                ) : (
                  paginatedChecked.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-[#c3f7c8] border border-[#7be385] rounded-2xl px-4 py-3.5"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center text-slate-600 shadow-sm">
                          <LaptopIcon />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.id}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-800">{item.ownerName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <PaginationFooter
                totalItems={checkedList.length}
                perPage={checkedPerPage}
                setPerPage={(val: number) => {
                  setCheckedPerPage(val);
                  setCheckedPage(1);
                }}
                currentPage={safeCheckedPage}
                setCurrentPage={setCheckedPage}
                totalPages={totalCheckedPages}
              />
            </div>
          </div>

          {/* รายการ ยังไม่ได้ตรวจ (สีแดง) */}
          <div>
            <div className="flex items-center justify-between mb-2.5 lg:mb-3">
              <h3 className="text-base lg:text-xl font-bold text-slate-900">รายการ ยังไม่ได้ตรวจ</h3>
              <span className="hidden lg:inline-block bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 shadow-sm">
                คงเหลือ {uncheckedList.length} รายการ
              </span>
            </div>

            <div className="lg:hidden bg-white border border-slate-200/90 rounded-xl py-2.5 px-4 text-center text-xs font-bold text-slate-800 mb-2.5 shadow-sm">
              คงเหลือ {uncheckedList.length} รายการ
            </div>

            {/* มุมมอง Mobile */}
            <div className="lg:hidden space-y-2.5">
              {paginatedUnchecked.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200/80">
                  {cleanQuery ? "ไม่พบรายการที่ค้นหา" : "ตรวจนับครบทุกรายการแล้ว 🎉"}
                </div>
              ) : (
                paginatedUnchecked.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleScanAsset(item.id)}
                    disabled={!canScan}
                    className="w-full text-left bg-[#ffeded] enabled:hover:bg-[#ffe2e2] border border-[#f8c5c5] rounded-2xl p-3.5 shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-sm shrink-0">
                        <LaptopIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">{item.id}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-medium text-slate-700">{item.ownerName}</p>
                        <p className="text-[11px] text-slate-500">{item.timestamp}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-[#ffc9c9] text-rose-950 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        <span>•</span>
                        <span>ยังไม่ได้ตรวจ</span>
                      </span>
                    </div>
                  </button>
                ))
              )}

              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm">
                <PaginationFooter
                  totalItems={uncheckedList.length}
                  perPage={uncheckedPerPage}
                  setPerPage={(val: number) => {
                    setUncheckedPerPage(val);
                    setUncheckedPage(1);
                  }}
                  currentPage={safeUncheckedPage}
                  setCurrentPage={setUncheckedPage}
                  totalPages={totalUncheckedPages}
                  isMobile
                />
              </div>
            </div>

            {/* มุมมอง Desktop */}
            <div className="hidden lg:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex justify-between px-10 py-3 bg-[#f8f9fc] border-b border-slate-100 text-xs font-semibold text-slate-500">
                <span>ชื่อรายการ</span>
                <span>ผู้รับผิดชอบ</span>
              </div>

              <div className="p-2.5 space-y-2.5 min-h-[260px]">
                {paginatedUnchecked.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                    {cleanQuery ? "ไม่พบรายการที่ค้นหา" : "ตรวจนับครบทุกรายการแล้ว 🎉"}
                  </div>
                ) : (
                  paginatedUnchecked.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleScanAsset(item.id)}
                      disabled={!canScan}
                      title={canScan ? "คลิกเพื่อจำลองว่าสแกน QR รายการนี้แล้ว" : undefined}
                      className="w-full text-left enabled:cursor-pointer flex items-center justify-between bg-[#ffd8d8] enabled:hover:bg-[#ffcccc] border border-[#f5a3a3] rounded-2xl px-4 py-3.5 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center text-slate-600 shadow-sm">
                          <LaptopIcon />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.id}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-800">{item.ownerName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.timestamp}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <PaginationFooter
                totalItems={uncheckedList.length}
                perPage={uncheckedPerPage}
                setPerPage={(val: number) => {
                  setUncheckedPerPage(val);
                  setUncheckedPage(1);
                }}
                currentPage={safeUncheckedPage}
                setCurrentPage={setUncheckedPage}
                totalPages={totalUncheckedPages}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 lg:mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full lg:w-auto bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 lg:py-2.5 text-xs font-bold text-slate-800 shadow-sm flex items-center justify-center lg:justify-start gap-1.5 transition"
          >
            <span>‹</span>
            <span>ย้อนกลับ</span>
          </button>
        </div>
      </main>
    </div>
  );
}

function PaginationFooter({
  totalItems,
  perPage,
  setPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  isMobile = false,
}: PaginationFooterProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div
      className={`px-4 py-3 text-xs text-slate-500 space-y-2.5 ${
        isMobile ? "" : "border-t border-slate-100"
      }`}
    >
      <div>
        แสดง {startItem}–{endItem} จาก {totalItems} รายการ
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-2 ${
          isMobile ? "flex-col items-stretch" : ""
        }`}
      >
        <div className="flex items-center justify-between lg:justify-start gap-2">
          <span>แสดง</span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            aria-label="จำนวนรายการต่อหน้า"
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value={3}>3 รายการ</option>
            <option value={5}>5 รายการ</option>
            <option value={10}>10 รายการ</option>
          </select>
          <span>ต่อหน้า</span>
        </div>

        <div className="flex items-center justify-center gap-1 pt-1 lg:pt-0">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            ←
          </button>

          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`dots-${index}`}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center ${
                  currentPage === page
                    ? "bg-[#e0e0ff] text-[#4f46e5] border border-[#c7c7fe]"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

function LaptopIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
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
