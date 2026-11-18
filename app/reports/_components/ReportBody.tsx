"use client";

// เนื้อหารายงานที่ Admin เสนอ President ใช้ทั้งตอนกด "ดูตัวอย่าง" และตอน President เปิดอ่าน
import { PURPOSE_LABEL, type SentReport } from "@/lib/reports";
import { Badge } from "./parts";

type Props = { report: Pick<SentReport, "title" | "periodLabel" | "purpose" | "summary" | "message" | "sections" | "issues" | "createdByName"> };

export function ReportBody({ report }: Props) {
  return (
    <div className="space-y-4 text-base">
      <div className="flex flex-wrap items-center gap-2 text-slate-600">
        <Badge tone={report.purpose === "approve" ? "wait" : "info"}>{PURPOSE_LABEL[report.purpose]}</Badge>
        <span>รอบรายงาน {report.periodLabel}</span>
        <span>· ผู้จัดทำ {report.createdByName}</span>
      </div>

      <section>
        <h3 className="mb-1 font-bold text-slate-900">สรุปสำหรับผู้บริหาร</h3>
        <p className="whitespace-pre-line rounded-xl bg-slate-100 px-4 py-3 text-slate-800">{report.summary || "-"}</p>
      </section>

      <section>
        <h3 className="mb-2 font-bold text-slate-900">รายงานประกอบ 4 ประเภท</h3>
        <dl className="grid gap-2 sm:grid-cols-2">
          {report.sections.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 px-3 py-2">
              <dt className="text-sm text-slate-500">{s.label}</dt>
              <dd className="font-semibold text-slate-900">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {report.issues.length > 0 && (
        <section>
          <h3 className="mb-2 font-bold text-slate-900">ประเด็นและข้อเสนอ</h3>
          <ol className="space-y-2">
            {report.issues.map((issue, i) => (
              <li key={i} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="font-semibold text-slate-900">
                  {i + 1}. {issue.title}
                </p>
                <p className="whitespace-pre-line text-slate-700">{issue.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h3 className="mb-1 font-bold text-slate-900">ข้อความถึง President</h3>
        <p className="whitespace-pre-line text-slate-800">{report.message || "-"}</p>
      </section>
    </div>
  );
}
