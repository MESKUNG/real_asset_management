"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslate } from "@/lib/language";

type SuspendStaffModalProps = {
  account: {
    first_name: string;
    last_name: string;
    status: "Active" | "Inactive";
  };
  accountCode: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function SuspendStaffModal({
  account,
  accountCode,
  onClose,
  onConfirm,
}: SuspendStaffModalProps) {
  const translateText = useTranslate();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  const handleConfirm = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      await onConfirm();
    } catch (error) {
      console.error("Could not suspend staff account:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ระงับบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-account-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="suspend-account-title"
                className="text-xl font-bold text-slate-800"
              >
                {translateText("ระงับบัญชี")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {translateText("ยืนยันการเปลี่ยนสถานะบัญชีเป็น Inactive")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label={translateText("ปิดหน้าต่าง")}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="px-6 pb-6">
          <div className="rounded-xl bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-800">
              {translateText("บัญชีที่จะระงับ")}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {accountCode} · {account.first_name} {account.last_name}
            </p>
          </div>
          {errorMessage && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {translateText(errorMessage)}
            </p>
          )}
        </div>

        <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {translateText("ยกเลิก")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving || account.status === "Inactive"}
            className="h-10 rounded-lg bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? translateText("กำลังบันทึก...")
              : translateText("ยืนยันการระงับ")}
          </button>
        </footer>
      </section>
    </div>
  );
}
