"use client";

import {
  useState,
  useMemo,
  useSyncExternalStore,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Select, { type StylesConfig } from "react-select";
import { Asset } from "@/data/asset";
import { branches } from "@/data/branches";
import { categories } from "@/data/catagories";
import {
  getMergedAssets,
  getServerAssets,
  subscribeAssets,
} from "@/lib/assetStorage";
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
import { useTranslate } from "@/lib/language";

type RoleKey = "user" | "admin" | "president" | "superadmin";

type CredentialData = {
  role: RoleKey;
  branch_id?: string;
  staff_id?: number | null;
};

type StaffOption = {
  value: string;
  label: string;
  staffId: number | null;
  isDisabled: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStaffOptions(value: unknown): StaffOption[] {
  if (!Array.isArray(value)) {
    throw new Error("รูปแบบข้อมูลบัญชี Staff ไม่ถูกต้อง");
  }

  return value.map((account, index) => {
    if (
      !isRecord(account) ||
      typeof account.id !== "number" ||
      (account.staff_id !== null && typeof account.staff_id !== "number") ||
      typeof account.first_name !== "string" ||
      typeof account.last_name !== "string" ||
      typeof account.username !== "string" ||
      (account.status !== "Active" && account.status !== "Inactive")
    ) {
      throw new Error(`ข้อมูลบัญชี Staff รายการที่ ${index + 1} ไม่ถูกต้อง`);
    }

    const name =
      [account.first_name, account.last_name].filter(Boolean).join(" ").trim() ||
      account.username.trim();
    if (!name) {
      throw new Error(`บัญชี Staff รายการที่ ${index + 1} ไม่มีชื่อ`);
    }

    const staffId =
      account.staff_id !== null &&
      Number.isInteger(account.staff_id) &&
      account.staff_id > 0
        ? account.staff_id
        : null;
    const staffCode = staffId
      ? `STF-${String(staffId).padStart(3, "0")}`
      : "ไม่มีรหัสพนักงาน";
    const accountStatus =
      account.status === "Inactive" ? " · ระงับบัญชี" : "";

    return {
      value: staffId === null ? `account-${account.id}` : String(staffId),
      label: `${name} (${staffCode})${accountStatus}`,
      staffId,
      isDisabled: staffId === null,
    };
  });
}

const staffSelectStyles: StylesConfig<StaffOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 12,
    borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 2px rgb(99 102 241 / 0.2)" : "none",
    "&:hover": { borderColor: "#6366f1" },
  }),
  valueContainer: (base) => ({ ...base, paddingLeft: 40 }),
  menuPortal: (base) => ({ ...base, zIndex: 50 }),
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

// ย่อขนาดและบีบอัดรูปภาพก่อนเก็บลง localStorage
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

export default function AddAssetPage() {
  const translateText = useTranslate();
  const router = useRouter();
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

  // สร้างรหัสทรัพย์สินถัดไปอัตโนมัติ (นับรวมรายการที่เพิ่งเพิ่มใหม่ด้วย)
  const nextAssetId = useMemo(() => {
    const maxNum = allAssets.reduce((max, item) => {
      const num = parseInt(item.id.replace(/\D/g, ""), 10);
      return Number.isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `AST-${String(maxNum + 1).padStart(4, "0")}`;
  }, [allAssets]);

  const categoryOptions = categories;

  // รายชื่อสาขา
  const branchOptions = useMemo(() => {
    return (branches as Record<string, string>[]).map((b) => ({
      id: b.id || b.branchId || "",
      name: b.name || b.branchName || b.id || "",
    }));
  }, []);

  // Image States
  const [assetImage, setAssetImage] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]?.id || "");
  const [isAvailable, setIsAvailable] = useState(true);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  const [branchId, setBranchId] = useState(
    credential.branch_id || branchOptions[0]?.id || "BR-001"
  );
  const [responsiblePersonId, setResponsiblePersonId] = useState<string>("");
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [staffLoadError, setStaffLoadError] = useState("");

  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyEndDate, setWarrantyEndDate] = useState("");

  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStaffOptions() {
      try {
        const response = await fetch("/api/staff-management/accounts", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`โหลดรายชื่อ Staff ไม่สำเร็จ (HTTP ${response.status})`);
        }

        const options = parseStaffOptions(await response.json());
        setStaffOptions(options);
        setStaffLoadError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Could not load staff options for asset assignment:", error);
        setStaffLoadError(
          error instanceof Error
            ? error.message
            : "โหลดรายชื่อ Staff ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingStaff(false);
      }
    }

    void loadStaffOptions();
    return () => controller.abort();
  }, []);

  // ป้องกันสิทธิ์ User / President เข้ามาเพิ่มข้อมูล
  if (!canManageAsset) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">

          {translateText("ไม่มีสิทธิ์เข้าถึงหน้านี้")}
        </h2>
        <p className="text-sm text-slate-500 mb-5">

          {translateText("เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเพิ่มรายการทรัพย์สินได้")}
        </p>
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
        >
          <ArrowLeft size={16} />
          <span>{translateText("กลับหน้ารายการทรัพย์สิน")}</span>
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

    const now = new Date().toISOString();
    const newAsset: Asset = {
      id: nextAssetId,
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
      purchaseDate: purchaseDate || now.split("T")[0],
      warrantyEndDate: warrantyEndDate || now.split("T")[0],
      vendorId: vendorName.trim() || "VND-001",
      qrCode: nextAssetId,
      barcode: nextAssetId,
      createdAt: now,
      updatedAt: now,
      createdBy: credential.staff_id || 1,
      updatedBy: credential.staff_id || 1,
    };

    try {
      const saved = JSON.parse(localStorage.getItem("custom_assets") || "[]");
      localStorage.setItem(
        "custom_assets",
        JSON.stringify([newAsset, ...saved])
      );
      window.dispatchEvent(new Event("assetchange"));
    } catch {
      alert("พื้นที่จัดเก็บชั่วคราวเต็ม กรุณาลดขนาดรูปภาพหรือใช้รูปที่เล็กลง");
      return;
    }

    alert(`บันทึกทรัพย์สิน ${newAsset.name} (${newAsset.id}) เรียบร้อยแล้ว`);
    router.push("/assets");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8 text-slate-800">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-slate-900">{translateText("เพิ่มทรัพย์สิน")}</h1>

        {/* Card 1: ข้อมูลทั่วไป + รูปภาพทรัพย์สิน */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">

            {translateText("ข้อมูลทั่วไป")}
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
                      alt={name || "ตัวอย่างรูปภาพทรัพย์สิน"}
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

          {/* แถว 1: รหัสทรัพย์สิน & ชื่อทรัพย์สิน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("รหัสทรัพย์สิน")}
              </label>
              <input
                type="text"
                disabled
                value={nextAssetId}
                className="w-full px-4 py-2.5 text-sm bg-slate-200/70 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("ชื่อทรัพย์สิน")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='เช่น MacBook Pro 14"'
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* แถว 2: หมวดหมู่ & สถานะ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("หมวดหมู่")} <span className="text-rose-500">*</span>
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

                {translateText("สถานะ")} <span className="text-rose-500">*</span>
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
                <span>{translateText("พร้อมใช้งาน")}</span>
              </button>
            </div>
          </div>

          {/* แถว 3: ยี่ห้อ, รุ่น, Serial number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("ยี่ห้อ")}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="เช่น Apple"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("รุ่น")}
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="เช่น MacBook Pro M3 Pro"
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
                placeholder="เช่น C02XK7QLMD6T"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: สาขาและตำแหน่งจัดเก็บ */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">

            {translateText("สาขาและตำแหน่งจัดเก็บ")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("สาขา")} <span className="text-rose-500">*</span>
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

                {translateText("ผู้รับผิดชอบ")}
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Select<StaffOption, false>
                  inputId="responsible-person-select"
                  options={staffOptions}
                  value={
                    staffOptions.find(
                      (option) => option.value === responsiblePersonId,
                    ) ?? null
                  }
                  onChange={(option) =>
                    setResponsiblePersonId(
                      option?.staffId ? String(option.staffId) : "",
                    )
                  }
                  placeholder={translateText("พิมพ์ชื่อเพื่อค้นหา Staff...")}
                  noOptionsMessage={() => translateText("ไม่พบรายชื่อ Staff")}
                  loadingMessage={() =>
                    translateText("กำลังโหลดรายชื่อ Staff...")
                  }
                  isLoading={isLoadingStaff}
                  isDisabled={isLoadingStaff || Boolean(staffLoadError)}
                  isClearable
                  isSearchable
                  styles={staffSelectStyles}
                  menuPosition="fixed"
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                />
              </div>
              {staffLoadError && (
                <p className="mt-1 text-xs text-rose-600">{staffLoadError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: การรับประกัน / และค่าเสื่อมราคา */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">

            {translateText("การรับประกัน / และค่าเสื่อมราคา")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("มูลค่าที่ซื้อ (บาท)")}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("วันที่ซื้อ")}
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

                {translateText("สิ้นสุดการรับประกัน")}
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

        {/* Card 4: ผู้จำหน่าย */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-5">

            {translateText("ผู้จำหน่าย")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("ผู้จำหน่าย")}
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="เช่น Synnex"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">

                {translateText("ที่อยู่")}
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

                {translateText("เบอร์ติดต่อ")}
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

                {translateText("อีเมล")}
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

        {/* Bottom Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Link
            href="/assets"
            className="w-full py-3 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl text-center transition"
          >

            {translateText("ยกเลิก")}
          </Link>
          <button
            type="submit"
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >

            {translateText("บันทึกทรัพย์สิน")}
          </button>
        </div>
      </form>
    </div>
  );
}
