"use client";

// หน้ารับรายงาน (Admin / President): เลือกประเภทรายงาน กำหนดเงื่อนไข ดูตัวอย่าง แล้วดาวน์โหลด Excel
// President มีกล่อง "รายงานจาก Admin" เพิ่มด้านบน สำหรับรายงานที่ Admin ส่งมาจากหน้า /reports/send
import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Boxes,
  Building2,
  Calendar,
  CircleCheck,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  Inbox,
  Send,
} from "lucide-react";
import { assetHistories } from "@/data/assetHistories";
import { approvals } from "@/data/approvals";
import { branches } from "@/data/branches";
import { exportExcel, type ExcelSheet } from "@/lib/exportExcel";
import {
  ASSET_STATUS_LABEL,
  formatBaht,
  formatThaiDate,
  formatThaiDateTime,
  getBranchName,
  getCategoryName,
  getStaffName,
  toDateValue,
} from "@/lib/inventory";
import {
  APPROVAL_STATUS_LABEL,
  APPROVAL_TONE,
  ASSET_TONE,
  BORROW_STATUS_LABEL,
  BORROW_TONE,
  BORROW_TYPE_LABEL,
  PURPOSE_LABEL,
  approvalSheet,
  assetLabel,
  durationText,
  getApprovalRows,
  getMovementRows,
  getPeriods,
  getRegisterRows,
  localizedPeriodLabel,
  markReportRead,
  movementSheet,
  registerSheet,
  reportSheet,
  useReportStore,
  type ApprovalRow,
  type MovementRow,
  type SentReport,
} from "@/lib/reports";
import { Toast, useToast } from "@/app/inventories/_components/ui";
import { Badge, Card, DetailDialog, DetailList, SelectField, reportButton } from "./parts";
import { ReportBody } from "./ReportBody";
import type { Asset } from "@/data/asset";
import { useLanguage, useTranslate } from "@/lib/language";

type ReportKind = "movement" | "register" | "approval";

const KIND_INFO: Record<ReportKind, { name: string; desc: string; title: string; icon: ReactNode; file: string }> = {
  movement: {
    name: "การโยกย้ายทรัพย์สิน",
    desc: "คำขอ สาขา สถานะ และผลพิจารณา",
    title: "รายงานการโยกย้ายทรัพย์สิน",
    icon: <ArrowLeftRight size={20} />,
    file: "รายงานโยกย้าย",
  },
  register: {
    name: "ทะเบียนทรัพย์สินทุกสาขา",
    desc: "รหัสทรัพย์สิน ผู้ดูแล และสถานที่",
    title: "รายงานทะเบียนทรัพย์สิน",
    icon: <Boxes size={20} />,
    file: "ทะเบียนทรัพย์สิน",
  },
  approval: {
    name: "สรุปการอนุมัติ",
    desc: "ผู้พิจารณา ระยะเวลา และเหตุผล",
    title: "รายงานสรุปการอนุมัติ",
    icon: <ClipboardCheck size={20} />,
    file: "สรุปการอนุมัติ",
  },
};

const STATUS_OPTIONS: Record<ReportKind, { value: string; label: string }[]> = {
  movement: Object.entries(BORROW_STATUS_LABEL).map(([value, label]) => ({ value, label })),
  register: Object.entries(ASSET_STATUS_LABEL).map(([value, label]) => ({ value, label })),
  approval: Object.entries(APPROVAL_STATUS_LABEL).map(([value, label]) => ({ value, label })),
};

const PAGE_STEP = 10;

type Filters = { kind: ReportKind; branchId: string; periodKey: string; status: string };

export default function ReceiveReports({ role }: { role: "admin" | "president" }) {
  const language = useLanguage();
  const translateText = useTranslate();
  const numberLocale = language === "en" ? "en-US" : "th-TH";
  const toast = useToast();
  const [periods] = useState(() => getPeriods());
  const defaults: Filters = { kind: "movement", branchId: "all", periodKey: periods[0].key, status: "all" };

  // draft = ค่าที่กำลังเลือกในฟอร์ม, applied = ค่าที่กด "ดูรายงาน" แล้ว
  const [draft, setDraft] = useState<Filters>(defaults);
  const [applied, setApplied] = useState<Filters>(defaults);
  const [limit, setLimit] = useState(PAGE_STEP);
  const [detail, setDetail] = useState<
    | { kind: "movement"; row: MovementRow }
    | { kind: "register"; asset: Asset }
    | { kind: "approval"; row: ApprovalRow }
    | null
  >(null);

  const period = periods.find((p) => p.key === applied.periodKey) ?? periods[0];
  const info = KIND_INFO[applied.kind];

  // เลือกประเภทรายงานจากการ์ดด้านบน = ใช้ทันที ไม่ต้องกด "ดูรายงาน"
  const chooseKind = (kind: ReportKind) => {
    const next = { ...draft, kind, status: "all" };
    setDraft(next);
    setApplied(next);
    setLimit(PAGE_STEP);
  };

  const applyFilters = () => {
    setApplied(draft);
    setLimit(PAGE_STEP);
    toast.show("อัปเดตตัวอย่างรายงานแล้ว");
  };

  const movementRows =
    applied.kind === "movement"
      ? getMovementRows({ period, branchId: applied.branchId, status: applied.status, type: "all" })
      : [];
  const registerRows =
    applied.kind === "register" ? getRegisterRows({ branchId: applied.branchId, status: applied.status }) : [];
  const approvalRows =
    applied.kind === "approval" ? getApprovalRows({ period, branchId: applied.branchId, status: applied.status }) : [];
  const total = movementRows.length + registerRows.length + approvalRows.length;
  const unit = applied.kind === "register" ? "รายการ" : "คำขอ";

  const countBy = <T,>(list: T[], key: (item: T) => string) =>
    list.reduce<Record<string, number>>((acc, item) => {
      acc[key(item)] = (acc[key(item)] ?? 0) + 1;
      return acc;
    }, {});

  // แถวสรุปใต้ตาราง และชีต "สรุป" ใน Excel
  const summary: [string, number][] =
    applied.kind === "movement"
      ? Object.entries(countBy(movementRows, (r) => BORROW_STATUS_LABEL[r.request.status]))
      : applied.kind === "register"
        ? Object.entries(countBy(registerRows, (a) => ASSET_STATUS_LABEL[a.status]))
        : Object.entries(countBy(approvalRows, (r) => APPROVAL_STATUS_LABEL[r.approval.status]));
  const summaryText = summary
    .map(([label, n]) => `${translateText(label)} ${n}`)
    .join(" · ");

  const scopeText =
    applied.kind === "register"
      ? `${translateText("ข้อมูล ณ วันที่")} ${formatThaiDate(toDateValue(new Date()), true, language)} · ${applied.branchId === "all" ? translateText("ทุกสาขา") : getBranchName(applied.branchId)}`
      : `${localizedPeriodLabel(period, language)} · ${applied.branchId === "all" ? translateText("ทุกสาขา") : getBranchName(applied.branchId)}`;

  const mainSheet = (): ExcelSheet =>
    applied.kind === "movement"
      ? movementSheet(movementRows)
      : applied.kind === "register"
        ? registerSheet(registerRows)
        : approvalSheet(approvalRows);

  const fileName = `${info.file}_${toDateValue(new Date())}`;

  const handleDownload = async () => {
    await exportExcel(fileName, [
      mainSheet(),
      {
        name: "สรุป",
        rows: [
          { หัวข้อ: "ประเภทรายงาน", ค่า: info.title },
          { หัวข้อ: "ขอบเขต", ค่า: scopeText },
          { หัวข้อ: `จำนวน${unit}ทั้งหมด`, ค่า: total },
          ...summary.map(([label, n]) => ({ หัวข้อ: label, ค่า: n })),
        ],
      },
    ]);
    toast.show(`ดาวน์โหลด ${fileName}.xlsx แล้ว`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <Toast message={toast.message} />
      <main className="mx-auto max-w-7xl space-y-5 px-4 pt-5 lg:px-8 lg:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-700">
              {role === "admin" ? "Admin" : `President · ${translateText("ผู้บริหารสูงสุด")}`}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{translateText(info.title)}</h1>
            <p className="mt-1 text-base text-slate-500">{translateText("เรียกดูข้อมูลและเตรียมไฟล์ Excel เพื่อวิเคราะห์ต่อ")}</p>
          </div>
          {role === "admin" && (
            <Link href="/reports/send" className={reportButton.primary}>
              <Send size={18} />  {translateText("จัดทำรายงานเสนอ President")}
            </Link>
          )}
        </div>

        {role === "president" && <PresidentInbox onToast={toast.show} />}

        <section aria-labelledby="kind-title">
          <h2 id="kind-title" className="mb-2 text-base font-semibold text-slate-700">

            {translateText("เลือกประเภทรายงาน")}
          </h2>
          <div className="grid gap-3 md:grid-cols-3" role="tablist">
            {(Object.keys(KIND_INFO) as ReportKind[]).map((kind) => {
              const active = applied.kind === kind;
              return (
                <button
                  key={kind}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => chooseKind(kind)}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300"
                      : "border-slate-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  <span className={active ? "text-indigo-700" : "text-slate-500"}>{KIND_INFO[kind].icon}</span>
                  <span className="min-w-0">
                    <span className={`block text-base font-semibold ${active ? "text-indigo-800" : "text-slate-900"}`}>
                      {translateText(KIND_INFO[kind].name)} {active && "✓"}
                    </span>
                    <span className="block text-sm text-slate-500">{translateText(KIND_INFO[kind].desc)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <Card title="เงื่อนไขรายงาน">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
            <SelectField
              label="ประเภทรายงานที่เลือก"
              value={draft.kind}
              onChange={(v) => setDraft({ ...draft, kind: v as ReportKind, status: "all" })}
              icon={<CircleCheck size={18} />}
              options={(Object.keys(KIND_INFO) as ReportKind[]).map((k) => ({ value: k, label: KIND_INFO[k].name }))}
            />
            <SelectField
              label={draft.kind === "register" ? "สาขา" : "สาขาต้นทาง / ปลายทาง"}
              value={draft.branchId}
              onChange={(v) => setDraft({ ...draft, branchId: v })}
              icon={<Building2 size={18} />}
              options={[{ value: "all", label: "ทุกสาขา" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
            />
            {draft.kind === "register" ? (
              <label className="block min-w-0">
                <span className="mb-1 block text-sm font-medium text-slate-600">{translateText("ข้อมูล ณ วันที่")}</span>
                <span className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 text-base text-slate-700">
                  <Calendar size={18} className="text-slate-400" /> {formatThaiDate(toDateValue(new Date()), true, language)}
                </span>
              </label>
            ) : (
              <SelectField
                label={translateText("ช่วงวันที่")}
                value={draft.periodKey}
                onChange={(v) => setDraft({ ...draft, periodKey: v })}
                icon={<Calendar size={18} />}
                options={periods.map((p) => ({ value: p.key, label: localizedPeriodLabel(p, language) }))}
              />
            )}
            <SelectField
              label={draft.kind === "approval" ? "ผลพิจารณา" : "สถานะ"}
              value={draft.status}
              onChange={(v) => setDraft({ ...draft, status: v })}
              icon={<CircleCheck size={18} />}
              options={[{ value: "all", label: "ทุกสถานะ" }, ...STATUS_OPTIONS[draft.kind]]}
            />
            <button type="button" onClick={applyFilters} className={`${reportButton.primary} min-h-12 sm:col-span-2 lg:col-span-1`}>

              {translateText("ดูรายงาน")}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500">{translateText("ขอบเขตที่ใช้อยู่:")} {scopeText}</p>
        </Card>

        <Card title={`${translateText("ตัวอย่าง")}${translateText(info.name)}`}>
          <p className="-mt-2 mb-3 text-sm text-slate-500">

            {translateText("แสดง")} {Math.min(limit, total)}  {translateText("จาก")} {total.toLocaleString(numberLocale)} {translateText(unit)}
            {summaryText && ` · ${summaryText}`}
          </p>
          {total === 0 ? (
            <p className="py-8 text-center text-base text-slate-500">{translateText("ไม่พบข้อมูลตามเงื่อนไขที่เลือก")}</p>
          ) : applied.kind === "movement" ? (
            <MovementTable rows={movementRows.slice(0, limit)} onOpen={(row) => setDetail({ kind: "movement", row })} />
          ) : applied.kind === "register" ? (
            <RegisterTable rows={registerRows.slice(0, limit)} onOpen={(asset) => setDetail({ kind: "register", asset })} />
          ) : (
            <ApprovalTable rows={approvalRows.slice(0, limit)} onOpen={(row) => setDetail({ kind: "approval", row })} />
          )}
          {total > limit && (
            <button type="button" onClick={() => setLimit((n) => n + PAGE_STEP)} className={`${reportButton.secondary} mt-3 w-full`}>

              {translateText("แสดงเพิ่ม (")}{(total - limit).toLocaleString(numberLocale)} {translateText(unit)})
            </button>
          )}
        </Card>

        <Card title="ไฟล์รายงาน Excel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 gap-3">
              <FileSpreadsheet size={28} className="shrink-0 text-indigo-600" />
              <div className="min-w-0">
                <p className="break-all text-base font-semibold text-slate-900">{fileName}.xlsx</p>
                <p className="text-sm text-slate-500">

                  {translateText("ข้อมูลตามเงื่อนไข ·")} {total.toLocaleString(numberLocale)} {translateText(unit)}
                </p>
                <p className="mt-2 text-sm text-slate-600">{translateText("ชีต \"")}{mainSheet().name}{translateText("\" · ข้อมูลทุกแถวตามเงื่อนไข")}</p>
                <p className="text-sm text-slate-600">{translateText("ชีต \"สรุป\" · ขอบเขตรายงานและจำนวนแยกตามสถานะ")}</p>
              </div>
            </div>
            <div className="lg:w-80">
              <button type="button" onClick={handleDownload} className={`${reportButton.primary} min-h-12 w-full`}>
                <Download size={18} />  {translateText("ดาวน์โหลด Excel (.xlsx)")}
              </button>
              <p className="mt-2 text-sm text-slate-500">{translateText("ไฟล์สร้างจากเงื่อนไขที่กด \"ดูรายงาน\" ล่าสุด")}</p>
            </div>
          </div>
        </Card>

        <p className="text-sm text-slate-500">{translateText("ข้อมูลอัปเดตล่าสุด ณ")} {formatThaiDate(toDateValue(new Date()), true, language)}  {translateText("· คำนวณจากข้อมูลกลางของระบบ")}</p>
      </main>

      {detail?.kind === "movement" && <MovementDetail row={detail.row} onClose={() => setDetail(null)} />}
      {detail?.kind === "register" && <RegisterDetail asset={detail.asset} onClose={() => setDetail(null)} />}
      {detail?.kind === "approval" && <ApprovalDetail row={detail.row} onClose={() => setDetail(null)} />}
    </div>
  );
}

/* ---------------- ตาราง (คอม) + การ์ด (มือถือ) ---------------- */

const th = "px-3 py-2.5 text-sm font-semibold text-slate-600";
const td = "px-3 py-3 align-top text-base";
const openButton =
  "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100";

function TableShell({ head, children }: { head: string[]; children: ReactNode }) {
  const translateText = useTranslate();
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
      <table className="w-full text-left">
        <thead className="bg-indigo-50">
          <tr>
            {head.map((h) => (
              <th key={h} className={th}>
                {translateText(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

function MobileCard({ title, badge, lines, action }: { title: string; badge: ReactNode; lines: string[]; action: ReactNode }) {
  return (
    <li className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-semibold text-indigo-700">{title}</p>
        {badge}
      </div>
      {lines.map((line) => (
        <p key={line} className="mt-1 text-sm text-slate-600">
          {line}
        </p>
      ))}
      <div className="mt-2">{action}</div>
    </li>
  );
}

function MovementTable({ rows, onOpen }: { rows: MovementRow[]; onOpen: (row: MovementRow) => void }) {
  const language = useLanguage();
  const translateText = useTranslate();
  return (
    <>
      <TableShell head={["เลขที่คำขอ / สถานะ", "ต้นทาง → ปลายทาง", "รายการทรัพย์สิน", "ผู้ขอ / สาขา", "วันที่ยื่น", "หลักฐาน"]}>
        {rows.map((row) => (
          <tr key={row.request.id}>
            <td className={td}>
              <p className="font-semibold text-indigo-700">{row.request.id}</p>
              <div className="mt-1">
                <Badge tone={BORROW_TONE[row.request.status]}>{translateText(BORROW_STATUS_LABEL[row.request.status])}</Badge>
              </div>
            </td>
            <td className={td}>
              <p className="font-semibold">
                {row.from} → {row.to}
              </p>
              <p className="text-sm text-slate-500">{translateText(BORROW_TYPE_LABEL[row.request.type])}</p>
            </td>
            <td className={td}>{assetLabel(row.request.assetId)}</td>
            <td className={td}>
              <p>{getStaffName(row.request.borrowerId)}</p>
              <p className="text-sm text-slate-500">{getBranchName(row.request.branchId)}</p>
            </td>
            <td className={`${td} whitespace-nowrap`}>{formatThaiDate(row.request.createdAt, true, language)}</td>
            <td className={td}>
              <button type="button" onClick={() => onOpen(row)} className={openButton}>

                {translateText("ดูหลักฐาน")}
              </button>
            </td>
          </tr>
        ))}
      </TableShell>
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <MobileCard
            key={row.request.id}
            title={row.request.id}
            badge={<Badge tone={BORROW_TONE[row.request.status]}>{translateText(BORROW_STATUS_LABEL[row.request.status])}</Badge>}
            lines={[
              `${translateText(BORROW_TYPE_LABEL[row.request.type])}: ${row.from} → ${row.to}`,
              assetLabel(row.request.assetId),
              `${getStaffName(row.request.borrowerId)} · ${formatThaiDate(row.request.createdAt, true, language)}`,
            ]}
            action={
              <button type="button" onClick={() => onOpen(row)} className={openButton}>

                {translateText("ดูหลักฐาน")}
              </button>
            }
          />
        ))}
      </ul>
    </>
  );
}

function RegisterTable({ rows, onOpen }: { rows: Asset[]; onOpen: (asset: Asset) => void }) {
  const language = useLanguage();
  const translateText = useTranslate();
  return (
    <>
      <TableShell head={["รหัสทรัพย์สิน / สถานะ", "ชื่อทรัพย์สิน", "สาขา / หมวดหมู่", "ผู้ดูแล", "วันที่อัปเดต", "รายละเอียด"]}>
        {rows.map((a) => (
          <tr key={a.id}>
            <td className={td}>
              <p className="font-semibold text-indigo-700">{a.id}</p>
              <div className="mt-1">
                <Badge tone={ASSET_TONE[a.status]}>{translateText(ASSET_STATUS_LABEL[a.status])}</Badge>
              </div>
            </td>
            <td className={td}>
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-slate-500">
                {a.brand} {a.model}
              </p>
            </td>
            <td className={td}>
              <p>{getBranchName(a.branchId)}</p>
              <p className="text-sm text-slate-500">{getCategoryName(a.category)}</p>
            </td>
            <td className={td}>{getStaffName(a.responsiblePersonId)}</td>
            <td className={`${td} whitespace-nowrap`}>{formatThaiDate(a.updatedAt, true, language)}</td>
            <td className={td}>
              <button type="button" onClick={() => onOpen(a)} className={openButton}>

                {translateText("ดูรายละเอียด")}
              </button>
            </td>
          </tr>
        ))}
      </TableShell>
      <ul className="space-y-3 md:hidden">
        {rows.map((a) => (
          <MobileCard
            key={a.id}
            title={`${a.id} · ${a.name}`}
            badge={<Badge tone={ASSET_TONE[a.status]}>{translateText(ASSET_STATUS_LABEL[a.status])}</Badge>}
            lines={[`${getBranchName(a.branchId)} · ${getCategoryName(a.category)}`, `${translateText("ผู้ดูแล")} ${getStaffName(a.responsiblePersonId)}`]}
            action={
              <button type="button" onClick={() => onOpen(a)} className={openButton}>

                {translateText("ดูรายละเอียด")}
              </button>
            }
          />
        ))}
      </ul>
    </>
  );
}

function ApprovalTable({ rows, onOpen }: { rows: ApprovalRow[]; onOpen: (row: ApprovalRow) => void }) {
  const language = useLanguage();
  const translateText = useTranslate();
  return (
    <>
      <TableShell head={["เลขที่คำขอ / ผลพิจารณา", "ต้นทาง → ปลายทาง", "ผู้พิจารณา / วันที่พิจารณา", "ระยะเวลาพิจารณา", "เหตุผล", "รายละเอียด"]}>
        {rows.map((row) => (
          <tr key={row.approval.id}>
            <td className={td}>
              <p className="font-semibold text-indigo-700">{row.approval.requestId}</p>
              <div className="mt-1">
                <Badge tone={APPROVAL_TONE[row.approval.status]}>{translateText(APPROVAL_STATUS_LABEL[row.approval.status])}</Badge>
              </div>
            </td>
            <td className={td}>
              {row.from} → {row.to}
            </td>
            <td className={td}>
              <p>{row.approval.approverId ? getStaffName(row.approval.approverId) : translateText("รอผู้พิจารณา")}</p>
              <p className="text-sm text-slate-500">
                {row.approval.approvedAt ? formatThaiDateTime(row.approval.approvedAt, language) : "-"}
              </p>
            </td>
            <td className={td}>{durationText(row.approval.requestedAt, row.approval.approvedAt)}</td>
            <td className={`${td} text-slate-600`}>{row.approval.comment || "-"}</td>
            <td className={td}>
              <button type="button" onClick={() => onOpen(row)} className={openButton}>

                {translateText("ดูรายละเอียด")}
              </button>
            </td>
          </tr>
        ))}
      </TableShell>
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <MobileCard
            key={row.approval.id}
            title={row.approval.requestId}
            badge={<Badge tone={APPROVAL_TONE[row.approval.status]}>{translateText(APPROVAL_STATUS_LABEL[row.approval.status])}</Badge>}
            lines={[
              `${row.from} → ${row.to}`,
              `${translateText("ผู้พิจารณา")} ${row.approval.approverId ? getStaffName(row.approval.approverId) : "-"} · ${durationText(row.approval.requestedAt, row.approval.approvedAt)}`,
              row.approval.comment || "ไม่มีเหตุผลระบุ",
            ]}
            action={
              <button type="button" onClick={() => onOpen(row)} className={openButton}>

                {translateText("ดูรายละเอียด")}
              </button>
            }
          />
        ))}
      </ul>
    </>
  );
}

/* ---------------- หน้าต่างรายละเอียด ---------------- */

function MovementDetail({ row, onClose }: { row: MovementRow; onClose: () => void }) {
  const language = useLanguage();
  const translateText = useTranslate();
  const r = row.request;
  const approval = approvals.find((a) => a.requestId === r.id);
  return (
    <DetailDialog title={`${translateText("หลักฐานคำขอ")} ${r.id}`} onClose={onClose}>
      <DetailList
        rows={[
          ["ประเภท", translateText(BORROW_TYPE_LABEL[r.type])],
          ["สถานะ", <Badge key="s" tone={BORROW_TONE[r.status]}>{BORROW_STATUS_LABEL[r.status]}</Badge>],
          ["ต้นทาง → ปลายทาง", `${row.from} → ${row.to}`],
          ["ทรัพย์สิน", assetLabel(r.assetId)],
          ["ผู้ขอ", getStaffName(r.borrowerId)],
          ["วันที่ยื่น", formatThaiDateTime(r.createdAt, language)],
          ["วันที่ต้องการ", r.borrowDate ? formatThaiDate(r.borrowDate, true, language) : "-"],
          ["วัตถุประสงค์", r.purpose],
          ["หมายเหตุ", r.note],
          ["ผลพิจารณา", approval ? `${translateText(APPROVAL_STATUS_LABEL[approval.status])} · ${approval.comment || translateText("ไม่มีความเห็น")}` : translateText("ยังไม่มีบันทึกการพิจารณา")],
          ["ผู้พิจารณา", approval?.approverId ? getStaffName(approval.approverId) : "-"],
        ]}
      />
    </DetailDialog>
  );
}

function RegisterDetail({ asset: a, onClose }: { asset: Asset; onClose: () => void }) {
  const language = useLanguage();
  const translateText = useTranslate();
  const history = assetHistories
    .filter((h) => h.assetId === a.id)
    .sort((x, y) => y.performedAt.localeCompare(x.performedAt))
    .slice(0, 5);
  return (
    <DetailDialog title={`${a.id} · ${a.name}`} onClose={onClose}>
      <DetailList
        rows={[
          ["สถานะ", <Badge key="s" tone={ASSET_TONE[a.status]}>{ASSET_STATUS_LABEL[a.status]}</Badge>],
          ["ยี่ห้อ / รุ่น", `${a.brand} ${a.model}`],
          ["Serial Number", a.serialNumber],
          ["หมวดหมู่", getCategoryName(a.category)],
          ["สาขา", getBranchName(a.branchId)],
          ["ผู้ดูแล", getStaffName(a.responsiblePersonId)],
          ["ราคาซื้อ", formatBaht(a.purchasePrice)],
          ["วันที่ซื้อ / หมดประกัน", `${formatThaiDate(a.purchaseDate, true, language)} / ${formatThaiDate(a.warrantyEndDate, true, language)}`],
        ]}
      />
      <h3 className="mb-2 mt-5 text-base font-bold text-slate-900">{translateText("ประวัติล่าสุด")}</h3>
      {history.length === 0 ? (
        <p className="text-base text-slate-500">{translateText("ยังไม่มีประวัติ")}</p>
      ) : (
        <ul className="space-y-2">
          {history.map((h) => (
            <li key={h.id} className="rounded-xl bg-slate-100 px-3 py-2">
              <p className="text-base text-slate-900">{h.description}</p>
              <p className="text-sm text-slate-500">
                {formatThaiDateTime(h.performedAt, language)} · {getStaffName(h.performedBy)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DetailDialog>
  );
}

function ApprovalDetail({ row, onClose }: { row: ApprovalRow; onClose: () => void }) {
  const language = useLanguage();
  const translateText = useTranslate();
  const a = row.approval;
  return (
    <DetailDialog title={`${translateText("การพิจารณาคำขอ")} ${a.requestId}`} onClose={onClose}>
      <DetailList
        rows={[
          ["เลขที่อนุมัติ", a.id],
          ["ผลพิจารณา", <Badge key="s" tone={APPROVAL_TONE[a.status]}>{APPROVAL_STATUS_LABEL[a.status]}</Badge>],
          ["ประเภทคำขอ", row.request ? translateText(BORROW_TYPE_LABEL[row.request.type]) : "-"],
          ["ต้นทาง → ปลายทาง", `${row.from} → ${row.to}`],
          ["ทรัพย์สิน", row.request ? assetLabel(row.request.assetId) : "-"],
          ["ผู้ขอ", getStaffName(a.requesterId)],
          ["ผู้พิจารณา", a.approverId ? getStaffName(a.approverId) : "รอผู้พิจารณา"],
          ["วันที่ยื่น", formatThaiDateTime(a.requestedAt, language)],
          ["วันที่พิจารณา", a.approvedAt ? formatThaiDateTime(a.approvedAt, language) : "-"],
          ["ระยะเวลาพิจารณา", durationText(a.requestedAt, a.approvedAt)],
          ["เหตุผล", a.comment],
        ]}
      />
    </DetailDialog>
  );
}

/* ---------------- กล่องรายงานจาก Admin (President) ---------------- */

function PresidentInbox({ onToast }: { onToast: (text: string) => void }) {
  const language = useLanguage();
  const translateText = useTranslate();
  const { reports } = useReportStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const sent = reports
    .filter((r) => r.status === "sent")
    .sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? ""));
  const unread = sent.filter((r) => !r.readAt).length;
  const opened = sent.find((r) => r.id === openId);

  const open = (report: SentReport) => {
    setOpenId(report.id);
    markReportRead(report.id);
  };

  const download = async (report: SentReport) => {
    await exportExcel(report.id, [reportSheet(report)]);
    onToast(`ดาวน์โหลด ${report.id}.xlsx แล้ว`);
  };

  return (
    <Card
      title="รายงานจาก Admin"
      badge={unread > 0 ? <Badge tone="wait">{translateText("ยังไม่อ่าน")} {unread}</Badge> : <Badge tone="plain">{sent.length}  {translateText("ฉบับ")}</Badge>}
    >
      {sent.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-4 text-base text-slate-600">
          <Inbox size={22} className="shrink-0" />  {translateText("ยังไม่มีรายงานที่ Admin ส่งมา")}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {sent.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-900">
                  {!r.readAt && <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-amber-500" aria-label={translateText("ยังไม่อ่าน")} />}
                  {r.title}
                </p>
                <p className="text-sm text-slate-500">
                  {r.id} · {translateText(PURPOSE_LABEL[r.purpose])}  {translateText("· จาก")} {r.createdByName}  {translateText("· ส่งเมื่อ")} {r.sentAt ? formatThaiDateTime(r.sentAt, language) : "-"}
                </p>
              </div>
              <button type="button" onClick={() => open(r)} className={reportButton.secondary}>

                {translateText("เปิดอ่าน")}
              </button>
            </li>
          ))}
        </ul>
      )}
      {opened && (
        <DetailDialog
          title={opened.title}
          onClose={() => setOpenId(null)}
          footer={
            <>
              <button type="button" onClick={() => setOpenId(null)} className={reportButton.secondary}>

                {translateText("ปิด")}
              </button>
              <button type="button" onClick={() => download(opened)} className={reportButton.primary}>
                <Download size={18} />  {translateText("ดาวน์โหลด Excel")}
              </button>
            </>
          }
        >
          <ReportBody report={opened} />
        </DetailDialog>
      )}
    </Card>
  );
}
