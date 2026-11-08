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
    "id": "AH-0001",
    "assetId": "AST-0001",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "MacBook Pro 14”",
    "performedBy": 112,
    "performedAt": "2026-01-15T09:00:00"
  },
  {
    "id": "AH-0002",
    "assetId": "AST-0001",
    "action": "assigned",
    "description": "กำหนดผู้รับผิดชอบทรัพย์สิน",
    "oldValue": null,
    "newValue": "Staff ID: 101",
    "performedBy": 112,
    "performedAt": "2026-01-15T10:00:00"
  },
  {
    "id": "AH-0003",
    "assetId": "AST-0002",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440",
    "performedBy": 112,
    "performedAt": "2025-08-10T10:00:00"
  },
  {
    "id": "AH-0004",
    "assetId": "AST-0002",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 101,
    "performedAt": "2026-10-05T13:00:00"
  },
  {
    "id": "AH-0005",
    "assetId": "AST-0002",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นพร้อมใช้งาน",
    "oldValue": "borrowed",
    "newValue": "available",
    "performedBy": 112,
    "performedAt": "2026-10-08T16:00:00"
  },
  {
    "id": "AH-0006",
    "assetId": "AST-0003",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Samsung Monitor 24-inch",
    "newValue": "Samsung Monitor 24”",
    "performedBy": 112,
    "performedAt": "2025-03-05T10:00:00"
  },
  {
    "id": "AH-0007",
    "assetId": "AST-0003",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 102,
    "performedAt": "2026-10-21T10:00:00"
  },
  {
    "id": "AH-0008",
    "assetId": "AST-0004",
    "action": "transferred",
    "description": "ย้ายทรัพย์สินไปยังสาขาเชียงใหม่",
    "oldValue": "BR-001",
    "newValue": "BR-002",
    "performedBy": 112,
    "performedAt": "2026-10-15T10:00:00"
  },
  {
    "id": "AH-0009",
    "assetId": "AST-0001",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 103",
    "performedBy": 112,
    "performedAt": "2026-10-20T09:00:00"
  },
  {
    "id": "AH-0010",
    "assetId": "AST-0004",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 102,
    "performedAt": "2026-10-25T15:00:00"
  },
  {
    "id": "AH-0011",
    "assetId": "AST-0002",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 102,
    "performedAt": "2026-11-01T10:00:00"
  },
  {
    "id": "AH-0012",
    "assetId": "AST-0001",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 101,
    "performedAt": "2026-11-05T13:00:00"
  },
  {
    "id": "AH-GEN-0006",
    "assetId": "AST-0006",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 006",
    "performedBy": 101,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-GEN-0007",
    "assetId": "AST-0007",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 007",
    "performedBy": 101,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-GEN-0008",
    "assetId": "AST-0008",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 008",
    "performedBy": 101,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-GEN-0009",
    "assetId": "AST-0009",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 009",
    "performedBy": 101,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-GEN-0010",
    "assetId": "AST-0010",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 010",
    "performedBy": 101,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-GEN-0011",
    "assetId": "AST-0011",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 011",
    "performedBy": 101,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-GEN-0012",
    "assetId": "AST-0012",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 012",
    "performedBy": 101,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-GEN-0013",
    "assetId": "AST-0013",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 013",
    "performedBy": 101,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-GEN-0014",
    "assetId": "AST-0014",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 014",
    "performedBy": 101,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-GEN-0015",
    "assetId": "AST-0015",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 015",
    "performedBy": 101,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-GEN-0016",
    "assetId": "AST-0016",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 016",
    "performedBy": 101,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-GEN-0017",
    "assetId": "AST-0017",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 017",
    "performedBy": 101,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-GEN-0018",
    "assetId": "AST-0018",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 018",
    "performedBy": 101,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-GEN-0019",
    "assetId": "AST-0019",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 019",
    "performedBy": 101,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-GEN-0020",
    "assetId": "AST-0020",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 020",
    "performedBy": 101,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-GEN-0021",
    "assetId": "AST-0021",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 021",
    "performedBy": 101,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-GEN-0022",
    "assetId": "AST-0022",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 022",
    "performedBy": 101,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-GEN-0023",
    "assetId": "AST-0023",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 023",
    "performedBy": 101,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-GEN-0024",
    "assetId": "AST-0024",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 024",
    "performedBy": 101,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-GEN-0025",
    "assetId": "AST-0025",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 025",
    "performedBy": 101,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-GEN-0026",
    "assetId": "AST-0026",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 026",
    "performedBy": 101,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-GEN-0027",
    "assetId": "AST-0027",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 027",
    "performedBy": 101,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-GEN-0028",
    "assetId": "AST-0028",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 028",
    "performedBy": 101,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-GEN-0029",
    "assetId": "AST-0029",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 029",
    "performedBy": 101,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-GEN-0030",
    "assetId": "AST-0030",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 030",
    "performedBy": 101,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-GEN-0031",
    "assetId": "AST-0031",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 031",
    "performedBy": 101,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-GEN-0032",
    "assetId": "AST-0032",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 032",
    "performedBy": 101,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-GEN-0033",
    "assetId": "AST-0033",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 033",
    "performedBy": 101,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-GEN-0034",
    "assetId": "AST-0034",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 034",
    "performedBy": 101,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-GEN-0035",
    "assetId": "AST-0035",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 035",
    "performedBy": 101,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-GEN-0036",
    "assetId": "AST-0036",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 036",
    "performedBy": 101,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-GEN-0037",
    "assetId": "AST-0037",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 037",
    "performedBy": 101,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-GEN-0038",
    "assetId": "AST-0038",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 038",
    "performedBy": 101,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-GEN-0039",
    "assetId": "AST-0039",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 039",
    "performedBy": 101,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-GEN-0040",
    "assetId": "AST-0040",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 040",
    "performedBy": 101,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-GEN-0041",
    "assetId": "AST-0041",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 041",
    "performedBy": 101,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-GEN-0042",
    "assetId": "AST-0042",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 042",
    "performedBy": 101,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-GEN-0043",
    "assetId": "AST-0043",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 043",
    "performedBy": 101,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-GEN-0044",
    "assetId": "AST-0044",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 044",
    "performedBy": 101,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-GEN-0045",
    "assetId": "AST-0045",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 045",
    "performedBy": 101,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-GEN-0046",
    "assetId": "AST-0046",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 046",
    "performedBy": 101,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-GEN-0047",
    "assetId": "AST-0047",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 047",
    "performedBy": 101,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-GEN-0048",
    "assetId": "AST-0048",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 048",
    "performedBy": 101,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-GEN-0049",
    "assetId": "AST-0049",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 049",
    "performedBy": 101,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-GEN-0050",
    "assetId": "AST-0050",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 050",
    "performedBy": 101,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-GEN-0051",
    "assetId": "AST-0051",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 051",
    "performedBy": 101,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-GEN-0052",
    "assetId": "AST-0052",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 052",
    "performedBy": 101,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-GEN-0053",
    "assetId": "AST-0053",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 053",
    "performedBy": 101,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-GEN-0054",
    "assetId": "AST-0054",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 054",
    "performedBy": 101,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-GEN-0055",
    "assetId": "AST-0055",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 055",
    "performedBy": 101,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-GEN-0056",
    "assetId": "AST-0056",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 056",
    "performedBy": 101,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-GEN-0057",
    "assetId": "AST-0057",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 057",
    "performedBy": 101,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-GEN-0058",
    "assetId": "AST-0058",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 058",
    "performedBy": 101,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-GEN-0059",
    "assetId": "AST-0059",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 059",
    "performedBy": 101,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-GEN-0060",
    "assetId": "AST-0060",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 060",
    "performedBy": 101,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-GEN-0061",
    "assetId": "AST-0061",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 061",
    "performedBy": 101,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-GEN-0062",
    "assetId": "AST-0062",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 062",
    "performedBy": 101,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-GEN-0063",
    "assetId": "AST-0063",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 063",
    "performedBy": 101,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-GEN-0064",
    "assetId": "AST-0064",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 064",
    "performedBy": 101,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-GEN-0065",
    "assetId": "AST-0065",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 065",
    "performedBy": 101,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-GEN-0066",
    "assetId": "AST-0066",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 066",
    "performedBy": 101,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-GEN-0067",
    "assetId": "AST-0067",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 067",
    "performedBy": 101,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-GEN-0068",
    "assetId": "AST-0068",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 068",
    "performedBy": 101,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-GEN-0069",
    "assetId": "AST-0069",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 069",
    "performedBy": 101,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-GEN-0070",
    "assetId": "AST-0070",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 070",
    "performedBy": 101,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-GEN-0071",
    "assetId": "AST-0071",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 071",
    "performedBy": 101,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-GEN-0072",
    "assetId": "AST-0072",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 072",
    "performedBy": 101,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-GEN-0073",
    "assetId": "AST-0073",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 073",
    "performedBy": 101,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-GEN-0074",
    "assetId": "AST-0074",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 074",
    "performedBy": 101,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-GEN-0075",
    "assetId": "AST-0075",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 075",
    "performedBy": 101,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-GEN-0076",
    "assetId": "AST-0076",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 076",
    "performedBy": 101,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-GEN-0077",
    "assetId": "AST-0077",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 077",
    "performedBy": 101,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-GEN-0078",
    "assetId": "AST-0078",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 078",
    "performedBy": 101,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-GEN-0079",
    "assetId": "AST-0079",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 079",
    "performedBy": 101,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-GEN-0080",
    "assetId": "AST-0080",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 080",
    "performedBy": 101,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-GEN-0081",
    "assetId": "AST-0081",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 081",
    "performedBy": 101,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-GEN-0082",
    "assetId": "AST-0082",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 082",
    "performedBy": 101,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-GEN-0083",
    "assetId": "AST-0083",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 083",
    "performedBy": 101,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-GEN-0084",
    "assetId": "AST-0084",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 084",
    "performedBy": 101,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-GEN-0085",
    "assetId": "AST-0085",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 085",
    "performedBy": 101,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-GEN-0086",
    "assetId": "AST-0086",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 086",
    "performedBy": 101,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-GEN-0087",
    "assetId": "AST-0087",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 087",
    "performedBy": 101,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-GEN-0088",
    "assetId": "AST-0088",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 088",
    "performedBy": 101,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-GEN-0089",
    "assetId": "AST-0089",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 089",
    "performedBy": 101,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-GEN-0090",
    "assetId": "AST-0090",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 090",
    "performedBy": 101,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-GEN-0091",
    "assetId": "AST-0091",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 091",
    "performedBy": 101,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-GEN-0092",
    "assetId": "AST-0092",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 092",
    "performedBy": 101,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-GEN-0093",
    "assetId": "AST-0093",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 093",
    "performedBy": 101,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-GEN-0094",
    "assetId": "AST-0094",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 094",
    "performedBy": 101,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-GEN-0095",
    "assetId": "AST-0095",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 095",
    "performedBy": 101,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-GEN-0096",
    "assetId": "AST-0096",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 096",
    "performedBy": 101,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-GEN-0097",
    "assetId": "AST-0097",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 097",
    "performedBy": 101,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-GEN-0098",
    "assetId": "AST-0098",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 098",
    "performedBy": 101,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-GEN-0099",
    "assetId": "AST-0099",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 099",
    "performedBy": 101,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-GEN-0100",
    "assetId": "AST-0100",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 100",
    "performedBy": 101,
    "performedAt": "2024-11-01T09:00:00"
  }
];
