"use client";

// ชิ้นส่วนหน้าจอที่ใช้ร่วมกันในหน้ารายงานทั้ง 3 แบบ
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { TONE_STYLE, type Tone } from "@/lib/reports";

export function Card({ title, badge, actions, children, className = "" }: {
  title?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 lg:p-5 ${className}`}>
      {(title || badge || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
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
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${TONE_STYLE[tone]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
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
  const noteColor = { indigo: "text-indigo-700", green: "text-emerald-700", amber: "text-amber-700" }[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base text-slate-600">{label}</p>
        <span className={noteColor}>{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className={`mt-2 text-sm font-medium ${noteColor}`}>{note}</p>
    </div>
  );
}

// ช่องตัวเลขเล็กๆ ในการ์ดรายงาน (ป้าย + ค่า)
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-100 px-3 py-2.5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-slate-900">{value}</p>
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
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-12 w-full rounded-xl border border-slate-300 bg-white pr-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${icon ? "pl-10" : "pl-3"}`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 lg:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl lg:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
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
  return (
    <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
          <dt className="text-sm text-slate-500">{label}</dt>
          <dd className="text-base text-slate-900 sm:col-span-2">{value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}
