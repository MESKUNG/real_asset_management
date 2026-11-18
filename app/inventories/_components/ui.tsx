"use client";

// ชิ้นส่วนหน้าจอที่ใช้ซ้ำในหน้าตรวจนับและหน้ารายงาน
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { InventorySessionStatus } from "@/data/inventorySessions";
import type { InventoryResult } from "@/data/inventoryCheck";
import {
  RESULT_LABEL,
  SESSION_STATUS_LABEL,
  useCredential,
  type Role,
} from "@/lib/inventory";

export function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              aria-label="ย้อนกลับ"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-2xl text-slate-700 hover:bg-slate-100"
            >
              ‹
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 lg:text-2xl">{title}</h1>
            {subtitle && <p className="mt-0.5 text-base text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<InventorySessionStatus, string> = {
  planned: "bg-violet-100 text-violet-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-600",
};

export function StatusPill({ status }: { status: InventorySessionStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[status]}`}
    >
      {SESSION_STATUS_LABEL[status]}
    </span>
  );
}

const RESULT_STYLE: Record<InventoryResult, string> = {
  found: "bg-emerald-100 text-emerald-800",
  damaged: "bg-amber-100 text-amber-800",
  missing: "bg-rose-100 text-rose-800",
  mismatch: "bg-rose-100 text-rose-800",
};

export function ResultPill({ result }: { result: InventoryResult }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-semibold ${RESULT_STYLE[result]}`}
    >
      {RESULT_LABEL[result]}
    </span>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
    >
      <div
        className="h-full rounded-full bg-blue-900 transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function Loading() {
  return <div className="p-10 text-center text-base text-slate-500">กำลังโหลด...</div>;
}

export function EmptyState({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-base text-slate-500">
      <p>{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

// หน้าภาพรวมของแต่ละ role (ตรงกับเมนู "ภาพรวม" ใน sideNavbar ของกลุ่ม)
const DASHBOARD_PATH: Record<Role, string> = {
  user: "/dashboardUser",
  admin: "/dashboardAdmin",
  president: "/dashboardPresident",
  superadmin: "/notifications-center",
};

export function NoAccess({ message }: { message: string }) {
  const { credential } = useCredential();
  // ยังไม่ล็อกอิน → กลับหน้าเข้าสู่ระบบ, ล็อกอินแล้ว → กลับหน้าภาพรวมของ role ตัวเอง
  const backHref = credential ? DASHBOARD_PATH[credential.role] : "/";
  const backText = credential ? "กลับหน้าภาพรวม" : "ไปหน้าเข้าสู่ระบบ";

  return (
    <div className="mx-auto max-w-md p-6 pt-16">
      <EmptyState text={message}>
        <Link href={backHref} className="font-semibold text-blue-600 underline">
          {backText}
        </Link>
      </EmptyState>
    </div>
  );
}

// ครอบหน้าที่ต้องเช็คสิทธิ์ แสดงเนื้อหาเฉพาะ role ที่อนุญาต
export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { credential, ready } = useCredential();
  if (!ready) return <Loading />;
  if (!credential) return <NoAccess message="กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้" />;
  if (!allow.includes(credential.role)) {
    return <NoAccess message="บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้" />;
  }
  return <>{children}</>;
}

// ข้อความแจ้งเตือนสั้นๆ ที่หายเองหลัง 2.5 วินาที
// เก็บ id ไว้ด้วย เพื่อให้ข้อความเดิมที่ส่งซ้ำนับเวลาใหม่ทุกครั้ง
export function useToast(duration = 2500) {
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);

  return {
    message: toast?.text ?? null,
    show: (text: string) => setToast({ text, id: Date.now() }),
  };
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 top-20 z-50 mx-auto max-w-md rounded-2xl bg-slate-900 px-4 py-3 text-center text-base font-medium text-white shadow-lg"
    >
      {message}
    </div>
  );
}

export const buttonStyle = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 text-base font-semibold text-white hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-slate-300",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 hover:bg-slate-50",
  danger:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-base font-semibold text-rose-700 hover:bg-rose-100",
};
