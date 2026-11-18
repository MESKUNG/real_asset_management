"use client";

import { CalendarDays, Mail, Phone, X } from "lucide-react";
import { useEffect } from "react";
import { useLanguage, useTranslate } from "@/lib/language";
import StaffProfileImage from "./StaffProfileImage";

type StaffDetailModalProps = {
  account: {
    first_name: string;
    last_name: string;
    username: string;
    staff_id: number | null;
    email: string;
    phone: string;
    profile_image: string;
    status: "Active" | "Inactive";
    created_at: number;
  };
  accountCode: string;
  roleName: string;
  branchName: string;
  onClose: () => void;
};

export default function StaffDetailModal({
  account,
  accountCode,
  roleName,
  branchName,
  onClose,
}: StaffDetailModalProps) {
  const translateText = useTranslate();
  const language = useLanguage();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const createdAt = new Intl.DateTimeFormat(
    language === "en" ? "en-US" : "th-TH",
    { dateStyle: "long" },
  ).format(new Date(account.created_at * 1000));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-detail-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="staff-detail-title"
              className="text-xl font-bold text-slate-800"
            >
              {translateText("รายละเอียดบัญชี Staff")}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <MetaPill>{roleName}</MetaPill>
              <MetaPill>
                {translateText("Staff ID")} {account.staff_id === null
                  ? translateText("ไม่ระบุ")
                  : `STF-${String(account.staff_id).padStart(3, "0")}`}
              </MetaPill>
              <MetaPill>{branchName}</MetaPill>
              <MetaPill>
                {translateText("สร้างเมื่อ")} {createdAt}
              </MetaPill>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={translateText("ปิดหน้าต่าง")}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-5 px-6 py-6">
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-5">
            <StaffProfileImage
              src={account.profile_image}
              alt={`รูปโปรไฟล์ ${account.first_name} ${account.last_name}`}
              initials={`${account.first_name.charAt(0)}${account.last_name.charAt(0)}`}
              size={56}
            />
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-800">
                {accountCode} · {account.first_name} {account.last_name}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {account.username}
              </p>
            </div>
            <span
              className={`ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                account.status === "Active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {account.status}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<Mail className="size-4" aria-hidden="true" />}
              label={translateText("อีเมล")}
              value={account.email || translateText("ไม่ระบุ")}
            />
            <InfoCard
              icon={<Phone className="size-4" aria-hidden="true" />}
              label={translateText("เบอร์โทรศัพท์")}
              value={account.phone || translateText("ไม่ระบุ")}
            />
            <InfoCard
              icon={<CalendarDays className="size-4" aria-hidden="true" />}
              label={translateText("วันที่สร้างบัญชี")}
              value={createdAt}
            />
          </div>
        </div>

        <footer className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {translateText("ปิด")}
          </button>
        </footer>
      </section>
    </div>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
      {children}
    </span>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 break-all text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}
