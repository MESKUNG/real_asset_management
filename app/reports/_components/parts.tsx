"use client";

import { useT } from "@/lib/i18n";
// ชิ้นส่วนหน้าจอที่ใช้ร่วมกันในหน้ารายงานทั้ง 3 แบบ
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { TONE_STYLE, type Tone } from "@/lib/reports";
import { useTheme } from "@/lib/language";

export function Card({ title, badge, actions, children, className = "" }: {
  title?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const isDark = useTheme() === "dark";
  return (
    <section className={`rounded-2xl border p-4 lg:p-5 ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"} ${className}`}>
      {(title || badge || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{title}</h2>}
          <div className="flex flex-wrap items-center gap-2">
            {badge}
            {actions}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const isDark = useTheme() === "dark";
  const translateText = useT();
  const darkToneStyle: Record<Tone, string> = {
    good: "bg-emerald-950/60 text-emerald-300",
    wait: "bg-amber-950/60 text-amber-300",
    bad: "bg-rose-950/60 text-rose-300",
    info: "bg-indigo-950/60 text-indigo-300",
    plain: "bg-slate-700 text-slate-300",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${isDark ? darkToneStyle[tone] : TONE_STYLE[tone]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {typeof children === "string" ? translateText(children) : children}
    </span>
  );
}

// การ์ดตัวเลขสรุปด้านบน
export function Kpi({ label, value, note, icon, tone = "indigo" }: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  tone?: "indigo" | "green" | "amber";
}) {
  const isDark = useTheme() === "dark";
  const noteColor = (isDark
    ? { indigo: "text-indigo-300", green: "text-emerald-300", amber: "text-amber-300" }
    : { indigo: "text-indigo-700", green: "text-emerald-700", amber: "text-amber-700" })[tone];
  return (
    <div className={`rounded-2xl border p-4 lg:p-5 ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>{label}</p>
        <span className={noteColor}>{icon}</span>
      </div>
      <p className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{value}</p>
      <p className={`mt-2 text-sm font-medium ${noteColor}`}>{note}</p>
    </div>
  );
}

// ช่องตัวเลขเล็กๆ ในการ์ดรายงาน (ป้าย + ค่า)
export function Stat({ label, value }: { label: string; value: string }) {
  const isDark = useTheme() === "dark";
  return (
    <div className={`rounded-xl px-3 py-2.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-0.5 text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

export function SelectField({ label, value, onChange, options, icon }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: ReactNode;
}) {
  const isDark = useTheme() === "dark";
  const translateText = useT();
  return (
    <label className="block min-w-0">
      <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{translateText(label)}</span>
      <span className="relative block">
        {icon && <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-400"}`}>{icon}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-12 w-full rounded-xl border pr-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? "border-slate-600 bg-slate-800 text-slate-100" : "border-slate-300 bg-white text-slate-800"} ${icon ? "pl-10" : "pl-3"}`}
          style={{ colorScheme: isDark ? "dark" : "light" }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {translateText(o.label)}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

export const reportButton = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-4 text-base font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 hover:bg-slate-100",
};

// หน้าต่างแสดงรายละเอียด เลื่อนขึ้นจากด้านล่างบนมือถือ อยู่กลางจอบนคอม
export function DetailDialog({ title, onClose, children, footer }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const isDark = useTheme() === "dark";
  const translateText = useT();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 lg:items-center"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl p-5 shadow-xl lg:rounded-3xl ${isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={translateText("ปิด")}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            <X size={20} />
          </button>
        </div>
        {children}
        {footer && <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// รายการ "หัวข้อ: ค่า" ในหน้าต่างรายละเอียด
export function DetailList({ rows }: { rows: [string, ReactNode][] }) {
  const isDark = useTheme() === "dark";
  const translateText = useT();
  return (
    <dl className={`divide-y rounded-xl border ${isDark ? "divide-slate-700 border-slate-700" : "divide-slate-100 border-slate-200"}`}>
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
          <dt className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{translateText(label)}</dt>
          <dd className={`text-base sm:col-span-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}
