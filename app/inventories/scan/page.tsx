"use client";


import { inThai, tx, useT } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
// หน้าสแกนตรวจนับ: ใช้ตัวสแกนกลางของกลุ่ม (components/scanner) อ่านได้ทั้ง QR Code และ Barcode
// สแกนได้ต่อเนื่องหลายชิ้นโดยไม่ต้องกลับไปหน้ารายการทุกครั้ง
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import CodeScanner from "@/components/scanner/CodeScanner";
import {
  RESULT_LABEL,
  findAsset,
  formatThaiDateTime,
  getBranchName,
  getCheckerName,
  getSessionProgress,
  previewScan,
  removeCheck,
  saveCheck,
  updateCheck,
  useCredential,
  useInventoryStore,
  type ScanOutcome,
} from "@/lib/inventory";
import {
  EmptyState,
  Loading,
  PageHeader,
  ProgressBar,
  RoleGate,
  Toast,
  buttonStyle,
  useToast,
} from "../_components/ui";

export default function ScanPage() {
  return (
    <RoleGate allow={["user"]}>
      <Suspense fallback={<Loading />}>
        <ScanContent />
      </Suspense>
    </RoleGate>
  );
}

function ScanContent() {
  const translateText = useT();
  const language = useLanguage();
  const sessionId = useSearchParams().get("session");
  const { credential } = useCredential();
  const { sessions, checks, ready } = useInventoryStore();
  const toast = useToast();

  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  // ผลที่เพิ่งสแกน เก็บ id ไว้ให้เปลี่ยนสภาพหรือยกเลิกได้ทันที
  const [lastCheckId, setLastCheckId] = useState<string | null>(null);

  if (!ready) return <Loading />;

  const session = sessions.find((s) => s.id === sessionId);
  if (!session) {
    return (
      <div className="mx-auto max-w-md p-6 pt-16">
        <EmptyState text={translateText("ไม่พบรอบตรวจนับ กรุณาเลือกรอบจากหน้ากำหนดการก่อน")}>
          <Link href="/inventories" className={buttonStyle.primary}>
            {translateText("ไปหน้ากำหนดการ")}
          </Link>
        </EmptyState>
      </div>
    );
  }

  const progress = getSessionProgress(session, checks);
  const allDone = progress.total > 0 && progress.checked === progress.total;
  const auditHref = `/inventories/audit?session=${session.id}`;
  const isOpen = session.status === "in_progress";

  const handleCode = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code || outcome || !credential) return;
    const result = previewScan(session, code, checks);
    // เจอของในรอบนี้ = บันทึกเป็น "ปกติ" ทันที (ค่าเริ่มต้น) แล้วสแกนชิ้นต่อไปได้เลย
    if (result.type === "ready") {
      const saved = saveCheck({ sessionId: session.id, asset: result.asset, result: "found", checker: credential, note: "สแกน QR" }); // เก็บเป็นภาษาไทย แปลตอนแสดงผล
      setLastCheckId(saved?.id ?? null);
      toast.show(saved ? tx("บันทึก {0}: ปกติ", result.asset.id) : tx("บันทึกไม่สำเร็จ"));
      return;
    }
    setOutcome(result);
  };

  const lastCheck = checks.find((c) => c.id === lastCheckId);
  const lastAsset = lastCheck ? findAsset(lastCheck.assetId) : undefined;

  const handleChangeLast = (result: "found" | "damaged" | "missing") => {
    if (!lastCheck || !credential) return;
    toast.show(updateCheck(lastCheck.id, result, credential) ? tx("เปลี่ยน {0} เป็น {1}", lastCheck.assetId, RESULT_LABEL[result]) : tx("เปลี่ยนไม่สำเร็จ"));
  };

  const handleUndoLast = () => {
    if (!lastCheck) return;
    toast.show(removeCheck(lastCheck.id) ? tx("ยกเลิกผล {0} แล้ว", lastCheck.assetId) : tx("ยกเลิกไม่สำเร็จ"));
    setLastCheckId(null);
  };

  const handleRecordMismatch = () => {
    if (outcome?.type !== "mismatch" || !credential) return;
    const saved = saveCheck({
      sessionId: session.id,
      asset: outcome.asset,
      result: "mismatch",
      checker: credential,
      // หมายเหตุเก็บเป็นภาษาไทยเสมอ ตอนแสดงผลจะแปลตามภาษาที่เลือก
      note: inThai(() =>
        outcome.asset.status === "disposed"
          ? tx("พบทรัพย์สินที่จำหน่ายแล้วแต่ยังอยู่ในสาขา")
          : tx("พบทรัพย์สินของ{0} ที่{1}", getBranchName(outcome.asset.branchId), getBranchName(session.branchId)),
      ),
    });
    toast.show(saved ? tx("บันทึก {0} ว่าสูญหาย (ไม่ตรงทะเบียน) แล้ว", outcome.asset.id) : tx("บันทึกไม่สำเร็จ"));
    setOutcome(null);
  };

  const closeSheet = () => setOutcome(null);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <Toast message={toast.message} />
      <PageHeader
        title={translateText("สแกน QR Code")}
        subtitle={`${session.id} · ${getBranchName(session.branchId)}`}
        backHref={auditHref}
      />

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex justify-between text-base">
            <span>
              {translateText("ตรวจแล้ว")} <strong>{progress.checked}</strong> / {progress.total}{" "}
              {translateText("รายการ")}
            </span>
            <span className="font-bold text-blue-600">{progress.percent}%</span>
          </div>
          <ProgressBar percent={progress.percent} />
          {allDone && (
            <Link
              href={auditHref}
              className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white"
            >
              {translateText("ตรวจครบแล้ว กลับไปส่งผล")}
            </Link>
          )}
        </section>

        {!isOpen ? (
          <EmptyState text={translateText("รอบนี้ไม่ได้เปิดให้สแกน")}>
            <Link href={auditHref} className={buttonStyle.primary}>
              {translateText("กลับไปหน้ารายการ")}
            </Link>
          </EmptyState>
        ) : (
          <>
            <CodeScanner onScan={(code) => handleCode(code)} paused={outcome !== null} />

            {lastCheck && lastAsset && (
              <section aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">{translateText("สแกนล่าสุด")}</p>
                <p className="text-base font-bold text-slate-900">{lastAsset.name}</p>
                <p className="text-sm text-slate-600">
                  {lastAsset.id} · {formatThaiDateTime(lastCheck.checkedAt, language)}
                </p>
                <label className="mt-3 flex items-center gap-3 text-base text-slate-700">
                  <span className="shrink-0">{translateText("สภาพทรัพย์สิน")}</span>
                  <select
                    value={lastCheck.result}
                    onChange={(e) => handleChangeLast(e.target.value as "found" | "damaged" | "missing")}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-base"
                  >
                    <option value="found">{translateText("ปกติ")}</option>
                    <option value="damaged">{translateText("ชำรุด")}</option>
                    <option value="missing">{translateText("สูญหาย")}</option>
                  </select>
                </label>
                <button type="button" onClick={handleUndoLast} className="mt-2 text-sm font-semibold text-slate-600 underline">
                  {translateText("สแกนผิดชิ้น? ยกเลิกผลนี้")}
                </button>
              </section>
            )}

          </>
        )}

        <Link href={auditHref} className={`${buttonStyle.secondary} w-full`}>
          {translateText("ดูรายการทั้งหมด")}
        </Link>
      </main>

      {outcome?.type === "duplicate" && (
        <MessageSheet
          tone="warn"
          title={translateText("สแกนซ้ำ")}
          body={`${outcome.asset.name} (${outcome.asset.id}) ${translateText("ตรวจไปแล้วเมื่อ")} ${formatThaiDateTime(outcome.check.checkedAt, language)} ${translateText("โดย")} ${getCheckerName(outcome.check)}`}
          primaryLabel={translateText("สแกนชิ้นต่อไป")}
          onPrimary={closeSheet}
        />
      )}
      {outcome?.type === "mismatch" && outcome.asset.status === "disposed" && (
        <MessageSheet
          tone="error"
          title={translateText("ทรัพย์สินนี้จำหน่ายไปแล้ว")}
          body={`${outcome.asset.name} (${outcome.asset.id}) ${translateText("ในทะเบียนจำหน่ายไปแล้ว แต่ยังพบอยู่ในสาขา")}`}
          primaryLabel={translateText("บันทึกผล")}
          onPrimary={handleRecordMismatch}
          secondaryLabel={translateText("ไม่บันทึก")}
          onSecondary={closeSheet}
        />
      )}
      {outcome?.type === "mismatch" && outcome.asset.status !== "disposed" && (
        <MessageSheet
          tone="error"
          title={translateText("ทรัพย์สินนี้ไม่ได้อยู่ในสาขาที่ตรวจ")}
          body={`${outcome.asset.name} (${outcome.asset.id}) ${translateText("ลงทะเบียนไว้ที่")}${getBranchName(outcome.asset.branchId)} ${translateText("แต่รอบนี้ตรวจ")}${getBranchName(session.branchId)}`}
          primaryLabel={translateText("บันทึกว่าพบต่างสาขา")}
          onPrimary={handleRecordMismatch}
          secondaryLabel={translateText("ไม่บันทึก")}
          onSecondary={closeSheet}
        />
      )}
      {outcome?.type === "not_found" && (
        <MessageSheet
          tone="error"
          title={translateText("ไม่พบรหัสนี้ในระบบ")}
          body={`${translateText("รหัส")} ${outcome.code} ${translateText("ไม่ตรงกับทรัพย์สินใดเลย ตรวจดูว่า QR ถูกต้อง หรือพิมพ์รหัสใหม่")}`}
          primaryLabel={translateText("สแกนใหม่")}
          onPrimary={closeSheet}
        />
      )}
      {outcome?.type === "closed" && (
        <MessageSheet
          tone="error"
          title={translateText("รอบนี้ปิดแล้ว")}
          body={translateText("ไม่สามารถบันทึกผลเพิ่มได้")}
          primaryLabel={translateText("ตกลง")}
          onPrimary={closeSheet}
        />
      )}
    </div>
  );
}

function MessageSheet({
  tone,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  tone: "warn" | "error";
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 lg:items-center"
    >
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-xl lg:rounded-3xl">
        <h2 className={`text-xl font-bold ${tone === "warn" ? "text-amber-700" : "text-rose-700"}`}>
          {title}
        </h2>
        <p className="mt-2 text-base text-slate-700">{body}</p>
        <button
          type="button"
          onClick={onPrimary}
          className="mt-5 min-h-14 w-full rounded-2xl bg-blue-900 text-lg font-bold text-white hover:bg-blue-950"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="mt-3 min-h-12 w-full rounded-2xl border border-slate-300 text-base font-semibold text-slate-700"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
