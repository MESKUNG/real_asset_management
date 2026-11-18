"use client";

import { useState, useMemo, useSyncExternalStore, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Asset } from "@/data/asset";
import { branches } from "@/data/branches";
import { categories } from "@/data/catagories";
import {
  getMergedAssets,
  getServerAssets,
  subscribeAssets,
} from "@/lib/assetStorage";
import { AssetQrCode, AssetBarcode } from "@/components/AssetCodeVisuals";
import {
  LayoutGrid,
  Building2,
  User,
  ShieldAlert,
  ArrowLeft,
  Check,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";

type RoleKey = "user" | "admin" | "president" | "superadmin";

type CredentialData = {
  role: RoleKey;
  branch_id?: string;
  staff_id?: number | null;
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
  return { role: "admin", branch_id: "BR-001", staff_id: 1 };
}

let cachedRaw: string | null = null;
let cachedParsed: CredentialData = {
  role: "admin",
  branch_id: "BR-001",
  staff_id: 1,
};

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
      staff_id: parsed?.staff_id ?? 1,
    };
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

function toInputDate(dateStr?: string) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10);
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function compressImageToDataUrl(file: File, maxSize = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("ไม่สามารถโหลดไฟล์ได้"));
    reader.readAsDataURL(file);
  });
}

function EditAssetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get("id") || "";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const targetAsset = useMemo(() => {
    return allAssets.find((item) => item.id === assetId);
  }, [allAssets, assetId]);

  const categoryOptions = useMemo(() => {
    const list = categories.map((c) => ({ id: c.id, name: c.name }));
    const currentVal = targetAsset?.category;
    if (
      currentVal &&
      !list.some((c) => c.id === currentVal || c.name === currentVal)
    ) {
      list.push({ id: currentVal, name: currentVal });
    }
    return list;
  }, [targetAsset]);

  const initialCategoryId = useMemo(() => {
    const currentVal = targetAsset?.category || "";
    const matched = categoryOptions.find(
      (c) => c.id === currentVal || c.name === currentVal
    );
    return matched?.id || categoryOptions[0]?.id || "";
  }, [targetAsset, categoryOptions]);

  const branchOptions = useMemo(() => {
    return (branches as Record<string, string>[]).map((b) => ({
      id: b.id || b.branchId || "",
      name: b.name || b.branchName || b.id || "",
    }));
  }, []);

  const [assetImage, setAssetImage] = useState<string>(
    targetAsset?.assetImage || ""
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [name, setName] = useState(targetAsset?.name || "");
  const [category, setCategory] = useState(initialCategoryId);
  const [isAvailable, setIsAvailable] = useState(
    targetAsset ? targetAsset.status === "available" : true
  );
  const [brand, setBrand] = useState(targetAsset?.brand || "");
  const [model, setModel] = useState(targetAsset?.model || "");
  const [serialNumber, setSerialNumber] = useState(
    targetAsset?.serialNumber || ""
  );

  const [branchId, setBranchId] = useState(
    targetAsset?.branchId || credential.branch_id || "BR-001"
  );
  const [responsiblePersonId, setResponsiblePersonId] = useState(
    targetAsset?.responsiblePersonId
      ? String(targetAsset.responsiblePersonId)
      : ""
  );

  const [purchasePrice, setPurchasePrice] = useState(
    targetAsset ? String(targetAsset.purchasePrice) : ""
  );
  const [purchaseDate, setPurchaseDate] = useState(
    toInputDate(targetAsset?.purchaseDate)
  );
  const [warrantyEndDate, setWarrantyEndDate] = useState(
    toInputDate(targetAsset?.warrantyEndDate)
  );

  const [vendorName, setVendorName] = useState(targetAsset?.vendorId || "");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [qrCodeText, setQrCodeText] = useState(
    targetAsset?.qrCode || targetAsset?.id || ""
  );

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
          เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขข้อมูลทรัพย์สินได้
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
          ไม่พบข้อมูลทรัพย์สินที่ต้องการแก้ไข ({assetId || "ไม่ได้ระบุรหัส"})
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)");
      return;
    }

    try {
      setIsUploadingImage(true);
      const compressedDataUrl = await compressImageToDataUrl(file, 800);
      setAssetImage(compressedDataUrl);
    } catch {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedAsset: Asset = {
      ...targetAsset,
      name: name.trim(),
      category,
      status: isAvailable ? "available" : "repair",
      brand: brand.trim() || "-",
      model: model.trim() || "-",
      serialNumber: serialNumber.trim() || "-",
      assetImage: assetImage || undefined,
      branchId,
      responsiblePersonId: responsiblePersonId
        ? Number(responsiblePersonId)
        : 0,
      purchasePrice: Number(purchasePrice) || 0,
      purchaseDate: purchaseDate || targetAsset.purchaseDate,
      warrantyEndDate: warrantyEndDate || targetAsset.warrantyEndDate,
      vendorId: vendorName.trim() || targetAsset.vendorId,
      qrCode: qrCodeText.trim() || targetAsset.id,
      barcode: qrCodeText.trim() || targetAsset.id,
      updatedAt: new Date().toISOString(),
      updatedBy: credential.staff_id || 1,
    };

    try {
      const saved = JSON.parse(localStorage.getItem("updated_assets") || "{}");
      saved[updatedAsset.id] = updatedAsset;
      localStorage.setItem("updated_assets", JSON.stringify(saved));
      window.dispatchEvent(new Event("assetchange"));
    } catch {
      alert("พื้นที่จัดเก็บชั่วคราวเต็ม กรุณาลดขนาดรูปภาพหรือใช้รูปที่เล็กลง");
      return;
    }

    alert(`บันทึกการเปลี่ยนแปลง ${updatedAsset.name} (${updatedAsset.id}) เรียบร้อยแล้ว`);
    router.push(`/assets/${updatedAsset.id}`);
  };

  const liveCodeValue = qrCodeText.trim() || targetAsset.id;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8 text-slate-800">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">แก้ไขทรัพย์สิน</h1>
          <p className="text-xs text-slate-400 mt-1">
            {targetAsset.id} · {targetAsset.name}
          </p>
        </div>

        {/* Card 1: ข้อมูลทั่วไป + รูปภาพทรัพย์สิน */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">
            ข้อมูลทั่วไป
          </h2>

          {/* ส่วนอัปโหลดรูปภาพ */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              รูปภาพทรัพย์สิน
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <div className="relative w-32 h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {assetImage ? (
                  <>
                    <Image
                      src={assetImage}
                      alt={name || targetAsset.name}
                      width={256}
                      height={256}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAssetImage("")}
                      title="ลบรูปภาพ"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon size={26} />
                    <span className="text-[11px] mt-1">ไม่มีรูปภาพ</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={15} />
                    <span>
                      {isUploadingImage
                        ? "กำลังอัปโหลด..."
                        : assetImage
                        ? "เปลี่ยนรูปภาพ"
                        : "อัปโหลดรูปภาพ"}
                    </span>
                  </button>

                  {assetImage && (
                    <button
                      type="button"
                      onClick={() => setAssetImage("")}
                      className="px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  รองรับไฟล์ JPG, PNG, WEBP (ระบบจะปรับขนาดให้อัตโนมัติเพื่อความรวดเร็ว)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                รหัสทรัพย์สิน <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled
                value={targetAsset.id}
                className="w-full px-4 py-2.5 text-sm bg-slate-200/70 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                รหัสทรัพย์สินไม่สามารถเปลี่ยนแปลงได้
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                ชื่อทรัพย์สิน <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                หมวดหมู่ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LayoutGrid
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                สถานะ <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className="inline-flex items-center gap-2.5 py-2.5 text-sm text-slate-700 cursor-pointer"
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                    isAvailable
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-300 bg-white"
                  }`}
                >
                  {isAvailable && <Check size={14} strokeWidth={3} />}
                </span>
                <span>พร้อมใช้งาน</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                ยี่ห้อ
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                รุ่น
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Serial number
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">
            สาขาและตำแหน่งจัดเก็บ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                สาขา <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  required
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {branchOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                ผู้รับผิดชอบ
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={responsiblePersonId}
                  onChange={(e) => setResponsiblePersonId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">ยังไม่มอบหมาย</option>
                  <option value="1">กานต์ พิพัฒน์ (STF-001)</option>
                  <option value="2">นภา สุขใจ (STF-002)</option>
                  <option value="3">วิชัย ทองดี (STF-003)</option>
                  <option value="4">สุดา แก้วใส (STF-004)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">
            การรับประกัน / และค่าเสื่อมราคา
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                มูลค่าที่ซื้อ (บาท)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                วันที่ซื้อ
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                สิ้นสุดการรับประกัน
              </label>
              <input
                type="date"
                value={warrantyEndDate}
                onChange={(e) => setWarrantyEndDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">
            ผู้จำหน่าย
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                ผู้จำหน่าย
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                ที่อยู่
              </label>
              <input
                type="text"
                value={vendorAddress}
                onChange={(e) => setVendorAddress(e.target.value)}
                placeholder="ที่อยู่บริษัทผู้จำหน่าย"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                เบอร์ติดต่อ
              </label>
              <input
                type="tel"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                placeholder="เช่น 025538899"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="เช่น service@vendor.co.th"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* QR Code / Barcode Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            QR Code / Barcode
          </h2>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              รหัส QR / Barcode
            </label>
            <input
              type="text"
              value={qrCodeText}
              onChange={(e) => setQrCodeText(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-800">
                  QR Code
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isAvailable
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAvailable ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {isAvailable ? "พร้อมใช้งาน" : "ซ่อมบำรุง"}
                </span>
              </div>

              <div className="border border-slate-100 rounded-xl py-8 flex flex-col items-center justify-center bg-slate-50/30">
                <AssetQrCode value={liveCodeValue} />
                <span className="text-xs font-mono text-slate-500 mt-2.5">
                  {liveCodeValue}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-800">
                  Barcode
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isAvailable
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAvailable ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {isAvailable ? "พร้อมใช้งาน" : "ซ่อมบำรุง"}
                </span>
              </div>

              <div className="border border-slate-100 rounded-xl py-8 flex flex-col items-center justify-center bg-slate-50/30">
                <AssetBarcode value={liveCodeValue} />
                <span className="text-xs font-mono text-slate-500 mt-2.5">
                  {liveCodeValue}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Link
            href={`/assets/${targetAsset.id}`}
            className="w-full py-3 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl text-center transition"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditAssetPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">กำลังโหลดข้อมูล...</div>}>
      <EditAssetForm />
    </Suspense>
  );
}