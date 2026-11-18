"use client";

import { useState, useMemo, useSyncExternalStore, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AssetStatus } from "@/data/asset";
import { branches } from "@/data/branches";
import {
  getMergedAssets,
  getServerAssets,
  subscribeAssets,
} from "@/lib/assetStorage";
import { Trash2, ShieldAlert, ArrowLeft } from "lucide-react";

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
    const role: RoleKey = ["user", "admin", "president", "superadmin"].includes(
      parsed?.role
    )
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

function DeleteAssetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get("id") || "";

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

  const [confirmInput, setConfirmInput] = useState("");

  const targetAsset = useMemo(() => {
    return allAssets.find((item) => item.id === assetId);
  }, [allAssets, assetId]);

  const getBranchName = (branchId: string) => {
    const found = (branches as Record<string, string>[]).find(
      (b) => b.id === branchId || b.branchId === branchId
    );
    return found?.name || found?.branchName || branchId;
  };

  const getStatusLabel = (status: AssetStatus) => {
    const map: Record<AssetStatus, { label: string; color: string }> = {
      available: { label: "พร้อมใช้งาน", color: "text-emerald-600" },
      borrowed: { label: "กำลังถูกยืม", color: "text-sky-600" },
      repair: { label: "ซ่อมบำรุง", color: "text-amber-600" },
      damaged: { label: "ชำรุด", color: "text-rose-600" },
      disposed: { label: "จำหน่ายออก", color: "text-slate-600" },
    };
    return map[status];
  };

  if (!canManageAsset) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบรายการทรัพย์สินได้
        </p>
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
        >
          <ArrowLeft size={16} />
          <span>กลับหน้ารายการทรัพย์สิน</span>
        </Link>
      </div>
    );
  }

  if (!targetAsset) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center justify-center text-slate-600">
        <p className="text-lg font-semibold mb-3">
          ไม่พบข้อมูลทรัพย์สินที่ต้องการลบ ({assetId || "ไม่ได้ระบุรหัส"})
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

  const isConfirmed = confirmInput.trim() === targetAsset.id;
  const statusInfo = getStatusLabel(targetAsset.status);

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    try {
      const deleted = JSON.parse(
        localStorage.getItem("deleted_assets") || "[]"
      );
      if (!deleted.includes(targetAsset.id)) {
        localStorage.setItem(
          "deleted_assets",
          JSON.stringify([...deleted, targetAsset.id])
        );
        window.dispatchEvent(new Event("assetchange"));
      }
    } catch {
      // ignore storage error
    }

    alert(`ลบทรัพย์สิน ${targetAsset.name} (${targetAsset.id}) เรียบร้อยแล้ว`);
    router.push("/assets");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8 text-slate-800">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">ลบทรัพย์สิน</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <Link href="/assets" className="hover:text-indigo-600 transition">
              ทรัพย์สินทั้งหมด
            </Link>
            <span>/</span>
            <Link
              href={`/assets/${targetAsset.id}`}
              className="hover:text-indigo-600 transition"
            >
              {targetAsset.id}
            </Link>
            <span>/</span>
            <span className="text-slate-500 font-medium">ยืนยันการลบ</span>
          </div>
        </div>

        <form
          onSubmit={handleDelete}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Trash2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ยืนยันการลบทรัพย์สิน?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
          </div>

          <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-5 mb-6 space-y-1.5">
            <p className="text-xs text-slate-400 font-medium">
              {targetAsset.id}
            </p>
            <p className="text-base font-bold text-slate-900">
              {targetAsset.name}
            </p>
            <p className="text-xs text-slate-500">
              {getBranchName(targetAsset.branchId)}
            </p>
            <p className={`text-xs font-semibold pt-1 ${statusInfo.color}`}>
              {statusInfo.label}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              พิมพ์รหัสทรัพย์สินเพื่อยืนยัน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={targetAsset.id}
              className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={`/assets/${targetAsset.id}`}
              className="w-full py-3 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl text-center transition"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={!isConfirmed}
              className={`w-full py-3 px-6 text-sm font-semibold rounded-xl transition ${
                isConfirmed
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                  : "bg-rose-50 text-rose-400 cursor-not-allowed"
              }`}
            >
              ยืนยันการลบ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DeleteAssetPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-sm text-slate-500">กำลังโหลดข้อมูล...</div>}
    >
      <DeleteAssetForm />
    </Suspense>
  );
}