"use client";

import { useState } from "react";
import {
  saveLanguage,
  saveTheme,
  useLanguage,
  useTheme,
  useTranslate,
  type AppLanguage,
  type AppTheme,
} from "@/lib/language";

export default function SettingsPage() {
  const language = useLanguage();
  const theme = useTheme();
  const translateText = useTranslate();
  const [saveError, setSaveError] = useState(false);

  const changeLanguage = (nextLanguage: AppLanguage) => {
    try {
      saveLanguage(nextLanguage);
      setSaveError(false);
    } catch (error) {
      console.error("Could not save language setting:", error);
      setSaveError(true);
    }
  };

  const changeTheme = (nextTheme: AppTheme) => {
    try {
      saveTheme(nextTheme);
      setSaveError(false);
    } catch (error) {
      console.error("Could not save theme setting:", error);
      setSaveError(true);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-100 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">
            {translateText("ตั้งค่าระบบ")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {translateText("เลือกภาษาที่ต้องการใช้แสดงทั่วทั้งเว็บไซต์")}
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            {translateText("ภาษา")}
            <select
              value={language}
              onChange={(event) =>
                changeLanguage(event.target.value === "en" ? "en" : "th")
              }
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="mt-5 block text-sm font-medium text-slate-700">
            {translateText("ธีม")}
            <select
              value={theme}
              onChange={(event) =>
                changeTheme(event.target.value === "dark" ? "dark" : "light")
              }
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="light">{translateText("สว่าง")}</option>
              <option value="dark">{translateText("มืด")}</option>
            </select>
          </label>
          <p
            role={saveError ? "alert" : undefined}
            className={`mt-4 text-xs ${saveError ? "text-rose-600" : "text-slate-400"}`}
          >
            {saveError
              ? translateText("บันทึกไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์")
              : translateText("การตั้งค่าภาษาจะถูกบันทึกโดยอัตโนมัติ")}
          </p>
        </section>
      </div>
    </main>
  );
}
