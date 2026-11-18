"use client";

// หน้าสรุปรายงานทั้งหมด (User) วางตาม Figma ที่เสนออาจารย์:
// ตัวเลขสรุป 3 การ์ด → ตัวกรอง 4 ช่อง → รายงานรวม 4 ประเภท → Export Excel / ประวัติตรวจนับ → กิจกรรมล่าสุด
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Boxes, Calendar, CircleCheck, Download, MapPin, Plus, Search, Wrench } from "lucide-react";
import { branches } from "@/data/branches";
import { exportExcel, type ExcelSheet } from "@/lib/exportExcel";
import {
  formatLocalizedDate,
  useLanguage,
  useTheme,
  useTranslate,
  type AppLanguage,
} from "@/lib/language";
import {
  ASSET_STATUS_LABEL,
  SESSION_STATUS_LABEL,
  formatBaht,
  getBranchName,
  toDateValue,
  useInventoryStore,
} from "@/lib/inventory";
import {
  ASSET_TONE,
  BORROW_STATUS_LABEL,
  BORROW_TONE,
  BORROW_TYPE_LABEL,
  REPAIR_STATUS_LABEL,
  getActivities,
  getInventoryRows,
  getMovementRows,
  getPeriods,
  getRegisterRows,
  getRepairRows,
  inventorySheet,
  issueCount,
  movementSheet,
  registerSheet,
  repairCost,
  repairSheet,
  sessionResultSheet,
  type Period,
  type Tone,
} from "@/lib/reports";
import { Toast, useToast } from "@/app/inventories/_components/ui";
import { Badge, Card, DetailDialog, Kpi, Stat, reportButton } from "./parts";

type ReportType = "asset" | "movement" | "inventory" | "repair";

const REPORT_NAME: Record<ReportType, string> = {
  asset: "รายงาน Asset",
  movement: "รายงาน Movement",
  inventory: "รายงาน Inventory",
  repair: "รายงาน Repair",
};

// คอลัมน์ของรายงาน Asset ที่เลือกส่งออกได้ (ชื่อตรงกับหัวตารางใน registerSheet)
const ASSET_COLUMNS = [
  "รหัส",
  "ชื่อทรัพย์สิน",
  "ยี่ห้อ / รุ่น",
  "หมวดหมู่",
  "สาขา",
  "ผู้รับผิดชอบ",
  "สถานะ",
  "ราคาซื้อ (บาท)",
  "วันที่ซื้อ",
  "อัปเดตล่าสุด",
];
const DEFAULT_COLUMNS = ["รหัส", "ชื่อทรัพย์สิน", "หมวดหมู่", "สาขา", "สถานะ", "ราคาซื้อ (บาท)"];

function localizedPeriodLabel(period: Period, language: AppLanguage) {
  if (language === "th") return period.label;
  if (period.key === "all") return "All time";
  if (period.key.startsWith("year-")) return `All year ${period.key.slice(5)}`;

  const from = new Date(`${period.from.slice(0, 7)}-01T00:00:00`);
  const to = new Date(`${period.to.slice(0, 7)}-01T00:00:00`);
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  if (period.key === "last3") {
    return `${monthFormatter.format(from)}–${monthFormatter.format(to)} ${to.getFullYear()}`;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(from);
}

function localizedCount(count: number, thaiUnit: string, englishUnit: string, language: AppLanguage) {
  if (language === "th") return `${count} ${thaiUnit}`;
  return `${count} ${englishUnit}${count === 1 ? "" : "s"}`;
}

function localizedActivityText(value: string, translateText: (text: string) => string) {
  const inventoryPrefix = "บันทึกผลตรวจนับ: ";
  const repairPrefix = "แจ้งซ่อม: ";
  if (value.startsWith(inventoryPrefix)) {
    return `${translateText("บันทึกผลตรวจนับ")}: ${translateText(value.slice(inventoryPrefix.length))}`;
  }
  if (value.startsWith(repairPrefix)) {
    return `${translateText("แจ้งซ่อม")}: ${translateText(value.slice(repairPrefix.length))}`;
  }
  const transferMatch = value.match(/^โอนทรัพย์สิน(กลับ)?จาก (BR-\d+) ไปยัง (BR-\d+)$/);
  if (transferMatch) {
    const [, isReturning, fromBranch, toBranch] = transferMatch;
    return `Asset transferred${isReturning ? " back" : ""} from ${fromBranch} to ${toBranch}`;
  }
  if (value.startsWith("ขอ") && value.endsWith("ทรัพย์สิน")) {
    return translateText(value);
  }
  return translateText(value);
}
function formatLocalizedDateTime(value: string, language: AppLanguage) {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export default function UserSummary() {
  const language = useLanguage();
  const isDark = useTheme() === "dark";
  const translateText = useTranslate();
  const { sessions, checks } = useInventoryStore();
  const toast = useToast();
  const [periods] = useState(() => getPeriods());
  const fieldStyle = `min-h-12 w-full rounded-xl border pl-10 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
    isDark
      ? "border-slate-600 bg-slate-800 text-slate-100"
      : "border-slate-300 bg-white text-slate-800"
  }`;
  const secondaryButtonClass = `inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 text-base font-semibold transition-colors ${
    isDark
      ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
  }`;

  const [branchId, setBranchId] = useState("all");
  const [periodKey, setPeriodKey] = useState(periods[0].key);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [preview, setPreview] = useState<ReportType | null>(null);
  const [showColumns, setShowColumns] = useState(false);

  const period = periods.find((p) => p.key === periodKey) ?? periods[0];
  const periodDisplayLabel = localizedPeriodLabel(period, language);
  const countLocale = language === "en" ? "en-US" : "th-TH";

  // ทรัพย์สินดูตามสถานะปัจจุบัน ส่วนรายงานอื่นกรองตามช่วงเวลา
  const assetRows = getRegisterRows({ branchId, status, query });
  const assetValue = assetRows.reduce((sum, a) => sum + a.purchasePrice, 0);
  const movementRows = getMovementRows({ period, branchId, status: "all", type: "all" });
  const pendingMovements = movementRows.filter((r) => r.request.status === "pending").length;
  const inventoryRows = getInventoryRows(sessions, checks, { period, branchId });
  const completedRounds = inventoryRows.filter((r) => r.session.status === "completed").length;
  const activeRounds = inventoryRows.filter((r) => r.session.status === "in_progress").length;
  const inventoryIssues = inventoryRows.reduce((sum, r) => sum + issueCount(r), 0);
  const repairRows = getRepairRows({ period, branchId });
  const repairTotal = repairRows.reduce((sum, r) => sum + repairCost(r), 0);
  const openRepairs = repairRows.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const activities = getActivities(checks, { period, branchId }).slice(0, 3);

  // ประวัติตรวจนับ: รอบที่ปิดล่าสุดของสาขาที่เลือก
  const latestRound = sessions
    .filter((s) => s.status === "completed" && (branchId === "all" || s.branchId === branchId))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];

  const sheetOf: Record<ReportType, () => ExcelSheet> = {
    asset: () => registerSheet(assetRows),
    movement: () => movementSheet(movementRows),
    inventory: () => inventorySheet(inventoryRows),
    repair: () => repairSheet(repairRows),
  };
  const fileDate = toDateValue(new Date());

  const exportAll = async () => {
    await exportExcel(`สรุปรายงานทั้งหมด_${fileDate}`, (Object.keys(sheetOf) as ReportType[]).map((t) => sheetOf[t]()));
    toast.show(translateText("ดาวน์โหลดรายงานรวม 4 ประเภทแล้ว"));
  };

  // ส่งออกรายงาน Asset เฉพาะคอลัมน์ที่เลือกไว้ใน "ตั้งค่าข้อมูล"
  const exportColumns = async () => {
    const full = registerSheet(assetRows);
    const rows = full.rows.map((row) => Object.fromEntries(columns.map((c) => [c, row[c] ?? ""])));
    await exportExcel(`รายงาน Asset_${fileDate}`, [{ name: full.name, rows }]);
    toast.show(`${translateText("ดาวน์โหลดรายงาน Asset")} ${columns.length} ${translateText("คอลัมน์")} ${translateText("แล้ว")}`);
  };

  const exportOne = async (type: ReportType) => {
    await exportExcel(`${translateText(REPORT_NAME[type])}_${fileDate}`, [sheetOf[type]()]);
    toast.show(`${translateText("ดาวน์โหลด")}${translateText(REPORT_NAME[type])}${translateText("แล้ว")}`);
  };

  const exportRound = async () => {
    if (!latestRound) return;
    await exportExcel(`${translateText("ผลตรวจนับ")}_${latestRound.id}`, [sessionResultSheet(latestRound, checks)]);
    toast.show(`${translateText("ดาวน์โหลดผลตรวจรอบ")} ${latestRound.id} ${translateText("แล้ว")}`);
  };

  // เรียงคอลัมน์ตามลำดับเดิมเสมอ ไม่ว่าจะติ๊กอันไหนก่อน
  const toggleColumn = (column: string) =>
    setColumns((list) =>
      list.includes(column) ? list.filter((c) => c !== column) : ASSET_COLUMNS.filter((c) => list.includes(c) || c === column),
    );

  return (
    <div className={`min-h-screen pb-12 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      <Toast message={toast.message} />
      <main className="mx-auto max-w-7xl space-y-4 px-4 pt-5 lg:space-y-5 lg:px-8 lg:pt-6">
        <h1 className={`text-xl font-bold lg:text-2xl ${isDark ? "text-slate-100" : "text-slate-900"}`}>{translateText("สรุปรายงานทั้งหมด")}</h1>

        <div className="grid gap-3 md:grid-cols-3 lg:gap-4">
          <Kpi
            label={translateText("มูลค่าทรัพย์สิน")}
            value={formatBaht(assetValue)}
            note={`${assetRows.length.toLocaleString(countLocale)} ${translateText("รายการในรายงาน Asset")}`}
            icon={<Boxes size={24} />}
          />
          <Kpi
            label={translateText("พบปัญหาจากการตรวจนับ")}
            value={`${inventoryIssues.toLocaleString(countLocale)} ${translateText("รายการ")}`}
            note={`${translateText("ชำรุด / สูญหาย")} · ${localizedCount(inventoryRows.length, "รอบ", "cycle", language)}`}
            icon={<CircleCheck size={24} />}
            tone="green"
          />
          <Kpi
            label={translateText("ค่าใช้จ่ายซ่อม")}
            value={formatBaht(repairTotal)}
            note={`${translateText("รวม")} ${repairRows.length} ${translateText("งานซ่อม")} · ${periodDisplayLabel}`}
            icon={<Wrench size={24} />}
            tone="amber"
          />
        </div>

        {/* ตัวกรอง 4 ช่องเรียงแถวเดียวบนคอม 2 แถวบนแท็บเล็ต และเรียงลงบนมือถือ */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <IconField icon={<MapPin size={18} />}>
            <select aria-label={translateText("สถานที่")} value={branchId} onChange={(e) => setBranchId(e.target.value)} className={fieldStyle} style={{ colorScheme: isDark ? "dark" : "light" }}>
              <option value="all">{translateText("ทุกสถานที่")}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {translateText(b.name)}
                </option>
              ))}
            </select>
          </IconField>
          <IconField icon={<Calendar size={18} />}>
            <select aria-label={translateText("ช่วงเวลา")} value={periodKey} onChange={(e) => setPeriodKey(e.target.value)} className={fieldStyle} style={{ colorScheme: isDark ? "dark" : "light" }}>
              {periods.map((p) => (
                <option key={p.key} value={p.key}>
                  {localizedPeriodLabel(p, language)}
                </option>
              ))}
            </select>
          </IconField>
          <IconField icon={<CircleCheck size={18} />}>
            <select aria-label={translateText("สถานะทรัพย์สิน")} value={status} onChange={(e) => setStatus(e.target.value)} className={fieldStyle} style={{ colorScheme: isDark ? "dark" : "light" }}>
              <option value="all">{translateText("ทุกสถานะ")}</option>
              {(Object.keys(ASSET_STATUS_LABEL) as (keyof typeof ASSET_STATUS_LABEL)[]).map((s) => (
                <option key={s} value={s}>
                  {translateText(ASSET_STATUS_LABEL[s])}
                </option>
              ))}
            </select>
          </IconField>
          <IconField icon={<Search size={18} />}>
            <input
              type="search"
              aria-label={translateText("ค้นหาทรัพย์สิน")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={translateText("ค้นหาชื่อ หรือรหัสทรัพย์สิน")}
              className={fieldStyle}
            />
          </IconField>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                  <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{translateText("รายงานรวม 4 ประเภท")}</h2>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{translateText("รวม Asset · Movement · Inventory · Repair พร้อมแอกชั่นการส่งออกเดียว")}</p>
            </div>
            <button type="button" onClick={exportAll} className={`${reportButton.secondary} w-full sm:w-auto`}>
              <Download size={18} /> {translateText("ส่งออกรายงานทั้งหมด")}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ReportCard
              title={translateText(REPORT_NAME.asset)}
              tone="good"
              badge={translateText("พร้อมใช้งาน")}
              stats={[
                [translateText("รายการ"), `${assetRows.length} ${translateText("รายการ")}`],
                [translateText("มูลค่ารวม"), formatBaht(assetValue)],
              ]}
              onClick={() => setPreview("asset")}
            />
            <ReportCard
              title={translateText(REPORT_NAME.movement)}
              tone={pendingMovements > 0 ? "wait" : "info"}
              badge={pendingMovements > 0 ? `${translateText("รออนุมัติ")} ${pendingMovements}` : translateText("อนุมัติครบ")}
              stats={[
                [translateText("การเคลื่อนไหว"), `${movementRows.length} ${translateText("รายการ")}`],
                [translateText("ช่วงเวลา"), periodDisplayLabel],
              ]}
              onClick={() => setPreview("movement")}
            />
            <ReportCard
              title={translateText(REPORT_NAME.inventory)}
              tone={activeRounds > 0 ? "info" : "good"}
              badge={activeRounds > 0 ? `${translateText("กำลังนับ")} ${localizedCount(activeRounds, "รอบ", "cycle", language)}` : translateText("พร้อมใช้งาน")}
              stats={[
                [translateText("รอบที่เสร็จแล้ว"), `${localizedCount(completedRounds, "รอบ", "cycle", language)}`],
                [translateText("พบปัญหา"), `${inventoryIssues} ${translateText("รายการ")}`],
              ]}
              onClick={() => setPreview("inventory")}
            />
            <ReportCard
              title={translateText(REPORT_NAME.repair)}
              tone={openRepairs > 0 ? "wait" : "good"}
              badge={openRepairs > 0 ? `${translateText("ซ่อมค้าง")} ${openRepairs}` : translateText("ซ่อมครบ")}
              stats={[
                [translateText("งานซ่อม"), `${repairRows.length} ${translateText("รายการ")}`],
                [translateText("ค่าใช้จ่ายรวม"), formatBaht(repairTotal)],
              ]}
              onClick={() => setPreview("repair")}
            />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title={translateText("ส่งออก Excel")} badge={<Badge tone="good">{translateText("พร้อมใช้งาน")}</Badge>}>
            <div className="grid grid-cols-2 gap-3">
              <Stat label={translateText("คอลัมน์")} value={`${columns.length} ${translateText("คอลัมน์")}`} />
              <Stat label={translateText("รูปแบบ")} value=".xlsx" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button type="button" onClick={exportColumns} disabled={columns.length === 0} className={`${secondaryButtonClass} px-2 disabled:opacity-50`}>
                <Download size={18} /> {translateText("ส่งออก Excel")}
              </button>
              <button type="button" onClick={() => setShowColumns(true)} className={`${reportButton.primary} px-2`}>
                <Plus size={18} /> {translateText("ตั้งค่าข้อมูล")}
              </button>
            </div>
          </Card>

          <Card title={translateText("ประวัติตรวจนับ")} badge={<Badge tone={latestRound ? "good" : "plain"}>{translateText(latestRound ? "พร้อมใช้งาน" : "ยังไม่มีข้อมูล")}</Badge>}>
            <div className="grid grid-cols-2 gap-3">
              <Stat label={translateText("รอบล่าสุด")} value={latestRound ? monthText(latestRound.startDate, language) : "-"} />
              <Stat label={translateText("สถานะ")} value={latestRound ? translateText("ปิดรอบแล้ว") : "-"} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button type="button" onClick={exportRound} disabled={!latestRound} className={`${secondaryButtonClass} px-2 disabled:opacity-50`}>
                <Download size={18} /> {translateText("ส่งออก Excel")}
              </button>
              {latestRound ? (
                <Link href={`/inventories/audit?session=${latestRound.id}`} className={`${reportButton.primary} px-2`}>
                  <Plus size={18} /> {translateText("ดูรายละเอียด")}
                </Link>
              ) : (
                <span className={`${reportButton.primary} cursor-not-allowed px-2 opacity-50`}>{translateText("ดูรายละเอียด")}</span>
              )}
            </div>
            {latestRound && (
              <p className="mt-2 text-sm text-slate-500">
                {latestRound.id} · {translateText(getBranchName(latestRound.branchId))} · {formatLocalizedDate(latestRound.startDate, language)}
              </p>
            )}
          </Card>
        </div>

        <Card title={translateText("กิจกรรมล่าสุด")} badge={<Badge tone="wait">{activities.length} {translateText("กิจกรรม")}</Badge>}>
          {activities.length === 0 ? (
            <p className="py-6 text-center text-base text-slate-500">{translateText("ไม่พบรายการกิจกรรมที่ตรงกับตัวกรอง")}</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-base">
                  <thead className={`text-sm ${isDark ? "bg-indigo-950/50 text-slate-300" : "bg-indigo-50 text-slate-600"}`}>
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">{translateText("เวลา")}</th>
                      <th className="px-3 py-2.5 font-semibold">{translateText("ผู้ดำเนินการ")}</th>
                      <th className="px-3 py-2.5 font-semibold">{translateText("กิจกรรม")}</th>
                      <th className="px-3 py-2.5 font-semibold">{translateText("รายการที่เกี่ยวข้อง")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activities.map((a) => (
                      <tr key={a.id}>
                        <td className="whitespace-nowrap px-3 py-3">{formatLocalizedDateTime(a.at, language)}</td>
                        <td className="px-3 py-3">{a.who}</td>
                        <td className="px-3 py-3">{localizedActivityText(a.text, translateText)}</td>
                        <td className="px-3 py-3">{a.ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* มือถือ: การ์ดเรียงลงมา ไม่ต้องเลื่อนตารางไปข้าง */}
              <ul className="space-y-3 md:hidden">
                {activities.map((a) => (
                  <li key={a.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm text-slate-500">{formatLocalizedDateTime(a.at, language)}</p>
                    <p className="text-base font-semibold text-slate-900">{localizedActivityText(a.text, translateText)}</p>
                    <p className="text-sm text-slate-600">
                      {a.who} · {a.ref}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </main>

      {showColumns && (
        <DetailDialog
          title={translateText("ตั้งค่าข้อมูลที่จะส่งออก")}
          onClose={() => setShowColumns(false)}
          footer={
            <>
              <button type="button" onClick={() => setColumns(DEFAULT_COLUMNS)} className={secondaryButtonClass}>
                {translateText("ค่าเริ่มต้น")}
              </button>
              <button type="button" onClick={() => setShowColumns(false)} className={reportButton.primary}>
                {translateText("เสร็จ")} ({columns.length} {translateText("คอลัมน์")})
              </button>
            </>
          }
        >
          <p className="mb-3 text-base text-slate-600">{translateText("เลือกคอลัมน์ของรายงาน Asset ที่ต้องการในไฟล์ Excel")}</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {ASSET_COLUMNS.map((column) => (
              <label key={column} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-base ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
                <input
                  type="checkbox"
                  checked={columns.includes(column)}
                  onChange={() => toggleColumn(column)}
                  className="h-5 w-5 accent-indigo-600"
                />
                {translateText(column)}
              </label>
            ))}
          </div>
        </DetailDialog>
      )}

      {preview && (
        <DetailDialog
          title={`${translateText(REPORT_NAME[preview])} · ${translateText("ตัวอย่าง 10 รายการแรก")}`}
          onClose={() => setPreview(null)}
          footer={
            <>
              <button type="button" onClick={() => setPreview(null)} className={secondaryButtonClass}>
                {translateText("ปิด")}
              </button>
              <button type="button" onClick={() => exportOne(preview)} className={reportButton.primary}>
                <Download size={18} /> {translateText("ส่งออกชีตนี้")}
              </button>
            </>
          }
        >
          <PreviewList
            type={preview}
            assetRows={assetRows}
            movementRows={movementRows}
            inventoryRows={inventoryRows}
            repairRows={repairRows}
            language={language}
          />
        </DetailDialog>
      )}
    </div>
  );
}

function monthText(date: string, language: AppLanguage) {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "th-TH", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00`));
}

function IconField({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      {children}
    </div>
  );
}

// การ์ดรายงานแต่ละประเภท กดแล้วเปิดตัวอย่างข้อมูล
function ReportCard({ title, tone, badge, stats, onClick }: {
  title: string;
  tone: Tone;
  badge: string;
  stats: [string, string][];
  onClick: () => void;
}) {
  const isDark = useTheme() === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isDark
          ? "border-slate-700 bg-slate-900 hover:border-indigo-400"
          : "border-slate-200 bg-white hover:border-indigo-300"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className={`text-base font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{title}</h3>
        <Badge tone={tone}>{badge}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(([label, value]) => (
          <Stat key={label} label={label} value={value} />
        ))}
      </div>
    </button>
  );
}

function PreviewList({ type, assetRows, movementRows, inventoryRows, repairRows, language }: {
  type: ReportType;
  assetRows: ReturnType<typeof getRegisterRows>;
  movementRows: ReturnType<typeof getMovementRows>;
  inventoryRows: ReturnType<typeof getInventoryRows>;
  repairRows: ReturnType<typeof getRepairRows>;
  language: AppLanguage;
}) {
  const translateText = useTranslate();
  const isDark = useTheme() === "dark";
  type Item = { key: string; title: string; sub: string; badge: ReactNode };
  const items: Item[] =
    type === "asset"
      ? assetRows.slice(0, 10).map((a) => ({
          key: a.id,
          title: `${a.id} · ${a.name}`,
          sub: `${getBranchName(a.branchId)} · ${formatBaht(a.purchasePrice)}`,
          badge: <Badge tone={ASSET_TONE[a.status]}>{translateText(ASSET_STATUS_LABEL[a.status])}</Badge>,
        }))
      : type === "movement"
        ? movementRows.slice(0, 10).map(({ request: r, from, to }) => ({
            key: r.id,
            title: `${r.id} · ${translateText(BORROW_TYPE_LABEL[r.type])}`,
            sub: `${translateText(from)} → ${translateText(to)} · ${formatLocalizedDate(r.createdAt, language)}`,
            badge: <Badge tone={BORROW_TONE[r.status]}>{translateText(BORROW_STATUS_LABEL[r.status])}</Badge>,
          }))
        : type === "inventory"
          ? inventoryRows.slice(0, 10).map(({ session: s, progress: p }) => ({
              key: s.id,
              title: `${s.id} · ${translateText(getBranchName(s.branchId))}`,
              sub: `${translateText("ตรวจแล้ว")} ${p.checked}/${p.total} · ${translateText("ชำรุด")} ${p.damaged} · ${translateText("สูญหาย")} ${p.lost}`,
              badge: <Badge tone={s.status === "completed" ? "good" : "info"}>{translateText(SESSION_STATUS_LABEL[s.status])}</Badge>,
            }))
          : repairRows.slice(0, 10).map((r) => ({
              key: r.id,
                title: `${r.id} · ${translateText(r.issue)}`,
                sub: `${translateText(getBranchName(r.branchId))} · ${formatBaht(repairCost(r))}`,
              badge: (
                <Badge tone={r.status === "completed" ? "good" : r.status === "rejected" ? "bad" : "wait"}>
                    {translateText(REPAIR_STATUS_LABEL[r.status])}
                </Badge>
              ),
            }));

  if (items.length === 0) return <p className="py-6 text-center text-base text-slate-500">{translateText("ไม่มีข้อมูลตามตัวกรองที่เลือก")}</p>;
  return (
    <ul className={`divide-y rounded-xl border ${isDark ? "divide-slate-700 border-slate-700" : "divide-slate-100 border-slate-200"}`}>
      {items.map((item) => (
        <li key={item.key} className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-900">{item.title}</p>
            <p className="text-sm text-slate-600">{item.sub}</p>
          </div>
          {item.badge}
        </li>
      ))}
    </ul>
  );
}
