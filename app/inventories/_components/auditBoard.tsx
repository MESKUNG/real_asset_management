"use client";

import { tx, useT, localized } from "@/lib/i18n";
// หน้ารายการตรวจนับของรอบที่เลือก (?session=IS-0032) วางตาม Figma:
// การ์ดแต่ละชิ้นมีช่อง "สภาพทรัพย์สิน" ให้เลือก ปกติ (ค่าเริ่มต้น) / ชำรุด / สูญหาย
// User: บันทึก แก้สภาพ ยกเลิกผล และส่งผล | Admin: ดูอย่างเดียว
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Armchair, ChevronLeft, ChevronRight, Laptop, Monitor, Printer, Router, X } from "lucide-react";
import type { Asset } from "@/data/asset";
import { exportExcel } from "@/lib/exportExcel";
import {
  RESULT_LABEL,
  completeSession,
  findAsset,
  formatDateRange,
  formatThaiDate,
  formatThaiDateTime,
  getAwayReason,
  getBranchName,
  getCategoryName,
  getCheckerName,
  getConditionHint,
  getSessionAssets,
  getSessionProgress,
  getStaffName,
  removeCheck,
  saveCheck,
  updateCheck,
  useCredential,
  useInventoryStore,
  type StoredCheck,
} from "@/lib/inventory";
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
type Condition = "found" | "damaged" | "missing";

// ตัวเลือกสภาพทรัพย์สิน ปกติเป็นค่าเริ่มต้น
const CONDITIONS: { value: Condition; label: string }[] = localized([
  { value: "found", label: "ปกติ" },
  { value: "damaged", label: "ชำรุด" },
  { value: "missing", label: "สูญหาย" },
]);

const PAGE_SIZES = [5, 10, 20];

export default function AuditBoard() {
  useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { credential, ready: credentialReady } = useCredential();
  const { sessions, checks, ready } = useInventoryStore();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("unchecked");
  const [pageSize, setPageSize] = useState(5);
  const [uncheckedPage, setUncheckedPage] = useState(1);
  const [checkedPage, setCheckedPage] = useState(1);
  // สภาพที่เลือกไว้ในการ์ดที่ยังไม่ตรวจ (ยังไม่บันทึก) ถ้าไม่ได้เลือก = ปกติ
  const [picked, setPicked] = useState<Record<string, Condition>>({});

  if (!ready || !credentialReady) return <Loading />;

  const sessionId = searchParams.get("session");
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="mx-auto max-w-md p-6 pt-16">
        <EmptyState text={tx("ไม่พบรอบตรวจนับนี้")}>
          <Link href="/inventories" className={buttonStyle.primary}>
            {tx("เลือกรอบตรวจนับ")}
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
  const checkByAsset = new Map(sessionChecks.map((c) => [c.assetId, c]));

  const q = query.trim().toLowerCase();
  const matches = (a: Asset) =>
    !q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q);

  // แบ่งของเป็น 3 กลุ่ม ให้ตัวเลขบนหัวตรงกับจำนวนในรายการเสมอ
  // 1) ของในสาขาที่ต้องตรวจ  2) ของที่ถูกเบิก/ยืม หรือส่งซ่อมแล้ว  3) ของที่เจอแต่ไม่อยู่ในรายการรอบนี้
  const onSite = sessionAssets.filter((a) => !getAwayReason(a));
  const onSiteIds = new Set(onSite.map((a) => a.id));
  const sessionAssetIds = new Set(sessionAssets.map((a) => a.id));
  const awayAssets = sessionAssets.filter((a) => getAwayReason(a) && matches(a));
  const uncheckedAssets = onSite.filter((a) => !checkByAsset.has(a.id) && matches(a));
  const toRows = (list: StoredCheck[]) =>
    list
      .map((check) => ({ check, asset: findAsset(check.assetId) }))
      .filter((row): row is { check: StoredCheck; asset: Asset } => !!row.asset && matches(row.asset));
  const checkedRows = toRows(sessionChecks.filter((c) => onSiteIds.has(c.assetId))).sort((a, b) =>
    b.check.checkedAt.localeCompare(a.check.checkedAt),
  );
  const extraRows = toRows(sessionChecks.filter((c) => !sessionAssetIds.has(c.assetId)));

  const uncheckedPageData = paginate(uncheckedAssets, uncheckedPage, pageSize);
  const checkedPageData = paginate(checkedRows, checkedPage, pageSize);

  const resetPages = () => {
    setUncheckedPage(1);
    setCheckedPage(1);
  };

  const handleSave = (asset: Asset) => {
    if (!credential) return;
    const result = picked[asset.id] ?? "found";
    const saved = saveCheck({
      sessionId: session.id,
      asset,
      result,
      checker: credential,
      // เก็บเป็นภาษาไทยไว้ในข้อมูล แล้วค่อยแปลตอนแสดงผล
      note: "ยืนยันด้วยมือ (ไม่ได้สแกน)",
    });
    toast.show(saved ? tx("บันทึก {0}: {1}", asset.id, RESULT_LABEL[result]) : tx("บันทึกไม่สำเร็จ"));
  };

  const handleChange = (check: StoredCheck, result: Condition) => {
    if (!credential) return;
    const changed = updateCheck(check.id, result, credential);
    toast.show(changed ? tx("เปลี่ยน {0} เป็น {1}", check.assetId, RESULT_LABEL[result]) : tx("เปลี่ยนไม่สำเร็จ"));
  };

  const handleUndo = (check: StoredCheck) => {
    if (!window.confirm(tx("ยกเลิกผลตรวจของ {0} แล้วย้ายกลับไปรายการที่ยังไม่ตรวจ ใช่ไหม?", check.assetId))) return;
    toast.show(removeCheck(check.id) ? tx("ยกเลิกผล {0} แล้ว", check.assetId) : tx("ยกเลิกไม่สำเร็จ"));
  };

  const handleSubmit = () => {
    if (!credential) return;
    const remaining = progress.total - progress.checked;
    const message =
      remaining > 0
        ? tx("ยังเหลือ {0} รายการที่ไม่ได้ตรวจ ระบบจะบันทึกว่า \"สูญหาย\" ยืนยันส่งผลไหม?", remaining)
        : tx("ยืนยันส่งผลตรวจนับและปิดรอบนี้?");
    if (!window.confirm(message)) return;
    if (completeSession(session.id, credential)) router.push("/inventories");
    else toast.show(tx("ส่งผลไม่สำเร็จ"));
  };

  const handleExport = async () => {
    const rowOf = (asset: Asset, check?: StoredCheck) => ({
      รหัส: asset.id,
      ชื่อทรัพย์สิน: asset.name,
      "ยี่ห้อ / รุ่น": `${asset.brand} ${asset.model}`,
      หมวดหมู่: getCategoryName(asset.category),
      สาขาที่ลงทะเบียน: getBranchName(asset.branchId),
      ผลตรวจ: check ? RESULT_LABEL[check.result] : (getAwayReason(asset)?.text ?? tx("ยังไม่ตรวจ")),
      ผู้ตรวจ: check ? getCheckerName(check) : "-",
      เวลาตรวจ: check ? formatThaiDateTime(check.checkedAt) : "-",
      หมายเหตุ: check?.note ?? "",
    });
    const rows = [
      ...sessionAssets.map((a) => rowOf(a, checkByAsset.get(a.id))),
      ...extraRows.map(({ asset, check }) => rowOf(asset, check)),
    ];
    await exportExcel(tx("ผลตรวจนับ_{0}", session.id), [{ name: session.id, rows }]);
    toast.show(tx("ดาวน์โหลดไฟล์ Excel แล้ว"));
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <Toast message={toast.message} />
      <PageHeader
        title={canScan ? tx("ตรวจนับทรัพย์สิน") : tx("รายละเอียดการตรวจนับ")}
        subtitle={`${session.id} · ${session.name}`}
        backHref="/inventories"
        actions={
          <button type="button" onClick={handleExport} className={buttonStyle.secondary}>
            {tx("ส่งออก Excel")}
          </button>
        }
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 pb-8 pt-4 lg:px-8 lg:pt-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-slate-600">
            <StatusPill status={session.status} />
            <span>{getBranchName(session.branchId)}</span>
            {/* จุดคั่นซ่อนบนมือถือ เพราะวันที่จะขึ้นบรรทัดใหม่ */}
            <span className="hidden sm:inline">·</span>
            <span className="w-full sm:w-auto">{formatDateRange(session.startDate, session.endDate)}</span>
            {session.assigneeId && (
              <>
                <span>·</span>
                <span>{tx("ผู้รับผิดชอบ")} {getStaffName(session.assigneeId)}</span>
              </>
            )}
          </div>
          <div className="mt-4 flex items-end justify-between">
            <p className="text-3xl font-extrabold text-slate-900">
              {progress.checked}
              <span className="text-xl font-semibold text-slate-400"> / {progress.total} {tx("รายการ")}</span>
            </p>
            <p className="text-xl font-bold text-blue-600">{progress.percent}%</p>
          </div>
          <div className="mt-2">
            <ProgressBar percent={progress.percent} />
          </div>
          <p className="mt-3 text-base text-slate-600">
            {tx("ตรวจแล้ว")} {progress.checked} {tx("· ยังไม่ตรวจ")} {progress.total - progress.checked}
            {progress.away > 0 && tx(" · ไม่อยู่ในสาขา {0} รายการ (ไม่ต้องสแกน)", progress.away)}
          </p>
          {(progress.damaged > 0 || progress.lost > 0) && (
            <p className="mt-1 text-base font-semibold text-amber-700">
              {tx("พบปัญหา: ชำรุด")} {progress.damaged} {tx("· สูญหาย")} {progress.lost}
            </p>
          )}
        </section>

        {session.status !== "in_progress" && (
          <p className="rounded-xl bg-slate-200 px-4 py-3 text-base text-slate-700">
            {session.status === "planned"
              ? tx("รอบนี้จะเริ่มให้ตรวจนับอัตโนมัติวันที่ {0}", formatThaiDate(session.startDate))
              : tx("รอบนี้ปิดแล้ว ดูผลได้อย่างเดียว")}
          </p>
        )}
        {!isUser && session.status === "in_progress" && (
          <p className="rounded-xl bg-blue-50 px-4 py-3 text-base text-blue-800">
            {tx("มุมมองผู้ดูแล: ติดตามความคืบหน้าได้ การตรวจนับทำโดยผู้ใช้ของสาขา")}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPages();
            }}
            placeholder={tx("ค้นหาชื่อ ยี่ห้อ หรือรหัสทรัพย์สิน")}
            aria-label={tx("ค้นหาทรัพย์สิน")}
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-md"
          />
          <label className="flex items-center gap-2 text-base text-slate-600">
            {tx("แสดง")}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                resetPages();
              }}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-base"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} {tx("รายการ")}
                </option>
              ))}
            </select>
            {tx("ต่อหน้า")}
          </label>
        </div>

        {/* มือถือ: แท็บสลับ 2 รายการ โดยเปิด "ยังไม่ตรวจ" ก่อน */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-200 p-1 lg:hidden" role="tablist">
          <TabButton active={tab === "unchecked"} onClick={() => setTab("unchecked")}>
            {tx("ยังไม่ตรวจ (")}{uncheckedAssets.length})
          </TabButton>
          <TabButton active={tab === "checked"} onClick={() => setTab("checked")}>
            {tx("ตรวจแล้ว (")}{checkedRows.length})
          </TabButton>
        </div>

        {/* คอม: 2 คอลัมน์คู่กัน "ยังไม่ตรวจ" อยู่ซ้าย */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${tab === "unchecked" ? "block" : "hidden"} lg:block`}>
            <h2 className="mb-3 hidden text-lg font-bold lg:block">{tx("รายการ ยังไม่ได้ตรวจ")}</h2>
            <p className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-base font-semibold text-slate-800">
              {tx("คงเหลือ")} {uncheckedAssets.length} {tx("รายการ")}
            </p>
            {uncheckedAssets.length === 0 ? (
              <EmptyState text={q ? tx("ไม่พบรายการที่ค้นหา") : tx("ตรวจครบทุกรายการแล้ว")} />
            ) : (
              <ul className="space-y-3">
                {uncheckedPageData.items.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    tone="unchecked"
                    person={getStaffName(asset.responsiblePersonId)}
                    hint={getConditionHint(asset)}
                    footer={
                      canScan ? (
                        <>
                          <ConditionSelect
                            value={picked[asset.id] ?? "found"}
                            onChange={(v) => setPicked((p) => ({ ...p, [asset.id]: v }))}
                          />
                          <button type="button" onClick={() => handleSave(asset)} className={`${buttonStyle.primary} shrink-0`}>
                            {tx("บันทึก")}
                          </button>
                        </>
                      ) : null
                    }
                  />
                ))}
              </ul>
            )}
            <Pager
              page={uncheckedPageData.page}
              pages={uncheckedPageData.pages}
              total={uncheckedAssets.length}
              shown={uncheckedPageData.items.length}
              onPage={setUncheckedPage}
            />

            {awayAssets.length > 0 && (
              <details className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <summary className="cursor-pointer text-base font-semibold text-sky-900">
                  {tx("ไม่อยู่ในสาขา (")}{awayAssets.length}{tx(") ไม่ต้องสแกน")}
                </summary>
                <p className="mt-2 text-sm text-sky-900">
                  {tx("ของที่ถูกเบิก/ยืม หรือส่งซ่อมแล้ว ระบบจะบันทึกให้อัตโนมัติตอนส่งผล")}
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
            <h2 className="mb-3 hidden text-lg font-bold lg:block">{tx("รายการ ตรวจแล้ว")}</h2>
            <p className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-base font-semibold text-slate-800">
              {tx("ตรวจแล้ว")} {checkedRows.length} {tx("รายการ")}
            </p>
            {checkedRows.length === 0 ? (
              <EmptyState text={q ? tx("ไม่พบรายการที่ค้นหา") : tx("ยังไม่มีรายการที่ตรวจแล้ว")} />
            ) : (
              <ul className="space-y-3">
                {checkedPageData.items.map(({ check, asset }) => (
                  <AssetCard
                    key={check.id}
                    asset={asset}
                    tone={check.result === "found" ? "checked" : "problem"}
                    person={getCheckerName(check)}
                    time={formatThaiDateTime(check.checkedAt)}
                    note={check.note}
                    onRemove={canScan ? () => handleUndo(check) : undefined}
                    footer={
                      canScan && check.result !== "mismatch" ? (
                        <ConditionSelect value={check.result as Condition} onChange={(v) => handleChange(check, v)} />
                      ) : (
                        <span className="flex items-center gap-2 text-base text-slate-600">
                          {tx("สภาพทรัพย์สิน")} <ResultPill result={check.result} />
                        </span>
                      )
                    }
                  />
                ))}
              </ul>
            )}
            <Pager
              page={checkedPageData.page}
              pages={checkedPageData.pages}
              total={checkedRows.length}
              shown={checkedPageData.items.length}
              onPage={setCheckedPage}
            />

            {extraRows.length > 0 && (
              <details className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <summary className="cursor-pointer text-base font-semibold text-rose-900">
                  {tx("ทรัพย์สินนอกรายการรอบนี้ (")}{extraRows.length})
                </summary>
                <p className="mt-2 text-sm text-rose-900">{tx("ของที่ทะเบียนระบุว่าจำหน่ายแล้ว หรือเป็นของสาขาอื่น แต่พบระหว่างตรวจ")}</p>
                <ul className="mt-3 divide-y divide-rose-100">
                  {extraRows.map(({ check, asset }) => (
                    <li key={check.id} className="flex items-start justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-900">
                          {asset.name} <span className="text-sm font-normal text-slate-600">{asset.id}</span>
                        </p>
                        <p className="text-sm text-rose-900">{check.note}</p>
                      </div>
                      <ResultPill result={check.result} />
                    </li>
                  ))}
                </ul>
              </details>
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
                {tx("ตรวจครบแล้ว ส่งผลตรวจนับ")}
              </button>
            ) : (
              <>
                <Link
                  href={`/inventories/scan?session=${session.id}`}
                  className="flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-blue-900 text-lg font-bold text-white hover:bg-blue-950"
                >
                  {tx("สแกน QR")}
                </Link>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="min-h-14 rounded-2xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700"
                >
                  {tx("ส่งผล")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- ชิ้นส่วนของหน้านี้ ---------------- */

// ตัดรายการเป็นหน้าละ size ชิ้น ถ้าหน้าที่เลือกเกินจำนวนหน้า (เช่นหลังบันทึกจนรายการลดลง) จะถอยไปหน้าสุดท้าย
function paginate<T>(list: T[], page: number, size: number) {
  const pages = Math.max(1, Math.ceil(list.length / size));
  const current = Math.min(page, pages);
  return { page: current, pages, items: list.slice((current - 1) * size, current * size) };
}

function Pager({ page, pages, total, shown, onPage }: {
  page: number;
  pages: number;
  total: number;
  shown: number;
  onPage: (page: number) => void;
}) {
  useT();
  if (total === 0) return null;
  // แสดงเลขหน้ารอบๆ หน้าปัจจุบันไม่เกิน 5 ปุ่ม
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  const pageButton = "flex h-10 min-w-10 items-center justify-center rounded-xl border px-2 text-base font-semibold sm:h-11 sm:min-w-11";
  return (
    <nav aria-label={tx("เปลี่ยนหน้า")} className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
      <p className="mb-2 text-center text-sm text-slate-500">
        {tx("แสดง")} {shown} {tx("จาก")} {total} {tx("รายการ · หน้า")} {page}/{pages}
      </p>
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label={tx("หน้าก่อน")}
          className={`${pageButton} border-slate-300 bg-white text-slate-700 disabled:opacity-40`}
        >
          <ChevronLeft size={18} />
        </button>
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${pageButton} ${n === page ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-300 bg-white text-slate-700"}`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label={tx("หน้าถัดไป")}
          className={`${pageButton} border-slate-300 bg-white text-slate-700 disabled:opacity-40`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}

const CARD_STYLE = localized({
  unchecked: { box: "bg-rose-50", pill: "bg-rose-100 text-rose-800", label: "ยังไม่ได้ตรวจ" },
  checked: { box: "bg-emerald-50", pill: "bg-emerald-100 text-emerald-800", label: "ตรวจแล้ว" },
  problem: { box: "bg-amber-50", pill: "bg-amber-100 text-amber-800", label: "ตรวจแล้ว" },
});

function CategoryIcon({ category }: { category: string }) {
  if (category === "CAT-002") return <Monitor size={22} aria-hidden />;
  if (category === "CAT-003") return <Printer size={22} aria-hidden />;
  if (category === "CAT-004") return <Armchair size={22} aria-hidden />;
  if (category === "CAT-005") return <Router size={22} aria-hidden />;
  return <Laptop size={22} aria-hidden />;
}

function AssetCard({ asset, tone, person, time, note, hint, footer, onRemove }: {
  asset: Asset;
  tone: keyof typeof CARD_STYLE;
  person: string;
  time?: string;
  note?: string;
  hint?: string | null;
  footer: ReactNode;
  onRemove?: () => void;
}) {
  useT();
  const style = CARD_STYLE[tone];
  return (
    <li className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className={`flex gap-3 p-4 ${style.box}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
          <CategoryIcon category={asset.category} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-slate-900">{asset.name}</p>
          <p className="text-sm text-slate-600">{asset.id}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-slate-600">{person}</span>
            <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${style.pill}`}>{style.label}</span>
          </div>
          {time && <p className="mt-1 text-sm text-slate-500">{time}</p>}
          {hint && <p className="mt-1 text-sm font-semibold text-amber-700">{hint}</p>}
          {note && <p className="mt-1 text-sm text-slate-600">{tx("หมายเหตุ:")} {note}</p>}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={tx("ยกเลิกผลตรวจ {0}", asset.id)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-white"
          >
            <X size={20} />
          </button>
        )}
      </div>
      {footer && <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-3">{footer}</div>}
    </li>
  );
}

function ConditionSelect({ value, onChange }: { value: Condition; onChange: (value: Condition) => void }) {
  useT();
  return (
    <label className="flex min-w-0 flex-1 items-center gap-3 text-base text-slate-700">
      <span className="shrink-0">{tx("สภาพทรัพย์สิน")}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Condition)}
        className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {CONDITIONS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-11 rounded-xl text-base font-semibold ${active ? "bg-white text-slate-900 shadow" : "text-slate-600"}`}
    >
      {children}
    </button>
  );
}
