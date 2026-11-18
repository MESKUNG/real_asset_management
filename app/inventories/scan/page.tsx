"use client";
import { useTranslate } from "@/lib/language";


import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QrScannerMockupPage() {
  const translateText = useTranslate();
  const router = useRouter();
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string>("พร้อมสแกน");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showSimpleToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // ยังไม่ได้ต่อกล้องจริง ใช้การคลิกกรอบกล้องแทนการสแกนไปก่อน
  const handleMockScan = () => {
    if (scanStatus === "กำลังสแกน...") return; // กันกดซ้ำระหว่างกำลังสแกน

    setScanStatus("กำลังสแกน...");
    setTimeout(() => {
      setScanStatus("สแกนสำเร็จ (AST-0025)");
      showSimpleToast("สแกนทรัพย์สิน AST-0025 สำเร็จ!");
      router.push("/inventories/audit");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f9] text-slate-800 font-sans pb-12">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg">
          ✅ {toastMsg}
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="text-slate-700 font-bold">
          ←
        </button>
        <h1 className="text-base font-bold text-slate-900">{translateText("สแกน QR Code")}</h1>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5">
        <h2 className="text-sm font-bold text-slate-900">{translateText("สแกน QR Code บนทรัพย์สิน")}</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-4">{translateText("วาง QR Code ให้อยู่ภายในกรอบเพื่อสแกน")}</p>

        {/* กรอบกล้องจำลอง */}
        <div
          onClick={handleMockScan}
          className="relative w-full aspect-[3/4] max-h-[440px] rounded-2xl bg-gradient-to-b from-[#1e2238] to-[#0c0e18] p-4 flex flex-col justify-between cursor-pointer shadow-md"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3.5 py-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#8b7ff9]" />
            <span className="text-[11px] font-semibold text-white">{scanStatus}</span>
          </div>

          {/* กรอบเล็ง 4 มุม */}
          <div className="relative my-auto mx-auto w-[70%] aspect-square flex items-center justify-center border border-white/10 rounded-xl">
            <div className="w-[88%] h-[2px] bg-[#a594ff] shadow-[0_0_10px_2px_rgba(165,148,255,0.8)]" />
          </div>

          <div className="text-center pb-2">
            <p className="text-xs font-bold text-white">
              
              {translateText("เล็งกล้องไปที่ QR Code (")}{isFrontCamera ? "กล้องหน้า" : "กล้องหลัง"})
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              
              {translateText("(แตะที่กรอบมืดนี้เพื่อจำลองการสแกนสำเร็จ)")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-16">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsTorchOn(!isTorchOn);
                showSimpleToast(!isTorchOn ? "เปิดไฟฉายแล้ว (Mockup)" : "ปิดไฟฉายแล้ว");
              }}
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-bold ${
                isTorchOn ? "bg-[#4f46e5] text-white" : "bg-white text-[#5848e5]"
              }`}
            >
              🔦
            </button>
            <span className="text-xs font-bold">{isTorchOn ? "ปิดไฟฉาย" : "เปิดไฟฉาย"}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsFrontCamera(!isFrontCamera);
                showSimpleToast(!isFrontCamera ? "สลับเป็นกล้องหน้า" : "สลับเป็นกล้องหลัง");
              }}
              className="w-14 h-14 rounded-2xl bg-white text-[#5848e5] border flex items-center justify-center font-bold"
            >
              📷
            </button>
            <span className="text-xs font-bold">{translateText("สลับกล้อง")}</span>
          </div>
        </div>
      </main>
    </div>
  );
}