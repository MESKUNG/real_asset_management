"use client";
import { useTranslate } from "@/lib/language";


// หน้ารายการตรวจนับของรอบที่เลือก (?session=IS-0004)
// User: สแกน/ยืนยันด้วยมือ และส่งผล | Admin: ดูอย่างเดียว
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Asset } from "@/data/asset";
import { exportExcel } from "@/lib/exportExcel";
import {
  RESULT_LABEL,
  completeSession,
  findAsset,
  formatDateRange,
  formatThaiDateTime,
  getBranchName,
  getCategoryName,
  getCheckerName,
  getSessionAssets,
  getSessionProgress,
  getAwayReason,
  getStaffName,
  removeCheck,
  saveCheck,
  useCredential,
  useInventoryStore,
  type StoredCheck,
} from "@/lib/inventory";
import ConfirmCheckSheet from "./ConfirmCheckSheet";
import {
  EmptyState,
  Loading,
  PageHeader,
  ProgressBar,
  ResultPill,
  StatusPill,
  Toast,
  buttonStyle,
  useToast,
} from "./ui";

type Tab = "unchecked" | "checked";
const PAGE_SIZE = 20;

export default function AuditBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { credential, ready: credentialReady } = useCredential();
  const { sessions, checks, ready } = useInventoryStore();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("unchecked");
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const [manualAsset, setManualAsset] = useState<Asset | null>(null);

  if (!ready || !credentialReady) return <Loading />;

  const sessionId = searchParams.get("session");
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) {
    return (
      <div className="mx-auto max-w-md p-6 pt-16">
        <EmptyState text="ไม่พบรอบตรวจนับนี้">
          <Link href="/inventories" className={buttonStyle.primary}>
            เลือกรอบตรวจนับ
          </Link>
        </EmptyState>
      </div>
    );
  }

  const isUser = credential?.role === "user";
  const canScan = isUser && session.status === "in_progress";
  const progress = getSessionProgress(session, checks);
  const allDone = progress.total > 0 && progress.checked === progress.total;

  const sessionAssets = getSessionAssets(session);
  const sessionChecks = checks.filter((c) => c.sessionId === session.id);
  const checkedIds = new Set(sessionChecks.map((c) => c.assetId));

  const q = query.trim().toLowerCase();
  const matches = (a: Asset) =>
    !q ||
    a.name.toLowerCase().includes(q) ||
    a.id.toLowerCase().includes(q) ||
    a.brand.toLowerCase().includes(q);

  const notChecked = sessionAssets.filter((a) => !checkedIds.has(a.id) && matches(a));
  // แยกของที่ถูกยืมหรือส่งซ่อมออกไป เพราะไม่อยู่ในสาขา ไม่ต้องเดินหา
  const uncheckedAssets = notChecked.filter((a) => !getAwayReason(a));
  const awayAssets = notChecked.filter((a) => getAwayReason(a));
  // รายการที่ตรวจแล้ว เรียงล่าสุดขึ้นก่อน (รวมของต่างสาขาที่สแกนเจอด้วย)
  const checkedRows = sessionChecks
    .map((check) => ({ check, asset: findAsset(check.assetId) }))
    .filter((row): row is { check: StoredCheck; asset: Asset } => !!row.asset && matches(row.asset))
    .sort((a, b) => b.check.checkedAt.localeCompare(a.check.checkedAt));

  const handleManualConfirm = (result: "found" | "damaged", note: string) => {
    if (!manualAsset || !credential) return;
    const saved = saveCheck({
      sessionId: session.id,
      asset: manualAsset,
      result,
      checker: credential,
      note: note ? `ยืนยันด้วยมือ: ${note}` : "ยืนยันด้วยมือ (ไม่ได้สแกน)",
    });
    toast.show(saved ? `บันทึก ${manualAsset.id} (${RESULT_LABEL[result]}) แล้ว` : "บันทึกไม่สำเร็จ");
    setManualAsset(null);
  };

  const handleUndo = (check: StoredCheck) => {
    if (!window.confirm(`ยกเลิกผลตรวจของ ${check.assetId} ใช่ไหม?`)) return;
    toast.show(removeCheck(check.id) ? `ยกเลิกผล ${check.assetId} แล้ว` : "ยกเลิกไม่สำเร็จ");
  };

  const handleSubmit = () => {
    if (!credential) return;
    const remaining = progress.total - progress.checked;
    const message =
      remaining > 0
        ? `ยังเหลือ ${remaining} รายการที่ไม่ได้สแกน ระบบจะบันทึกว่า "ไม่พบ" ยืนยันส่งผลไหม?`
        : "ยืนยันส่งผลตรวจนับและปิดรอบนี้?";
    if (!window.confirm(message)) return;
    if (completeSession(session.id, credential)) {
      router.push("/inventories");
    } else {
      toast.show("ส่งผลไม่สำเร็จ");
    }
  };

  const handleExport = async () => {
    const checkByAsset = new Map(sessionChecks.map((c) => [c.assetId, c]));
    const rowOf = (asset: Asset, check?: StoredCheck) => ({
      รหัส: asset.id,
      ชื่อทรัพย์สิน: asset.name,
      "ยี่ห้อ / รุ่น": `${asset.brand} ${asset.model}`,
      หมวดหมู่: getCategoryName(asset.category),
      สาขาที่ลงทะเบียน: getBranchName(asset.branchId),
      ผลตรวจ: check ? RESULT_LABEL[check.result] : "ยังไม่ตรวจ",
      ผู้ตรวจ: check ? getCheckerName(check) : "-",
      เวลาตรวจ: check ? formatThaiDateTime(check.checkedAt) : "-",
      หมายเหตุ: check?.note ?? "",
    });
    const rows = sessionAssets.map((a) => rowOf(a, checkByAsset.get(a.id)));
    const extraRows = sessionChecks
      .filter((c) => c.result === "mismatch")
      .flatMap((c) => {
        const asset = findAsset(c.assetId);
        return asset ? [rowOf(asset, c)] : [];
      });
    await exportExcel(`ผลตรวจนับ_${session.id}`, [{ name: session.id, rows: [...rows, ...extraRows] }]);
    toast.show("ดาวน์โหลดไฟล์ Excel แล้ว");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <Toast message={toast.message} />
      <PageHeader
        title={canScan ? "ตรวจนับทรัพย์สิน" : "รายละเอียดการตรวจนับ"}
        subtitle={`${session.id} · ${session.name}`}
        backHref="/inventories"
        actions={
          <button type="button" onClick={handleExport} className={buttonStyle.secondary}>
            ส่งออก Excel
          </button>
        }
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 pb-8 pt-4 lg:px-8 lg:pt-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-slate-600">
            <StatusPill status={session.status} />
            <span>{getBranchName(session.branchId)}</span>
            <span>·</span>
            <span>{formatDateRange(session.startDate, session.endDate)}</span>
            {session.assigneeId && (
              <>
                <span>·</span>
                <span>ผู้รับผิดชอบ {getStaffName(session.assigneeId)}</span>
              </>
            )}
          </div>
          <div className="mt-4 flex items-end justify-between">
            <p className="text-3xl font-extrabold text-slate-900">
              {progress.checked}
              <span className="text-xl font-semibold text-slate-400"> / {progress.total} รายการ</span>
            </p>
            <p className="text-xl font-bold text-blue-600">{progress.percent}%</p>
          </div>
          <div className="mt-2">
            <ProgressBar percent={progress.percent} />
          </div>
          {progress.away > 0 && (
            <p className="mt-3 text-base text-slate-600">
              ไม่ต้องสแกน {progress.away} รายการ เพราะถูกยืมหรือส่งซ่อมอยู่
            </p>
          )}
          {(progress.damaged > 0 || progress.missing > 0 || progress.mismatch > 0) && (
            <p className="mt-3 text-base font-semibold text-amber-700">
              พบปัญหา: ชำรุด {progress.damaged} · ไม่พบ {progress.missing} · ไม่ตรงสาขา {progress.mismatch}
            </p>
          )}
        </section>

        {session.status !== "in_progress" && (
          <p className="rounded-xl bg-slate-200 px-4 py-3 text-base text-slate-700">
            {session.status === "planned"
              ? "รอบนี้ยังไม่เริ่ม ต้องให้ Admin เปิดรอบก่อนจึงจะสแกนได้"
              : "รอบนี้ปิดแล้ว ดูผลได้อย่างเดียว"}
          </p>
        )}
        {!isUser && session.status === "in_progress" && (
          <p className="rounded-xl bg-blue-50 px-4 py-3 text-base text-blue-800">
            มุมมองผู้ดูแล: ติดตามความคืบหน้าได้ การสแกนทำโดยผู้ใช้ที่ได้รับมอบหมาย
          </p>
        )}

        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowCount(PAGE_SIZE);
          }}
          placeholder="ค้นหาชื่อ ยี่ห้อ หรือรหัสทรัพย์สิน"
          aria-label="ค้นหาทรัพย์สิน"
          className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 lg:max-w-md"
        />

        {/* มือถือ: แท็บสลับ 2 รายการ โดยเปิด "ยังไม่ตรวจ" ก่อน */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-200 p-1 lg:hidden" role="tablist">
          <TabButton active={tab === "unchecked"} onClick={() => setTab("unchecked")}>
            ยังไม่ตรวจ ({uncheckedAssets.length})
          </TabButton>
          <TabButton active={tab === "checked"} onClick={() => setTab("checked")}>
            ตรวจแล้ว ({checkedRows.length})
          </TabButton>
        </div>

        {/* คอม: แสดง 2 คอลัมน์คู่กัน โดยให้ "ยังไม่ตรวจ" อยู่ซ้าย */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${tab === "unchecked" ? "block" : "hidden"} lg:block`}>
            <h2 className="mb-3 hidden text-lg font-bold lg:block">
              ยังไม่ตรวจ ({uncheckedAssets.length})
            </h2>
            {uncheckedAssets.length === 0 ? (
              <EmptyState text={q ? "ไม่พบรายการที่ค้นหา" : "ตรวจครบทุกรายการแล้ว"} />
            ) : (
              <ul className="space-y-3">
                {uncheckedAssets.slice(0, showCount).map((asset) => (
                  <li
                    key={asset.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-900">{asset.name}</p>
                      <p className="text-sm text-slate-600">
                        {asset.id} · {asset.brand} {asset.model}
                      </p>
                      <p className="text-sm text-slate-600">
                        ผู้รับผิดชอบ {getStaffName(asset.responsiblePersonId)}
                      </p>
                    </div>
                    {canScan && (
                      <button
                        type="button"
                        onClick={() => setManualAsset(asset)}
                        className="min-h-11 shrink-0 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                      >
                        ยืนยันด้วยมือ
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {uncheckedAssets.length > showCount && (
              <button
                type="button"
                onClick={() => setShowCount((c) => c + PAGE_SIZE)}
                className={`${buttonStyle.secondary} mt-3 w-full`}
              >
                แสดงเพิ่ม ({uncheckedAssets.length - showCount} รายการ)
              </button>
            )}
            {awayAssets.length > 0 && (
              <details className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <summary className="cursor-pointer text-base font-semibold text-sky-900">
                  ไม่อยู่ในสาขา ({awayAssets.length}) ไม่ต้องสแกน
                </summary>
                <p className="mt-2 text-sm text-sky-900">
                  ของที่ถูกเบิกหรือส่งซ่อม ระบบจะบันทึกให้อัตโนมัติตอนส่งผล ถ้าเจอของจริงในสาขาก็สแกนได้ตามปกติ
                </p>
                <ul className="mt-3 divide-y divide-sky-100">
                  {awayAssets.map((asset) => {
                    const away = getAwayReason(asset);
                    return (
                      <li key={asset.id} className="py-2">
                        <p className="text-base font-semibold text-slate-900">
                          {asset.name} <span className="text-sm font-normal text-slate-600">{asset.id}</span>
                        </p>
                        <p className="text-sm text-sky-900">
                          {away?.text}
                          {away?.documentId ? ` (${away.documentId})` : ""}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}
          </section>

          <section className={`${tab === "checked" ? "block" : "hidden"} lg:block`}>
            <h2 className="mb-3 hidden text-lg font-bold lg:block">ตรวจแล้ว ({checkedRows.length})</h2>
            {checkedRows.length === 0 ? (
              <EmptyState text={q ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีรายการที่ตรวจแล้ว"} />
            ) : (
              <ul className="space-y-3">
                {checkedRows.slice(0, showCount).map(({ check, asset }) => (
                  <li key={check.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900">{asset.name}</p>
                        <p className="text-sm text-slate-600">
                          {asset.id} · โดย {getCheckerName(check)} · {formatThaiDateTime(check.checkedAt)}
                        </p>
                        {check.note && <p className="mt-1 text-sm text-slate-600">หมายเหตุ: {check.note}</p>}
                      </div>
                      <ResultPill result={check.result} />
                    </div>
                    {canScan && check.result !== "missing" && (
                      <button
                        type="button"
                        onClick={() => handleUndo(check)}
                        className="mt-2 text-sm font-semibold text-slate-500 underline"
                      >
                        บันทึกผิด? ยกเลิกผลนี้
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      {/* แถบปุ่มหลักติดขอบล่าง กดได้ทันทีไม่ต้องเลื่อนหา */}
      {canScan && (
        <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl gap-3">
            {allDone ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="min-h-14 flex-1 rounded-2xl bg-emerald-600 text-lg font-bold text-white hover:bg-emerald-700"
              >
                ตรวจครบแล้ว ส่งผลตรวจนับ
              </button>
            ) : (
              <>
                <Link
                  href={`/inventories/scan?session=${session.id}`}
                  className="flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-blue-900 text-lg font-bold text-white hover:bg-blue-950"
                >
                  สแกน QR
                </Link>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="min-h-14 rounded-2xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700"
                >
                  ส่งผล
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {manualAsset && (
        <ConfirmCheckSheet
          asset={manualAsset}
          onConfirm={handleManualConfirm}
          onCancel={() => setManualAsset(null)}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-11 rounded-xl text-base font-semibold ${
        active ? "bg-white text-slate-900 shadow" : "text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
