// เก็บสถานะล่าสุดของการดำเนินการจาก Admin แยกตามรายการและผู้รับ
export const USER_ACTION_NOTIFICATIONS_KEY =
  "asset-management-user-action-notifications";
export const USER_ACTION_NOTIFICATIONS_EVENT =
  "asset-management-user-action-notifications-change";

export type UserActionNotificationCategory =
  | "new"
  | "updated"
  | "completed"
  | "rejected"
  | "withdraw"
  | "return"
  | "transfer"
  | "inventory_action"
  | "asset_action";

export type UserActionNotification = {
  key: string;
  id: string;
  recipientId: number;
  category: UserActionNotificationCategory;
  title: string;
  assetName: string;
  branchId: string;
  issue: string;
  reference: string;
  createdAt: string;
  href: string;
};

export type UserActionNotificationInput = Omit<
  UserActionNotification,
  "id" | "createdAt"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUserActionNotification(
  value: unknown,
): value is UserActionNotification {
  return (
    isRecord(value) &&
    typeof value.key === "string" &&
    typeof value.id === "string" &&
    typeof value.recipientId === "number" &&
    Number.isSafeInteger(value.recipientId) &&
    typeof value.category === "string" &&
    typeof value.title === "string" &&
    typeof value.assetName === "string" &&
    typeof value.branchId === "string" &&
    typeof value.issue === "string" &&
    typeof value.reference === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.href === "string"
  );
}

// staff_id ใน credential ใช้ระบุว่า action notification นี้เป็นของ User คนใด
export function getCurrentStaffId(): number | null {
  try {
    const raw = localStorage.getItem("credential");
    if (!raw) return null;

    const credential: unknown = JSON.parse(raw);
    if (
      isRecord(credential) &&
      typeof credential.staff_id === "number" &&
      Number.isSafeInteger(credential.staff_id)
    ) {
      return credential.staff_id;
    }
  } catch (error) {
    console.error("อ่าน Staff ID จาก credential ไม่สำเร็จ:", error);
  }

  return null;
}

export function getUserActionNotificationsSnapshot() {
  try {
    return localStorage.getItem(USER_ACTION_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error("อ่านแจ้งเตือนของ User ไม่สำเร็จ:", error);
    return null;
  }
}

export function getServerUserActionNotificationsSnapshot() {
  return null;
}

// คืนเฉพาะข้อมูลที่ผ่านการตรวจ เพื่อไม่ให้ JSON เสียทำให้หน้าแจ้งเตือนล้ม
export function parseUserActionNotifications(
  snapshot: string | null,
): UserActionNotification[] {
  if (!snapshot) return [];
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (Array.isArray(parsed)) {
      return parsed.filter(isUserActionNotification);
    }
  } catch (error) {
    console.error("แปลงแจ้งเตือนของ User ไม่สำเร็จ:", error);
  }

  return [];
}

// เขียนทับรายการเดิมของ entity เดียวกัน เก็บเฉพาะสถานะล่าสุดและทำให้แจ้งเตือนใหม่ยังไม่อ่าน
export function publishUserActionNotification(
  input: UserActionNotificationInput,
) {
  if (!Number.isSafeInteger(input.recipientId) || input.recipientId <= 0) {
    throw new Error("ไม่พบ Staff ID ของผู้รับการแจ้งเตือน");
  }

  const raw = localStorage.getItem(USER_ACTION_NOTIFICATIONS_KEY);
  let existing: UserActionNotification[] = [];
  if (raw) {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isUserActionNotification)) {
      throw new Error("รูปแบบแจ้งเตือนของ User ใน Local Storage ไม่ถูกต้อง");
    }
    existing = parsed;
  }

  const timestamp = new Date().toISOString();
  const nextNotification: UserActionNotification = {
    ...input,
    id: `${input.key}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    createdAt: timestamp,
  };
  const next = [
    nextNotification,
    ...existing.filter((notification) => notification.key !== input.key),
  ];

  localStorage.setItem(USER_ACTION_NOTIFICATIONS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(USER_ACTION_NOTIFICATIONS_EVENT));
}
