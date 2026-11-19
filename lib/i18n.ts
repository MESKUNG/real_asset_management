// ตัวแปลภาษาของหน้าตรวจนับ / รายงาน / สแกน (ส่วนของเรา)
// ใช้ภาษาที่ผู้ใช้เลือกในหน้าตั้งค่า ผ่าน lib/language ของกลุ่ม (ไม่ได้แก้ไฟล์ของเพื่อน)
// วิธีใช้:
//   1) ในคอมโพเนนต์ เรียก useT() หนึ่งครั้งด้านบน เพื่อให้หน้าวาดใหม่เมื่อเปลี่ยนภาษา
//   2) ครอบข้อความไทยด้วย tx("ข้อความ") ถ้ามีตัวเลขแทรก ใช้ {0} {1} เช่น tx("อีก {0} วัน", days)
// คำแปลอยู่ใน lib/i18nDictionary.ts (ข้อความไทยเป็น key) ถ้าไม่มีจะลองดิกชันนารีกลางของกลุ่มต่อ
import { translate, useLanguage, type AppLanguage } from "@/lib/language";
import { pageTranslations } from "@/lib/i18nDictionary";

let activeLanguage: AppLanguage = "th";

function setActiveLanguage(language: AppLanguage) {
  activeLanguage = language;
}

// เรียกในคอมโพเนนต์ทุกตัวที่แสดงข้อความ หน้าจะวาดใหม่เองเมื่อเปลี่ยนภาษา
export function useT() {
  const language = useLanguage();
  setActiveLanguage(language);
  return tx;
}

// ใช้ตอนสร้างข้อความที่จะ "บันทึกลงข้อมูล" (เช่น หมายเหตุผลตรวจ) ให้เก็บเป็นภาษาไทยเสมอ
// ตอนแสดงผลจะแปลตามภาษาที่เลือกเอง ถ้าเก็บเป็นอังกฤษ พอสลับกลับเป็นไทยจะยังเห็นอังกฤษค้างอยู่
export function inThai<T>(build: () => T): T {
  const previous = activeLanguage;
  activeLanguage = "th";
  try {
    return build();
  } finally {
    activeLanguage = previous;
  }
}

export function isEnglish() {
  return activeLanguage === "en";
}

// รูปแบบวันที่ตามภาษา (ไทยใช้ปี พ.ศ. อังกฤษใช้ ค.ศ.)
export function dateLocale() {
  return activeLanguage === "en" ? "en-GB" : "th-TH";
}

const THAI_MONTHS: Record<string, string> = {
  มกราคม: "January", กุมภาพันธ์: "February", มีนาคม: "March", เมษายน: "April",
  พฤษภาคม: "May", มิถุนายน: "June", กรกฎาคม: "July", สิงหาคม: "August",
  กันยายน: "September", ตุลาคม: "October", พฤศจิกายน: "November", ธันวาคม: "December",
};

// ข้อความจากข้อมูลที่มีส่วนเปลี่ยนไปเรื่อยๆ (เลขรหัส ชื่อเดือน ปี พ.ศ.) แปลด้วยรูปแบบแทนการเพิ่มทีละข้อความ
const PATTERNS: [RegExp, (...parts: string[]) => string][] = [
  [/^(.+) \(ข้อมูลเดิม\)$/, (name) => `${english(name)} (previous record)`],
  [/^(.+) \(ตรวจสภาพแล้ว\)$/, (name) => `${english(name)} (inspected)`],
  [/^เก้าอี้สำนักงาน (.+)$/, (model) => `Office Chair ${model}`],
  [/^โต๊ะทำงาน (.+)$/, (model) => `Office Desk ${model}`],
  [/^โอนทรัพย์สินจาก (\S+) ไปยัง (\S+)$/, (from, to) => `Transferred asset from ${from} to ${to}`],
  [/^โอนทรัพย์สินกลับจาก (\S+) ไปยัง (\S+)$/, (from, to) => `Transferred asset back from ${from} to ${to}`],
  // หมายเหตุผลตรวจที่ระบบบันทึกให้ (เก็บเป็นภาษาไทย แปลตอนแสดงผล)
  [/^ไม่อยู่ในสาขาขณะตรวจ: (.+?)( \([A-Z]+-\d+\))?$/, (reason, doc) => tx("ไม่อยู่ในสาขาขณะตรวจ: {0}{1}", english(reason), doc ?? "")],
  [/^ส่งซ่อมที่ (.+)$/, (vendor) => tx("ส่งซ่อมที่ {0}", english(vendor))],
  [/^พบทรัพย์สินของ(.+) ที่(.+)$/, (from, at) => tx("พบทรัพย์สินของ{0} ที่{1}", english(from), english(at))],
  [/^ย้ายทรัพย์สินไปยัง(.+)$/, (branch) => `Moved asset to ${english(branch)}`],
  [/^เปลี่ยนสถานะทรัพย์สินเป็น(.+)$/, (status) => `Changed asset status to ${english(status)}`],
  [
    /^ตรวจนับทรัพย์สินประจำเดือน(\S+?) ?(\d{4})? - (.+)$/,
    (month, year, branch) =>
      `Asset count ${monthName(month)}${year ? ` ${toChristianYear(year)}` : ""} - ${english(branch)}`,
  ],
  [/^ตรวจนับทรัพย์สินประจำเดือน(\S+)$/, (month) => `Monthly asset count, ${monthName(month)}`],
  [/^ตรวจนับทรัพย์สินประจำสาขา (\S+) - (.+)$/, (branch, period) => `Branch asset count ${branch} - ${english(period)}`],
];

function monthName(text: string) {
  return THAI_MONTHS[text] ?? text;
}

// ปี พ.ศ. (เช่น 2569) เป็น ค.ศ. (2026) ถ้าเป็น ค.ศ. อยู่แล้วไม่เปลี่ยน
function toChristianYear(year: string) {
  const value = Number(year);
  return String(value > 2400 ? value - 543 : value);
}

function english(text: string): string {
  const exact = pageTranslations[text] ?? translate(text, "en");
  if (exact !== text || !/[\u0E00-\u0E7F]/.test(text)) return exact;
  for (const [pattern, build] of PATTERNS) {
    const match = text.match(pattern);
    if (match) return build(...match.slice(1));
  }
  return text;
}

export function tx(text: string, ...values: (string | number)[]): string {
  let result = text;
  if (activeLanguage === "en") {
    result = english(text);
  }
  // แทน {0} {1} ... ด้วยค่าที่ส่งมา
  return result.replace(/\{(\d+)\}/g, (match, index: string) =>
    values[Number(index)] === undefined ? match : String(values[Number(index)]),
  );
}

// ตารางป้ายชื่อหรือรายการคงที่ เช่น { pending: "รออนุมัติ" } ให้แปลตอนอ่านค่า (เปลี่ยนภาษาแล้วป้ายเปลี่ยนตาม)
// ใช้ได้ทั้ง object และ array ซ้อนกัน เช่น [{ key: "id", label: "รหัส" }]
const proxyCache = new WeakMap<object, object>();

export function localized<T extends object>(value: T): T {
  const cached = proxyCache.get(value);
  if (cached) return cached as T;
  const proxy = new Proxy(value, {
    get(target, key, receiver) {
      const item = Reflect.get(target, key, receiver);
      // ค่าที่แก้ไม่ได้ (เช่นไอคอน React ที่ถูก freeze) ต้องคืนค่าเดิมตามกติกาของ Proxy
      const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
      if (descriptor && !descriptor.configurable && !descriptor.writable) return item;
      if (item && typeof item === "object" && ("$$typeof" in item || Object.isFrozen(item))) return item;
      if (typeof item === "string") return /[\u0E00-\u0E7F]/.test(item) ? tx(item) : item;
      if (item && typeof item === "object") return localized(item);
      return item;
    },
  });
  proxyCache.set(value, proxy);
  return proxy;
}
