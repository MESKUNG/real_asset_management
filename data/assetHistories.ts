export type AssetHistoryAction =
  | "created"
  | "updated"
  | "status_changed"
  | "assigned"
  | "transferred"
  | "disposed";

export type AssetHistory = {
  id: string;
  assetId: string;
  action: AssetHistoryAction;
  description: string;

  oldValue: string | null;
  newValue: string | null;

  performedBy: number;
  performedAt: string;
};

export const assetHistories: AssetHistory[] = [
  {
    id: "AH-0001",
    assetId: "AST-0001",
    action: "created",
    description: "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    oldValue: null,
    newValue: "MacBook Pro 14”",
    performedBy: 112,
    performedAt: "2026-01-15T09:00:00",
  },
  {
    id: "AH-0002",
    assetId: "AST-0001",
    action: "assigned",
    description: "กำหนดผู้รับผิดชอบทรัพย์สิน",
    oldValue: null,
    newValue: "Staff ID: 101",
    performedBy: 112,
    performedAt: "2026-01-15T10:00:00",
  },
  {
    id: "AH-0003",
    assetId: "AST-0002",
    action: "created",
    description: "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    oldValue: null,
    newValue: "Dell Latitude 5440",
    performedBy: 112,
    performedAt: "2025-08-10T10:00:00",
  },
  {
    id: "AH-0004",
    assetId: "AST-0002",
    action: "status_changed",
    description: "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    oldValue: "available",
    newValue: "borrowed",
    performedBy: 101,
    performedAt: "2026-10-05T13:00:00",
  },
  {
    id: "AH-0005",
    assetId: "AST-0002",
    action: "status_changed",
    description: "เปลี่ยนสถานะทรัพย์สินเป็นพร้อมใช้งาน",
    oldValue: "borrowed",
    newValue: "available",
    performedBy: 112,
    performedAt: "2026-10-08T16:00:00",
  },
  {
    id: "AH-0006",
    assetId: "AST-0003",
    action: "updated",
    description: "แก้ไขรายละเอียดทรัพย์สิน",
    oldValue: "Samsung Monitor 24-inch",
    newValue: "Samsung Monitor 24”",
    performedBy: 112,
    performedAt: "2025-03-05T10:00:00",
  },
  {
    id: "AH-0007",
    assetId: "AST-0003",
    action: "status_changed",
    description: "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    oldValue: "available",
    newValue: "repair",
    performedBy: 102,
    performedAt: "2026-10-21T10:00:00",
  },
  {
    id: "AH-0008",
    assetId: "AST-0004",
    action: "transferred",
    description: "ย้ายทรัพย์สินไปยังสาขาเชียงใหม่",
    oldValue: "BR-001",
    newValue: "BR-002",
    performedBy: 112,
    performedAt: "2026-10-15T10:00:00",
  },
  {
    id: "AH-0009",
    assetId: "AST-0001",
    action: "assigned",
    description: "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    oldValue: "Staff ID: 101",
    newValue: "Staff ID: 103",
    performedBy: 112,
    performedAt: "2026-10-20T09:00:00",
  },
  {
    id: "AH-0010",
    assetId: "AST-0004",
    action: "status_changed",
    description: "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    oldValue: "available",
    newValue: "damaged",
    performedBy: 102,
    performedAt: "2026-10-25T15:00:00",
  },
  {
    id: "AH-0011",
    assetId: "AST-0002",
    action: "status_changed",
    description: "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    oldValue: "available",
    newValue: "borrowed",
    performedBy: 102,
    performedAt: "2026-11-01T10:00:00",
  },
  {
    id: "AH-0012",
    assetId: "AST-0001",
    action: "status_changed",
    description: "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    oldValue: "available",
    newValue: "repair",
    performedBy: 101,
    performedAt: "2026-11-05T13:00:00",
  },
];
