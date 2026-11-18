
'use client';

import { QRCodeSVG } from "qrcode.react";
import { assets } from "@/data/asset";

// ดึง Type จากข้อมูล assets โดยตรง
type Asset = (typeof assets)[number];

function AssetQRCode({ asset }: { asset: Asset }) {
  const qrId = `qr-${asset.id}`;

  const downloadQR = () => {
    const svg = document.getElementById(qrId);

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${asset.id}-QR.svg`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border p-5 bg-white shadow-sm">
      <h3 className="font-bold text-lg text-gray-800">
        {asset.name}
      </h3>

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
        ดาวน์โหลด QR Code
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
