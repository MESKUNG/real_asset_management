"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AssetStatus } from "@/data/asset";
import { useAssets } from "@/lib/assets";
import { AssetBarcode, AssetQrCode } from "@/components/assets/AssetCodes";
import { branches } from "@/data/branches";
import { Laptop, ArrowLeft } from "lucide-react";

type RoleKey = "user" | "admin" | "president" | "superadmin";

type CredentialData = {
  role: RoleKey;
  branch_id?: string;
};

// --- อ่านสิทธิ์จาก localStorage ---
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

  if (!raw) return cachedParsed;

  try {
    const parsed = JSON.parse(raw);
    const role: RoleKey = ["user", "admin", "president", "superadmin"].includes(parsed?.role)
      ? parsed.role
      : "user";
    cachedParsed = {
      role,
      branch_id: parsed?.branch_id || parsed?.branchId || "BR-001",
    };
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

// แปลงวันที่เป็นรูปแบบไทย (เช่น 15 มกราคม 2569)
function formatThaiDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatThaiDateTime(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const datePart = d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = decodeURIComponent(String(params?.id || ""));
  const allAssets = useAssets();

  const credential = useSyncExternalStore(
    subscribeCredential,
    getClientCredential,
    getServerCredential
  );

  // เฉพาะ Admin และ Superadmin ที่เห็นปุ่มแก้ไข / ลบ
  const canManageAsset =
    credential.role === "admin" || credential.role === "superadmin";

  // ค้นหาข้อมูลทรัพย์สินตาม ID จาก URL
  const asset = useMemo(() => {
    return allAssets.find((item) => item.id === assetId);
  }, [allAssets, assetId]);

  const getBranchLabel = (branchId: string) => {
    const found = (branches as Record<string, string>[]).find(
      (b) => b.id === branchId || b.branchId === branchId
    );
    const name = found?.name || found?.branchName;
    return name ? `${name} (${branchId})` : branchId;
  };

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
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {style.label}
      </span>
    );
  };

  if (!asset) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center justify-center text-slate-600">
        <p className="text-lg font-semibold mb-3">
          ไม่พบข้อมูลทรัพย์สินรหัส {assetId}
        </p>
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl"
        >
          <ArrowLeft size={16} />
          <span>กลับหน้ารายการทรัพย์สิน</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Top Header + Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              รายละเอียดทรัพย์สิน
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <Link href="/assets" className="hover:text-indigo-600 transition">
                ทรัพย์สินทั้งหมด
              </Link>
              <span>/</span>
              <span className="text-slate-500 font-medium">{asset.id}</span>
            </div>
          </div>

          {/* ปุ่มแก้ไข / ลบ (แสดงเฉพาะ Admin และ Superadmin) */}
          {canManageAsset && (
            <div className="flex items-center gap-3">
              <Link
                href={`/assets/edit?id=${asset.id}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition"
              >
                แก้ไขข้อมูล
              </Link>
              <Link
                href={`/assets/delete?id=${asset.id}`}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium rounded-xl transition"
              >
                ลบทรัพย์สิน
              </Link>
            </div>
          )}
        </div>

        {/* Asset Summary Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 overflow-hidden">
            {asset.imageUrl ? (
              <Image src={asset.imageUrl} alt={asset.name} width={128} height={128} unoptimized className="h-full w-full object-cover" />
            ) : (
              <Laptop size={30} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{asset.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5 mb-2.5">
              {asset.id} · {asset.brand} {asset.model}
            </p>
            {renderStatusBadge(asset.status)}
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {asset.imageUrl && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                <Image
                  src={asset.imageUrl}
                  alt={`ภาพทรัพย์สิน ${asset.name}`}
                  width={1200}
                  height={900}
                  unoptimized
                  className="max-h-96 w-full rounded-xl object-contain"
                />
              </div>
            )}

            {/* การ์ดข้อมูลทั่วไป */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-5">
                ข้อมูลทั่วไป
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-xs text-slate-400 mb-1">รหัสทรัพย์สิน</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asset.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">หมวดหมู่</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asset.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">ยี่ห้อ / รุ่น</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asset.brand} / {asset.model}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Serial number</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asset.serialNumber || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">วันที่ซื้อ</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatThaiDate(asset.purchaseDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">มูลค่าที่ซื้อ</p>
                  <p className="text-sm font-semibold text-slate-800">
                    ฿
                    {asset.purchasePrice.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">ผู้จำหน่าย</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asset.vendorId || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">
                    วันสิ้นสุดการรับประกัน
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatThaiDate(asset.warrantyEndDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* การ์ดสาขาและผู้รับผิดชอบ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-5">
                สาขาและผู้รับผิดชอบ
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-xs text-slate-400 mb-1">สาขา</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {getBranchLabel(asset.branchId)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">ผู้รับผิดชอบ</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asset.responsiblePersonId
                      ? `รหัสพนักงาน #${asset.responsiblePersonId}`
                      : "ยังไม่มอบหมาย"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: ประวัติการอัปเดต (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs h-full">
              <h3 className="text-base font-bold text-slate-900 mb-5">
                ประวัติการอัปเดต
              </h3>

              <div className="space-y-5">
                {asset.updatedAt && asset.updatedAt !== asset.createdAt && (
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-xs text-slate-400">
                      {formatThaiDateTime(asset.updatedAt)}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      อัปเดตข้อมูลทรัพย์สิน
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      ผู้ใช้งาน #{asset.updatedBy}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-400">
                    {formatThaiDateTime(asset.createdAt)}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    เพิ่มทรัพย์สินเข้าระบบ
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    ผู้ใช้งาน #{asset.createdBy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code / Barcode Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs mb-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            QR Code / Barcode
          </h3>

          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              รหัส QR / Barcode
            </label>
            <input
              type="text"
              readOnly
              value={asset.id}
              className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* QR Code Box */}
            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-800">
                  QR Code
                </span>
                {renderStatusBadge(asset.status)}
              </div>

              <div className="border border-slate-100 rounded-xl py-8 flex flex-col items-center justify-center bg-slate-50/30">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <AssetQrCode value={asset.id} className="w-28 h-28" />
                </div>
                <span className="text-xs text-slate-400 mt-2">
                  {asset.id}
                </span>
              </div>
            </div>

            {/* Barcode Box */}
            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-800">
                  Barcode
                </span>
                {renderStatusBadge(asset.status)}
              </div>

              <div className="border border-slate-100 rounded-xl py-8 flex flex-col items-center justify-center bg-slate-50/30">
                <AssetBarcode value={asset.id} className="h-16 w-64 max-w-full" />
                <span className="text-xs text-slate-400 mt-2">
                  {asset.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Timestamp */}
        <p className="text-xs text-slate-400">
          อัปเดตล่าสุด {formatThaiDateTime(asset.updatedAt)} โดยผู้ใช้งาน #
          {asset.updatedBy}
        </p>
      </div>
    </div>
  );
}
