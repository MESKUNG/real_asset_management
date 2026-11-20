"use client";
import { useTheme, useTranslate } from "@/lib/language";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type FormEventHandler,
} from "react";
import { Plus } from "@tailgrids/icons";
import { ImagePlus, ScanQrCode, X } from "lucide-react";
import Image from "next/image";
import CodeScanner from "@/components/scanner/CodeScanner";
import { assets } from "@/data/asset";
import { branches } from "@/data/branches";
import {
  MAX_REPAIR_IMAGES,
  MAX_REPAIR_IMAGE_SIZE,
} from "@/lib/repairImages";

// หน้าต่างนี้รับข้อมูลคำร้องใหม่; หน้าแม่เป็นคนบันทึกหลังจากกดส่ง
type CreateRepairModalProps = {
  // ปุ่มปิดหน้าต่างและปุ่มส่งคำร้องถูกจัดการจากหน้า repairsuser/page.tsx
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, images: File[]) => void;
  error?: string;
  branchId: string | null;
  branchReady: boolean;
  isSubmitting: boolean;
};

export default function CreateRepairModal({
  onClose,
  onSubmit,
  error,
  branchId,
  branchReady,
  isSubmitting,
}: CreateRepairModalProps) {
  const translateText = useTranslate();
  const isDark = useTheme() === "dark";
  const primaryTextClass = isDark ? "text-slate-100" : "text-slate-900";
  const secondaryTextClass = isDark ? "text-slate-300" : "text-slate-700";
  const fieldClass = isDark
    ? "border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";
  const surfaceClass = isDark
    ? "border-slate-700 bg-slate-900"
    : "border-slate-200 bg-white";
  const [assetQuery, setAssetQuery] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [isAssetListOpen, setIsAssetListOpen] = useState(false);
  const [assetError, setAssetError] = useState("");
  const [qrMessage, setQrMessage] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const previewUrls = useRef<string[]>([]);
  const [imageError, setImageError] = useState("");
  const userBranch = branches.find((branch) => branch.id === branchId);
  useEffect(
    () => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  const normalizedAssetQuery = assetQuery.trim().toLocaleLowerCase();
  // ค้นจากชื่อ รหัส และ Serial Number แล้วจำกัดคำแนะนำไว้ 8 รายการ
  const matchingAssets = assets
    .filter((asset) => asset.branchId === userBranch?.id)
    .filter((asset) =>
      [asset.name, asset.id, asset.serialNumber].some((value) =>
        value.toLocaleLowerCase().includes(normalizedAssetQuery),
      ),
    )
    .slice(0, 8);

  // เก็บรหัสทรัพย์สินที่เลือกจริง ไม่ใช้แค่ข้อความที่พิมพ์ในช่องค้นหา
  const selectAsset = (asset: (typeof assets)[number]) => {
    setSelectedAssetId(asset.id);
    setAssetQuery(`${asset.name} (${asset.id})`);
    setIsAssetListOpen(false);
    setAssetError("");
  };

  const handleQrScan = (rawValue: string) => {
    let code = rawValue.trim();
    if (!code) {
      setQrMessage("ไม่พบรหัสทรัพย์สินใน QR Code");
      return;
    }

    try {
      const parsed: unknown = JSON.parse(code);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const values = parsed as Record<string, unknown>;
        const parsedCode = values.assetId ?? values.id;
        if (typeof parsedCode === "string" && parsedCode.trim()) {
          code = parsedCode.trim();
        }
      }
    } catch {
      // QR Code อาจเก็บ Asset ID เป็นข้อความธรรมดา
    }

    const matchedAsset = assets.find(
      (asset) => asset.id === code || asset.qrCode === code,
    );
    if (!matchedAsset) {
      setQrMessage(`ไม่พบทรัพย์สินรหัส ${code}`);
      return;
    }

    if (matchedAsset.branchId !== userBranch?.id) {
      setQrMessage("ทรัพย์สินนี้ไม่ได้อยู่ในสาขาของคุณ");
      return;
    }

    selectAsset(matchedAsset);
    setQrMessage(`สแกนสำเร็จ: ${matchedAsset.name} (${matchedAsset.id})`);
  };

  const handleImageSelection = (files: File[]) => {
    const invalidFile = files.find(
      (file) =>
        !file.type.startsWith("image/") || file.size > MAX_REPAIR_IMAGE_SIZE,
    );
    const clearSelection = () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current = [];
      setSelectedImages([]);
    };
    if (files.length > MAX_REPAIR_IMAGES) {
      clearSelection();
      setImageError("เลือกภาพได้ไม่เกิน 3 ภาพ");
      return;
    }
    if (invalidFile) {
      clearSelection();
      setImageError(
        invalidFile.size > MAX_REPAIR_IMAGE_SIZE
          ? "ไฟล์ภาพต้องมีขนาดไม่เกิน 10 MB"
          : "รองรับไฟล์รูปภาพเท่านั้น",
      );
      return;
    }

    setImageError("");
    clearSelection();
    const nextImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    previewUrls.current = nextImages.map(({ previewUrl }) => previewUrl);
    setSelectedImages(nextImages);
  };

  const removeSelectedImage = (index: number) => {
    const removedImage = selectedImages[index];
    if (!removedImage) return;

    URL.revokeObjectURL(removedImage.previewUrl);
    setImageError("");
    previewUrls.current = previewUrls.current.filter(
      (url) => url !== removedImage.previewUrl,
    );
    setSelectedImages((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  // ตรวจว่ามีการเลือกทรัพย์สินจากรายการก่อนส่งข้อมูลให้หน้าแม่
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    if (!branchReady || !userBranch) {
      event.preventDefault();
      setAssetError("ไม่พบสาขาของผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ");
      return;
    }

    // ต้องเลือกจากคำแนะนำเพื่อให้ assetId ที่ส่งไปเป็นรหัสจริง ไม่ใช่ข้อความที่พิมพ์
    if (!selectedAssetId) {
      event.preventDefault();
      setAssetError("เลือกทรัพย์สินจากรายการ");
      setIsAssetListOpen(true);
      return;
    }

    const selectedAsset = assets.find((asset) => asset.id === selectedAssetId);
    if (!selectedAsset || selectedAsset.branchId !== userBranch.id) {
      event.preventDefault();
      setAssetError("เลือกทรัพย์สินจากสาขาของคุณ");
      return;
    }

    setAssetError("");
    if (selectedImages.length > MAX_REPAIR_IMAGES) {
      event.preventDefault();
      setImageError("เลือกภาพได้ไม่เกิน 3 ภาพ");
      return;
    }
    onSubmit(
      event,
      selectedImages.map(({ file }) => file),
    );
  };

  return (
    // กล่องด้านนอกคือพื้นหลัง; เปลี่ยนความกว้างของฟอร์มได้ที่ max-w-lg
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-repair-title"
        className={`w-full max-w-lg rounded-xl p-5 shadow-xl ${isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2
            id="create-repair-title"
            className={`text-lg font-semibold ${primaryTextClass}`}
          >

            {translateText("สร้างคำร้องแจ้งซ่อม")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={translateText("ปิดหน้าต่าง")}
            className={`rounded-md px-2 py-1 text-xl leading-none transition ${isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
          >
            ×
          </button>
        </div>

        {error && (
          <p role="alert" className={`mb-4 rounded-md px-3 py-2 text-sm ${isDark ? "bg-rose-950/50 text-rose-200" : "bg-rose-50 text-rose-600"}`}>
            {translateText(error)}
          </p>
        )}

        {/* ชื่อ name ตรงกับช่องที่หน้า repairsuser/page.tsx อ่านตอนกดส่ง */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* รายชื่อทรัพย์สินมาจาก data/asset.ts */}
          <div>
            <label
              htmlFor="repair-asset-search"
              className={`block text-sm font-medium ${secondaryTextClass}`}
            >
              {translateText("ทรัพย์สิน")}
            </label>
            <div className="mt-1.5 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <input
                  id="repair-asset-search"
                  type="text"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={isAssetListOpen}
                  aria-controls="repair-asset-options"
                  aria-invalid={Boolean(assetError)}
                  aria-describedby={assetError ? "repair-asset-error" : undefined}
                  autoComplete="off"
                  required
                  value={assetQuery}
                  onFocus={() => setIsAssetListOpen(true)}
                  onBlur={() => setIsAssetListOpen(false)}
                  onChange={(event) => {
                    setAssetQuery(event.target.value);
                    setSelectedAssetId("");
                    setAssetError("");
                    setQrMessage("");
                    setIsAssetListOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      isAssetListOpen &&
                      matchingAssets.length > 0
                    ) {
                      event.preventDefault();
                      selectAsset(matchingAssets[0]);
                    } else if (event.key === "Escape") {
                      setIsAssetListOpen(false);
                    }
                  }}
                  placeholder={translateText("พิมพ์ชื่อหรือรหัสทรัพย์สิน")}
                  className={`h-10 w-full rounded-md border px-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${fieldClass}`}
                />
                <input
                  type="hidden"
                  name="assetId"
                  value={selectedAssetId}
                  readOnly
                />
                {isAssetListOpen && (
                  <ul
                    id="repair-asset-options"
                    role="listbox"
                    className={`absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-md border py-1 shadow-lg ${surfaceClass}`}
                  >
                    {matchingAssets.length > 0 ? (
                      matchingAssets.map((asset) => (
                        <li key={asset.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={asset.id === selectedAssetId}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectAsset(asset)}
                            className={`flex w-full flex-col px-3 py-2 text-left text-sm transition ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                          >
                            <span className={`font-medium ${primaryTextClass}`}>
                              {asset.name}
                            </span>
                            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              {asset.id} · {asset.serialNumber}
                            </span>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className={`px-3 py-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {translateText("ไม่พบทรัพย์สินที่ตรงกัน")}
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <button
                type="button"
                disabled={!branchReady || !userBranch}
                onClick={() => {
                  setQrMessage("");
                  setIsScannerOpen(true);
                }}
                aria-label={translateText("สแกน QR")}
                className="inline-flex h-10 shrink-0 items-center gap-2 pr-1 text-sm font-medium text-indigo-600 transition hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <ScanQrCode className="size-5" aria-hidden="true" />
                </span>
                <span>{translateText("สแกน QR")}</span>
              </button>
            </div>
            {qrMessage && (
              <p
                role="status"
                className={`mt-1 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                {translateText(qrMessage)}
              </p>
            )}
            {assetError && (
              <p
                id="repair-asset-error"
                role="alert"
                className="mt-1 text-xs text-rose-600"
              >
                {translateText(assetError)}
              </p>
            )}
          </div>
          {/* คำร้องจากหน้า User ถูกกำหนดให้เป็นสาขาเชียงใหม่เท่านั้น */}
          <label className={`block text-sm font-medium ${secondaryTextClass}`}>
            {translateText("สาขา")}
            <input
              type="hidden"
              name="branchId"
              value={userBranch?.id ?? ""}
              readOnly
            />
            <span className={`mt-1.5 flex h-10 items-center rounded-md border px-3 text-sm font-normal ${isDark ? "border-slate-600 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
              {translateText(
                !branchReady
                  ? "กำลังโหลดข้อมูลสาขา..."
                  : userBranch?.name ?? "ไม่พบสาขาของผู้ใช้",
              )}
            </span>
          </label>
          {/* ต้องกรอกอาการก่อนส่งคำร้อง */}
          <label className={`block text-sm font-medium ${secondaryTextClass}`}>

            {translateText("อาการที่พบ")}
            <textarea
              name="issue"
              required
              rows={3}
              placeholder={translateText("อธิบายอาการหรือปัญหาที่พบ")}
              className={`mt-1.5 w-full resize-y rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${fieldClass}`}
            />
          </label>
          <div>
            <label
              htmlFor="repair-images"
              className={`mb-1.5 block text-sm font-medium ${secondaryTextClass}`}
            >
              {translateText("แนบภาพประกอบ (ไม่เกิน 3 ภาพ)")}
            </label>
            <label
              htmlFor="repair-images"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-3 text-sm transition ${isDark ? "border-slate-600 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              {translateText("เลือกรูปภาพ")}
            </label>
            <input
              id="repair-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                handleImageSelection(Array.from(event.currentTarget.files ?? []));
                event.currentTarget.value = "";
              }}
              className="sr-only"
            />
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {translateText("รองรับไฟล์ภาพ ไม่เกิน 10 MB ต่อภาพ")}
            </p>
            {selectedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {selectedImages.map(({ file, previewUrl }, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className={`relative overflow-hidden rounded-md border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                  >
                    <Image
                      src={previewUrl}
                      alt={`${translateText("รูปภาพประกอบ")} ${index + 1}`}
                      width={240}
                      height={160}
                      unoptimized
                      className="h-20 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      aria-label={`${translateText("ลบภาพ")} ${index + 1}`}
                      className="absolute right-1 top-1 rounded-full bg-slate-950/70 p-1 text-white"
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imageError && (
              <p role="alert" className="mt-1 text-xs text-rose-600">
                {translateText(imageError)}
              </p>
            )}
          </div>
          {/* เลือกระดับความเร่งด่วนของงานซ่อม */}
          <label className={`block text-sm font-medium ${secondaryTextClass}`}>

            {translateText("ระดับความเร่งด่วน")}
            <select
              name="priority"
              defaultValue="medium"
              className={`mt-1.5 h-10 w-full rounded-md border px-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${fieldClass}`}
              style={{ colorScheme: isDark ? "dark" : "light" }}
            >
              <option value="low" className={isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-900"}>{translateText("ต่ำ")}</option>
              <option value="medium" className={isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-900"}>{translateText("ปกติ")}</option>
              <option value="high" className={isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-900"}>{translateText("สูง")}</option>
              <option value="urgent" className={isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-900"}>{translateText("เร่งด่วน")}</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-md border px-4 py-2 text-sm transition ${isDark ? "border-slate-600 text-slate-200 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >

              {translateText("ยกเลิก")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            >
              {!isSubmitting && <Plus className="size-4" />}
              {translateText(isSubmitting ? "กำลังส่งคำร้อง..." : "ส่งคำร้อง")}
            </button>
          </div>
        </form>
      </section>
      {isScannerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsScannerOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="repair-qr-scanner-title"
            onClick={(event) => event.stopPropagation()}
            className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-4 shadow-xl ${
              isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-900"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 id="repair-qr-scanner-title" className="text-lg font-bold">
                {translateText("สแกน QR Code")}
              </h2>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                aria-label={translateText("ปิด")}
                className="rounded-md px-2 py-1 text-xl leading-none hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <CodeScanner
              onScan={(code, format) => {
                if (format !== "qr_code") return;
                handleQrScan(code);
                setIsScannerOpen(false);
              }}
              allowManual={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
