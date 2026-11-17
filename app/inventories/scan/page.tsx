"use client";

// หน้าสแกน QR ด้วยกล้องจริง (ใช้ไลบรารี @yudiel/react-qr-scanner)
// สแกนได้ต่อเนื่องหลายชิ้นโดยไม่ต้องกลับไปหน้ารายการทุกครั้ง
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";
import {
  RESULT_LABEL,
  formatThaiDateTime,
  getBranchName,
  getCheckerName,
  getSessionProgress,
  previewScan,
  saveCheck,
  useCredential,
  useInventoryStore,
  type ScanOutcome,
} from "@/lib/inventory";
import ConfirmCheckSheet from "../_components/ConfirmCheckSheet";
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

// กล้องใช้ได้เฉพาะบนเบราว์เซอร์ จึงปิดการ render ฝั่ง server (ssr: false)
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-square items-center justify-center text-base text-white">
        กำลังเปิดกล้อง...
      </div>
    ),
  },
);

const CAMERA_ERROR_TEXT: Record<IScannerError["kind"], string> = {
  "permission-denied": "ยังไม่ได้อนุญาตให้ใช้กล้อง กดรูปกุญแจที่แถบที่อยู่เว็บแล้วอนุญาตกล้อง",
  "no-camera": "ไม่พบกล้องในอุปกรณ์นี้",
  "in-use": "กล้องถูกใช้งานโดยแอปอื่นอยู่",
  overconstrained: "กล้องตัวนี้ใช้ไม่ได้ ลองกดสลับกล้อง",
  "insecure-context": "เบราว์เซอร์อนุญาตกล้องเฉพาะเว็บที่เป็น https หรือ localhost",
  unsupported: "เบราว์เซอร์นี้ไม่รองรับการสแกน",
  aborted: "การเปิดกล้องถูกยกเลิก",
  security: "เบราว์เซอร์ไม่อนุญาตให้ใช้กล้อง",
  "type-error": "เปิดกล้องไม่สำเร็จ",
  unknown: "เปิดกล้องไม่สำเร็จ",
};

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
  const sessionId = useSearchParams().get("session");
  const { credential } = useCredential();
  const { sessions, checks, ready } = useInventoryStore();
  const toast = useToast();

  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  if (!ready) return <Loading />;

  const session = sessions.find((s) => s.id === sessionId);
  if (!session) {
    return (
      <div className="mx-auto max-w-md p-6 pt-16">
        <EmptyState text="ไม่พบรอบตรวจนับ กรุณาเลือกรอบจากหน้ากำหนดการก่อน">
          <Link href="/inventories" className={buttonStyle.primary}>
            ไปหน้ากำหนดการ
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
    if (!code || outcome) return;
    setOutcome(previewScan(session, code, checks));
  };

  // ไลบรารีจะไม่ส่งโค้ดเดิมซ้ำติดกัน จึงไม่ต้องกันการอ่านซ้ำเอง
  const handleScan = (codes: IDetectedBarcode[]) => {
    handleCode(codes[0]?.rawValue ?? "");
  };

  const handleManualSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCode(manualCode);
    setManualCode("");
  };

  const handleConfirm = (result: "found" | "damaged", note: string) => {
    if (outcome?.type !== "ready" || !credential) return;
    const saved = saveCheck({ sessionId: session.id, asset: outcome.asset, result, checker: credential, note });
    toast.show(saved ? `✓ บันทึก ${outcome.asset.id} (${RESULT_LABEL[result]}) แล้ว` : "บันทึกไม่สำเร็จ");
    setOutcome(null);
  };

  const handleRecordMismatch = () => {
    if (outcome?.type !== "mismatch" || !credential) return;
    const saved = saveCheck({
      sessionId: session.id,
      asset: outcome.asset,
      result: "mismatch",
      checker: credential,
      note: `พบทรัพย์สินของ${getBranchName(outcome.asset.branchId)} ที่${getBranchName(session.branchId)}`,
    });
    toast.show(saved ? `บันทึก ${outcome.asset.id} ว่าพบต่างสาขาแล้ว` : "บันทึกไม่สำเร็จ");
    setOutcome(null);
  };

  const closeSheet = () => setOutcome(null);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <Toast message={toast.message} />
      <PageHeader title="สแกน QR Code" subtitle={`${session.id} · ${getBranchName(session.branchId)}`} backHref={auditHref} />

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex justify-between text-base">
            <span>
              ตรวจแล้ว <strong>{progress.checked}</strong> / {progress.total} รายการ
            </span>
            <span className="font-bold text-indigo-600">{progress.percent}%</span>
          </div>
          <ProgressBar percent={progress.percent} />
          {allDone && (
            <Link
              href={auditHref}
              className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white"
            >
              ✓ ตรวจครบแล้ว กลับไปส่งผล
            </Link>
          )}
        </section>

        {!isOpen ? (
          <EmptyState text="รอบนี้ไม่ได้เปิดให้สแกน">
            <Link href={auditHref} className={buttonStyle.primary}>
              กลับไปหน้ารายการ
            </Link>
          </EmptyState>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl bg-slate-900">
              {cameraError ? (
                <div className="flex aspect-square flex-col items-center justify-center gap-3 p-6 text-center text-base text-white">
                  <p>📷 {cameraError}</p>
                  <p className="text-sm text-slate-300">ใช้ช่องพิมพ์รหัสด้านล่างแทนได้</p>
                </div>
              ) : (
                <Scanner
                  key={facingMode}
                  onScan={handleScan}
                  onError={(error) => setCameraError(CAMERA_ERROR_TEXT[error.kind] ?? error.message)}
                  paused={outcome !== null}
                  constraints={{ facingMode }}
                  formats={["qr_code", "code_128", "code_39", "ean_13"]}
                  components={{ finder: true, torch: true }}
                  sound
                />
              )}
            </div>

            <p className="text-center text-base text-slate-600">
              เล็งกล้องไปที่ QR Code บนทรัพย์สิน ระบบจะอ่านให้อัตโนมัติ
            </p>

            <button
              type="button"
              onClick={() => {
                setFacingMode((m) => (m === "environment" ? "user" : "environment"));
                setCameraError(null);
              }}
              className={`${buttonStyle.secondary} w-full`}
            >
              🔄 สลับเป็น{facingMode === "environment" ? "กล้องหน้า" : "กล้องหลัง"}
            </button>

            <form onSubmit={handleManualSubmit} className="rounded-2xl border border-slate-200 bg-white p-4">
              <label htmlFor="manual-code" className="text-base font-semibold text-slate-800">
                สแกนไม่ติด? พิมพ์รหัสทรัพย์สิน
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="manual-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="เช่น AST-0005"
                  autoCapitalize="characters"
                  className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-base uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className={buttonStyle.primary} disabled={!manualCode.trim()}>
                  ตรวจ
                </button>
              </div>
            </form>
          </>
        )}

        <Link href={auditHref} className={`${buttonStyle.secondary} w-full`}>
          ดูรายการทั้งหมด
        </Link>
      </main>

      {outcome?.type === "ready" && (
        <ConfirmCheckSheet
          asset={outcome.asset}
          title="✓ พบทรัพย์สินในรอบนี้"
          onConfirm={handleConfirm}
          onCancel={closeSheet}
        />
      )}
      {outcome?.type === "duplicate" && (
        <MessageSheet
          tone="warn"
          title="สแกนซ้ำ"
          body={`${outcome.asset.name} (${outcome.asset.id}) ตรวจไปแล้วเมื่อ ${formatThaiDateTime(outcome.check.checkedAt)} โดย ${getCheckerName(outcome.check)}`}
          primaryLabel="สแกนชิ้นต่อไป"
          onPrimary={closeSheet}
        />
      )}
      {outcome?.type === "mismatch" && (
        <MessageSheet
          tone="error"
          title="ทรัพย์สินนี้ไม่ได้อยู่ในสาขาที่ตรวจ"
          body={`${outcome.asset.name} (${outcome.asset.id}) ลงทะเบียนไว้ที่${getBranchName(outcome.asset.branchId)} แต่รอบนี้ตรวจ${getBranchName(session.branchId)}`}
          primaryLabel="บันทึกว่าพบต่างสาขา"
          onPrimary={handleRecordMismatch}
          secondaryLabel="ไม่บันทึก"
          onSecondary={closeSheet}
        />
      )}
      {outcome?.type === "not_found" && (
        <MessageSheet
          tone="error"
          title="ไม่พบรหัสนี้ในระบบ"
          body={`รหัส ${outcome.code} ไม่ตรงกับทรัพย์สินใดเลย ตรวจดูว่า QR ถูกต้อง หรือพิมพ์รหัสใหม่`}
          primaryLabel="สแกนใหม่"
          onPrimary={closeSheet}
        />
      )}
      {outcome?.type === "closed" && (
        <MessageSheet
          tone="error"
          title="รอบนี้ปิดแล้ว"
          body="ไม่สามารถบันทึกผลเพิ่มได้"
          primaryLabel="ตกลง"
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
          {tone === "warn" ? "⚠ " : "✕ "}
          {title}
        </h2>
        <p className="mt-2 text-base text-slate-700">{body}</p>
        <button
          type="button"
          onClick={onPrimary}
          className="mt-5 min-h-14 w-full rounded-2xl bg-indigo-600 text-lg font-bold text-white hover:bg-indigo-700"
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
