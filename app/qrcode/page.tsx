
'use client';

import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { assets } from "@/data/asset";

// ดึง Type จากข้อมูล assets โดยตรง
type Asset = (typeof assets)[number];

function AssetQRCode({ asset }: { asset: Asset }) {
  const qrId = `qr-${asset.id}`;

  // ดาวน์โหลด QR Code เป็น PNG
  const downloadQR = () => {
    const svg = document.getElementById(qrId);

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const img = new Image();

    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;

      ctx.drawImage(img, 0, 0, 600, 600);

      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${asset.id}-QR.png`;
      link.click();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border p-5 bg-white shadow-sm">
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

      <button
        onClick={downloadQR}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        ดาวน์โหลด QR Code (PNG)
      </button>
    </div>
  );
}

// Component หลักของหน้า /qrcode
export default function QRCodePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        QR Code ครุภัณฑ์
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
