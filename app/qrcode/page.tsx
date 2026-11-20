
'use client';

import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import Barcode from "react-barcode";
import { assets } from "@/data/asset";
import { useTranslate } from "@/lib/language";

type Asset = (typeof assets)[number];

function AssetQRCode({ asset }: { asset: Asset }) {
  const translateText = useTranslate();

  const qrId = `qr-${asset.id}`;
  const barcodeId = `barcode-${asset.id}`;

  // ดาวน์โหลด SVG เป็น PNG
  const downloadPNG = (
    elementId: string,
    fileName: string,
    width: number,
    height: number
  ) => {

    const svg = document.getElementById(elementId);

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    const blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      // พื้นหลังสีขาว
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = fileName;
      link.click();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border p-6 bg-white shadow-sm">

      {/* ชื่อครุภัณฑ์ */}
      <h3 className="font-bold text-lg text-gray-800">
        {asset.name}
      </h3>

      {asset.assetImage && (
        <Image
          src={asset.assetImage}
          alt={`ภาพทรัพย์สิน ${asset.name}`}
          width={400}
          height={300}
          unoptimized
          className="h-36 w-full rounded-lg object-cover"
        />
      )}

      <QRCodeSVG
        id={qrId}
        value={asset.qrCode || asset.id}
        size={200}
        level="H"
        includeMargin
      />

      <p className="font-semibold text-gray-700">
        {asset.id}
      </p>

      <p className="text-sm text-gray-500">
        {asset.brand} - {asset.model}
      </p>

      {/* QR CODE */}
      <div className="w-full border-t pt-4 flex flex-col items-center gap-3">

        <h4 className="font-semibold text-gray-800">
          QR Code
        </h4>

        <QRCodeSVG
          id={qrId}
          value={asset.qrCode || asset.id}
          size={200}
          level="H"
          includeMargin
        />

        <button
          onClick={() =>
            downloadPNG(
              qrId,
              `${asset.id}-QR.png`,
              600,
              600
            )
          }
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >

          {translateText("ดาวน์โหลด QR Code (PNG)")}
        </button>

      </div>

      {/* BARCODE */}
      <div className="w-full border-t pt-4 flex flex-col items-center gap-3">

        <h4 className="font-semibold text-gray-800">
          Barcode (CODE128)
        </h4>

        <div className="max-w-full overflow-hidden">
          <Barcode
            id={barcodeId}
            value={asset.id}
            format="CODE128"
            width={2}
            height={80}
            displayValue={true}
            background="#ffffff"
            lineColor="#000000"
            margin={10}
          />
        </div>

        <button
          onClick={() =>
            downloadPNG(
              barcodeId,
              `${asset.id}-Barcode.png`,
              800,
              250
            )
          }
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
        >

          {translateText("ดาวน์โหลด Barcode (PNG)")}
        </button>

      </div>

    </div>
  );
}

// หน้าหลัก
export default function QRCodePage() {
  const translateText = useTranslate();

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-2xl font-bold mb-6 text-gray-800">

        {translateText("QR Code และ Barcode ครุภัณฑ์")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {assets.map((asset) => (
          <AssetQRCode
            key={asset.id}
            asset={asset}
          />
        ))}

      </div>

    </main>
  );
}
