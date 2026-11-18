"use client";

// ส่วนกล้องของตัวสแกนกลาง (ใช้ไลบรารี @yudiel/react-qr-scanner)
// เลือกกล้องเองได้ เพราะคอมบางเครื่องมีกล้องเสมือนหลายตัว เช่น OBS Virtual Camera หรือ Iriun Webcam
import { useState } from "react";
import {
  Scanner,
  prepareZXingModule,
  useDevices,
  type IDetectedBarcode,
  type IScannerError,
} from "@yudiel/react-qr-scanner";

// ตัวถอดรหัส (zxing_reader.wasm) เก็บไว้ในโฟลเดอร์ public/zxing ของโปรเจกต์
// ปกติไลบรารีจะโหลดไฟล์นี้จากอินเทอร์เน็ต ถ้าเน็ตหลุดจะสแกนไม่ได้ จึงให้โหลดจากเว็บเราเองแทน
prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => (path.endsWith(".wasm") ? `/zxing/${path}` : prefix + path),
  },
});

// อ่านได้ทั้ง QR Code และ Barcode แบบที่ใช้กันทั่วไป
const FORMATS = [
  "qr_code",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "itf",
  "data_matrix",
] as const;

const CAMERA_KEY = "scanner-camera";

const ERROR_TEXT: Record<IScannerError["kind"], string> = {
  "permission-denied": "ยังไม่ได้อนุญาตให้ใช้กล้อง กดรูปกุญแจที่แถบที่อยู่เว็บ แล้วเลือกอนุญาตกล้อง",
  "no-camera": "ไม่พบกล้องในเครื่องนี้",
  "in-use": "กล้องถูกโปรแกรมอื่นใช้อยู่ ปิดโปรแกรมนั้นก่อน หรือเลือกกล้องตัวอื่น",
  overconstrained: "เปิดกล้องตัวนี้ไม่ได้ ลองเลือกกล้องตัวอื่น",
  "insecure-context": "เบราว์เซอร์เปิดกล้องได้เฉพาะเว็บที่เป็น https หรือ localhost",
  unsupported: "เบราว์เซอร์นี้ไม่รองรับการสแกน",
  aborted: "การเปิดกล้องถูกยกเลิก",
  security: "เบราว์เซอร์ไม่อนุญาตให้ใช้กล้อง",
  "type-error": "เปิดกล้องไม่สำเร็จ",
  unknown: "เปิดกล้องไม่สำเร็จ",
};

function readSavedCamera() {
  try {
    return localStorage.getItem(CAMERA_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function CameraView({ onScan, paused }: {
  onScan: (code: string, format: string) => void;
  paused: boolean;
}) {
  const devices = useDevices();
  const [deviceId, setDeviceId] = useState(readSavedCamera);
  const [error, setError] = useState<string | null>(null);

  // กล้องที่เคยเลือกไว้หายไป (เช่น ถอดกล้อง) ให้กลับไปใช้กล้องหลังของเครื่อง
  const selected = devices.some((d) => d.deviceId === deviceId) ? deviceId : "";

  const chooseCamera = (id: string) => {
    setDeviceId(id);
    setError(null);
    try {
      localStorage.setItem(CAMERA_KEY, id);
    } catch {
      // เบราว์เซอร์บางแบบบันทึกไม่ได้ ไม่เป็นไร เลือกใหม่ครั้งหน้า
    }
  };

  // ไลบรารีไม่ส่งรหัสเดิมซ้ำติดกัน จึงไม่ต้องกันการอ่านซ้ำเอง
  const handleScan = (codes: IDetectedBarcode[]) => {
    const code = codes[0];
    if (code?.rawValue) onScan(code.rawValue.trim(), code.format);
  };

  return (
    <div className="space-y-3">
      {devices.length > 1 && (
        <label className="block text-base font-medium text-slate-700">
          เลือกกล้อง
          <select
            value={selected}
            onChange={(e) => chooseCamera(e.target.value)}
            className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">กล้องหลัง (ค่าเริ่มต้น)</option>
            {devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `กล้อง ${i + 1}`}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="overflow-hidden rounded-3xl bg-slate-900">
        {error ? (
          <div className="flex aspect-square flex-col items-center justify-center gap-3 p-6 text-center text-base text-white">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="min-h-11 rounded-xl bg-white px-4 text-base font-semibold text-slate-900"
            >
              ลองเปิดกล้องอีกครั้ง
            </button>
          </div>
        ) : (
          <Scanner
            key={selected || "default"}
            onScan={handleScan}
            onError={(e) => setError(ERROR_TEXT[e.kind] ?? e.message)}
            paused={paused}
            constraints={{
              ...(selected ? { deviceId: { exact: selected } } : { facingMode: "environment" }),
              // ไลบรารีตั้งค่าเริ่มต้นให้ภาพสูงอย่างน้อย 640px ซึ่งกล้องคอมทั่วไป (640x480) เปิดไม่ได้
              // จึงกำหนดแค่ขนาดที่อยากได้ ไม่บังคับขั้นต่ำ
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }}
            formats={[...FORMATS]}
            components={{ finder: true, torch: true }}
            sound
          />
        )}
      </div>
    </div>
  );
}
