"use client";

import { Building2, Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { branches } from "@/data/branches";
import { useTranslate } from "@/lib/language";

export type StaffAccountChanges = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  branch_id: string;
  password?: string;
};

type EditStaffModalProps = {
  account: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    staff_id: number | null;
    branch_id?: string;
    status: "Active" | "Inactive";
  };
  onClose: () => void;
  onSave: (changes: StaffAccountChanges) => Promise<void>;
};

export default function EditStaffModal({
  account,
  onClose,
  onSave,
}: EditStaffModalProps) {
  const translateText = useTranslate();
  const [username, setUsername] = useState(account.username);
  const [firstName, setFirstName] = useState(account.first_name);
  const [lastName, setLastName] = useState(account.last_name);
  const [email, setEmail] = useState(account.email);
  const [phone, setPhone] = useState(account.phone);
  const [branchId, setBranchId] = useState(account.branch_id ?? "");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setErrorMessage("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      await onSave({
        username: username.trim(),
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        email: trimmedEmail,
        phone: phone.trim(),
        branch_id: branchId,
        ...(password ? { password } : {}),
      });
    } catch (error) {
      console.error("Could not update staff account:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "บันทึกข้อมูลบัญชีไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const staffId =
    account.staff_id === null
      ? translateText("ไม่ระบุ")
      : `STF-${String(account.staff_id).padStart(3, "0")}`;

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
        aria-labelledby="edit-staff-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-start justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
            <div>
              <h2
                id="edit-staff-title"
                className="text-xl font-bold text-slate-800"
              >
                {translateText("แก้ไขบัญชี Staff")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {translateText("แก้ไขข้อมูลบัญชี Staff")}
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

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-5 sm:px-6 sm:pb-6">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-slate-700">
                {translateText("ข้อมูลบัญชี")}
              </legend>
              <FormField label={translateText("ชื่อผู้ใช้")}>
                <input
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={translateText("ชื่อ")}>
                  <input
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className={inputClassName}
                  />
                </FormField>
                <FormField label={translateText("นามสกุล")}>
                  <input
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className={inputClassName}
                  />
                </FormField>
              </div>

              <FormField label={translateText("อีเมล")}>
                <input
                  type="email"
                  autoComplete="email"
                  required
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

              <FormField label={translateText("Staff ID")}>
                <input
                  readOnly
                  value={staffId}
                  className={`${inputClassName} cursor-not-allowed bg-slate-100 text-slate-500`}
                />
              </FormField>
            </fieldset>

            <FormField label={translateText("รหัสผ่านใหม่ (ไม่บังคับ)")}>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={translateText(
                  "เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน",
                )}
                className={inputClassName}
              />
            </FormField>

            <FormField label={translateText("สาขา")}>
              <span className="relative block">
                <Building2
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <select
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  className={`${inputClassName} appearance-none pl-9`}
                >
                  <option value="">{translateText("ไม่ระบุสาขา")}</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {translateText(branch.name)}
                    </option>
                  ))}
                </select>
              </span>
            </FormField>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                {translateText("สถานะ")}
              </p>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  account.status === "Active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    account.status === "Active"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                {account.status}
              </span>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {translateText(errorMessage)}
              </p>
            )}
          </div>

          <footer className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4">
            <p className="hidden text-xs text-slate-500 sm:block">
              {translateText("บันทึกข้อมูลบัญชี")}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
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
                <Save className="size-4" aria-hidden="true" />
                {isSaving
                  ? translateText("กำลังบันทึก...")
                  : translateText("บันทึกการเปลี่ยนแปลง")}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}
