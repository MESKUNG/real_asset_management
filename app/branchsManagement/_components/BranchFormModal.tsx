"use client";

import { MapPin, Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { Branch } from "@/data/branches";
import { useTranslate } from "@/lib/language";
import styles from "../branchManagement.module.css";

export type BranchChanges = Pick<
  Branch,
  "code" | "name" | "address" | "province" | "postalCode" | "status"
>;

type BranchFormModalProps = {
  branch: Branch | null;
  onClose: () => void;
  onSave: (changes: BranchChanges) => Promise<void>;
};

const provinces = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
  "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ",
  "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก",
  "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์",
  "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี",
  "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา",
  "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี",
  "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
  "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี",
  "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล",
  "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี",
  "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์",
  "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี",
  "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี",
];

const inputClassName =
  `${styles.input} h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100`;

export default function BranchFormModal({
  branch,
  onClose,
  onSave,
}: BranchFormModalProps) {
  const translateText = useTranslate();
  const [code, setCode] = useState(branch?.code ?? "");
  const [name, setName] = useState(branch?.name ?? "");
  const [address, setAddress] = useState(branch?.address ?? "");
  const [province, setProvince] = useState(
    branch?.province ?? "กรุงเทพมหานคร",
  );
  const [postalCode, setPostalCode] = useState(branch?.postalCode ?? "");
  const [isActive, setIsActive] = useState(branch?.status !== "inactive");
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
    setIsSaving(true);
    setErrorMessage("");

    try {
      await onSave({
        code: code.trim().toLocaleUpperCase(),
        name: name.trim(),
        address: address.trim(),
        province,
        postalCode: postalCode.trim(),
        status: isActive ? "active" : "inactive",
      });
    } catch (error) {
      console.error("Could not save branch:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "บันทึกข้อมูลสาขาไม่สำเร็จ",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-form-title"
        className={`${styles.formPanel} my-auto w-full max-w-5xl rounded-2xl bg-[#f1f2f7] p-5 shadow-2xl sm:p-8`}
      >
        <form onSubmit={handleSubmit}>
          <header className="mb-6 flex items-start justify-between gap-4">
            <h2
              id="branch-form-title"
              className="text-2xl font-bold text-slate-800"
            >
              {translateText(branch ? "แก้ไขสาขา" : "เพิ่มสาขา")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label={translateText("ปิดหน้าต่าง")}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white disabled:opacity-50"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>

          <fieldset
            className={`${styles.formFieldset} space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7`}
          >
            <legend className="px-1 text-lg font-semibold text-slate-800">
              {translateText("ข้อมูลสาขา")}
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2 text-sm font-semibold text-slate-700">
                <span>{translateText("รหัสสาขา *")}</span>
                <input
                  required
                  maxLength={12}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder={translateText("เช่น BKK")}
                  className={inputClassName}
                />
                <span className="block font-normal text-slate-500">
                  {translateText("รหัสไม่ซ้ำกัน เช่น BKK, CNX")}
                </span>
              </label>
              <label className="block space-y-2 text-sm font-semibold text-slate-700">
                <span>{translateText("ชื่อสาขา *")}</span>
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>
            <label className="block space-y-2 text-sm font-semibold text-slate-700">
              <span>{translateText("ที่อยู่ *")}</span>
              <input
                required
                maxLength={200}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className={inputClassName}
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2 text-sm font-semibold text-slate-700">
                <span>{translateText("จังหวัด *")}</span>
                <span className="relative block">
                  <MapPin
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                    aria-hidden="true"
                  />
                  <select
                    required
                    value={province}
                    onChange={(event) => setProvince(event.target.value)}
                    className={`${inputClassName} pl-10`}
                  >
                    {provinces.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
              <label className="block space-y-2 text-sm font-semibold text-slate-700">
                <span>{translateText("รหัสไปรษณีย์")}</span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  value={postalCode}
                  onChange={(event) =>
                    setPostalCode(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder={translateText("เช่น 40000")}
                  className={inputClassName}
                />
              </label>
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-5 accent-violet-600"
              />
              {translateText("เปิดใช้งานสาขานี้")}
            </label>
          </fieldset>

          {errorMessage && (
            <p
              className={`${styles.errorText} mt-4 text-sm text-red-600`}
              role="alert"
            >
              {translateText(errorMessage)}
            </p>
          )}

          <footer className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-12 rounded-lg border border-slate-200 bg-white px-5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {translateText("ยกเลิก")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              <Save className="size-4" aria-hidden="true" />
              {translateText(isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล")}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
