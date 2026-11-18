"use client";

import { tx, useT } from "@/lib/i18n";
// หน้าสแกน QR Code / Barcode ทั่วไป ใช้ได้ทุกบทบาท
// อ่านรหัสอย่างเดียว แสดงว่าอ่านได้อะไร และถ้าเป็นรหัสทรัพย์สินในระบบจะบอกชื่อทรัพย์สินให้ด้วย
import { useState } from "react";
import CodeScanner from "@/components/scanner/CodeScanner";
import { findAsset, formatThaiDateTime, getBranchName, toLocalISO } from "@/lib/inventory";
import { EmptyState, PageHeader, RoleGate, buttonStyle } from "../inventories/_components/ui";

type ScanResult = { id: number; code: string; format: string; at: string };

// ชื่อชนิดรหัสให้อ่านง่าย
function formatLabel(format: string) {
  if (format === "qr_code") return "QR Code";
  if (format === "manual") return tx("พิมพ์เอง");
  if (format === "data_matrix") return "Data Matrix";
  return `Barcode (${format.replace(/_/g, "-").toUpperCase()})`;
}

export default function ScannerPage() {
  return (
    <RoleGate allow={["user", "admin", "president", "superadmin"]}>
      <ScannerContent />
    </RoleGate>
  );
}

function ScannerContent() {
  useT();
  const [results, setResults] = useState<ScanResult[]>([]);

  const handleScan = (code: string, format: string) => {
    setResults((list) => [{ id: Date.now(), code, format, at: toLocalISO(new Date()) }, ...list].slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <PageHeader title={tx("สแกน QR Code / Barcode")} subtitle={tx("ใช้สำหรับอ่านรหัสเท่านั้น ไม่มีการบันทึกข้อมูล")} />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 pt-5 lg:grid-cols-2 lg:px-8">
        <section className="mx-auto w-full max-w-md">
          <CodeScanner onScan={handleScan} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">{tx("ผลที่อ่านได้ (")}{results.length})</h2>
            {results.length > 0 && (
              <button type="button" onClick={() => setResults([])} className={buttonStyle.secondary}>
                {tx("ล้างรายการ")}
              </button>
            )}
          </div>
          {results.length === 0 ? (
            <EmptyState text={tx("ยังไม่ได้สแกน เล็งกล้องไปที่ QR Code หรือ Barcode")} />
          ) : (
            <ul className="space-y-3">
              {results.map((r) => {
                const asset = findAsset(r.code);
                return (
                  <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="break-all text-lg font-bold text-slate-900">{r.code}</p>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                        {formatLabel(r.format)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{formatThaiDateTime(r.at)}</p>
                    {asset ? (
                      <p className="mt-2 text-base text-slate-700">
                        {tx("ทรัพย์สิน:")} <strong>{asset.name}</strong> · {getBranchName(asset.branchId)}
                      </p>
                    ) : (
                      <p className="mt-2 text-base text-slate-500">{tx("ไม่ใช่รหัสทรัพย์สินในระบบ")}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
