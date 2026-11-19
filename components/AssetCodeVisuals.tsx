"use client";

import { useMemo } from "react";

// ==========================================
// 1. BARCODE GENERATOR (Code 128B - สแกนได้จริง)
// ==========================================
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
  "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
  "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
  "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
  "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
  "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
  "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224",
  "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114",
  "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
  "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113",
  "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412",
  "211214", "211232", "2331112",
];

function encodeCode128B(text: string): number[] {
  const safeText = (text || "ASSET").replace(/[^\x20-\x7E]/g, "-");
  const startCode = 104;
  let checksum = startCode;
  const codes = [startCode];

  for (let i = 0; i < safeText.length; i++) {
    const val = safeText.charCodeAt(i) - 32;
    codes.push(val);
    checksum += val * (i + 1);
  }

  codes.push(checksum % 103);
  codes.push(106);

  const bars: number[] = [];
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
    for (const ch of pattern) {
      bars.push(Number(ch));
    }
  }
  return bars;
}

// ==========================================
// 2. REAL QR CODE GENERATOR (Version 2-L, 25x25, Reed-Solomon ECC - สแกนได้จริง)
// ==========================================
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function computeReedSolomon(data: Uint8Array, ecCount: number): Uint8Array {
  let gen = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(gen.length + 1).fill(0);
    const factor = GF_EXP[i];
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], factor);
    }
    gen = next;
  }

  const res = new Uint8Array(data.length + ecCount);
  res.set(data);

  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

function generateRealQrMatrix(text: string): boolean[][] {
  const size = 25; // Version 2 (25x25)
  const dataCapacity = 34; // Version 2-L data codewords
  const ecCount = 10; // Version 2-L EC codewords

  const bytes = new TextEncoder().encode((text || "AST-0001").slice(0, 32));
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >>> i) & 1);
    }
  };

  // Mode: Byte (0100) + Length (8 bits) + Payload
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  // Terminator
  const maxBits = dataCapacity * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataCodewords = new Uint8Array(dataCapacity);
  for (let i = 0; i < bits.length / 8; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i * 8 + b];
    dataCodewords[i] = byte;
  }

  const pads = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < dataCapacity; i++, p ^= 1) {
    dataCodewords[i] = pads[p];
  }

  const ecCodewords = computeReedSolomon(dataCodewords, ecCount);
  const allCodewords = new Uint8Array(dataCapacity + ecCount);
  allCodewords.set(dataCodewords);
  allCodewords.set(ecCodewords, dataCapacity);

  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const setFunc = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      grid[r][c] = dark;
      isFunction[r][c] = true;
    }
  };

  // Finder Patterns + Separators
  const drawFinder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inBox = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setFunc(r0 + r, c0 + c, inBox && (border || center));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Alignment Pattern (18, 18)
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const dark = Math.max(Math.abs(r), Math.abs(c)) !== 1;
      setFunc(18 + r, 18 + c, dark);
    }
  }

  // Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  // Format Info (Level L, Mask 0 -> 0x77C4)
  const formatBits = 0x77c4;
  for (let i = 0; i < 15; i++) {
    const dark = ((formatBits >>> i) & 1) === 1;
    // Top-left
    if (i < 6) setFunc(8, i, dark);
    else if (i < 8) setFunc(8, i + 1, dark);
    else if (i === 8) setFunc(7, 8, dark);
    else setFunc(14 - i, 8, dark);

    // Top-right & Bottom-left
    if (i < 8) setFunc(8, size - 1 - i, dark);
    else setFunc(size - 15 + i, 8, dark);
  }
  setFunc(size - 8, 8, true); // Dark module

  // Zigzag Data Placement + Mask 0 ((r + c) % 2 === 0)
  let bitIdx = 0;
  const totalBits = allCodewords.length * 8;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (let dx = 0; dx < 2; dx++) {
        const c = right - dx;
        if (isFunction[r][c]) continue;
        let bit = false;
        if (bitIdx < totalBits) {
          const cw = allCodewords[bitIdx >>> 3];
          bit = ((cw >>> (7 - (bitIdx & 7))) & 1) === 1;
          bitIdx++;
        }
        const mask = (r + c) % 2 === 0;
        grid[r][c] = bit !== mask;
      }
    }
    upward = !upward;
  }

  return grid;
}

export function AssetQrCode({ value }: { value: string }) {
  const matrix = useMemo(() => generateRealQrMatrix(value), [value]);
  const size = matrix.length;

  return (
    <div className="h-[136px] flex items-center justify-center">
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <svg
          viewBox={`-2 -2 ${size + 4} ${size + 4}`}
          className="w-28 h-28 text-slate-900"
          shapeRendering="crispEdges"
          aria-label={`QR Code ${value}`}
        >
          <rect x={-2} y={-2} width={size + 4} height={size + 4} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={c}
                  y={r}
                  width={1}
                  height={1}
                  fill="currentColor"
                />
              ) : null
            )
          )}
        </svg>
      </div>
    </div>
  );
}

export function AssetBarcode({ value }: { value: string }) {
  const { rects, totalWidth } = useMemo(() => {
    const bars = encodeCode128B(value);
    const list: { x: number; width: number }[] = [];
    let cursor = 10;

    bars.forEach((w, idx) => {
      if (idx % 2 === 0) {
        list.push({ x: cursor, width: w });
      }
      cursor += w;
    });

    return { rects: list, totalWidth: cursor + 10 };
  }, [value]);

  return (
    <div className="h-[136px] flex items-center justify-center w-full px-4">
      <div className="px-6 py-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
        <svg
          viewBox={`0 0 ${totalWidth} 80`}
          className="w-60 sm:w-72 h-20 text-slate-900"
          shapeRendering="crispEdges"
          preserveAspectRatio="none"
          aria-label={`Barcode ${value}`}
        >
          <rect x={0} y={0} width={totalWidth} height={80} fill="#ffffff" />
          {rects.map((bar, i) => (
            <rect
              key={i}
              x={bar.x}
              y={4}
              width={bar.width}
              height={72}
              fill="currentColor"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}