"use client";

import { useTranslate } from "@/lib/language";
import type { AdminAccount } from "./types";

type SuspendAdminModalProps = {
  account: AdminAccount;
  accountCode: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SuspendAdminModal({
  account,
  accountCode,
  onClose,
  onConfirm,
}: SuspendAdminModalProps) {
  const translateText = useTranslate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-2 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-admin-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="px-4 py-4 sm:px-6 sm:py-5">
          <h2
            id="suspend-admin-title"
            className="text-xl font-bold text-slate-800"
          >
            {translateText("ระงับบัญชี Admin")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {translateText("ยืนยันการเปลี่ยนสถานะบัญชีเป็น Inactive")}
          </p>
        </header>
        <div className="px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-slate-700">
            {accountCode} · {account.first_name} {account.last_name}
          </div>
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            {translateText("ยกเลิก")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 w-full rounded-lg bg-rose-500 px-4 text-sm font-semibold text-white hover:bg-rose-600 sm:w-auto"
          >
            {translateText("ยืนยันการระงับ")}
          </button>
        </footer>
      </section>
    </div>
  );
}
