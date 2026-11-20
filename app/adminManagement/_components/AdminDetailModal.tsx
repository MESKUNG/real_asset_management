"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { useLanguage, useTranslate } from "@/lib/language";
import StaffProfileImage from "../../staffManagement/_components/StaffProfileImage";
import AdminStatusBadge from "./AdminStatusBadge";
import type { AdminAccount } from "./types";

type AdminDetailModalProps = {
  account: AdminAccount;
  accountCode: string;
  branchName: string;
  onClose: () => void;
};

export default function AdminDetailModal({
  account,
  accountCode,
  branchName,
  onClose,
}: AdminDetailModalProps) {
  const translateText = useTranslate();
  const language = useLanguage();
  const createdAt = new Intl.DateTimeFormat(
    language === "en" ? "en-US" : "th-TH",
    { dateStyle: "long" },
  ).format(new Date(account.created_at * 1000));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
        aria-labelledby="admin-detail-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div>
            <h2
              id="admin-detail-title"
              className="text-xl font-bold text-slate-800"
            >
              {translateText("รายละเอียดบัญชี")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={translateText("ปิดหน้าต่าง")}
            className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3 sm:flex-nowrap sm:gap-4 sm:p-5">
            <StaffProfileImage
              src={account.profile_image}
              alt={`รูปโปรไฟล์ ${account.first_name} ${account.last_name}`}
              initials={`${account.first_name.charAt(0)}${account.last_name.charAt(0)}`}
              size={56}
            />
            <div className="min-w-0">
              <p className="break-words text-base font-bold text-slate-800 sm:text-lg">
                {accountCode} · {account.first_name} {account.last_name}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {account.username}
              </p>
            </div>
            <AdminStatusBadge status={account.status} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              label={translateText("ชื่อผู้ใช้")}
              value={account.username}
            />
            <DetailItem
              label={translateText("อีเมล")}
              value={account.email}
            />
            <DetailItem
              label={translateText("บทบาท")}
              value={translateText(account.role)}
            />
            <DetailItem
              label={translateText("เบอร์โทรศัพท์")}
              value={account.phone || translateText("ไม่ระบุ")}
            />
            <DetailItem label={translateText("สาขา")} value={branchName} />
            <DetailItem
              label={translateText("วันที่สร้างบัญชี")}
              value={createdAt}
            />
          </div>
        </div>
        <footer className="flex justify-end border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            {translateText("ปิด")}
          </button>
        </footer>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}
