"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslate } from "@/lib/language";
import styles from "../branchManagement.module.css";

type DeleteBranchModalProps = {
  branchName: string;
  assetCount: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteBranchModal({
  branchName,
  assetCount,
  onClose,
  onConfirm,
}: DeleteBranchModalProps) {
  const translateText = useTranslate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onClose]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await onConfirm();
    } catch (error) {
      console.error("Could not deactivate branch:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "ปิดใช้งานสาขาไม่สำเร็จ",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-branch-title"
      className={`${styles.surface} w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl`}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
          <span className={`${styles.dangerIcon} grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600`}>
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="delete-branch-title"
                className="text-lg font-bold text-slate-800"
              >
              {translateText("ยืนยันการลบสาขา")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
              {translateText("ต้องการลบสาขานี้ใช่หรือไม่?")}{" "}
              <span className="font-semibold">{branchName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label={translateText("ปิดหน้าต่าง")}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <p className={`${styles.warningSurface} mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-800`}>
          {assetCount > 0
            ? translateText(
                "สาขานี้มี Asset {count} รายการ ระบบจะปิดใช้งานแทนการลบ เพื่อรักษาประวัติ Asset",
              ).replace("{count}", String(assetCount))
            : translateText(
                "ระบบจะปิดใช้งานสาขาและเก็บข้อมูลเดิมไว้ เพื่อไม่ให้ประวัติการทำรายการสูญหาย",
              )}
        </p>
        {errorMessage && (
          <p
            className={`${styles.errorText} mt-3 text-sm text-red-600`}
            role="alert"
          >
            {translateText(errorMessage)}
          </p>
        )}

        <footer className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-11 rounded-lg border border-slate-200 px-4 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {translateText("ยกเลิก")}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isDeleting}
            className="h-11 rounded-lg bg-red-600 px-4 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {translateText(isDeleting ? "กำลังดำเนินการ..." : "ยืนยันลบ")}
          </button>
        </footer>
      </section>
    </div>
  );
}
