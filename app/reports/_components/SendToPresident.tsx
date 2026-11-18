"use client";

// หน้าจัดทำรายงานเสนอ President (Admin)
// ระบบเติมตัวเลขและข้อความตั้งต้นจากข้อมูลจริงให้ Admin แก้ได้ แล้ว "ส่ง" หรือ "บันทึกฉบับร่าง"
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Boxes, CircleCheck, Download, Eye, FileSpreadsheet, Plus, RotateCcw, Send, Wrench } from "lucide-react";
import { assets } from "@/data/asset";
import { exportExcel } from "@/lib/exportExcel";
import {
  SESSION_STATUS_LABEL,
  formatBaht,
  formatThaiDate,
  formatThaiDateTime,
  getBranchName,
  toDateValue,
  useCredential,
  useInventoryStore,
  type Credential,
  type StoredCheck,
  type StoredSession,
} from "@/lib/inventory";
import {
  PURPOSE_LABEL,
  getActivities,
  getInventoryRows,
  getMovementRows,
  getPeriods,
  localizedPeriodLabel,
  getRepairRows,
  inventorySheet,
  issueCount,
  movementSheet,
  registerSheet,
  repairCost,
  repairSheet,
  reportSheet,
  saveDraft,
  sendReport,
  sessionResultSheet,
  useReportStore,
  type Period,
  type ReportInput,
  type ReportPurpose,
  type SentReport,
} from "@/lib/reports";
import { Loading, Toast, useToast } from "@/app/inventories/_components/ui";
import { Badge, Card, DetailDialog, Kpi, SelectField, Stat, reportButton } from "./parts";
import { ReportBody } from "./ReportBody";
import { useLanguage, useTranslate } from "@/lib/language";

// ทรัพย์สินที่ยังใช้งาน (ไม่นับของที่จำหน่ายแล้ว) ใช้เป็นฐานของรายงาน Asset
const activeAssets = assets.filter((a) => a.status !== "disposed");

export default function SendToPresident() {
  const { credential } = useCredential();
  const { sessions, checks, ready } = useInventoryStore();
  const { reports, ready: reportsReady } = useReportStore();

  if (!ready || !reportsReady || !credential) return <Loading />;

  const draft = reports.find((r) => r.status === "draft" && r.createdBy === credential.id);
  const mySent = reports
    .filter((r) => r.status === "sent" && r.createdBy === credential.id)
    .sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? ""));

  // key เปลี่ยนเมื่อมี/ไม่มีฉบับร่าง ฟอร์มจะโหลดค่าจากฉบับร่างใหม่
  return (
    <Composer
      key={draft?.id ?? "new"}
      credential={credential}
      sessions={sessions}
      checks={checks}
      draft={draft}
      sent={mySent}
    />
  );
}

// ตัวเลขทั้งหมดของรายงานตามช่วงเวลาที่เลือก
function buildFigures(period: Period, sessions: StoredSession[], checks: StoredCheck[]) {
  const scope = { period, branchId: "all" };
  const movements = getMovementRows({ ...scope, status: "all", type: "all" });
  const inventory = getInventoryRows(sessions, checks, scope);
  const repairs = getRepairRows(scope);
  const assetValue = activeAssets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const issues = inventory.reduce((sum, r) => sum + issueCount(r), 0);
  const damaged = inventory.reduce((sum, r) => sum + r.progress.damaged, 0);
  const lost = inventory.reduce((sum, r) => sum + r.progress.lost, 0);
  const repairTotal = repairs.reduce((sum, r) => sum + repairCost(r), 0);
  const openRepairs = repairs.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const pendingMovements = movements.filter((r) => r.request.status === "pending").length;
  const completedRounds = inventory.filter((r) => r.session.status === "completed").length;
  return {
    movements,
    inventory,
    repairs,
    assetValue,
    issues,
    damaged,
    lost,
    repairTotal,
    openRepairs,
    pendingMovements,
    completedRounds,
  };
}

type Figures = ReturnType<typeof buildFigures>;

function autoSummary(
  f: Figures,
  periodLabel: string,
  language: "th" | "en",
) {
  if (language === "en") {
    return (
      `Active assets: ${activeAssets.length.toLocaleString("en-US")} items, value ${formatBaht(f.assetValue)}\n` +
      `During ${periodLabel}: ${f.movements.length} borrow/return/transfer requests (${f.pendingMovements} pending), ` +
      `${f.inventory.length} inventory cycles with ${f.issues} issues, and ${formatBaht(f.repairTotal)} in repair costs across ${f.repairs.length} jobs`
    );
  }
  return (
    `ทรัพย์สินที่ใช้งานอยู่ ${activeAssets.length.toLocaleString("th-TH")} รายการ มูลค่า ${formatBaht(f.assetValue)}\n` +
    `ช่วง ${periodLabel} มีการเบิก/คืน/โอนย้าย ${f.movements.length} รายการ (รออนุมัติ ${f.pendingMovements}) ` +
    `ตรวจนับ ${f.inventory.length} รอบ พบปัญหา ${f.issues} รายการ และค่าใช้จ่ายซ่อม ${formatBaht(f.repairTotal)} จาก ${f.repairs.length} งาน`
  );
}

function autoIssues(
  f: Figures,
  translateText: (text: string) => string,
) {
  return [
    {
      title: `${translateText("เฝ้าระวัง · ผลตรวจนับพบปัญหา")} ${f.issues} ${translateText("รายการ")}`,
      detail: `${translateText("ชำรุด")} ${f.damaged} · ${translateText("สูญหาย")} ${f.lost} ${translateText("รายการ")}\n${translateText("ข้อเสนอ: ให้สาขาติดตามรายการที่สูญหาย และส่งของชำรุดเข้ากระบวนการซ่อม")}`,
    },
    {
      title: `${translateText("ติดตามค่าใช้จ่ายซ่อม")} ${formatBaht(f.repairTotal)}`,
      detail: `${translateText("งานซ่อมทั้งหมด")} ${f.repairs.length} ${translateText("งาน ยังไม่เสร็จ")} ${f.openRepairs} ${translateText("งาน")}\n${translateText("ข้อเสนอ: สรุปสาเหตุและแผนป้องกันการซ่อมซ้ำ ก่อนเสนอวงเงินเพิ่มเติม")}`,
    },
  ];
}

const DEFAULT_MESSAGE =
  "เรียน President\nขอนำส่งสรุปรายงานทรัพย์สินตามรอบที่เลือก เพื่อทราบ\nโดยมีประเด็นผลตรวจนับและค่าใช้จ่ายซ่อมตามสรุปข้างต้น";

function Composer({ credential, sessions, checks, draft, sent }: {
  credential: Credential;
  sessions: StoredSession[];
  checks: StoredCheck[];
  draft: SentReport | undefined;
  sent: SentReport[];
}) {
  const language = useLanguage();
  const translateText = useTranslate();
  const toast = useToast();
  const [periods] = useState(() => getPeriods());
  const draftPeriod = periods.find(
    (p) =>
      p.label === draft?.periodLabel ||
      localizedPeriodLabel(p, "en") === draft?.periodLabel,
  );
  const [periodKey, setPeriodKey] = useState(draftPeriod?.key ?? periods[0].key);
  const period = periods.find((p) => p.key === periodKey) ?? periods[0];
  const periodLabel = localizedPeriodLabel(period, language);
  const figures = buildFigures(period, sessions, checks);

  // null = ยังไม่ได้แก้เอง ให้ใช้ข้อความอัตโนมัติ (เปลี่ยนช่วงเวลาแล้วข้อความเปลี่ยนตาม)
  const [summary, setSummary] = useState<string | null>(draft?.summary ?? null);
  const [issues, setIssues] = useState<{ title: string; detail: string }[] | null>(draft?.issues ?? null);
  const [title, setTitle] = useState<string | null>(draft?.title ?? null);
  const [purpose, setPurpose] = useState<ReportPurpose>(draft?.purpose ?? "inform");
  const [message, setMessage] = useState<string | null>(draft?.message ?? null);
  const [showPreview, setShowPreview] = useState(false);

  const summaryText = summary ?? autoSummary(figures, periodLabel, language);
  const issueList = issues ?? autoIssues(figures, translateText);
  const titleText = title ?? `${translateText("สรุปทรัพย์สิน")} ${periodLabel}`;
  const messageText = message ?? translateText(DEFAULT_MESSAGE);

  const sections = [
    { label: "ทรัพย์สิน · Asset", value: `${activeAssets.length} รายการ · ${formatBaht(figures.assetValue)}` },
    { label: "เคลื่อนไหว · Movement", value: `${figures.movements.length} รายการ · ${periodLabel}` },
    { label: "ตรวจนับ · Inventory", value: `${figures.inventory.length} รอบ · พบปัญหา ${figures.issues} รายการ` },
    { label: "ซ่อมบำรุง · Repair", value: `${figures.repairs.length} งาน · ${formatBaht(figures.repairTotal)}` },
  ];

  const input: ReportInput = {
    title: titleText.trim(),
    periodLabel,
    purpose,
    summary: summaryText.trim(),
    message: messageText.trim(),
    sections,
    issues: issueList.filter((i) => i.title.trim() || i.detail.trim()),
    createdBy: credential.id,
    createdByName: credential.username,
  };

  const error = !input.title ? "กรุณาใส่ชื่อรายงาน" : !input.message ? "กรุณาเขียนข้อความถึง President" : null;

  const handleDraft = () => {
    saveDraft(input);
    toast.show("บันทึกฉบับร่างแล้ว เปิดหน้านี้ใหม่จะได้ข้อความเดิม");
  };

  const handleSend = () => {
    if (error) {
      toast.show(error);
      return;
    }
    if (!window.confirm(`ส่ง "${input.title}" ให้ President ใช่ไหม? ส่งแล้วแก้ไขไม่ได้`)) return;
    const report = sendReport(input);
    toast.show(`ส่ง ${report.id} ให้ President แล้ว`);
  };

  const resetAuto = () => {
    setSummary(null);
    setIssues(null);
    setTitle(null);
    toast.show("เติมข้อความใหม่จากตัวเลขล่าสุดแล้ว");
  };

  const updateIssue = (index: number, field: "title" | "detail", value: string) =>
    setIssues(issueList.map((issue, i) => (i === index ? { ...issue, [field]: value } : issue)));

  const handleExport = async () => {
    await exportExcel(`รายงานเสนอ President_${toDateValue(new Date())}`, [
      reportSheet({ ...input, id: "-", status: "draft", updatedAt: "", sentAt: null, readAt: null }),
      registerSheet(activeAssets),
      movementSheet(figures.movements),
      inventorySheet(figures.inventory),
      repairSheet(figures.repairs),
    ]);
    toast.show("ดาวน์โหลดข้อมูลประกอบ 5 ชีตแล้ว");
  };

  const latestRound = sessions
    .filter((s) => s.status === "completed")
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];

  const handleExportRound = async () => {
    if (!latestRound) return;
    await exportExcel(`ผลตรวจนับ_${latestRound.id}`, [sessionResultSheet(latestRound, checks)]);
    toast.show(`ดาวน์โหลดผลตรวจรอบ ${latestRound.id} แล้ว`);
  };

  const activities = getActivities(checks, { period, branchId: "all" }).slice(0, 3);
  const fieldStyle =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <Toast message={toast.message} />
      <main className="mx-auto max-w-7xl space-y-5 px-4 pt-5 lg:px-8 lg:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{translateText("จัดทำรายงานเสนอ President")}</h1>
            <p className="mt-1 text-base text-slate-500">{translateText("รวบรวมข้อมูล สรุปประเด็น และตรวจทานก่อนส่ง")}</p>
          </div>
          <Link href="/reports" className={reportButton.secondary}>

            {translateText("‹ กลับหน้ารับรายงาน")}
          </Link>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[16rem_20rem_1fr] lg:items-end">
          <h2 className="text-lg font-bold text-slate-900 lg:pb-3">{translateText("1. กำหนดขอบเขตรายงาน")}</h2>
          <SelectField
            label={translateText("ช่วงเวลา")}
            value={periodKey}
            onChange={setPeriodKey}
            options={periods.map((p) => ({ value: p.key, label: localizedPeriodLabel(p, language) }))}
          />
          <p className="text-sm text-slate-500 lg:pb-3">

            {translateText("Movement, ตรวจนับ และงานซ่อม:")} {formatThaiDate(period.from === "0000-01-01" ? "2024-01-01" : period.from, true, language)} –{" "}
            {formatThaiDate(period.to === "9999-12-31" ? toDateValue(new Date()) : period.to, true, language)}  {translateText("· ทรัพย์สิน: ณ วันนี้")}
          </p>
        </div>

        <Card
          title="2. สรุปสำหรับผู้บริหาร"
          actions={
            <button type="button" onClick={resetAuto} className={reportButton.secondary}>
              <RotateCcw size={18} />  {translateText("เติมข้อความจากตัวเลขใหม่")}
            </button>
          }
        >
          <textarea
            value={summaryText}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            aria-label={translateText("สรุปสำหรับผู้บริหาร")}
            className={fieldStyle}
          />
          <p className="mt-2 text-sm text-slate-500">

            {translateText("สรุปตามขอบเขตที่เลือก ไม่ใช่ยอดรวมทั้งองค์กร · แก้ไขแล้วกด \"บันทึกฉบับร่าง\" เพื่อเก็บไว้")}
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Kpi
            label={translateText("มูลค่าทรัพย์สิน")}
            value={formatBaht(figures.assetValue)}
            note={`${activeAssets.length} รายการที่ใช้งานอยู่`}
            icon={<Boxes size={24} />}
          />
          <Kpi
            label={translateText("พบปัญหาจากการตรวจนับ")}
            value={`${figures.issues} รายการ`}
            note={`ชำรุด ${figures.damaged} · สูญหาย ${figures.lost} · ${figures.inventory.length} รอบ`}
            icon={<CircleCheck size={24} />}
            tone="green"
          />
          <Kpi
            label={translateText("ค่าใช้จ่ายซ่อม")}
            value={formatBaht(figures.repairTotal)}
            note={`รวม ${figures.repairs.length} งานซ่อม · ${periodLabel}`}
            icon={<Wrench size={24} />}
            tone="amber"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card title="3. รายงานประกอบ 4 ประเภท">
              <div className="grid gap-3 sm:grid-cols-2">
                <SubReport
                  title="ทรัพย์สิน · Asset"
                  badge={<Badge tone="good">{activeAssets.length}  {translateText("รายการ")}</Badge>}
                  stats={[
                    ["รายการ", `${activeAssets.length} รายการ`],
                    ["มูลค่ารวม", formatBaht(figures.assetValue)],
                  ]}
                />
                <SubReport
                  title="เคลื่อนไหว · Movement"
                  badge={<Badge tone="info">{figures.movements.length}  {translateText("รายการ")}</Badge>}
                  stats={[
                    ["การเคลื่อนไหว", `${figures.movements.length} รายการ`],
                    ["รออนุมัติ", `${figures.pendingMovements} รายการ`],
                  ]}
                />
                <SubReport
                  title="ตรวจนับ · Inventory"
                  badge={<Badge tone={figures.issues > 0 ? "wait" : "good"}>{translateText("พบปัญหา")} {figures.issues}</Badge>}
                  stats={[
                    ["รอบตรวจนับ", `${figures.inventory.length} รอบ (ปิดแล้ว ${figures.completedRounds})`],
                    ["ชำรุด / สูญหาย", `${figures.damaged} / ${figures.lost} รายการ`],
                  ]}
                />
                <SubReport
                  title="ซ่อมบำรุง · Repair"
                  badge={<Badge tone="wait">{figures.repairs.length}  {translateText("งาน")}</Badge>}
                  stats={[
                    ["งานซ่อม", `${figures.repairs.length} งาน (ค้าง ${figures.openRepairs})`],
                    ["ค่าใช้จ่ายรวม", formatBaht(figures.repairTotal)],
                  ]}
                />
              </div>
              <p className="mt-3 text-sm text-slate-500">{translateText("ตัวเลขคำนวณจากข้อมูลกลางของระบบ แก้ไขไม่ได้ เพื่อให้รายงานตรงกับข้อมูลจริง")}</p>
            </Card>

            <Card title="4. ประเด็นและข้อเสนอ">
              <div className="grid gap-3 md:grid-cols-2">
                {issueList.map((issue, i) => (
                  <div key={i} className={`rounded-2xl p-4 ${i === 0 ? "bg-amber-50" : "border border-slate-200"}`}>
                    <label className="block text-sm font-semibold text-slate-700">

                      {translateText("หัวข้อประเด็น")}
                      <input value={issue.title} onChange={(e) => updateIssue(i, "title", e.target.value)} className={fieldStyle} />
                    </label>
                    <label className="mt-3 block text-sm font-semibold text-slate-700">

                      {translateText("รายละเอียดและข้อเสนอ")}
                      <textarea
                        value={issue.detail}
                        onChange={(e) => updateIssue(i, "detail", e.target.value)}
                        rows={4}
                        className={fieldStyle}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-500">{translateText("ข้อเสนอข้างต้นยังไม่ใช่คำขออนุมัติงบประมาณ ถ้าต้องการให้อนุมัติ เลือก \"ขออนุมัติ\" ในข้อ 5")}</p>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              <Card title="ข้อมูลประกอบ · Excel" badge={<Badge tone="good">{translateText("พร้อมใช้งาน")}</Badge>}>
                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    label={translateText("ชีต")}
                    value={`5 ${translateText("ชีต")}`}
                  />
                  <Stat label={translateText("รูปแบบ")} value=".xlsx" />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 [&>*]:flex-1 [&>*]:basis-40">
                  <button type="button" onClick={handleExport} className={reportButton.secondary}>
                    <Download size={18} />  {translateText("ส่งออก Excel")}
                  </button>
                  <Link href="/reports" className={reportButton.primary}>
                    <FileSpreadsheet size={18} />  {translateText("ดูข้อมูลละเอียด")}
                  </Link>
                </div>
              </Card>

              <Card title={translateText("ประวัติตรวจนับ")} badge={<Badge tone={latestRound ? "good" : "plain"}>{latestRound ? "พร้อมใช้งาน" : "ไม่มีข้อมูล"}</Badge>}>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label={translateText("รอบล่าสุด")} value={latestRound ? `${latestRound.id} · ${formatThaiDate(latestRound.startDate, true, language)}` : "-"} />
                  <Stat
                    label={translateText("สถานะ")}
                    value={
                      latestRound
                        ? translateText(SESSION_STATUS_LABEL[latestRound.status])
                        : "-"
                    }
                  />
                </div>
                {latestRound && <p className="mt-2 text-sm text-slate-500">{getBranchName(latestRound.branchId)}</p>}
                <div className="mt-3 flex flex-wrap gap-3 [&>*]:flex-1 [&>*]:basis-40">
                  <button type="button" onClick={handleExportRound} disabled={!latestRound} className={`${reportButton.secondary} disabled:opacity-50`}>
                    <Download size={18} />  {translateText("ส่งออก Excel")}
                  </button>
                  {latestRound && (
                    <Link href={`/inventories/audit?session=${latestRound.id}`} className={reportButton.primary}>
                      <Plus size={18} />  {translateText("ดูรายละเอียด")}
                    </Link>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-5">
            <Card title="5. เตรียมส่งให้ President">
              <p className="-mt-2 mb-3 text-sm text-slate-500">{translateText("ระบุรายละเอียดและตรวจทานรายงานก่อนส่ง")}</p>
              <label className="block text-base font-semibold text-slate-800">

                {translateText("ชื่อรายงาน *")}
                <input value={titleText} onChange={(e) => setTitle(e.target.value)} className={fieldStyle} />
              </label>

              <div className="mt-3 space-y-1 rounded-xl bg-slate-100 px-4 py-3 text-base">
                <p>

                  {translateText("ผู้จัดทำ:")} {credential.username} · Admin
                </p>
                <p className="font-semibold">{translateText("ผู้รับ: President")}</p>
                <p>{translateText("รอบรายงาน:")} {periodLabel}</p>
              </div>

              <fieldset className="mt-4">
                <legend className="text-base font-semibold text-slate-800">{translateText("วัตถุประสงค์ *")}</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(Object.keys(PURPOSE_LABEL) as ReportPurpose[]).map((p) => (
                    <label
                      key={p}
                      className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 text-base ${
                        purpose === p ? "border-indigo-400 bg-indigo-50 font-semibold text-indigo-800" : "border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="purpose"
                        checked={purpose === p}
                        onChange={() => setPurpose(p)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      {translateText(PURPOSE_LABEL[p])}
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-sm text-slate-500">{translateText("กรณีขออนุมัติ: ระบุเรื่อง วงเงิน เหตุผล และกำหนดการในข้อความ")}</p>
              </fieldset>

              <label className="mt-4 block text-base font-semibold text-slate-800">

                {translateText("ข้อความถึง President *")}
                <textarea value={messageText} onChange={(e) => setMessage(e.target.value)} rows={4} className={fieldStyle} />
              </label>

              <div className="mt-3 rounded-xl bg-slate-100 px-4 py-3">
                <p className="text-base font-semibold text-slate-800">{translateText("เอกสารประกอบการส่ง")}</p>
                <p className="text-sm text-slate-600">{translateText("สรุปผู้บริหาร + รายงาน 4 ประเภท + ประเด็นและข้อเสนอ")}</p>
                <p className="text-sm text-slate-600">{translateText("President ดาวน์โหลดเป็น Excel ได้จากหน้ารายงาน")}</p>
              </div>

              {error && (
                <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-base text-rose-700" aria-live="polite">
                  {error}
                </p>
              )}

              <div className="mt-4 space-y-2">
                <button type="button" onClick={() => setShowPreview(true)} className={`${reportButton.secondary} w-full`}>
                  <Eye size={18} />  {translateText("ดูตัวอย่างรายงาน")}
                </button>
                <p className="text-sm text-slate-500">{translateText("โปรดตรวจช่วงเวลา ตัวเลข และประเด็นเสนอให้ครบถ้วน")}</p>
                <button type="button" onClick={handleSend} disabled={!!error} className={`${reportButton.primary} min-h-12 w-full`}>
                  <Send size={18} />  {translateText("ส่งรายงานให้ President")}
                </button>
                <button type="button" onClick={handleDraft} className={`${reportButton.secondary} w-full`}>

                  {translateText("บันทึกฉบับร่าง")}
                </button>
                <p className="text-sm text-slate-500">
                  {draft ? `${translateText("มีฉบับร่างที่บันทึกเมื่อ")} ${formatThaiDateTime(draft.updatedAt, language)}` : translateText("รายงานจะถูกส่งเมื่อกดยืนยันการส่งเท่านั้น")}
                </p>
              </div>
            </Card>

            <Card title="กิจกรรมอ้างอิงล่าสุด" badge={<Badge tone="wait">{activities.length}  {translateText("กิจกรรม")}</Badge>}>
              {activities.length === 0 ? (
                <p className="text-base text-slate-500">{translateText("ไม่มีกิจกรรมในช่วงเวลานี้")}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {activities.map((a) => (
                    <li key={a.id} className="py-3 first:pt-0">
                      <p className="text-sm text-slate-500">{formatThaiDateTime(a.at, language)}</p>
                      <p className="text-base font-semibold text-slate-900">{a.text}</p>
                      <p className="text-sm text-slate-600">{translateText("ผู้ดำเนินการ ·")} {a.who}</p>
                      <p className="text-sm font-medium text-indigo-700">{a.ref}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="รายงานที่ส่งแล้ว" badge={<Badge tone="plain">{sent.length}  {translateText("ฉบับ")}</Badge>}>
              {sent.length === 0 ? (
                <p className="text-base text-slate-500">{translateText("ยังไม่เคยส่งรายงาน")}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {sent.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-start justify-between gap-2 py-3 first:pt-0">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-900">{r.title}</p>
                        <p className="text-sm text-slate-500">
                          {r.id}  {translateText("· ส่ง")} {r.sentAt ? formatThaiDateTime(r.sentAt, language) : "-"}
                        </p>
                      </div>
                      <Badge tone={r.readAt ? "good" : "wait"}>{r.readAt ? "President อ่านแล้ว" : "ยังไม่อ่าน"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>

      {showPreview && (
        <DetailDialog
          title={input.title || "ตัวอย่างรายงาน"}
          onClose={() => setShowPreview(false)}
          footer={
            <>
              <button type="button" onClick={() => setShowPreview(false)} className={reportButton.secondary}>

                {translateText("กลับไปแก้ไข")}
              </button>
              <button
                type="button"
                disabled={!!error}
                onClick={() => {
                  setShowPreview(false);
                  handleSend();
                }}
                className={reportButton.primary}
              >
                <Send size={18} />  {translateText("ส่งรายงาน")}
              </button>
            </>
          }
        >
          <ReportBody report={input} />
        </DetailDialog>
      )}
    </div>
  );
}

function SubReport({ title, badge, stats }: { title: string; badge: ReactNode; stats: [string, string][] }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {badge}
      </div>
      <div className="grid gap-2">
        {stats.map(([label, value]) => (
          <Stat key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
