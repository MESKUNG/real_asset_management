"use client";

// หน้ากำหนดการตรวจนับของ User: แยกเป็น ต้องทำตอนนี้ / กำลังจะมาถึง / เสร็จแล้ว
import Link from "next/link";
import type { StoredCheck, StoredSession } from "@/lib/inventory";
import {
  daysFromToday,
  formatDateRange,
  getBranchName,
  getSessionProgress,
  getStaffName,
  useCredential,
  useInventoryStore,
} from "@/lib/inventory";
import { EmptyState, Loading, PageHeader, ProgressBar, StatusPill, buttonStyle } from "./ui";

const byStartDate = (a: StoredSession, b: StoredSession) => a.startDate.localeCompare(b.startDate);

export default function UserSchedulePage() {
  const { credential } = useCredential();
  const { sessions, checks, ready } = useInventoryStore();
  if (!ready) return <Loading />;

  // ผู้ใช้ที่มีสาขา (branch_id ในบัญชี) เห็นเฉพาะรอบของสาขาตัวเอง
  const myBranch = credential?.branchId;
  const mySessions = myBranch ? sessions.filter((s) => s.branchId === myBranch) : sessions;

  const active = mySessions.filter((s) => s.status === "in_progress").sort(byStartDate);
  const upcoming = mySessions.filter((s) => s.status === "planned").sort(byStartDate);
  const finished = mySessions
    .filter((s) => s.status === "completed" || s.status === "cancelled")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <PageHeader
        title="ตรวจนับ / รอบการตรวจนับ"
        subtitle={`สวัสดี ${credential?.username ?? ""} · ${myBranch ? getBranchName(myBranch) : "ทุกสาขา"}`}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-4 pt-5 lg:px-8">
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900 lg:text-xl">
            ต้องตรวจนับตอนนี้ ({active.length})
          </h2>
          {active.length === 0 ? (
            <EmptyState text="ยังไม่มีรอบที่เปิดให้ตรวจนับ" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {active.map((session) => (
                <ActiveCard key={session.id} session={session} checks={checks} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900 lg:text-xl">
            กำลังจะมาถึง ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <EmptyState text="ยังไม่มีรอบที่วางแผนไว้" />
          ) : (
            <ol className="space-y-3">
              {upcoming.map((session, index) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-900">{session.name}</p>
                      <p className="text-sm text-slate-500">
                        {session.id} · {getBranchName(session.branchId)} ·{" "}
                        {formatDateRange(session.startDate, session.endDate)}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700 sm:ml-4">
                    {countdownText(session.startDate)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {finished.length > 0 && (
          <details className="rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-base font-semibold text-slate-700">
              รอบที่เสร็จแล้ว ({finished.length})
            </summary>
            <ul className="mt-3 divide-y divide-slate-100">
              {finished.map((session) => (
                <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-base text-slate-800">{session.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatDateRange(session.startDate, session.endDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill status={session.status} />
                    {session.status === "completed" && (
                      <Link
                        href={`/inventories/audit?session=${session.id}`}
                        className="text-base font-semibold text-blue-600 underline"
                      >
                        ดูผล
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        )}
      </main>
    </div>
  );
}

function ActiveCard({ session, checks }: { session: StoredSession; checks: StoredCheck[] }) {
  const progress = getSessionProgress(session, checks);
  const started = progress.checked > 0;
  return (
    <article className="rounded-2xl border-2 border-blue-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{session.id}</p>
          <h3 className="text-lg font-bold text-slate-900">{session.name}</h3>
        </div>
        <StatusPill status={session.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-base">
        <div>
          <dt className="text-sm text-slate-500">สาขา</dt>
          <dd className="font-semibold">{getBranchName(session.branchId)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">ช่วงวันที่</dt>
          <dd className="font-semibold">{formatDateRange(session.startDate, session.endDate)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-sm text-slate-500">ผู้รับผิดชอบ</dt>
          <dd className="font-semibold">{getStaffName(session.assigneeId)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-base">
          <span>
            ตรวจแล้ว <strong>{progress.checked}</strong> / {progress.total} รายการ
          </span>
          <span className="font-bold text-blue-600">{progress.percent}%</span>
        </div>
        <ProgressBar percent={progress.percent} />
      </div>

      <Link
        href={`/inventories/audit?session=${session.id}`}
        className={`${buttonStyle.primary} mt-4 min-h-12 w-full text-lg`}
      >
        {started ? "ตรวจนับต่อ ›" : "เริ่มตรวจนับ ›"}
      </Link>
    </article>
  );
}

function countdownText(startDate: string): string {
  const days = daysFromToday(startDate);
  if (days > 0) return `อีก ${days} วัน`;
  if (days === 0) return "เริ่มวันนี้";
  return "รอ Admin เปิดรอบ";
}
