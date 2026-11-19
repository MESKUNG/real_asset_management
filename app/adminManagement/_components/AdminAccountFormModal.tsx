"use client";

import { UserRoundPlus, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { branches } from "@/data/branches";
import { useTranslate } from "@/lib/language";
import type { AdminAccount, AdminAccountChanges } from "./types";

type AdminAccountFormModalProps = {
  account?: AdminAccount;
  onClose: () => void;
  onSave: (changes: AdminAccountChanges) => Promise<void>;
};

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

export default function AdminAccountFormModal({
  account,
  onClose,
  onSave,
}: AdminAccountFormModalProps) {
  const translateText = useTranslate();
  const [username, setUsername] = useState(account?.username ?? "");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(account?.first_name ?? "");
  const [lastName, setLastName] = useState(account?.last_name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [phone, setPhone] = useState(account?.phone ?? "");
  const [branchId, setBranchId] = useState(account?.branch_id ?? "BR-001");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isEditing = Boolean(account);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    try {
      await onSave({
        username: username.trim(),
        ...(password ? { password } : {}),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        branch_id: branchId,
      });
    } catch (error) {
      console.error("Could not save Admin account:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "บันทึกข้อมูลบัญชี Admin ไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-2 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-account-form-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-start justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
            <div>
              <h2
                id="admin-account-form-title"
                className="text-xl font-bold text-slate-800"
              >
                {translateText(
                  isEditing ? "แก้ไขบัญชี Admin" : "เพิ่มบัญชี Admin",
                )}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {translateText("กรอกข้อมูลเพื่อจัดการบัญชี Admin")}
              </p>
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

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={translateText("ชื่อผู้ใช้")}>
                <input
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField
                label={translateText(
                  isEditing ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน",
                )}
              >
                <input
                  required={!isEditing}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label={translateText("ชื่อ")}>
                <input
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label={translateText("นามสกุล")}>
                <input
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label={translateText("อีเมล")}>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label={translateText("เบอร์โทรศัพท์")}>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
            </div>
            <FormField label={translateText("สาขา")}>
              <select
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                className={inputClassName}
              >
                <option value="">{translateText("ไม่ระบุสาขา")}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {translateText(branch.name)}
                  </option>
                ))}
              </select>
            </FormField>
            <p className="text-sm text-slate-500">
              {translateText("บทบาทบัญชี")}: <strong>Admin</strong>
            </p>
            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {translateText(errorMessage)}
              </p>
            )}
          </div>
          <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 w-full rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
            >
              {translateText("ยกเลิก")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <UserRoundPlus className="size-4" aria-hidden="true" />
              {isSaving
                ? translateText("กำลังบันทึก...")
                : translateText(
                    isEditing ? "บันทึกการเปลี่ยนแปลง" : "สร้างบัญชี Admin",
                  )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}
