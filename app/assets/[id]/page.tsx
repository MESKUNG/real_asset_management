"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AssetStatus } from "@/data/asset";
import { branches } from "@/data/branches";
import { categories } from "@/data/catagories";
import {
  getMergedAssets,
  getServerAssets,
  subscribeAssets,
} from "@/lib/assetStorage";
import { AssetQrCode, AssetBarcode } from "@/components/AssetCodeVisuals";
import { Laptop, ArrowLeft } from "lucide-react";
import { useLanguage, useTranslate } from "@/lib/language";

type RoleKey = "user" | "admin" | "president" | "superadmin";

type CredentialData = {
  role: RoleKey;
  branch_id?: string;
};

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
function formatThaiDate(dateStr: string | undefined, language: "th" | "en") {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(language === "en" ? "en-US" : "th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatThaiDateTime(dateStr: string | undefined, language: "th" | "en") {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const datePart = d.toLocaleDateString(language === "en" ? "en-US" : "th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString(language === "en" ? "en-US" : "th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

export default function AssetDetailPage() {
  const language = useLanguage();
  const translateText = useTranslate();
  const params = useParams();
  const assetId = decodeURIComponent(String(params?.id || ""));

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

  const canManageAsset =
    credential.role === "admin" || credential.role === "superadmin";

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

  const getCategoryName = (categoryValue: string) => {
    const found = categories.find(
      (c) => c.id === categoryValue || c.name === categoryValue
    );
    return found?.name || categoryValue;
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

          {translateText("ไม่พบข้อมูลทรัพย์สินรหัส")} {assetId}
        </p>
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl"
        >
          <ArrowLeft size={16} />
          <span>{translateText("กลับหน้ารายการทรัพย์สิน")}</span>
        </Link>
      </div>
    );
  }

  const qrValue = asset.qrCode || asset.id;
  const barcodeValue = asset.barcode || asset.qrCode || asset.id;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Top Header + Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">

              {translateText("รายละเอียดทรัพย์สิน")}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <Link href="/assets" className="hover:text-indigo-600 transition">

                {translateText("ทรัพย์สินทั้งหมด")}
              </Link>
              <span>/</span>
              <span className="text-slate-500 font-medium">{asset.id}</span>
            </div>
          </div>

          {canManageAsset && (
            <div className="flex items-center gap-3">
              <Link
                href={`/assets/edit?id=${asset.id}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition"
              >

                {translateText("แก้ไขข้อมูล")}
              </Link>
              <Link
                href={`/assets/delete?id=${asset.id}`}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium rounded-xl transition"
              >

                {translateText("ลบทรัพย์สิน")}
              </Link>
            </div>
          )}
        </div>

        {/* Asset Summary Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 overflow-hidden">
            {asset.assetImage ? (
              <Image
                src={asset.assetImage}
                alt={asset.name}
                width={128}
                height={128}
                unoptimized
                className="h-full w-full object-cover"
              />
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
            {asset.assetImage && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                <Image
                  src={asset.assetImage}
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

                {translateText("ข้อมูลทั่วไป")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{translateText("รหัสทรัพย์สิน")}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asset.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">{translateText("หมวดหมู่")}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {getCategoryName(asset.category)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">{translateText("ยี่ห้อ / รุ่น")}</p>
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
                  <p className="text-xs text-slate-400 mb-1">{translateText("วันที่ซื้อ")}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatThaiDate(asset.purchaseDate, language)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">{translateText("มูลค่าที่ซื้อ")}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    ฿
                    {asset.purchasePrice.toLocaleString(language === "en" ? "en-US" : "th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">{translateText("ผู้จำหน่าย")}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asset.vendorId || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">

                    {translateText("วันสิ้นสุดการรับประกัน")}
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatThaiDate(asset.warrantyEndDate, language)}
                  </p>
                </div>
              </div>
            </div>

            {/* การ์ดสาขาและผู้รับผิดชอบ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-5">

                {translateText("สาขาและผู้รับผิดชอบ")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{translateText("สาขา")}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {getBranchLabel(asset.branchId)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">{translateText("ผู้รับผิดชอบ")}</p>
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

                {translateText("ประวัติการอัปเดต")}
              </h3>

              <div className="space-y-5">
                {asset.updatedAt && asset.updatedAt !== asset.createdAt && (
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-xs text-slate-400">
                      {formatThaiDateTime(asset.updatedAt, language)}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">

                      {translateText("อัปเดตข้อมูลทรัพย์สิน")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">

                      {translateText("ผู้ใช้งาน #")}{asset.updatedBy}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-400">
                    {formatThaiDateTime(asset.createdAt, language)}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">

                    {translateText("เพิ่มทรัพย์สินเข้าระบบ")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">

                    {translateText("ผู้ใช้งาน #")}{asset.createdBy}
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

              {translateText("รหัส QR / Barcode")}
            </label>
            <input
              type="text"
              readOnly
              value={qrValue}
              className="w-full px-4 py-2.5 text-sm font-mono bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
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
                <AssetQrCode value={qrValue} />
                <span className="text-xs font-mono text-slate-500 mt-2.5">
                  {qrValue}
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
                <AssetBarcode value={barcodeValue} />
                <span className="text-xs font-mono text-slate-500 mt-2.5">
                  {barcodeValue}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Timestamp */}
        <p className="text-xs text-slate-400">

          {translateText("อัปเดตล่าสุด")} {formatThaiDateTime(asset.updatedAt, language)}  {translateText("โดยผู้ใช้งาน #")}
          {asset.updatedBy}
        </p>
      </div>
    </div>
  );
}