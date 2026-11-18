"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { assets as initialAssets, Asset, AssetStatus } from "@/data/asset";
import { branches } from "@/data/branches";
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
  const credential = useSyncExternalStore(
    subscribeCredential,
    getClientCredential,
    getServerCredential
  );

  const { role, branch_id: userBranchId } = credential;

  // สิทธิ์ตาม Role
  const canViewAllBranches = role === "president" || role === "superadmin";
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
    const ids = Array.from(new Set(initialAssets.map((a) => a.branchId)));
    return ids.map((id) => ({ id, name: getBranchName(id) }));
  }, []);

  // กรองข้อมูลตามสิทธิ์ Role + Search + Branch + Status
  const filteredAssets = useMemo(() => {
    return initialAssets
      .filter((item) => {
        // 1. User / Admin เห็นเฉพาะสาขาของตัวเอง
        if (!canViewAllBranches && userBranchId && item.branchId !== userBranchId) {
          return false;
        }
        // 2. President / Superadmin กรองตาม Dropdown สาขาได้
        if (canViewAllBranches && selectedBranch !== "all" && item.branchId !== selectedBranch) {
          return false;
        }
        // 3. กรองตามสถานะ
        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }
        // 4. ค้นหาจากชื่อ, รหัส, ยี่ห้อ, รุ่น, Serial Number
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
  }, [canViewAllBranches, userBranchId, selectedBranch, selectedStatus, search]);

  // คำนวณสถิติสำหรับ Summary Card (จากข้อมูลที่กรองตามสิทธิ์แล้ว)
  const stats = useMemo(() => {
    const total = filteredAssets.length;
    const ready = filteredAssets.filter(
      (a) => a.status === "available" || a.status === "borrowed"
    ).length;
    const repair = filteredAssets.filter((a) => a.status === "repair").length;
    const damaged = filteredAssets.filter(
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
  }, [filteredAssets]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAssets = filteredAssets.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Badge สถานะภาษาไทย
  const renderStatusBadge = (status: AssetStatus) => {
    const map: Record<
      AssetStatus,
      { label: string; bg: string; text: string; dot: string }
    > = {
      available: {
        label: "พร้อมใช้งาน",
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        dot: "bg-emerald-500",
      },
      borrowed: {
        label: "กำลังถูกยืม",
        bg: "bg-sky-50",
        text: "text-sky-600",
        dot: "bg-sky-500",
      },
      repair: {
        label: "ซ่อมบำรุง",
        bg: "bg-amber-50",
        text: "text-amber-600",
        dot: "bg-amber-500",
      },
      damaged: {
        label: "ชำรุด",
        bg: "bg-rose-50",
        text: "text-rose-600",
        dot: "bg-rose-500",
      },
      disposed: {
        label: "จำหน่ายออก",
        bg: "bg-slate-100",
        text: "text-slate-600",
        dot: "bg-slate-500",
      },
    };

    const style = map[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${style.bg} ${style.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {style.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ทรัพย์สินทั้งหมด</h1>
            <p className="text-sm text-slate-500 mt-1">
              {canViewAllBranches
                ? "ค้นหาและจัดการทะเบียนทรัพย์สินของทุกสาขา"
                : `ค้นหาและจัดการทะเบียนทรัพย์สินของสาขา (${getBranchName(userBranchId || "")})`}
            </p>
          </div>

          {canManageAsset && (
            <Link
              href="/assets/add"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition"
            >
              <Plus size={18} />
              <span>เพิ่มทรัพย์สิน</span>
            </Link>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Boxes size={22} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-700 font-semibold">ทรัพย์สินทั้งหมด</span>
                <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
                <span className="text-slate-600 text-sm">รายการ</span>
              </div>
            </div>
            <Link
              href="/reports"
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
              title="ดูรายงาน"
            >
              <BarChart2 size={20} />
            </Link>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-3.5 rounded-full overflow-hidden flex gap-1 bg-slate-100 mb-3">
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
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>พร้อมใช้งาน / ใช้งานอยู่ {stats.ready}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>ซ่อมบำรุง {stats.repair}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>ชำรุด / จำหน่าย {stats.damaged}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
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
              placeholder="ค้นหาชื่อ, รหัสทรัพย์สิน, ยี่ห้อ หรือ Serial Number"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="pl-10 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="all">ทุกสาขา</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
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
              className="pl-10 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="available">พร้อมใช้งาน</option>
              <option value="borrowed">กำลังถูกยืม</option>
              <option value="repair">ซ่อมบำรุง</option>
              <option value="damaged">ชำรุด</option>
              <option value="disposed">จำหน่ายออก</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          ทั้งหมด {filteredAssets.length} รายการ · เรียงตามอัปเดตล่าสุด
        </p>

        {/* Table Header (Desktop) */}
        <div className="hidden md:grid grid-cols-12 px-6 py-2.5 text-xs font-medium text-slate-400">
          <div className="col-span-4">ทรัพย์สิน / รหัส</div>
          <div className="col-span-3">ผู้รับผิดชอบ / ยี่ห้อ</div>
          <div className="col-span-2">สาขา</div>
          <div className="col-span-1">สถานะ</div>
          <div className="col-span-1 text-right">มูลค่า</div>
          <div className="col-span-1" />
        </div>

        {/* Asset List Rows */}
        <div className="space-y-2.5">
          {paginatedAssets.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-sm text-slate-400 border border-slate-100">
              ไม่พบรายการทรัพย์สินที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            paginatedAssets.map((asset: Asset) => (
              <div
                key={asset.id}
                className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-0 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-200 transition relative"
              >
                {/* ทรัพย์สิน / รหัส */}
                <div className="col-span-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Laptop size={18} />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition truncate block"
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
                  <p className="text-sm text-slate-700">
                    {asset.responsiblePersonId
                      ? `รหัสพนักงาน #${asset.responsiblePersonId}`
                      : "ยังไม่มอบหมาย"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {asset.brand} {asset.model}
                  </p>
                </div>

                {/* สาขา */}
                <div className="col-span-2 text-sm text-slate-600">
                  {getBranchName(asset.branchId)}
                </div>

                {/* สถานะ */}
                <div className="col-span-1">{renderStatusBadge(asset.status)}</div>

                {/* มูลค่า */}
                <div className="col-span-1 md:text-right text-sm font-medium text-slate-700">
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
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenuId === asset.id && (
                        <div className="absolute right-0 top-9 z-20 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-xs">
                          <Link
                            href={`/assets/edit?id=${asset.id}`}
                            className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil size={14} />
                            <span>แก้ไขข้อมูล</span>
                          </Link>
                          <Link
                            href={`/assets/delete?id=${asset.id}`}
                            className="flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                            <span>ลบทรัพย์สิน</span>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-slate-500">
          <span>
            แสดง {filteredAssets.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(safePage * ITEMS_PER_PAGE, filteredAssets.length)} จาก{" "}
            {filteredAssets.length} รายการ
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40"
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
                        ? "bg-indigo-100 text-indigo-600 font-semibold"
                        : "hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))}

            <button
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}