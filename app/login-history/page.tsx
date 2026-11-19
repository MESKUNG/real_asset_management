"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { fetchLoginHistory, type LoginHistoryEntry } from "@/lib/loginHistory";
import { useLanguage } from "@/lib/language";

const PAGE_SIZE = 4;
const UNKNOWN_VALUE = "ระบุไม่ได้";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStaffId() {
  const rawCredential = localStorage.getItem("credential");
  if (!rawCredential) {
    throw new Error("ไม่พบข้อมูลบัญชี กรุณาเข้าสู่ระบบใหม่");
  }

  let credential: unknown;
  try {
    credential = JSON.parse(rawCredential);
  } catch {
    throw new Error("ข้อมูลบัญชีไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่");
  }

  if (
    !isRecord(credential) ||
    typeof credential.staff_id !== "number"
  ) {
    throw new Error("บัญชีนี้ไม่มี StaffID ที่ถูกต้อง");
  }

  return credential.staff_id;
}

function formatDate(value: string, language: "th" | "en") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return language === "en" ? "Unknown" : UNKNOWN_VALUE;

  const datePart = new Intl.DateTimeFormat(language === "en" ? "en-US" : "th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
  const timePart = new Intl.DateTimeFormat(language === "en" ? "en-US" : "th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Bangkok",
  }).format(date);
  return language === "en" ? `${datePart} · ${timePart}` : `${datePart} · ${timePart} น.`;
}

function formatHistoryValue(value: string | undefined, language: "th" | "en") {
  const normalizedValue = value?.trim();
  if (
    !normalizedValue ||
    normalizedValue === UNKNOWN_VALUE ||
    normalizedValue.toLocaleLowerCase() === "unknown"
  ) {
    return language === "en" ? "Unknown" : UNKNOWN_VALUE;
  }
  return normalizedValue;
}

function getBangkokDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Bangkok",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : "";
}

function getTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

export default function LoginHistoryPage() {
  const language = useLanguage();
  const isEnglish = language === "en";
  const t = (thai: string, english: string) => isEnglish ? english : thai;
  const [entries, setEntries] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() => {
        const staffId = getStaffId();
        return fetchLoginHistory(staffId).then((items) => ({
          staffId,
          items,
        }));
      })
      .then(({ staffId, items }) => {
        if (active) {
          setEntries(
            items
              .filter((entry) => entry.account_id === staffId)
              .sort((a, b) => {
                const timestampDifference =
                  getTimestamp(b.login_time) - getTimestamp(a.login_time);
                return Number.isNaN(timestampDifference)
                  ? 0
                  : timestampDifference;
              }),
          );
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "โหลดประวัติไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const invalidDateRange = Boolean(startDate && endDate && startDate > endDate);
  const filteredEntries = useMemo(() => {
    if (invalidDateRange) return [];

    const query = search.trim().toLocaleLowerCase();
    return entries.filter((entry) => {
      const ipAddress = formatHistoryValue(entry.ip_address, language).toLocaleLowerCase();
      if (query && !ipAddress.includes(query)) return false;

      const loginDate = getBangkokDate(entry.login_time);
      if (startDate && loginDate < startDate) return false;
      if (endDate && loginDate > endDate) return false;
      return true;
    });
  }, [endDate, entries, invalidDateRange, search, startDate, language]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleEntries = filteredEntries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const firstItem =
    filteredEntries.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(currentPage * PAGE_SIZE, filteredEntries.length);
  const latestEntry = entries[0];

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f4f4f8] px-4 dark:bg-slate-950 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {t("ประวัติการเข้าสู่ระบบ", "Login history")}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("ตรวจสอบกิจกรรมการเข้าสู่ระบบของบัญชีคุณ", "Review sign-in activity for your account")}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t("แสดงวันและเวลาตามเวลาไทย (UTC+7)", "Dates and times are shown in Thailand time (UTC+7)")}
            </p>
          </header>

          <section
            aria-label={t("การเข้าสู่ระบบล่าสุด", "Latest sign-in")}
            className="mb-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("IP ล่าสุด (จำลอง)", "Latest IP (simulated)")}</p>
              {loading ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("กำลังโหลดประวัติ...", "Loading history...")}</p>
              ) : error ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("โหลดข้อมูลไม่สำเร็จ", "Could not load data")}</p>
              ) : latestEntry ? (
                <>
                  <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {formatHistoryValue(latestEntry.ip_address, language)}
                    <span className="font-medium">
                      {" "}
                      · {formatHistoryValue(latestEntry.location, language)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t("เข้าสู่ระบบ", "Signed in")} {formatDate(latestEntry.login_time, language)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("ยังไม่มีประวัติการเข้าสู่ระบบ", "No sign-in history yet")}
                </p>
              )}
            </div>
            {latestEntry && !loading && !error && (
              <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                />
                {t("เข้าสู่ระบบล่าสุด", "Latest sign-in")}
              </span>
            )}
          </section>

          <section
            aria-label={t("ตัวกรองประวัติ", "History filters")}
            className="mb-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-4 sm:p-5"
          >
            <div className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_minmax(18rem,0.9fr)] md:items-center">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("กรองประวัติของฉัน", "Filter my history")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="relative block">
                  <span className="sr-only">{t("ค้นหา IP address", "Search IP address")}</span>
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      resetPage();
                    }}
                    placeholder={t("ค้นหา IP address", "Search IP address")}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 pl-10 pr-3 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="relative block">
                    <span className="sr-only">{t("ตั้งแต่วันที่", "Start date")}</span>
                    <CalendarDays
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(event) => {
                        setStartDate(event.target.value);
                        resetPage();
                      }}
                      className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 pl-9 pr-2 text-xs text-slate-600 dark:text-slate-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                  <label className="relative block">
                    <span className="sr-only">{t("ถึงวันที่", "End date")}</span>
                    <CalendarDays
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(event) => {
                        setEndDate(event.target.value);
                        resetPage();
                      }}
                      className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 pl-9 pr-2 text-xs text-slate-600 dark:text-slate-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("ประวัติของฉัน", "My history")}
              </h2>
              {!loading && !error && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filteredEntries.length} {t("รายการ", "items")} · {t("เรียงจากล่าสุด", "Newest first")}
                </p>
              )}
            </div>

            {loading ? (
              <p
                aria-live="polite"
                className="rounded-lg border border-slate-100 p-6 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {t("กำลังโหลดประวัติ...", "Loading history...")}
              </p>
            ) : error ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700"
              >
                {isEnglish ? "Unable to load sign-in history. Please try again." : error}
              </div>
            ) : invalidDateRange ? (
              <p className="rounded-lg border border-slate-100 p-6 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("วันที่เริ่มต้นต้องไม่อยู่หลังวันที่สิ้นสุด", "Start date must be on or before end date")}
              </p>
            ) : visibleEntries.length === 0 ? (
              <p className="rounded-lg border border-slate-100 p-6 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                {entries.length === 0
                  ? t("ยังไม่มีประวัติการเข้าสู่ระบบ", "No sign-in history yet")
                  : t("ไม่พบรายการที่ตรงกับตัวกรอง", "No results match your filters")}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[42rem] border-separate border-spacing-y-1 text-left text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 dark:text-slate-400">
                        <th className="rounded-l-md bg-[#f3f3f8] dark:bg-slate-700 px-3 py-2 font-medium">
                          {t("วันและเวลาที่เข้าสู่ระบบ", "Sign-in date and time")}
                        </th>
                        <th className="bg-[#f3f3f8] dark:bg-slate-700 px-3 py-2 font-medium">
                          {t("IP address (จำลอง)", "IP address (simulated)")}
                        </th>
                        <th className="rounded-r-md bg-[#f3f3f8] dark:bg-slate-700 px-3 py-2 font-medium">
                          {t("ตำแหน่งโดยประมาณ", "Approximate location")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEntries.map((entry, index) => (
                        <tr
                          key={
                            entry.id ??
                            `${entry.account_id}-${entry.login_time}-${index}`
                          }
                          className={
                            index === 0
                              ? "text-slate-700 dark:text-slate-200 [&>td]:border-violet-200 [&>td]:bg-violet-50 dark:[&>td]:border-violet-400 dark:[&>td]:bg-violet-950/50"
                              : "text-slate-700 dark:text-slate-200 [&>td]:border-slate-200 [&>td]:bg-white dark:[&>td]:border-slate-700 dark:[&>td]:bg-slate-800"
                          }
                        >
                          <td className="rounded-l-md border-y border-l px-3 py-4 text-xs font-medium">
                            {formatDate(entry.login_time, language)}
                          </td>
                          <td className="border-y px-3 py-4 font-semibold">
                            {formatHistoryValue(entry.ip_address, language)}
                          </td>
                          <td className="rounded-r-md border-y border-r px-3 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {formatHistoryValue(entry.location, language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    {t("แสดง", "Showing")} {firstItem}–{lastItem} {t("จาก", "of")} {filteredEntries.length}{" "}
                    {t("รายการ · หน้า", "items · Page")} {currentPage} / {totalPages}
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                      {t("ก่อนหน้า", "Previous")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((value) => Math.min(totalPages, value + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t("ถัดไป", "Next")}
                      <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
      </div>
    </div>
  );
}
