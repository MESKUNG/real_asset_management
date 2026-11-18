"use client";

import { useMemo } from "react";

const QR_SIZE = 21;
const QR_DATA_CODEWORDS = 19;
const QR_ECC_CODEWORDS = 7;

function appendBits(target: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i -= 1) target.push((value >>> i) & 1);
}

function multiplyInField(left: number, right: number): number {
  let result = 0;
  let a = left;
  let b = right;
  while (b > 0) {
    if (b & 1) result ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 0x100) a ^= 0x11d;
  }
  return result;
}

function makeErrorCorrection(data: number[]): number[] {
  let generator = [1];
  let root = 1;
  for (let i = 0; i < QR_ECC_CODEWORDS; i += 1) {
    const next = Array(generator.length + 1).fill(0) as number[];
    for (let j = 0; j < generator.length; j += 1) {
      next[j] ^= generator[j];
      next[j + 1] ^= multiplyInField(generator[j], root);
    }
    generator = next;
    root = multiplyInField(root, 2);
  }

  const remainder = Array(QR_ECC_CODEWORDS).fill(0) as number[];
  for (const byte of data) {
    const factor = byte ^ remainder[0];
    for (let i = 0; i < QR_ECC_CODEWORDS - 1; i += 1) {
      remainder[i] = remainder[i + 1] ^ multiplyInField(generator[i + 1], factor);
    }
    remainder[QR_ECC_CODEWORDS - 1] = multiplyInField(generator[QR_ECC_CODEWORDS], factor);
  }
  return remainder;
}

function makeQrMatrix(value: string): boolean[][] {
  const bytes = Array.from(value, (character) => character.charCodeAt(0));
  if (bytes.length === 0 || bytes.length > 17 || bytes.some((byte) => byte > 0x7f)) {
    throw new Error("QR Code รองรับรหัส Asset ภาษาอังกฤษได้ไม่เกิน 17 ตัวอักษร");
  }

  const bits: number[] = [];
  appendBits(bits, 0b0100, 4); // byte mode
  appendBits(bits, bytes.length, 8);
  for (const byte of bytes) appendBits(bits, byte, 8);

  const capacity = QR_DATA_CODEWORDS * 8;
  for (let i = 0; i < Math.min(4, capacity - bits.length); i += 1) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const data = Array.from({ length: bits.length / 8 }, (_, index) => {
    return bits.slice(index * 8, index * 8 + 8).reduce((byte, bit) => (byte << 1) | bit, 0);
  });
  for (let pad = 0; data.length < QR_DATA_CODEWORDS; pad += 1) {
    data.push(pad % 2 === 0 ? 0xec : 0x11);
  }
  const allCodewords = [...data, ...makeErrorCorrection(data)];
  const codewordBits = allCodewords.flatMap((byte) => {
    const result: number[] = [];
    appendBits(result, byte, 8);
    return result;
  });

  const modules = Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false) as boolean[]);
  const functionModules = Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false) as boolean[]);
  const setFunctionModule = (x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) return;
    modules[y][x] = dark;
    functionModules[y][x] = true;
  };

  const addFinder = (left: number, top: number) => {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const distance = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        const dark = distance === 0 || distance === 1 || distance === 3;
        setFunctionModule(left + dx, top + dy, dark);
      }
    }
  };

  addFinder(0, 0);
  addFinder(QR_SIZE - 7, 0);
  addFinder(0, QR_SIZE - 7);

  for (let i = 8; i < QR_SIZE - 8; i += 1) {
    setFunctionModule(i, 6, i % 2 === 0);
    setFunctionModule(6, i, i % 2 === 0);
  }

  // Version 1-L format information. Mask 0 is used for the data modules.
  const formatData = (0b01 << 3) | 0;
  let formatRemainder = formatData << 10;
  for (let bit = 14; bit >= 10; bit -= 1) {
    if (((formatRemainder >>> bit) & 1) !== 0) {
      formatRemainder ^= 0x537 << (bit - 10);
    }
  }
  const formatBits = ((formatData << 10) | formatRemainder) ^ 0x5412;
  const formatBit = (index: number) => ((formatBits >>> index) & 1) !== 0;
  for (let i = 0; i <= 5; i += 1) setFunctionModule(8, i, formatBit(i));
  setFunctionModule(8, 7, formatBit(6));
  setFunctionModule(8, 8, formatBit(7));
  setFunctionModule(7, 8, formatBit(8));
  for (let i = 9; i < 15; i += 1) setFunctionModule(14 - i, 8, formatBit(i));
  for (let i = 0; i < 8; i += 1) setFunctionModule(QR_SIZE - 1 - i, 8, formatBit(i));
  for (let i = 8; i < 15; i += 1) setFunctionModule(8, QR_SIZE - 15 + i, formatBit(i));
  setFunctionModule(8, QR_SIZE - 8, true);

  let bitIndex = 0;
  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let vertical = 0; vertical < QR_SIZE; vertical += 1) {
      const y = upward ? QR_SIZE - 1 - vertical : vertical;
      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (functionModules[y][x]) continue;
        let dark = codewordBits[bitIndex] === 1;
        if ((x + y) % 2 === 0) dark = !dark;
        modules[y][x] = dark;
        bitIndex += 1;
      }
    }
  }
  return modules;
}

export function AssetQrCode({ value, className = "" }: { value: string; className?: string }) {
  const modules = useMemo(() => makeQrMatrix(value), [value]);
  return (
    <svg
      viewBox={`-4 -4 ${QR_SIZE + 8} ${QR_SIZE + 8}`}
      role="img"
      aria-label={`QR Code สำหรับ Asset ${value}`}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect x="-4" y="-4" width={QR_SIZE + 8} height={QR_SIZE + 8} fill="white" />
      {modules.flatMap((row, y) =>
        row.map((dark, x) => (dark ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="black" /> : null)),
      )}
    </svg>
  );
}

const CODE_39: Record<string, string> = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
  "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
  "8": "wnnwnnwnn", "9": "nnwwnnwnn", A: "wnnnnwnnw", B: "nnwnnwnnw",
  C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn", F: "nnwnwwnnn",
  G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn",
  K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww",
  O: "wnnnwnnwn", P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn",
  S: "nnwnnnwwn", T: "nnnnwnwwn", U: "wwnnnnnnw", V: "nwwnnnnnw",
  W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn", Z: "nwwnwnnnn",
  "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", $: "nwnwnwnnn",
  "/": "nwnwnnnwn", "+": "nwnnnwnwn", "%": "nnnwnwnwn", "*": "nwnnwnwnn",
};

export function AssetBarcode({ value, className = "" }: { value: string; className?: string }) {
  const bars = useMemo(() => {
    const encoded = `*${value.toUpperCase()}*`;
    const elements: { x: number; width: number }[] = [];
    let x = 10;
    for (const character of encoded) {
      const pattern = CODE_39[character];
      if (!pattern) throw new Error("Barcode รองรับตัวอักษร A-Z ตัวเลข และเครื่องหมายพื้นฐาน");
      for (let index = 0; index < pattern.length; index += 1) {
        const width = pattern[index] === "w" ? 3 : 1;
        if (index % 2 === 0) elements.push({ x, width });
        x += width;
      }
      x += 1;
    }
    return { elements, width: x + 10 };
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${bars.width} 52`}
      role="img"
      aria-label={`Barcode สำหรับ Asset ${value}`}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect width={bars.width} height="52" fill="white" />
      {bars.elements.map((bar, index) => (
        <rect key={index} x={bar.x} y="2" width={bar.width} height="44" fill="black" />
      ))}
    </svg>
  );
}
