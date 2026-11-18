// เก็บรายการแจ้งเตือน และจำว่ารายการไหนถูกอ่านแล้ว ใช้ทั้งในกล่องและหน้าแจ้งเตือน
import { assets } from "@/data/asset";
import {
  repairRequests,
  type RepairRequest,
} from "@/data/repairRequests";

export type NotificationItem = {
  // ข้อมูลที่จะแสดงในแต่ละแจ้งเตือน และคำร้องที่แจ้งเตือนนั้นเกี่ยวข้อง
  id: string;
  title: string;
  assetName: string;
  issue: string;
  reference: string;
  createdAt: string;
  category: "new" | "updated" | "completed" | "rejected";
  request: RepairRequest;
};

export const notificationsStorageKey = "asset-management-read-notifications";
export const notificationsChangedEvent = "asset-management-notifications-change";

// ตอนนี้ตัวอย่างแจ้งเตือนสร้างจากรายการซ่อมใน data/repairRequests.ts
function getNotificationDate(request: RepairRequest) {
  return request.completedAt ?? request.startedAt ?? request.reportedAt;
}

// ใช้วันที่ของสถานะล่าสุดจัดลำดับ และเก็บไว้แสดงไม่เกิน 20 รายการ
const latestRequests = [...repairRequests]
  .filter((request) =>
    ["pending", "in_progress", "completed", "rejected"].includes(request.status),
  )
  .sort((a, b) =>
    getNotificationDate(b).localeCompare(getNotificationDate(a)),
  )
  .slice(0, 20);

export const notifications: NotificationItem[] = latestRequests.map(
  (request) => {
    // หาชื่ออุปกรณ์จากรหัส เพื่อแสดงชื่อให้อ่านง่ายขึ้น
    const asset = assets.find((item) => item.id === request.assetId);
    const category =
      request.status === "pending"
        ? "new"
        : request.status === "in_progress"
          ? "updated"
          : request.status;

    const titleByCategory: Record<NotificationItem["category"], string> = {
      new: "มีคำขอแจ้งซ่อมใหม่",
      updated: "สถานะคำขอได้รับการอัปเดต",
      completed: "ดำเนินการซ่อมเสร็จสิ้น",
      rejected: "คำขอแจ้งซ่อมไม่ได้รับอนุมัติ",
    };

    return {
      id: request.id,
      title: titleByCategory[category],
      assetName: asset?.name ?? request.assetId,
      issue: request.issue,
      reference: request.id,
      createdAt: getNotificationDate(request),
      category,
      request,
    };
  },
);

export const defaultReadNotifications = JSON.stringify(
  // ตอนเปิดครั้งแรก จำลองให้สองรายการล่าสุดยังไม่อ่าน ส่วนที่เหลืออ่านแล้ว
  notifications.slice(2).map(({ id }) => id),
);

// อ่านรายการที่เคยกดแล้ว ถ้าอ่านไม่ได้จะใช้ค่าเริ่มต้นแทน
export function getReadNotificationsSnapshot() {
  try {
    return localStorage.getItem(notificationsStorageKey) ?? defaultReadNotifications;
  } catch (error) {
    console.error("โหลดสถานะการแจ้งเตือนไม่สำเร็จ:", error);
    return defaultReadNotifications;
  }
}

export function getServerReadNotificationsSnapshot() {
  // ตอนเว็บกำลังเริ่มโหลด ให้ใช้ค่าเริ่มต้นก่อน
  return defaultReadNotifications;
}

// คอยอัปเดตหน้าจอเมื่อสถานะอ่านแล้วเปลี่ยน
export function subscribeToNotificationChanges(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(notificationsChangedEvent, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(notificationsChangedEvent, onChange);
  };
}

export function parseReadNotifications(snapshot: string) {
  // อ่านรายการที่บันทึกไว้ ถ้าข้อมูลไม่ถูกต้องจะเริ่มจากไม่มีรายการที่อ่านแล้ว
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (
      Array.isArray(parsed) &&
      parsed.every((id): id is string => typeof id === "string")
    ) {
      return new Set(parsed);
    }
  } catch (error) {
    console.error("อ่านสถานะการแจ้งเตือนไม่สำเร็จ:", error);
  }

  return new Set<string>();
}

export function markNotificationsRead(ids: string[]) {
  // บันทึกว่ารายการที่เลือกอ่านแล้ว โดยเก็บรายการที่เคยอ่านไว้ด้วย
  const alreadyRead = parseReadNotifications(getReadNotificationsSnapshot());
  ids.forEach((id) => alreadyRead.add(id));

  try {
    localStorage.setItem(
      notificationsStorageKey,
      JSON.stringify([...alreadyRead]),
    );
    window.dispatchEvent(new Event(notificationsChangedEvent));
  } catch (error) {
    console.error("บันทึกสถานะการแจ้งเตือนไม่สำเร็จ:", error);
    throw error;
  }
}

export function getNotificationsPath(
  role: unknown,
  status: string,
  requestId: string,
) {
  // เลือกหน้าให้ตรงกับผู้ใช้: Admin ไปหน้าของ Admin, User ไปหน้าของ User
  const isAdmin = ["admin", "president", "superadmin"].includes(
    typeof role === "string" ? role : "",
  );
  const isCompleted = status === "completed";

  const path = isAdmin
    ? isCompleted
      ? "/repair-historyadmin"
      : "/repairsadmin"
    : "/repairsuser";

  return `${path}?requestId=${encodeURIComponent(requestId)}`;
}

export function formatNotificationTime(
  value: string,
  language: "th" | "en" = "th",
) {
  // แสดงเวลาให้อ่านง่าย เช่น "เมื่อ 5 นาทีที่แล้ว"
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "ไม่ทราบเวลา";

  const elapsedSeconds = Math.round((timestamp - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat(
    language === "en" ? "en" : "th",
    { numeric: "auto" },
  );

  for (const [unit, secondsPerUnit] of units) {
    if (Math.abs(elapsedSeconds) >= secondsPerUnit) {
      return formatter.format(
        Math.round(elapsedSeconds / secondsPerUnit),
        unit,
      );
    }
  }

  return language === "en" ? "Just now" : "เมื่อสักครู่";
}
