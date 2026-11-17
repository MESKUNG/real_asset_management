"use client";

import type { FormEventHandler } from "react";
import { Plus } from "@tailgrids/icons";
import { assets } from "@/data/asset";
import { branches } from "@/data/branches";

type CreateRepairModalProps = {
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function CreateRepairModal({
  onClose,
  onSubmit,
}: CreateRepairModalProps) {
  return (
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
            สร้างคำร้องแจ้งซ่อม
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            ทรัพย์สิน
            <select
              name="assetId"
              required
              defaultValue=""
              className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="" disabled>
                เลือกทรัพย์สิน
              </option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.id})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            สาขา
            <select
              name="branchId"
              required
              defaultValue=""
              className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="" disabled>
                เลือกสาขา
              </option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            อาการที่พบ
            <textarea
              name="issue"
              required
              rows={3}
              placeholder="อธิบายอาการหรือปัญหาที่พบ"
              className="mt-1.5 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            ระดับความเร่งด่วน
            <select
              name="priority"
              defaultValue="medium"
              className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="low">ต่ำ</option>
              <option value="medium">ปกติ</option>
              <option value="high">สูง</option>
              <option value="urgent">เร่งด่วน</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="size-4" />
              ส่งคำร้อง
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
