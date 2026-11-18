"use client";

// ตัวสแกนกลางของกลุ่ม: อ่าน QR Code และ Barcode แล้วส่งข้อความที่อ่านได้กลับไปให้หน้าที่เรียกใช้
// วิธีใช้: <CodeScanner onScan={(code) => console.log(code)} />
// ตัวสแกนทำหน้าที่ "อ่าน" อย่างเดียว ส่วนจะเอารหัสไปทำอะไรต่อ หน้าที่เรียกใช้เป็นคนตัดสินใจ
import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";

// กล้องใช้ได้เฉพาะบนเบราว์เซอร์ จึงโหลดส่วนกล้องแบบไม่ render ฝั่ง server
const CameraView = dynamic(() => import("./CameraView"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-square items-center justify-center rounded-3xl bg-slate-900 text-base text-white">
      กำลังเปิดกล้อง...
    </div>
  ),
});

export type CodeScannerProps = {
  /** เรียกเมื่ออ่านรหัสได้ ได้ข้อความในรหัส และชนิด เช่น "qr_code", "code_128" หรือ "manual" ถ้าพิมพ์เอง */
  onScan: (code: string, format: string) => void;
  /** หยุดอ่านชั่วคราว เช่น ตอนเปิดหน้าต่างยืนยัน */
  paused?: boolean;
  /** แสดงช่องพิมพ์รหัสเองไว้ใต้กล้อง (ค่าเริ่มต้น: แสดง) */
  allowManual?: boolean;
};

export default function CodeScanner({ onScan, paused = false, allowManual = true }: CodeScannerProps) {
  const [manualCode, setManualCode] = useState("");

  const handleManual = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    onScan(code, "manual");
    setManualCode("");
  };

  return (
    <div className="space-y-3">
      <CameraView onScan={onScan} paused={paused} />
      <p className="text-center text-base text-slate-600">เล็งกล้องไปที่ QR Code หรือ Barcode ระบบจะอ่านให้อัตโนมัติ</p>
      {allowManual && (
        <form onSubmit={handleManual} className="rounded-2xl border border-slate-200 bg-white p-4">
          <label htmlFor="manual-code" className="text-base font-semibold text-slate-800">
            สแกนไม่ติด? พิมพ์รหัสแทน
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="manual-code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="เช่น AST-0005"
              autoCapitalize="characters"
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-base uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-900 px-4 text-base font-semibold text-white hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              ตรวจ
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
