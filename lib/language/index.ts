"use client";

import { useSyncExternalStore } from "react";
import { englishTranslations } from "./dictionary";

export type AppLanguage = "th" | "en";
export type AppTheme = "light" | "dark";

export const SETTINGS_STORAGE_KEY = "asset-management-settings";
export const LANGUAGE_CHANGE_EVENT = "asset-management-settings-change";

function getSettingsSnapshot(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return {};

    const settings: unknown = JSON.parse(raw);
    return isRecord(settings) ? settings : {};
  } catch (error) {
    console.error("Could not read application settings:", error);
    return {};
  }
}

function getLanguageSnapshot(): AppLanguage {
  return getSettingsSnapshot().language === "en" ? "en" : "th";
}

function getThemeSnapshot(): AppTheme {
  return getSettingsSnapshot().theme === "dark" ? "dark" : "light";
}

function getServerLanguageSnapshot(): AppLanguage {
  return "th";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function subscribeToLanguage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onChange);
  };
}

export function useLanguage() {
  return useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
}

export function useTheme() {
  return useSyncExternalStore(
    subscribeToLanguage,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
}

function getServerThemeSnapshot(): AppTheme {
  return "light";
}

export function translate(text: string, language: AppLanguage) {
  if (language === "th") return text;
  const exactTranslation = englishTranslations[text];
  if (exactTranslation) return exactTranslation;

  const count = text.match(/^(\d+)\s*(รายการ|ชิ้น|งาน|รอบ)$/);
  if (count) {
    const units: Record<string, string> = {
      "รายการ": "items",
      "ชิ้น": "units",
      "งาน": "tasks",
      "รอบ": "cycles",
    };
    return `${count[1]} ${units[count[2]]}`;
  }

  return text;
}

export function formatLocalizedDate(
  value: string | Date,
  language: AppLanguage,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(
    language === "en" ? "en-US" : "th-TH",
    options,
  ).format(date);
}

export function useTranslate() {
  const language = useLanguage();
  return (text: string) => translate(text, language);
}

export function saveLanguage(language: AppLanguage) {
  saveSetting("language", language);
}

export function saveTheme(theme: AppTheme) {
  saveSetting("theme", theme);
}

function saveSetting(key: "language" | "theme", value: AppLanguage | AppTheme) {
  const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
  let settings: Record<string, unknown> = {};
  if (rawSettings) {
    const parsed: unknown = JSON.parse(rawSettings);
    if (isRecord(parsed)) settings = parsed;
  }
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify({ ...settings, [key]: value }),
  );
  window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
}
