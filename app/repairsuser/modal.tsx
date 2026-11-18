"use client";
import { useTranslate } from "@/lib/language";

import Link from "next/link";
import { useState, type FormEventHandler } from "react";
import { Plus } from "@tailgrids/icons";
import { ScanQrCode } from "lucide-react";
import { assets } from "@/data/asset";
import { HEAD_OFFICE_BRANCH_ID } from "@/data/branches";

type CreateRepairModalProps = {
  // ปุ่มปิดหน้าต่างและปุ่มส่งคำร้องถูกจัดการจากหน้า repairsuser/page.tsx
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  error?: string;
};

export default function CreateRepairModal({
  onClose,
  onSubmit,
  error,
}: CreateRepairModalProps) {
  const translateText = useTranslate();
  const [assetQuery, setAssetQuery] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [isAssetListOpen, setIsAssetListOpen] = useState(false);
  const [assetError, setAssetError] = useState("");
  const normalizedAssetQuery = assetQuery.trim().toLocaleLowerCase();
  // ค้นจากชื่อ รหัส และ Serial Number แล้วจำกัดคำแนะนำไว้ 8 รายการ
  const matchingAssets = assets
    .filter((asset) =>
      [asset.name, asset.id, asset.serialNumber].some((value) =>
        value.toLocaleLowerCase().includes(normalizedAssetQuery),
      ),
    )
    .slice(0, 8);

  const selectAsset = (asset: (typeof assets)[number]) => {
    setSelectedAssetId(asset.id);
    setAssetQuery(`${asset.name} (${asset.id})`);
    setIsAssetListOpen(false);
    setAssetError("");
  };

  const handleSubmit:
  FormEventHandler<HTMLFormElement> = (event) => {
    // ต้องเลือกจากคำแนะนำเพื่อให้ assetId ที่ส่งไปเป็นรหัสจริง ไม่ใช่ข้อความที่พิมพ์
    if (!selectedAssetId) {
      event.preventDefault();
      setAssetError("เลือกทรัพย์สินจากรายการ");
      setIsAssetListOpen(true);
      return;
    }

    setAssetError("");
    onSubmit(event);
  };

  return (
    // กล่องด้านนอกคือพื้นหลัง; เปลี่ยนความกว้างของฟอร์มได้ที่ max-w-lg
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-repair-title"
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2
            id="create-repair-title"
            className="text-lg font-semibold text-slate-900"
          >
            
            {translateText("สร้างคำร้องแจ้งซ่อม")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={translateText("ปิดหน้าต่าง")}
            className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 text-sm text-rose-600">
            {translateText(error)}
          </p>
        )}

        {/* ชื่อ name ตรงกับช่องที่หน้า repairsuser/page.tsx อ่านตอนกดส่ง */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* รายชื่อทรัพย์สินมาจาก data/asset.ts */}
          <div>
            <label
              htmlFor="repair-asset-search"
              className="block text-sm font-medium text-slate-700"
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
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
                    className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
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
                            className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-100"
                          >
                            <span className="font-medium text-slate-800">
                              {asset.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {asset.id} · {asset.serialNumber}
                            </span>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-sm text-slate-500">
                        {translateText("ไม่พบทรัพย์สินที่ตรงกัน")}
                      </li>
                    )}
                  </ul>
                )}
              </div>
              {/* ชั่วคราวให้ลิงก์สแกนกลับไปหน้า Login ที่ path "/" */}
              <Link
                href="/"
                aria-label={translateText("สแกน QR")}
                className="inline-flex h-10 shrink-0 items-center gap-2 pr-1 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <ScanQrCode className="size-5" aria-hidden="true" />
                </span>
                <span>{translateText("สแกน QR")}</span>
              </Link>
            </div>
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
          {/* คำร้องจากหน้า User ถูกกำหนดให้เป็นสำนักงานใหญ่เท่านั้น */}
          <label className="block text-sm font-medium text-slate-700">
            {translateText("สาขา")}
            <input
              type="hidden"
              name="branchId"
              value={HEAD_OFFICE_BRANCH_ID}
              readOnly
            />
            <span className="mt-1.5 flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-normal text-slate-700">
              {translateText("สำนักงานใหญ่")}
            </span>
          </label>
          {/* ต้องกรอกอาการก่อนส่งคำร้อง */}
          <label className="block text-sm font-medium text-slate-700">
            
            {translateText("อาการที่พบ")}
            <textarea
              name="issue"
              required
              rows={3}
              placeholder={translateText("อธิบายอาการหรือปัญหาที่พบ")}
              className="mt-1.5 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          {/* เลือกระดับความเร่งด่วนของงานซ่อม */}
          <label className="block text-sm font-medium text-slate-700">
            
            {translateText("ระดับความเร่งด่วน")}
            <select
              name="priority"
              defaultValue="medium"
              className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="low">{translateText("ต่ำ")}</option>
              <option value="medium">{translateText("ปกติ")}</option>
              <option value="high">{translateText("สูง")}</option>
              <option value="urgent">{translateText("เร่งด่วน")}</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              
              {translateText("ยกเลิก")}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="size-4" />
              
              {translateText("ส่งคำร้อง")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
