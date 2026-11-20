// รวมข้อมูลแจ้งเตือนจากหลายส่วน แล้วเลือกว่าผู้ใช้แต่ละบทบาทควรเห็นรายการใด
// ไฟล์นี้ยังจำรายการที่อ่านแล้ว และกำหนดว่ากดแจ้งเตือนแล้วจะเปิดหน้าไหน
import { assets } from "@/data/asset";
import { branches, HEAD_OFFICE_BRANCH_ID } from "@/data/branches";
import { parseAssetRequestsSnapshot } from "@/lib/assetRequests";
import {
  repairRequests,
  type RepairRequest,
} from "@/data/repairRequests";
import { borrowRequests as initialBorrowRequests } from "@/data/borrowRequests";
import { inventorySessions as initialInventorySessions } from "@/data/inventorySessions";
import {
  getCurrentStaffId,
  parseUserActionNotifications,
  USER_ACTION_NOTIFICATIONS_EVENT,
  USER_ACTION_NOTIFICATIONS_KEY,
} from "@/lib/userActionNotifications";

type NotificationCategory =
  | "new"
  | "updated"
  | "completed"
  | "rejected"
  | "withdraw"
  | "return"
  | "transfer"
  | "inventory"
  | "warranty_expired"
  | "warranty_expiring";

export type NotificationItem = {
  // ข้อมูลที่จะแสดงในแต่ละแจ้งเตือน และคำร้องที่แจ้งเตือนนั้นเกี่ยวข้อง
  id: string;
  title: string;
  assetName: string;
  branchName: string;
  branchCode: string;
  issue: string;
  reference: string;
  createdAt: string;
  category: NotificationCategory;
  branchId: string;
  recipientId?: number;
  entityKey?: string;
  // มีเฉพาะคำขอโอนย้าย เพื่อแสดงสาขาปลายทางเพิ่มเติมจากสาขาต้นทาง
  destinationBranchName?: string;
  href: string | null;
  request?: RepairRequest;
};

export const notificationsStorageKey = "asset-management-read-notifications";
export const notificationsChangedEvent = "asset-management-notifications-change";
// รายการ key ที่ใช้ประกอบแจ้งเตือนจากคำขอ, รอบตรวจนับ และข้อมูลทรัพย์สิน
const notificationSourceKeys = [
  "borrowRequests",
  "inventory-store-v3",
  "custom_assets",
  "updated_assets",
  "deleted_assets",
  USER_ACTION_NOTIFICATIONS_KEY,
  "asset-management-asset-requests",
] as const;
const emptyNotificationSourcesSnapshot = JSON.stringify(
  notificationSourceKeys.map(() => null),
);
// แสดงรอบตรวจที่กำลังเริ่มหรือเริ่มใน 7 วัน และประกันที่หมดแล้ว/จะหมดใน 30 วัน
const UPCOMING_INVENTORY_DAYS = 7;
const UPCOMING_WARRANTY_DAYS = 30;

function getNotificationDate(request: RepairRequest) {
  return request.completedAt ?? request.startedAt ?? request.reportedAt;
}

function toNotification(request: RepairRequest): NotificationItem {
  // หาชื่ออุปกรณ์และสาขาจากรหัส เพื่อให้แจ้งเตือนอ่านได้เข้าใจง่าย
  const asset = assets.find((item) => item.id === request.assetId);
  const branch = branches.find((item) => item.id === request.branchId);
  const category: NotificationItem["category"] =
    request.status === "pending"
      ? "new"
      : request.status === "in_progress"
        ? "updated"
        : request.status;
  const titleByCategory: Record<
    Extract<NotificationCategory, "new" | "updated" | "completed" | "rejected">,
    string
  > = {
    new: "มีคำขอแจ้งซ่อมใหม่",
    updated: "สถานะคำขอได้รับการอัปเดต",
    completed: "ดำเนินการซ่อมเสร็จสิ้น",
    rejected: "คำขอแจ้งซ่อมไม่ได้รับอนุมัติ",
  };

  return {
    id: request.id,
    title: titleByCategory[category],
    assetName: asset?.name ?? request.assetId,
    branchName: branch?.name ?? "ไม่ระบุสาขา",
    branchCode: branch?.code ?? request.branchId,
    branchId: request.branchId,
    recipientId: request.reporterId,
    entityKey: `repair:${request.id}`,
    issue: request.issue,
    reference: request.id,
    createdAt: getNotificationDate(request),
    category,
    href: null,
    request,
  };
}

const notificationStatuses = new Set([
  "pending",
  "in_progress",
  "completed",
  "rejected",
]);
const allNotifications = [...repairRequests]
  .filter((request) => notificationStatuses.has(request.status))
  .sort((a, b) =>
    getNotificationDate(b).localeCompare(getNotificationDate(a)),
  )
  .map(toNotification);

export const notifications = allNotifications.slice(0, 20);

// สมัครรับการเปลี่ยนแปลงจากคำขอเบิก, รอบตรวจนับ และรายการทรัพย์สินใน Local Storage
export function subscribeToNotificationSources(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("borrowrequestschange", onChange);
  window.addEventListener("inventorystorechange", onChange);
  window.addEventListener(USER_ACTION_NOTIFICATIONS_EVENT, onChange);
  window.addEventListener("asset-management-asset-requests-change", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("borrowrequestschange", onChange);
    window.removeEventListener("inventorystorechange", onChange);
    window.removeEventListener(USER_ACTION_NOTIFICATIONS_EVENT, onChange);
    window.removeEventListener("asset-management-asset-requests-change", onChange);
  };
}

// อ่านค่าแต่ละ key มารวมเป็น snapshot ให้ useSyncExternalStore ตรวจจับการเปลี่ยนแปลง
export function getNotificationSourcesSnapshot() {
  try {
    return JSON.stringify(
      notificationSourceKeys.map((key) => localStorage.getItem(key)),
    );
  } catch (error) {
    console.error("อ่านข้อมูลการแจ้งเตือนไม่สำเร็จ:", error);
    return emptyNotificationSourcesSnapshot;
  }
}

// ฝั่ง Server ยังอ่าน Local Storage ไม่ได้ จึงเริ่มด้วย snapshot ว่าง
export function getServerNotificationSourcesSnapshot() {
  return emptyNotificationSourcesSnapshot;
}

type StoredNotificationSources = {
  borrowRequests: string | null;
  inventoryStore: string | null;
  customAssets: string | null;
  updatedAssets: string | null;
  deletedAssets: string | null;
  userActionNotifications: string | null;
  assetRequests: string | null;
};

function parseNotificationSources(snapshot: string): StoredNotificationSources {
  // ลำดับข้อมูลต้องตรงกับ notificationSourceKeys เพื่ออ่านค่าแต่ละแหล่งได้ถูกต้อง
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (
      Array.isArray(parsed) &&
      parsed.length === notificationSourceKeys.length &&
      parsed.every((value) => value === null || typeof value === "string")
    ) {
      return {
        borrowRequests: parsed[0],
        inventoryStore: parsed[1],
        customAssets: parsed[2],
        updatedAssets: parsed[3],
        deletedAssets: parsed[4],
        userActionNotifications: parsed[5],
        assetRequests: parsed[6],
      };
    }
  } catch (error) {
    console.error("อ่านข้อมูลต้นทางการแจ้งเตือนไม่สำเร็จ:", error);
  }

  return {
    borrowRequests: null,
    inventoryStore: null,
    customAssets: null,
    updatedAssets: null,
    deletedAssets: null,
    userActionNotifications: null,
    assetRequests: null,
  };
}

type BorrowNotificationRequest = {
  id: string;
  type: "withdraw" | "return" | "transfer";
  assetId: string;
  borrowerId: number;
  branchId: string;
  toBranchId: string | null;
  status: "pending" | "revision" | "approved" | "returned" | "rejected" | "overdue";
  expectedReturnDate: string;
  actualReturnDate: string | null;
  createdAt: string;
  decidedAt?: string;
  submittedByUser?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBorrowNotificationRequest(value: unknown): value is BorrowNotificationRequest {
  // ตรวจ field ที่หน้าการแจ้งเตือนใช้ก่อนนำข้อมูลที่อ่านจาก Local Storage มาแสดง
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    ["withdraw", "return", "transfer"].includes(String(value.type)) &&
    typeof value.assetId === "string" &&
    typeof value.borrowerId === "number" &&
    typeof value.branchId === "string" &&
    (typeof value.toBranchId === "string" || value.toBranchId === null) &&
    ["pending", "revision", "approved", "returned", "rejected", "overdue"].includes(
      String(value.status),
    ) &&
    typeof value.expectedReturnDate === "string" &&
    (typeof value.actualReturnDate === "string" || value.actualReturnDate === null) &&
    typeof value.createdAt === "string" &&
    (value.submittedByUser === undefined ||
      typeof value.submittedByUser === "boolean")
  );
}

function parseStoredValue(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("อ่านข้อมูลแจ้งเตือนจาก Local Storage ไม่สำเร็จ:", error);
    return null;
  }
}

function getBorrowNotifications(
  raw: string | null,
  pendingOnly = false,
): NotificationItem[] {
  const parsed = parseStoredValue(raw);
  // ถ้าไม่เคยบันทึกคำขอ ให้ใช้ข้อมูลตั้งต้นชุดเดียวกับหน้าเบิก/รับคืน
  const requests = raw === null
    ? initialBorrowRequests
    : Array.isArray(parsed)
      ? parsed.filter(isBorrowNotificationRequest)
      : initialBorrowRequests;
  const typeTitles: Record<BorrowNotificationRequest["type"], string> = {
    withdraw: "คำขอเบิกทรัพย์สิน",
    return: "คำขอรับคืนทรัพย์สิน",
    transfer: "คำขอโอนย้ายทรัพย์สิน",
  };
  const statusLabels: Record<BorrowNotificationRequest["status"], string> = {
    pending: "รออนุมัติ",
    revision: "ส่งกลับแก้ไข",
    approved: "อนุมัติแล้ว",
    returned: "คืนแล้ว",
    rejected: "ไม่อนุมัติ",
    overdue: "เกินกำหนดคืน",
  };

  const visibleRequests = pendingOnly
    ? requests.filter(
        (request) =>
          request.status === "pending" && request.submittedByUser === true,
      )
    : requests;

  return visibleRequests.map((request) => {
    const asset = assets.find((item) => item.id === request.assetId);
    const branch = branches.find((item) => item.id === request.branchId);
    const destinationBranch = request.toBranchId
      ? branches.find((item) => item.id === request.toBranchId)
      : undefined;
    const decidedAt =
      "decidedAt" in request && typeof request.decidedAt === "string"
        ? request.decidedAt
        : null;
    // แสดงคำขอรับคืนที่เลยกำหนดเป็น "เกินกำหนดคืน" ให้ตรงกับหน้าคำขอ
    const status =
      request.type === "return" &&
      request.status === "approved" &&
      request.expectedReturnDate < getTodayDate()
        ? "overdue"
        : request.status;

    const createdAt = decidedAt ?? request.actualReturnDate ?? request.createdAt;

    return {
      id: `borrow:${request.id}:${createdAt}`,
      title: typeTitles[request.type],
      assetName: asset?.name ?? request.assetId,
      branchName: branch?.name ?? "ไม่ระบุสาขา",
      branchCode: branch?.code ?? request.branchId,
      branchId: request.branchId,
      recipientId: request.borrowerId,
      entityKey: `borrow:${request.id}`,
      issue: statusLabels[status],
      reference: request.id,
      createdAt,
      category: request.type,
      destinationBranchName: destinationBranch?.name,
      // ส่งรหัสคำขอไปหน้าเบิก/รับคืน เพื่อเปิดรายละเอียดของรายการนี้โดยตรง
      href: `/Borrow?requestId=${encodeURIComponent(request.id)}`,
    };
  });
}

function getAssetRequestNotifications(raw: string | null): NotificationItem[] {
  return parseAssetRequestsSnapshot(raw)
    .filter((request) => request.status === "pending")
    .map((request) => {
      const branch = branches.find((item) => item.id === request.asset.branchId);
      return {
        id: `asset-request:${request.id}`,
        title: "มีคำขอเพิ่มทรัพย์สินใหม่",
        assetName: request.asset.name,
        branchName: branch?.name ?? "ไม่ระบุสาขา",
        branchCode: branch?.code ?? request.asset.branchId,
        branchId: request.asset.branchId,
        recipientId: request.requesterId,
        entityKey: `asset-request:${request.id}`,
        issue: "รออนุมัติ",
        reference: request.id,
        createdAt: request.requestedAt,
        category: "new",
        href: "/assets/add",
      };
    });
}

type InventoryNotificationSession = {
  id: string;
  name: string;
  branchId: string;
  startDate: string;
  endDate: string;
  status: string;
  assigneeId?: number;
};

function isInventoryNotificationSession(value: unknown): value is InventoryNotificationSession {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.branchId === "string" &&
    typeof value.startDate === "string" &&
    typeof value.endDate === "string" &&
    typeof value.status === "string" &&
    (value.assigneeId === undefined ||
      (typeof value.assigneeId === "number" &&
        Number.isSafeInteger(value.assigneeId)))
  );
}

function dateDifferenceInDays(value: string, today: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const valueTime = Date.parse(`${value}T00:00:00Z`);
  const todayTime = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(valueTime) || Number.isNaN(todayTime)) return null;
  return Math.round((valueTime - todayTime) / 86_400_000);
}

function getTodayDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function getInventoryNotifications(raw: string | null): NotificationItem[] {
  const parsed = parseStoredValue(raw);
  const storedSessions = isRecord(parsed) && Array.isArray(parsed.sessions)
    ? parsed.sessions.filter(isInventoryNotificationSession)
    : null;
  const sessions: InventoryNotificationSession[] =
    raw === null || !storedSessions
      ? initialInventorySessions.map((session) => ({ ...session }))
      : storedSessions;
  const today = getTodayDate();
  const lastUpcomingDate = new Date(`${today}T00:00:00Z`);
  lastUpcomingDate.setUTCDate(lastUpcomingDate.getUTCDate() + UPCOMING_INVENTORY_DAYS);
  const lastUpcoming = lastUpcomingDate.toISOString().slice(0, 10);

  // แสดงเฉพาะรอบที่ยังไม่ปิดและกำลังเริ่มหรืออยู่ในช่วง 7 วันข้างหน้า
  return sessions
    .filter(
      (session) =>
        (session.status === "planned" || session.status === "in_progress") &&
        session.startDate <= lastUpcoming &&
        session.endDate >= today,
    )
    .map((session) => {
      const branch = branches.find((item) => item.id === session.branchId);
      return {
        id: `inventory:${session.id}`,
        title: "รอบตรวจนับใกล้ถึงกำหนด",
        assetName: session.name,
        branchName: branch?.name ?? "ไม่ระบุสาขา",
        branchCode: branch?.code ?? session.branchId,
        branchId: session.branchId,
        recipientId: session.assigneeId ?? 0,
        entityKey: `inventory-reminder:${session.id}`,
        issue: `${session.startDate} - ${session.endDate}`,
        reference: session.id,
        createdAt: `${session.startDate}T00:00:00`,
        category: "inventory",
        href: "/inventories",
      };
    });
}

type WarrantyNotificationAsset = {
  id: string;
  name: string;
  branchId: string;
  warrantyEndDate: string;
  status: string;
  responsiblePersonId?: number;
};

function isWarrantyNotificationAsset(value: unknown): value is WarrantyNotificationAsset {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.branchId === "string" &&
    typeof value.warrantyEndDate === "string" &&
    typeof value.status === "string" &&
    (value.responsiblePersonId === undefined ||
      (typeof value.responsiblePersonId === "number" &&
        Number.isSafeInteger(value.responsiblePersonId)))
  );
}

function getWarrantyNotifications(sources: StoredNotificationSources): NotificationItem[] {
  // รวมทรัพย์สินตั้งต้นกับรายการเพิ่ม/แก้ไข แล้วเอารายการที่ลบออกไปออกจากผล
  const assetsById = new Map<string, WarrantyNotificationAsset>(
    assets.map(({ id, name, branchId, warrantyEndDate, status, responsiblePersonId }) => [
      id,
      { id, name, branchId, warrantyEndDate, status, responsiblePersonId },
    ]),
  );
  const customAssets = parseStoredValue(sources.customAssets);
  if (Array.isArray(customAssets)) {
    customAssets.filter(isWarrantyNotificationAsset).forEach((asset) =>
      assetsById.set(asset.id, asset),
    );
  }

  const updatedAssets = parseStoredValue(sources.updatedAssets);
  if (isRecord(updatedAssets)) {
    Object.values(updatedAssets).filter(isWarrantyNotificationAsset).forEach((asset) =>
      assetsById.set(asset.id, asset),
    );
  }

  const deletedAssets = parseStoredValue(sources.deletedAssets);
  if (Array.isArray(deletedAssets)) {
    deletedAssets
      .filter((id): id is string => typeof id === "string")
      .forEach((id) => assetsById.delete(id));
  }

  const today = getTodayDate();
  // ไม่เตือนรายการที่จำหน่ายแล้ว และแยกประกันที่หมดแล้วกับที่กำลังจะหมด
  return [...assetsById.values()].flatMap((asset) => {
    const daysUntilExpiry = dateDifferenceInDays(asset.warrantyEndDate, today);
    if (asset.status === "disposed" || daysUntilExpiry === null) return [];

    const expired = daysUntilExpiry <= 0;
    const expiringSoon =
      daysUntilExpiry > 0 && daysUntilExpiry <= UPCOMING_WARRANTY_DAYS;
    if (!expired && !expiringSoon) return [];

    const branch = branches.find((item) => item.id === asset.branchId);
    return [{
      id: `warranty-${expired ? "expired" : "expiring"}:${asset.id}`,
      title: expired ? "ทรัพย์สินหมดประกันแล้ว" : "ทรัพย์สินใกล้หมดประกัน",
      assetName: asset.name,
      branchName: branch?.name ?? "ไม่ระบุสาขา",
      branchCode: branch?.code ?? asset.branchId,
      branchId: asset.branchId,
      recipientId: asset.responsiblePersonId ?? 0,
      entityKey: `warranty-${expired ? "expired" : "expiring"}:${asset.id}`,
      issue: expired ? "หมดประกัน" : "ใกล้หมดประกัน",
      reference: asset.id,
      createdAt: `${asset.warrantyEndDate}T00:00:00`,
      category: expired ? "warranty_expired" : "warranty_expiring",
      href: `/assets/${encodeURIComponent(asset.id)}`,
    }];
  });
}

function isAdminRole(role: unknown) {
  return ["admin", "president", "superadmin"].includes(
    typeof role === "string" ? role : "",
  );
}

export function getNotificationsForRole(
  role: unknown,
  userRequests: RepairRequest[] = [],
  sourceSnapshot = emptyNotificationSourcesSnapshot,
  staffId: number | null = null,
) {
  // กรองรายการตามบทบาทของบัญชีที่กำลังใช้งาน
  const currentStaffId =
    staffId ?? (role === null ? null : getCurrentStaffId());
  const sources = parseNotificationSources(sourceSnapshot);
  const actionNotifications = role !== "user" || currentStaffId === null
    ? []
    : parseUserActionNotifications(sources.userActionNotifications)
        .filter((notification) => notification.recipientId === currentStaffId)
        .map((notification): NotificationItem => {
          const branch = branches.find((item) => item.id === notification.branchId);
          return {
            ...notification,
            category:
              notification.category === "inventory_action"
                ? "inventory"
                : notification.category === "asset_action"
                  ? "updated"
                  : notification.category,
            branchName: branch?.name ?? "ไม่ระบุสาขา",
            branchCode: branch?.code ?? notification.branchId,
            entityKey: notification.key,
            href: notification.href,
          };
        });
  if (isAdminRole(role)) {
    // กล่อง Admin แสดงเฉพาะคำขอที่รอดำเนินการ ไม่แสดงการเปลี่ยนสถานะที่ Admin ทำเอง
    return [
      ...(role === "president"
        ? []
        : userRequests
            .filter((request) => request.status === "pending")
            .map(toNotification)),
      ...getBorrowNotifications(sources.borrowRequests, true),
      ...(role === "president"
        ? []
        : getAssetRequestNotifications(sources.assetRequests)),
    ]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20);
  }
  if (role !== "user" || currentStaffId === null) return [];

  // User เห็นแจ้งเตือนคำขอหลัง Admin ตอบกลับผ่าน actionNotifications เท่านั้น
  const userNotifications = [
    ...getInventoryNotifications(sources.inventoryStore),
    ...getWarrantyNotifications(sources),
  ];
  const actionEntityKeys = new Set(
    actionNotifications.map((notification) => notification.entityKey),
  );
  const notificationsWithoutSupersededItems = userNotifications.filter(
    (notification) => !notification.entityKey || !actionEntityKeys.has(notification.entityKey),
  );
  const scopedNotifications = [
    ...notificationsWithoutSupersededItems,
    ...actionNotifications,
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return scopedNotifications
    .filter(
      ({ branchId, recipientId }) =>
        recipientId !== undefined
          ? recipientId === currentStaffId
          : branchId === HEAD_OFFICE_BRANCH_ID,
    )
    .slice(0, 20);
}

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

export function getCredentialRoleSnapshot(): string | null {
  try {
    const rawCredential = localStorage.getItem("credential");
    if (!rawCredential) return null;

    const credential: unknown = JSON.parse(rawCredential);
    if (
      typeof credential === "object" &&
      credential !== null &&
      "role" in credential &&
      typeof credential.role === "string"
    ) {
      return credential.role;
    }
  } catch (error) {
    console.error("อ่านข้อมูลบัญชีไม่สำเร็จ:", error);
  }

  return null;
}

export function getServerCredentialRoleSnapshot() {
  return null;
}

export function subscribeToCredentialChanges(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("credentialchange", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
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
  const isCompleted = status === "completed";

  const path = isAdminRole(role)
    ? isCompleted
      ? "/repair-historyadmin"
      : "/repairsadmin"
    : "/repairsuser";

  return `${path}?requestId=${encodeURIComponent(requestId)}`;
}

export function getNotificationHref(role: unknown, notification: NotificationItem) {
  // คำร้องซ่อมใช้หน้าแยกตาม role ส่วนการแจ้งเตือนประเภทอื่นใช้ลิงก์ของตัวเอง
  if (notification.request) {
    return getNotificationsPath(
      role,
      notification.request.status,
      notification.request.id,
    );
  }
  return notification.href ?? "/notifications-center";
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
