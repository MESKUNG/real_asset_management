"use client";

// หน้านี้คือหน้าตั้งค่าระบบ
// ค่าที่เลือกจะถูกจำไว้ และโหมดมืดมีผลกับหน้าอื่นด้วย
import { useState, useSyncExternalStore } from "react";

type Settings = {
  // รายการตั้งค่าที่เว็บจำไว้
  notificationsEnabled: boolean;
  darkMode: boolean;
  language: "th" | "en";
};

// ชื่อนี้ใช้สำหรับเก็บค่าตั้งค่าในเบราว์เซอร์
const storageKey = "asset-management-settings";

// ค่าเริ่มต้นสำหรับคนที่ยังไม่เคยตั้งค่า
const defaultSettings: Settings = {
  notificationsEnabled: true,
  darkMode: false,
  language: "th",
};

const defaultSettingsSnapshot = JSON.stringify(defaultSettings);
const settingsChangedEvent = "asset-management-settings-change";

// ข้อความที่ใช้ตอนเลือกภาษาไทยหรืออังกฤษ
const labels = {
  th: {
    title: "ตั้งค่าระบบ",
    description: "จัดการการแจ้งเตือนและรูปแบบการแสดงผลของคุณ",
    notificationSettings: "การแจ้งเตือน",
    enableNotifications: "เปิดการแจ้งเตือน",
    enableNotificationsDescription: "รับการแจ้งเตือนเกี่ยวกับกิจกรรมในระบบ",
    displaySettings: "การแสดงผลและภาษา",
    darkMode: "โหมดมืด (Dark Mode)",
    darkModeDescription: "ปรับโทนสีของหน้าตั้งค่า",
    language: "ภาษา",
    saved: "การตั้งค่าจะถูกบันทึกโดยอัตโนมัติ",
    thai: "ไทย",
    english: "English",
  },
  en: {
    title: "System settings",
    description: "Manage your notifications and display preferences",
    notificationSettings: "Notifications",
    enableNotifications: "Enable notifications",
    enableNotificationsDescription: "Receive updates about activity in the system",
    displaySettings: "Display and language",
    darkMode: "Dark mode",
    darkModeDescription: "Change the color theme of the settings page",
    language: "Language",
    saved: "Your settings are saved automatically",
    thai: "ไทย",
    english: "English",
  },
} satisfies Record<Settings["language"], Record<string, string>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  // เช็กว่าข้อมูลที่อ่านมาเป็นกลุ่มข้อมูลจริงหรือไม่
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// อ่านค่าที่เคยบันทึกไว้ ถ้าอ่านไม่ได้จะใช้ค่าเริ่มต้น
function getSettingsSnapshot() {
  try {
    return localStorage.getItem(storageKey) ?? defaultSettingsSnapshot;
  } catch (error) {
    console.error("โหลดการตั้งค่าไม่สำเร็จ:", error);
    return defaultSettingsSnapshot;
  }
}

function getServerSettingsSnapshot() {
  // ระหว่างเริ่มเปิดหน้า ให้ใช้ค่าเริ่มต้นก่อน
  return defaultSettingsSnapshot;
}

// คอยฟังเวลาค่าตั้งค่าเปลี่ยน เพื่อให้หน้าแสดงค่าใหม่ทันที
function subscribeToSettings(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(settingsChangedEvent, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(settingsChangedEvent, onChange);
  };
}

function parseSettings(snapshot: string): Settings {
  // ถ้าค่าใดหายหรืออ่านไม่ได้ ให้ใช้ค่าเริ่มต้นของข้อนั้น
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!isRecord(parsed)) return defaultSettings;

    return {
      notificationsEnabled:
        typeof parsed.notificationsEnabled === "boolean"
          ? parsed.notificationsEnabled
          : defaultSettings.notificationsEnabled,
      darkMode:
        typeof parsed.darkMode === "boolean"
          ? parsed.darkMode
          : defaultSettings.darkMode,
      language: parsed.language === "en" ? "en" : "th",
    };
  } catch (error) {
    console.error("อ่านรูปแบบการตั้งค่าไม่สำเร็จ:", error);
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
  // สวิตช์แบบเดียวกัน ใช้ได้ทั้งเปิดแจ้งเตือนและเปิดโหมดมืด
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
  // อ่านค่าตั้งค่าปัจจุบัน เพื่อให้สวิตช์แสดงตรงกับที่เลือก
  const snapshot = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getServerSettingsSnapshot,
  );
  const settings = parseSettings(snapshot);

  const updateSetting = <Key extends keyof Settings>(
    key: Key,
    value: Settings[Key],
  ) => {
    // บันทึกค่าที่เปลี่ยน และบอกแถบด้านบนให้เปลี่ยนตาม
    const updatedSettings = { ...settings, [key]: value };
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedSettings));
      window.dispatchEvent(new Event(settingsChangedEvent));
      setSaveError(false);
    } catch (error) {
      console.error("บันทึกการตั้งค่าไม่สำเร็จ:", error);
      setSaveError(true);
    }
  };

  const text = labels[settings.language];
  const isDark = settings.darkMode;

  // กำหนดสีพื้นหลังและตัวหนังสือของการ์ด
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

  const renderToggleRow = (
    key: keyof Pick<Settings, "notificationsEnabled" | "darkMode">,
    title: string,
    description: string,
  ) => (
    // แสดงชื่อ คำอธิบาย และสวิตช์ของแต่ละตัวเลือก
    <div className="flex items-center justify-between gap-5 py-3">
      <div>
        <p className={labelClass}>{title}</p>
        <p className={descriptionClass}>{description}</p>
      </div>
      <Toggle
        checked={settings[key]}
        label={title}
        onChange={() => updateSetting(key, !settings[key])}
      />
    </div>
  );

  return (
    // เปลี่ยนสีพื้นหลังหน้านี้เมื่อเปิดหรือปิดโหมดมืด
    <div
      className={`min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#f3f4f8] text-slate-800"
      }`}
    >
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1
              className={`text-xl font-semibold tracking-tight sm:text-2xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {text.title}
            </h1>
            <p className={descriptionClass}>{text.description}</p>
          </div>
        </header>

        <div className="space-y-4">
          {/* ส่วนนี้ใช้เปิดหรือปิดการแจ้งเตือน */}
          <section className={cardClass} aria-labelledby="notification-heading">
            <h2 id="notification-heading" className={headingClass}>
              {text.notificationSettings}
            </h2>
            <div className="mt-2 divide-y divide-slate-100">
              {renderToggleRow(
                "notificationsEnabled",
                text.enableNotifications,
                text.enableNotificationsDescription,
              )}
            </div>
          </section>

          {/* ส่วนนี้ใช้เปลี่ยนโหมดมืดและเลือกภาษา */}
          <section className={cardClass} aria-labelledby="display-heading">
            <h2 id="display-heading" className={headingClass}>
              {text.displaySettings}
            </h2>
            <div className="mt-2">
              {renderToggleRow(
                "darkMode",
                text.darkMode,
                text.darkModeDescription,
              )}
              {/* เลือกภาษาที่ใช้แสดงในหน้าตั้งค่า */}
              <label className="mt-2 block">
                <span className={`${labelClass} mb-2 block`}>{text.language}</span>
                <select
                  value={settings.language}
                  onChange={(event) =>
                    updateSetting(
                      "language",
                      event.target.value === "en" ? "en" : "th",
                    )
                  }
                  className={`h-11 w-full rounded-md border px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <option value="th">{text.thai}</option>
                  <option value="en">{text.english}</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        {/* ข้อความบอกว่าบันทึกแล้ว หรือแจ้งเมื่อบันทึกไม่สำเร็จ */}
        <p
          role={saveError ? "alert" : undefined}
          className={`mt-4 text-xs ${
            saveError ? "text-rose-600" : "text-slate-400"
          }`}
        >
          {saveError
            ? "บันทึกไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์"
            : text.saved}
        </p>
      </div>
    </div>
  );
}
