"use client";

// หน้าต่างเลื่อนขึ้นจากด้านล่าง ให้ผู้ตรวจเลือกสภาพทรัพย์สินก่อนบันทึก
import { useEffect, useState } from "react";
import type { Asset } from "@/data/asset";
import { getBranchName, getCategoryName } from "@/lib/inventory";

type Props = {
  asset: Asset;
  title?: string;
  onConfirm: (result: "found" | "damaged", note: string) => void;
  onCancel: () => void;
};

export default function ConfirmCheckSheet({ asset, title, onConfirm, onCancel }: Props) {
  const [note, setNote] = useState("");

  // กด Esc เพื่อปิด
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`บันทึกผล ${asset.id}`}
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 lg:items-center"
    >
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-xl lg:rounded-3xl">
        {title && <p className="mb-2 text-base font-semibold text-emerald-700">{title}</p>}
        <p className="text-sm text-slate-500">
          {asset.id} · {getCategoryName(asset.category)}
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{asset.name}</h2>
        <p className="mt-1 text-base text-slate-600">
          {asset.brand} {asset.model} · {getBranchName(asset.branchId)}
        </p>

        <p className="mt-5 text-base font-semibold text-slate-800">สภาพทรัพย์สินเป็นอย่างไร?</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onConfirm("found", note.trim())}
            className="min-h-14 rounded-2xl bg-emerald-600 text-lg font-bold text-white hover:bg-emerald-700"
          >
            ปกติ
          </button>
          <button
            type="button"
            onClick={() => onConfirm("damaged", note.trim())}
            className="min-h-14 rounded-2xl bg-amber-500 text-lg font-bold text-white hover:bg-amber-600"
          >
            ชำรุด
          </button>
        </div>

        <label className="mt-4 block text-base font-medium text-slate-700">
          หมายเหตุ (ไม่บังคับ)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="เช่น หน้าจอมีรอยร้าว"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <button
          type="button"
          onClick={onCancel}
          className="mt-3 min-h-12 w-full rounded-2xl border border-slate-300 text-base font-semibold text-slate-700 hover:bg-slate-50"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
