"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Asset, AssetStatus } from "@/data/asset";
import { branches } from "@/data/branches";
import { useTheme, useTranslate } from "@/lib/language";
import {
  getMergedAssets,
  getServerAssets,
  subscribeAssets,
} from "@/lib/assetStorage";
import {
  Search,
  Plus,
  Building2,
  CheckCircle2,
  Laptop,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Boxes,
  BarChart2,
  Pencil,
  Trash2,
} from "lucide-react";

type RoleKey = "user" | "admin" | "president" | "superadmin";

type CredentialData = {
  role: RoleKey;
  branch_id?: string;
  staff_id?: number | null;
};

const ITEMS_PER_PAGE = 6;

// --- ดึงข้อมูล Credential จาก localStorage แบบเดียวกับ sideNavbar.tsx ---
function subscribeCredential(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("credentialchange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

function getServerCredential(): CredentialData {
  return { role: "admin", branch_id: "BR-001" };
}

let cachedRaw: string | null = null;
let cachedParsed: CredentialData = { role: "admin", branch_id: "BR-001" };

function getClientCredential(): CredentialData {
  const raw = localStorage.getItem("credential");
  if (raw === cachedRaw) return cachedParsed;
  cachedRaw = raw;

  if (!raw) {
    cachedParsed = { role: "admin", branch_id: "BR-001" };
    return cachedParsed;
  }

  try {
    const parsed = JSON.parse(raw);
    const role: RoleKey = ["user", "admin", "president", "superadmin"].includes(parsed?.role)
      ? parsed.role
      : "user";
    cachedParsed = {
      role,
      branch_id: parsed?.branch_id || parsed?.branchId || "BR-001",
      staff_id: parsed?.staff_id ?? null,
    };
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

export default function AssetListPage() {
  const isDark = useTheme() === "dark";
  const translateText = useTranslate();
  const surfaceClass = isDark
    ? "border-slate-700 bg-slate-900"
    : "border-slate-100 bg-white";
  const fieldClass = isDark
    ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400"
    : "border-slate-200 bg-white text-slate-700 placeholder:text-slate-400";
  const primaryTextClass = isDark ? "text-slate-100" : "text-slate-900";
  const bodyTextClass = isDark ? "text-slate-200" : "text-slate-700";

  // ดึงข้อมูลรวมจาก data/asset.ts + รายการที่เพิ่ม/แก้ไข/ลบ
  const allAssets = useSyncExternalStore(
    subscribeAssets,
    getMergedAssets,
    getServerAssets
  );

  const credential = useSyncExternalStore(
    subscribeCredential,
    getClientCredential,
    getServerCredential
  );

  const { role, branch_id: userBranchId } = credential;

  // สิทธิ์ตาม Role: Admin, President, Superadmin ดูได้ทุกสาขา (User ดูได้เฉพาะสาขาตัวเอง)
  const canViewAllBranches =
    role === "admin" || role === "president" || role === "superadmin";
  const canManageAsset = role === "admin" || role === "superadmin";

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // แปลง branchId -> ชื่อสาขา (รองรับทั้งโครงสร้าง { id, name } หรือ { branchId, branchName })
  const getBranchName = (branchId: string) => {
    const found = (branches as Record<string, string>[]).find(
      (b) => b.id === branchId || b.branchId === branchId
    );
    return found?.name || found?.branchName || branchId;
  };

  // รายชื่อสาขาสำหรับ Dropdown
  const branchOptions = useMemo(() => {
    const ids = Array.from(new Set(allAssets.map((a) => a.branchId)));
    return ids.map((id) => ({ id, name: getBranchName(id) }));
  }, [allAssets]);

  // ข้อมูลตั้งต้นทั้งหมดตามสิทธิ์ (ใช้คำนวณการ์ดสรุปด้านบน ไม่เปลี่ยนตามช่องค้นหา/ตัวกรอง)
  const scopedAssets = useMemo(() => {
    return allAssets.filter((item) => {
      if (!canViewAllBranches && userBranchId && item.branchId !== userBranchId) {
        return false;
      }
      return true;
    });
  }, [allAssets, canViewAllBranches, userBranchId]);

  // คำนวณสถิติสำหรับ Summary Card (ค่าคงที่ ไม่เปลี่ยนเวลาค้นหาหรือกรองสถานะ)
  const stats = useMemo(() => {
    const total = scopedAssets.length;
    const ready = scopedAssets.filter(
      (a) => a.status === "available" || a.status === "borrowed"
    ).length;
    const repair = scopedAssets.filter((a) => a.status === "repair").length;
    const damaged = scopedAssets.filter(
      (a) => a.status === "damaged" || a.status === "disposed"
    ).length;

    return {
      total,
      ready,
      repair,
      damaged,
      readyPct: total ? (ready / total) * 100 : 0,
      repairPct: total ? (repair / total) * 100 : 0,
      damagedPct: total ? (damaged / total) * 100 : 0,
    };
  }, [scopedAssets]);

  // กรองข้อมูลตามสิทธิ์ Role + Search + Branch + Status
  const filteredAssets = useMemo(() => {
    return scopedAssets
      .filter((item) => {
        if (canViewAllBranches && selectedBranch !== "all" && item.branchId !== selectedBranch) {
          return false;
        }
        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }
        if (search.trim() !== "") {
          const q = search.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q) ||
            item.brand.toLowerCase().includes(q) ||
            item.model.toLowerCase().includes(q) ||
            item.serialNumber.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [scopedAssets, canViewAllBranches, selectedBranch, selectedStatus, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAssets = filteredAssets.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // สร้างป้ายสถานะให้ใช้สีตามธีมและข้อความตามภาษาที่เลือก
  const renderStatusBadge = (status: AssetStatus) => {
    const map: Record<
      AssetStatus,
      { label: string; bg: string; text: string; dot: string }
    > = {
      available: {
        label: "พร้อมใช้งาน",
        bg: isDark ? "bg-emerald-950/60" : "bg-emerald-50",
        text: isDark ? "text-emerald-300" : "text-emerald-600",
        dot: "bg-emerald-500",
      },
      borrowed: {
        label: "กำลังถูกยืม",
        bg: isDark ? "bg-sky-950/60" : "bg-sky-50",
        text: isDark ? "text-sky-300" : "text-sky-600",
        dot: "bg-sky-500",
      },
      repair: {
        label: "ซ่อมบำรุง",
        bg: isDark ? "bg-amber-950/60" : "bg-amber-50",
        text: isDark ? "text-amber-300" : "text-amber-600",
        dot: "bg-amber-500",
      },
      damaged: {
        label: "ชำรุด",
        bg: isDark ? "bg-rose-950/60" : "bg-rose-50",
        text: isDark ? "text-rose-300" : "text-rose-600",
        dot: "bg-rose-500",
      },
      disposed: {
        label: "จำหน่ายออก",
        bg: isDark ? "bg-slate-700" : "bg-slate-100",
        text: isDark ? "text-slate-300" : "text-slate-600",
        dot: "bg-slate-500",
      },
    };

    const style = map[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${style.bg} ${style.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {translateText(style.label)}
      </span>
    );
  };

  return (
    <div className={`min-h-screen p-3 text-slate-800 sm:p-6 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${primaryTextClass}`}>{translateText("ทรัพย์สินทั้งหมด")}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {canViewAllBranches
                ? translateText("ค้นหาและจัดการทะเบียนทรัพย์สินของทุกสาขา")
                : `${translateText("ค้นหาและจัดการทะเบียนทรัพย์สินของสาขา")} (${translateText(getBranchName(userBranchId || ""))})`}
            </p>
          </div>

          {canManageAsset && (
            <Link
              href="/assets/add"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition"
            >
              <Plus size={18} />
              <span>{translateText("เพิ่มทรัพย์สิน")}</span>
            </Link>
          )}
        </div>

        {/* Summary Card (แสดงยอดคงที่ ไม่เปลี่ยนตามตัวกรอง) */}
        <div className={`rounded-2xl border p-4 shadow-xs mb-6 sm:p-6 ${surfaceClass}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isDark ? "bg-indigo-950/60 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>
                <Boxes size={22} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`font-semibold ${bodyTextClass}`}>{translateText("ทรัพย์สินทั้งหมด")}</span>
                <span className={`text-3xl font-bold ${primaryTextClass}`}>{stats.total}</span>
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{translateText("รายการ")}</span>
              </div>
            </div>
            <Link
              href="/reports"
              className={`rounded-lg p-2 transition ${isDark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"}`}
              title={translateText("ดูรายงาน")}
            >
              <BarChart2 size={20} />
            </Link>
          </div>

          {/* Segmented Progress Bar */}
          <div className={`mb-3 flex h-3.5 w-full gap-1 overflow-hidden rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            {stats.readyPct > 0 && (
              <div
                style={{ width: `${stats.readyPct}%` }}
                className="bg-emerald-600 transition-all duration-300"
              />
            )}
            {stats.repairPct > 0 && (
              <div
                style={{ width: `${stats.repairPct}%` }}
                className="bg-amber-600 transition-all duration-300"
              />
            )}
            {stats.damagedPct > 0 && (
              <div
                style={{ width: `${stats.damagedPct}%` }}
                className="bg-rose-500 transition-all duration-300"
              />
            )}
          </div>

          {/* Legend */}
          <div className={`flex flex-wrap items-center gap-6 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{translateText("พร้อมใช้งาน / ใช้งานอยู่")} {stats.ready}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>{translateText("ซ่อมบำรุง")} {stats.repair}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{translateText("ชำรุด / จำหน่าย")} {stats.damaged}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={translateText("ค้นหาชื่อ, รหัสทรัพย์สิน, ยี่ห้อ หรือ Serial Number")}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${fieldClass}`}
            />
          </div>

          {/* Dropdown สาขา */}
          <div className="relative">
            <Building2
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              disabled={!canViewAllBranches}
              value={canViewAllBranches ? selectedBranch : userBranchId || "all"}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-xl border py-2.5 pl-10 pr-8 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 ${fieldClass}`}
              style={{ colorScheme: isDark ? "dark" : "light" }}
            >
              <option value="all">{translateText("ทุกสาขา")}</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {translateText(b.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown สถานะ */}
          <div className="relative">
            <CheckCircle2
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-xl border py-2.5 pl-10 pr-8 text-sm outline-none ${fieldClass}`}
              style={{ colorScheme: isDark ? "dark" : "light" }}
            >
              <option value="all">{translateText("ทุกสถานะ")}</option>
              <option value="available">{translateText("พร้อมใช้งาน")}</option>
              <option value="borrowed">{translateText("กำลังถูกยืม")}</option>
              <option value="repair">{translateText("ซ่อมบำรุง")}</option>
              <option value="damaged">{translateText("ชำรุด")}</option>
              <option value="disposed">{translateText("จำหน่ายออก")}</option>
            </select>
          </div>
        </div>

        <p className="mb-4 text-xs text-slate-400">
          {translateText("ทั้งหมด")} {filteredAssets.length} {translateText("รายการ")} · {translateText("เรียงตามอัปเดตล่าสุด")}
        </p>

        {/* Table Header (Desktop) */}
        <div className="hidden md:grid grid-cols-12 px-6 py-2.5 text-xs font-medium text-slate-400">
          <div className="col-span-4">{translateText("ทรัพย์สิน / รหัส")}</div>
          <div className="col-span-3">{translateText("ผู้รับผิดชอบ / ยี่ห้อ")}</div>
          <div className="col-span-2">{translateText("สาขา")}</div>
          <div className="col-span-1">{translateText("สถานะ")}</div>
          <div className="col-span-1 text-right">{translateText("มูลค่า")}</div>
          <div className="col-span-1" />
        </div>

        {/* Asset List Rows */}
        <div className="space-y-2.5">
          {paginatedAssets.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center text-sm text-slate-400 ${surfaceClass}`}>
              {translateText("ไม่พบรายการทรัพย์สินที่ตรงกับเงื่อนไขการค้นหา")}
            </div>
          ) : (
            paginatedAssets.map((asset: Asset) => (
              <div
                key={asset.id}
                className={`relative grid grid-cols-1 items-center gap-3 rounded-2xl border px-4 py-4 shadow-xs transition hover:border-indigo-400 sm:px-6 md:grid-cols-12 md:gap-0 ${surfaceClass} ${isDark ? "hover:bg-slate-800" : "hover:bg-indigo-50/40"}`}
              >
                {/* ทรัพย์สิน / รหัส */}
                <div className="col-span-4 flex items-center gap-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-100 bg-slate-50 text-slate-500"}`}>
                    {asset.assetImage ? (
                      <Image
                        src={asset.assetImage}
                        alt={asset.name}
                        width={80}
                        height={80}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Laptop size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/assets/${asset.id}`}
                      className={`block truncate text-sm font-semibold transition hover:text-indigo-500 ${isDark ? "text-slate-100" : "text-slate-800"}`}
                    >
                      {asset.name}
                    </Link>
                    <p className="text-xs text-slate-400">
                      {asset.id} · {asset.category}
                    </p>
                  </div>
                </div>

                {/* ผู้รับผิดชอบ */}
                <div className="col-span-3">
                  <p className={`text-sm ${bodyTextClass}`}>
                    {asset.responsiblePersonId
                      ? `${translateText("รหัสพนักงาน")} #${asset.responsiblePersonId}`
                      : translateText("ยังไม่มอบหมาย")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {asset.brand} {asset.model}
                  </p>
                </div>

                {/* สาขา */}
                <div className={`col-span-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {translateText(getBranchName(asset.branchId))}
                </div>

                {/* สถานะ */}
                <div className="col-span-1">{renderStatusBadge(asset.status)}</div>

                {/* มูลค่า */}
                <div className={`col-span-1 text-sm font-medium md:text-right ${bodyTextClass}`}>
                  ฿{asset.purchasePrice.toLocaleString()}
                </div>

                {/* Action Menu (...) */}
                <div className="col-span-1 flex justify-end relative">
                  {canManageAsset && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === asset.id ? null : asset.id)
                        }
                        className={`rounded-lg p-1.5 ${isDark ? "text-slate-400 hover:bg-slate-700 hover:text-slate-100" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenuId === asset.id && (
                        <div className={`absolute right-0 top-9 z-20 w-36 rounded-xl border py-1.5 text-xs shadow-lg ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-100 bg-white"}`}>
                          <Link
                            href={`/assets/edit?id=${asset.id}`}
                            className={`flex items-center gap-2 px-3.5 py-2 ${isDark ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            <Pencil size={14} />
                            <span>{translateText("แก้ไขข้อมูล")}</span>
                          </Link>
                          <Link
                            href={`/assets/delete?id=${asset.id}`}
                            className={`flex items-center gap-2 px-3.5 py-2 ${isDark ? "text-rose-300 hover:bg-rose-950/50" : "text-rose-600 hover:bg-rose-50"}`}
                          >
                            <Trash2 size={14} />
                            <span>{translateText("ลบทรัพย์สิน")}</span>
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className={`mt-6 flex flex-col items-center justify-between gap-4 text-xs sm:flex-row ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <span>
            {translateText("แสดง")} {filteredAssets.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(safePage * ITEMS_PER_PAGE, filteredAssets.length)} {translateText("จาก")}{" "}
            {filteredAssets.length} {translateText("รายการ")}
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`rounded-lg p-1.5 transition disabled:opacity-40 ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - safePage) <= 1
              )
              .map((page, idx, arr) => (
                <div key={page} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-1.5 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg font-medium transition ${
                      safePage === page
                        ? isDark
                          ? "bg-indigo-500/20 font-semibold text-indigo-200"
                          : "bg-indigo-100 font-semibold text-indigo-600"
                        : isDark
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))}

            <button
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`rounded-lg p-1.5 transition disabled:opacity-40 ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}