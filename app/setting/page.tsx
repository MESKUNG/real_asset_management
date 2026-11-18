"use client";

import { useState, useSyncExternalStore } from "react";
import {
  SETTINGS_STORAGE_KEY,
  LANGUAGE_CHANGE_EVENT,
  saveLanguage,
  saveTheme,
  useLanguage,
  useTheme,
  useTranslate,
  type AppLanguage,
  type AppTheme,
} from "@/lib/language";

type Settings = {
  notificationsEnabled: boolean;
  darkMode: boolean;
  language: "th" | "en";
};

// ค่าตั้งต้นใช้ตอนเปิดเว็บครั้งแรกหรือยังไม่มีข้อมูลที่บันทึกไว้
const defaultSettings: Settings = {
  notificationsEnabled: true,
  darkMode: false,
  language: "th",
};

const defaultSettingsSnapshot = JSON.stringify(defaultSettings);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSettingsSnapshot() {
  try {
    return localStorage.getItem(SETTINGS_STORAGE_KEY) ?? defaultSettingsSnapshot;
  } catch (error) {
    console.error("Could not load application settings:", error);
    return defaultSettingsSnapshot;
  }
}

function subscribeToSettings(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onChange);
  };
}

function parseSettings(snapshot: string): Settings {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!isRecord(parsed)) return defaultSettings;
    // รองรับทั้งค่า darkMode แบบเดิมและ theme แบบใหม่
    return {
      notificationsEnabled:
        typeof parsed.notificationsEnabled === "boolean"
          ? parsed.notificationsEnabled
          : defaultSettings.notificationsEnabled,
      darkMode:
        typeof parsed.darkMode === "boolean"
          ? parsed.darkMode
          : parsed.theme === "dark",
      language: parsed.language === "en" ? "en" : "th",
    };
  } catch (error) {
    console.error("Could not parse application settings:", error);
    return defaultSettings;
  }
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [saveError, setSaveError] = useState(false);
  const language = useLanguage();
  const theme = useTheme();
  const translateText = useTranslate();
  const snapshot = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    () => defaultSettingsSnapshot,
  );
  const settings = parseSettings(snapshot);
  const isDark = theme === "dark";

  // บันทึกค่าที่เปลี่ยนและส่งสัญญาณให้ hook อัปเดตหน้าจอทันที
  const updateSetting = <Key extends keyof Settings>(
    key: Key,
    value: Settings[Key],
  ) => {
    const raw: unknown = JSON.parse(snapshot);
    const stored = isRecord(raw) ? raw : {};
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ ...stored, [key]: value }),
      );
      window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
      setSaveError(false);
    } catch (error) {
      console.error("Could not save application settings:", error);
      setSaveError(true);
    }
  };

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

  const cardClass = `rounded-xl border p-5 shadow-sm sm:p-6 ${
    isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
  }`;
  const headingClass = `text-sm font-semibold ${
    isDark ? "text-slate-100" : "text-slate-800"
  }`;
  const labelClass = `text-sm font-medium ${
    isDark ? "text-slate-100" : "text-slate-700"
  }`;
  const descriptionClass = `mt-1 text-xs leading-5 ${
    isDark ? "text-slate-400" : "text-slate-500"
  }`;

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#f3f4f8] text-slate-800"
      }`}
    >
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6">
          <h1 className={`text-xl font-semibold tracking-tight sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
            {translateText("ตั้งค่าระบบ")}
          </h1>
          <p className={descriptionClass}>
            {translateText("จัดการการแจ้งเตือนและรูปแบบการแสดงผลของคุณ")}
          </p>
        </header>

        <div className="space-y-4">
          {/* การ์ดแรกควบคุมการรับแจ้งเตือน */}
          <section className={cardClass} aria-labelledby="notification-heading">
            <h2 id="notification-heading" className={headingClass}>
              {translateText("การแจ้งเตือน")}
            </h2>
            <div className="mt-2 flex items-center justify-between gap-5 py-3">
              <div>
                <p className={labelClass}>{translateText("เปิดการแจ้งเตือน")}</p>
                <p className={descriptionClass}>
                  {translateText("รับการแจ้งเตือนเกี่ยวกับกิจกรรมในระบบ")}
                </p>
              </div>
              <Toggle
                checked={settings.notificationsEnabled}
                label={translateText("เปิดการแจ้งเตือน")}
                onChange={() =>
                  updateSetting(
                    "notificationsEnabled",
                    !settings.notificationsEnabled,
                  )
                }
              />
            </div>
          </section>

          {/* การ์ดนี้ใช้เปลี่ยนธีมและภาษาของระบบ */}
          <section className={cardClass} aria-labelledby="display-heading">
            <h2 id="display-heading" className={headingClass}>
              {translateText("การแสดงผลและภาษา")}
            </h2>
            <div className="mt-2 space-y-4">
              <div className="flex items-center justify-between gap-5 py-3">
                <div>
                  <p className={labelClass}>{translateText("โหมดมืด (Dark Mode)")}</p>
                  <p className={descriptionClass}>
                    {translateText("ปรับโทนสีของหน้าตั้งค่า")}
                  </p>
                </div>
                <Toggle
                  checked={isDark}
                  label={translateText("โหมดมืด (Dark Mode)")}
                  onChange={() => changeTheme(isDark ? "light" : "dark")}
                />
              </div>
              <label className="block">
                <span className={`${labelClass} mb-2 block`}>
                  {translateText("ภาษา")}
                </span>
                <select
                  value={language}
                  onChange={(event) =>
                    changeLanguage(event.target.value === "en" ? "en" : "th")
                  }
                  className={`h-11 w-full rounded-md border px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <option value="th">{translateText("ไทย")}</option>
                  <option value="en">{translateText("English")}</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        <p
          role={saveError ? "alert" : undefined}
          className={`mt-4 text-xs ${saveError ? "text-rose-600" : "text-slate-400"}`}
        >
          {saveError
            ? translateText("บันทึกไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์")
            : translateText("การตั้งค่าจะถูกบันทึกโดยอัตโนมัติ")}
        </p>
      </div>
    </div>
  );
}
