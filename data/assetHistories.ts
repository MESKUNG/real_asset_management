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
    "performedBy": 102,
    "performedAt": "2026-01-15T09:00:00"
  },
  {
    "id": "AH-0002",
    "assetId": "AST-0001",
    "action": "assigned",
    "description": "กำหนดผู้รับผิดชอบทรัพย์สิน",
    "oldValue": null,
    "newValue": "Staff ID: 101",
    "performedBy": 102,
    "performedAt": "2026-01-15T10:00:00"
  },
  {
    "id": "AH-0003",
    "assetId": "AST-0002",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440",
    "performedBy": 105,
    "performedAt": "2025-08-10T10:00:00"
  },
  {
    "id": "AH-0004",
    "assetId": "AST-0002",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 105,
    "performedAt": "2026-10-05T13:00:00"
  },
  {
    "id": "AH-0005",
    "assetId": "AST-0002",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นพร้อมใช้งาน",
    "oldValue": "borrowed",
    "newValue": "available",
    "performedBy": 109,
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
    "performedBy": 158,
    "performedAt": "2026-10-21T10:00:00"
  },
  {
    "id": "AH-0008",
    "assetId": "AST-0004",
    "action": "transferred",
    "description": "ย้ายทรัพย์สินไปยังสาขาเชียงใหม่",
    "oldValue": "BR-001",
    "newValue": "BR-002",
    "performedBy": 159,
    "performedAt": "2026-10-15T10:00:00"
  },
  {
    "id": "AH-0009",
    "assetId": "AST-0001",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 103",
    "performedBy": 160,
    "performedAt": "2026-10-20T09:00:00"
  },
  {
    "id": "AH-0010",
    "assetId": "AST-0004",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 161,
    "performedAt": "2026-10-25T15:00:00"
  },
  {
    "id": "AH-0011",
    "assetId": "AST-0002",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 162,
    "performedAt": "2026-11-01T10:00:00"
  },
  {
    "id": "AH-0012",
    "assetId": "AST-0001",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 163,
    "performedAt": "2026-11-05T13:00:00"
  },
  {
    "id": "AH-0101",
    "assetId": "AST-0005",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14",
    "performedBy": 158,
    "performedAt": "2026-05-10T09:00:00"
  },
  {
    "id": "AH-0102",
    "assetId": "AST-0006",
    "action": "assigned",
    "description": "กำหนดผู้รับผิดชอบทรัพย์สิน",
    "oldValue": null,
    "newValue": "Staff ID: 101",
    "performedBy": 164,
    "performedAt": "2024-01-01T10:00:00"
  },
  {
    "id": "AH-0103",
    "assetId": "AST-0010",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Canon Printer 010",
    "newValue": "Canon Printer 010 (ตรวจสภาพแล้ว)",
    "performedBy": 165,
    "performedAt": "2025-05-12T14:30:00"
  },
  {
    "id": "AH-0104",
    "assetId": "AST-0020",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 103",
    "performedBy": 166,
    "performedAt": "2025-08-20T11:00:00"
  },
  {
    "id": "AH-0105",
    "assetId": "AST-0030",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 167,
    "performedAt": "2025-09-03T09:15:00"
  },
  {
    "id": "AH-0106",
    "assetId": "AST-0040",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 168,
    "performedAt": "2025-10-10T16:00:00"
  },
  {
    "id": "AH-0107",
    "assetId": "AST-0030",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นพร้อมใช้งานหลังซ่อม",
    "oldValue": "repair",
    "newValue": "available",
    "performedBy": 169,
    "performedAt": "2025-09-08T15:00:00"
  },
  {
    "id": "AH-0108",
    "assetId": "AST-0040",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นพร้อมใช้งาน",
    "oldValue": "borrowed",
    "newValue": "available",
    "performedBy": 170,
    "performedAt": "2025-10-12T15:00:00"
  },
  {
    "id": "AH-0206",
    "assetId": "AST-0006",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 006",
    "performedBy": 159,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0109",
    "assetId": "AST-0007",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 007",
    "performedBy": 160,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0110",
    "assetId": "AST-0008",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 008",
    "performedBy": 161,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-0111",
    "assetId": "AST-0009",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 009",
    "performedBy": 162,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0112",
    "assetId": "AST-0010",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 010",
    "performedBy": 163,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-0113",
    "assetId": "AST-0011",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 011",
    "performedBy": 164,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-0114",
    "assetId": "AST-0012",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 012",
    "performedBy": 165,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-0115",
    "assetId": "AST-0013",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 013",
    "performedBy": 166,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-0116",
    "assetId": "AST-0014",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 014",
    "performedBy": 167,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-0117",
    "assetId": "AST-0015",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 015",
    "performedBy": 168,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-0118",
    "assetId": "AST-0016",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 016",
    "performedBy": 169,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-0119",
    "assetId": "AST-0017",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 017",
    "performedBy": 170,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-0120",
    "assetId": "AST-0018",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 018",
    "performedBy": 171,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0121",
    "assetId": "AST-0019",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 019",
    "performedBy": 172,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0122",
    "assetId": "AST-0020",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 020",
    "performedBy": 173,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-0123",
    "assetId": "AST-0021",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 021",
    "performedBy": 102,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0124",
    "assetId": "AST-0022",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 022",
    "performedBy": 105,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-0125",
    "assetId": "AST-0023",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 023",
    "performedBy": 109,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-0126",
    "assetId": "AST-0024",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 024",
    "performedBy": 112,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-0127",
    "assetId": "AST-0025",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 025",
    "performedBy": 158,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-0128",
    "assetId": "AST-0026",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 026",
    "performedBy": 159,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-0129",
    "assetId": "AST-0027",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 027",
    "performedBy": 160,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-0130",
    "assetId": "AST-0028",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 028",
    "performedBy": 161,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-0131",
    "assetId": "AST-0029",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 029",
    "performedBy": 162,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-0132",
    "assetId": "AST-0030",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 030",
    "performedBy": 163,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0133",
    "assetId": "AST-0031",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 031",
    "performedBy": 164,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0134",
    "assetId": "AST-0032",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 032",
    "performedBy": 165,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-0135",
    "assetId": "AST-0033",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 033",
    "performedBy": 166,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0136",
    "assetId": "AST-0034",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 034",
    "performedBy": 167,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-0137",
    "assetId": "AST-0035",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 035",
    "performedBy": 168,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-0138",
    "assetId": "AST-0036",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 036",
    "performedBy": 169,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-0139",
    "assetId": "AST-0037",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 037",
    "performedBy": 170,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-0140",
    "assetId": "AST-0038",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 038",
    "performedBy": 171,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-0141",
    "assetId": "AST-0039",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 039",
    "performedBy": 172,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-0142",
    "assetId": "AST-0040",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 040",
    "performedBy": 173,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-0143",
    "assetId": "AST-0041",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 041",
    "performedBy": 102,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-0144",
    "assetId": "AST-0042",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 042",
    "performedBy": 105,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0145",
    "assetId": "AST-0043",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 043",
    "performedBy": 109,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0146",
    "assetId": "AST-0044",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 044",
    "performedBy": 112,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-0147",
    "assetId": "AST-0045",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 045",
    "performedBy": 158,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0148",
    "assetId": "AST-0046",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 046",
    "performedBy": 159,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-0149",
    "assetId": "AST-0047",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 047",
    "performedBy": 160,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-0150",
    "assetId": "AST-0048",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 048",
    "performedBy": 161,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-0151",
    "assetId": "AST-0049",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 049",
    "performedBy": 162,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-0152",
    "assetId": "AST-0050",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 050",
    "performedBy": 163,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-0153",
    "assetId": "AST-0051",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 051",
    "performedBy": 164,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-0154",
    "assetId": "AST-0052",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 052",
    "performedBy": 165,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-0155",
    "assetId": "AST-0053",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 053",
    "performedBy": 166,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-0156",
    "assetId": "AST-0054",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 054",
    "performedBy": 167,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0157",
    "assetId": "AST-0055",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 055",
    "performedBy": 168,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0158",
    "assetId": "AST-0056",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 056",
    "performedBy": 169,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-0159",
    "assetId": "AST-0057",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 057",
    "performedBy": 170,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0160",
    "assetId": "AST-0058",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 058",
    "performedBy": 171,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-0161",
    "assetId": "AST-0059",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 059",
    "performedBy": 172,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-0162",
    "assetId": "AST-0060",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 060",
    "performedBy": 173,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-0163",
    "assetId": "AST-0061",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 061",
    "performedBy": 102,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-0164",
    "assetId": "AST-0062",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 062",
    "performedBy": 105,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-0165",
    "assetId": "AST-0063",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 063",
    "performedBy": 109,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-0166",
    "assetId": "AST-0064",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 064",
    "performedBy": 112,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-0167",
    "assetId": "AST-0065",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 065",
    "performedBy": 158,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-0168",
    "assetId": "AST-0066",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 066",
    "performedBy": 159,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0169",
    "assetId": "AST-0067",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 067",
    "performedBy": 160,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0170",
    "assetId": "AST-0068",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 068",
    "performedBy": 161,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-0171",
    "assetId": "AST-0069",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 069",
    "performedBy": 162,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0172",
    "assetId": "AST-0070",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 070",
    "performedBy": 163,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-0173",
    "assetId": "AST-0071",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 071",
    "performedBy": 164,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-0174",
    "assetId": "AST-0072",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 072",
    "performedBy": 165,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-0175",
    "assetId": "AST-0073",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 073",
    "performedBy": 166,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-0176",
    "assetId": "AST-0074",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 074",
    "performedBy": 167,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-0177",
    "assetId": "AST-0075",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 075",
    "performedBy": 168,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-0178",
    "assetId": "AST-0076",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 076",
    "performedBy": 169,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-0179",
    "assetId": "AST-0077",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 077",
    "performedBy": 170,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-0180",
    "assetId": "AST-0078",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 078",
    "performedBy": 171,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0181",
    "assetId": "AST-0079",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 079",
    "performedBy": 172,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0182",
    "assetId": "AST-0080",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 080",
    "performedBy": 173,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-0183",
    "assetId": "AST-0081",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 081",
    "performedBy": 102,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0184",
    "assetId": "AST-0082",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 082",
    "performedBy": 105,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-0185",
    "assetId": "AST-0083",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 083",
    "performedBy": 109,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-0186",
    "assetId": "AST-0084",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 084",
    "performedBy": 112,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-0187",
    "assetId": "AST-0085",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 085",
    "performedBy": 158,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-0188",
    "assetId": "AST-0086",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 086",
    "performedBy": 159,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-0189",
    "assetId": "AST-0087",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 087",
    "performedBy": 160,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-0190",
    "assetId": "AST-0088",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 088",
    "performedBy": 161,
    "performedAt": "2024-11-01T09:00:00"
  },
  {
    "id": "AH-0191",
    "assetId": "AST-0089",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 089",
    "performedBy": 162,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-0192",
    "assetId": "AST-0090",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 090",
    "performedBy": 163,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0193",
    "assetId": "AST-0091",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 091",
    "performedBy": 164,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0194",
    "assetId": "AST-0092",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 092",
    "performedBy": 165,
    "performedAt": "2024-03-01T09:00:00"
  },
  {
    "id": "AH-0195",
    "assetId": "AST-0093",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Office Desk 093",
    "performedBy": 166,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0196",
    "assetId": "AST-0094",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Lenovo ThinkPad E14 094",
    "performedBy": 167,
    "performedAt": "2024-05-01T09:00:00"
  },
  {
    "id": "AH-0197",
    "assetId": "AST-0095",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP ProBook 440 095",
    "performedBy": 168,
    "performedAt": "2024-06-01T09:00:00"
  },
  {
    "id": "AH-0198",
    "assetId": "AST-0096",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Dell Latitude 5440 096",
    "performedBy": 169,
    "performedAt": "2024-07-01T09:00:00"
  },
  {
    "id": "AH-0199",
    "assetId": "AST-0097",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24-inch 097",
    "performedBy": 170,
    "performedAt": "2024-08-01T09:00:00"
  },
  {
    "id": "AH-0200",
    "assetId": "AST-0098",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer 098",
    "performedBy": 171,
    "performedAt": "2024-09-01T09:00:00"
  },
  {
    "id": "AH-0201",
    "assetId": "AST-0099",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "HP LaserJet Pro 099",
    "performedBy": 172,
    "performedAt": "2024-10-01T09:00:00"
  },
  {
    "id": "AH-0202",
    "assetId": "AST-0100",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Cisco Network Switch 100",
    "performedBy": 173,
    "performedAt": "2024-11-01T09:00:00"
  }
,
  {
    "id": "AH-0301",
    "assetId": "AST-0006",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 102,
    "performedAt": "2025-01-01T10:00:00"
  },
  {
    "id": "AH-0302",
    "assetId": "AST-0007",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 105,
    "performedAt": "2025-01-02T10:00:00"
  },
  {
    "id": "AH-0303",
    "assetId": "AST-0008",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 109,
    "performedAt": "2025-01-03T10:00:00"
  },
  {
    "id": "AH-0304",
    "assetId": "AST-0009",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 112,
    "performedAt": "2025-01-04T10:00:00"
  },
  {
    "id": "AH-0305",
    "assetId": "AST-0010",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 158,
    "performedAt": "2025-01-05T10:00:00"
  },
  {
    "id": "AH-0306",
    "assetId": "AST-0011",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 159,
    "performedAt": "2025-01-06T10:00:00"
  },
  {
    "id": "AH-0307",
    "assetId": "AST-0012",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 160,
    "performedAt": "2025-01-07T10:00:00"
  },
  {
    "id": "AH-0308",
    "assetId": "AST-0013",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 161,
    "performedAt": "2025-01-08T10:00:00"
  },
  {
    "id": "AH-0309",
    "assetId": "AST-0014",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 162,
    "performedAt": "2025-01-09T10:00:00"
  },
  {
    "id": "AH-0310",
    "assetId": "AST-0015",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 163,
    "performedAt": "2025-01-10T10:00:00"
  },
  {
    "id": "AH-0311",
    "assetId": "AST-0016",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 164,
    "performedAt": "2025-01-11T10:00:00"
  },
  {
    "id": "AH-0312",
    "assetId": "AST-0017",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 165,
    "performedAt": "2025-01-12T10:00:00"
  },
  {
    "id": "AH-0313",
    "assetId": "AST-0018",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 166,
    "performedAt": "2025-01-13T10:00:00"
  },
  {
    "id": "AH-0314",
    "assetId": "AST-0019",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 167,
    "performedAt": "2025-01-14T10:00:00"
  },
  {
    "id": "AH-0315",
    "assetId": "AST-0020",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 168,
    "performedAt": "2025-01-15T10:00:00"
  },
  {
    "id": "AH-0316",
    "assetId": "AST-0021",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 169,
    "performedAt": "2025-01-16T10:00:00"
  },
  {
    "id": "AH-0317",
    "assetId": "AST-0022",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 170,
    "performedAt": "2025-01-17T10:00:00"
  },
  {
    "id": "AH-0318",
    "assetId": "AST-0023",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 171,
    "performedAt": "2025-01-18T10:00:00"
  },
  {
    "id": "AH-0319",
    "assetId": "AST-0024",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 172,
    "performedAt": "2025-01-19T10:00:00"
  },
  {
    "id": "AH-0320",
    "assetId": "AST-0025",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 173,
    "performedAt": "2025-01-20T10:00:00"
  },
  {
    "id": "AH-0321",
    "assetId": "AST-0026",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 102,
    "performedAt": "2025-01-21T10:00:00"
  },
  {
    "id": "AH-0322",
    "assetId": "AST-0027",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 105,
    "performedAt": "2025-01-22T10:00:00"
  },
  {
    "id": "AH-0323",
    "assetId": "AST-0028",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 109,
    "performedAt": "2025-01-23T10:00:00"
  },
  {
    "id": "AH-0324",
    "assetId": "AST-0029",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 112,
    "performedAt": "2025-01-24T10:00:00"
  },
  {
    "id": "AH-0325",
    "assetId": "AST-0030",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 158,
    "performedAt": "2025-01-25T10:00:00"
  },
  {
    "id": "AH-0326",
    "assetId": "AST-0031",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 159,
    "performedAt": "2025-01-26T10:00:00"
  },
  {
    "id": "AH-0327",
    "assetId": "AST-0032",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 160,
    "performedAt": "2025-01-27T10:00:00"
  },
  {
    "id": "AH-0328",
    "assetId": "AST-0033",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 161,
    "performedAt": "2025-01-28T10:00:00"
  },
  {
    "id": "AH-0329",
    "assetId": "AST-0034",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 162,
    "performedAt": "2025-02-01T10:00:00"
  },
  {
    "id": "AH-0330",
    "assetId": "AST-0035",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 163,
    "performedAt": "2025-02-02T10:00:00"
  },
  {
    "id": "AH-0331",
    "assetId": "AST-0036",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 164,
    "performedAt": "2025-02-03T10:00:00"
  },
  {
    "id": "AH-0332",
    "assetId": "AST-0037",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 165,
    "performedAt": "2025-02-04T10:00:00"
  },
  {
    "id": "AH-0333",
    "assetId": "AST-0038",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 166,
    "performedAt": "2025-02-05T10:00:00"
  },
  {
    "id": "AH-0334",
    "assetId": "AST-0039",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 167,
    "performedAt": "2025-02-06T10:00:00"
  },
  {
    "id": "AH-0335",
    "assetId": "AST-0040",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 168,
    "performedAt": "2025-02-07T10:00:00"
  },
  {
    "id": "AH-0336",
    "assetId": "AST-0041",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 169,
    "performedAt": "2025-02-08T10:00:00"
  },
  {
    "id": "AH-0337",
    "assetId": "AST-0042",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 170,
    "performedAt": "2025-02-09T10:00:00"
  },
  {
    "id": "AH-0338",
    "assetId": "AST-0043",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 171,
    "performedAt": "2025-02-10T10:00:00"
  },
  {
    "id": "AH-0339",
    "assetId": "AST-0044",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 172,
    "performedAt": "2025-02-11T10:00:00"
  },
  {
    "id": "AH-0340",
    "assetId": "AST-0045",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 173,
    "performedAt": "2025-02-12T10:00:00"
  },
  {
    "id": "AH-0341",
    "assetId": "AST-0046",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 102,
    "performedAt": "2025-02-13T10:00:00"
  },
  {
    "id": "AH-0342",
    "assetId": "AST-0047",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2025-02-14T10:00:00"
  },
  {
    "id": "AH-0343",
    "assetId": "AST-0048",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 109,
    "performedAt": "2025-02-15T10:00:00"
  },
  {
    "id": "AH-0344",
    "assetId": "AST-0049",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 112,
    "performedAt": "2025-02-16T10:00:00"
  },
  {
    "id": "AH-0345",
    "assetId": "AST-0050",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 158,
    "performedAt": "2025-02-17T10:00:00"
  },
  {
    "id": "AH-0346",
    "assetId": "AST-0051",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 159,
    "performedAt": "2025-02-18T10:00:00"
  },
  {
    "id": "AH-0347",
    "assetId": "AST-0101",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 101",
    "performedBy": 102,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0348",
    "assetId": "AST-0102",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 102",
    "performedBy": 105,
    "performedAt": "2024-01-08T09:00:00"
  },
  {
    "id": "AH-0349",
    "assetId": "AST-0103",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 103",
    "performedBy": 109,
    "performedAt": "2024-01-15T09:00:00"
  },
  {
    "id": "AH-0350",
    "assetId": "AST-0104",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 104",
    "performedBy": 112,
    "performedAt": "2024-02-22T09:00:00"
  },
  {
    "id": "AH-0351",
    "assetId": "AST-0104",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 112,
    "performedAt": "2026-09-04T15:00:00"
  },
  {
    "id": "AH-0352",
    "assetId": "AST-0105",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 105",
    "performedBy": 158,
    "performedAt": "2024-02-04T09:00:00"
  },
  {
    "id": "AH-0353",
    "assetId": "AST-0105",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 158,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0354",
    "assetId": "AST-0106",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 106",
    "performedBy": 159,
    "performedAt": "2024-02-11T09:00:00"
  },
  {
    "id": "AH-0355",
    "assetId": "AST-0106",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 159,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0356",
    "assetId": "AST-0107",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 107",
    "performedBy": 160,
    "performedAt": "2024-03-18T09:00:00"
  },
  {
    "id": "AH-0357",
    "assetId": "AST-0107",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 160,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0358",
    "assetId": "AST-0108",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 108",
    "performedBy": 161,
    "performedAt": "2024-03-25T09:00:00"
  },
  {
    "id": "AH-0359",
    "assetId": "AST-0108",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 161,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0360",
    "assetId": "AST-0109",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 109",
    "performedBy": 162,
    "performedAt": "2024-03-07T09:00:00"
  },
  {
    "id": "AH-0361",
    "assetId": "AST-0109",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 162,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0362",
    "assetId": "AST-0110",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 110",
    "performedBy": 163,
    "performedAt": "2024-04-14T09:00:00"
  },
  {
    "id": "AH-0363",
    "assetId": "AST-0110",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 163,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0364",
    "assetId": "AST-0111",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 111",
    "performedBy": 164,
    "performedAt": "2024-04-21T09:00:00"
  },
  {
    "id": "AH-0365",
    "assetId": "AST-0111",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 164,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0366",
    "assetId": "AST-0112",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 112",
    "performedBy": 165,
    "performedAt": "2024-04-03T09:00:00"
  },
  {
    "id": "AH-0367",
    "assetId": "AST-0112",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 165,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0368",
    "assetId": "AST-0113",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 113",
    "performedBy": 166,
    "performedAt": "2025-05-10T09:00:00"
  },
  {
    "id": "AH-0369",
    "assetId": "AST-0113",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 166,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0370",
    "assetId": "AST-0114",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 114",
    "performedBy": 167,
    "performedAt": "2025-05-17T09:00:00"
  },
  {
    "id": "AH-0371",
    "assetId": "AST-0114",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 167,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0372",
    "assetId": "AST-0115",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 115",
    "performedBy": 168,
    "performedAt": "2025-05-24T09:00:00"
  },
  {
    "id": "AH-0373",
    "assetId": "AST-0115",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 168,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0374",
    "assetId": "AST-0116",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 116",
    "performedBy": 169,
    "performedAt": "2025-06-06T09:00:00"
  },
  {
    "id": "AH-0375",
    "assetId": "AST-0116",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 169,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0376",
    "assetId": "AST-0117",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 117",
    "performedBy": 170,
    "performedAt": "2025-06-13T09:00:00"
  },
  {
    "id": "AH-0377",
    "assetId": "AST-0117",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 170,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0378",
    "assetId": "AST-0118",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 118",
    "performedBy": 171,
    "performedAt": "2025-06-20T09:00:00"
  },
  {
    "id": "AH-0379",
    "assetId": "AST-0118",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 171,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0380",
    "assetId": "AST-0119",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 119",
    "performedBy": 172,
    "performedAt": "2025-07-02T09:00:00"
  },
  {
    "id": "AH-0381",
    "assetId": "AST-0119",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 172,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0382",
    "assetId": "AST-0120",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 120",
    "performedBy": 173,
    "performedAt": "2025-07-09T09:00:00"
  },
  {
    "id": "AH-0383",
    "assetId": "AST-0120",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 173,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0384",
    "assetId": "AST-0121",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 121",
    "performedBy": 102,
    "performedAt": "2025-07-16T09:00:00"
  },
  {
    "id": "AH-0385",
    "assetId": "AST-0121",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 102,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0386",
    "assetId": "AST-0122",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 122",
    "performedBy": 105,
    "performedAt": "2025-08-23T09:00:00"
  },
  {
    "id": "AH-0387",
    "assetId": "AST-0122",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0388",
    "assetId": "AST-0123",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 123",
    "performedBy": 109,
    "performedAt": "2025-08-05T09:00:00"
  },
  {
    "id": "AH-0389",
    "assetId": "AST-0123",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 109,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0390",
    "assetId": "AST-0124",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 124",
    "performedBy": 112,
    "performedAt": "2025-08-12T09:00:00"
  },
  {
    "id": "AH-0391",
    "assetId": "AST-0125",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 125",
    "performedBy": 158,
    "performedAt": "2026-09-19T09:00:00"
  },
  {
    "id": "AH-0392",
    "assetId": "AST-0125",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 158,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0393",
    "assetId": "AST-0126",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 126",
    "performedBy": 159,
    "performedAt": "2026-09-01T09:00:00"
  },
  {
    "id": "AH-0394",
    "assetId": "AST-0126",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 159,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-0395",
    "assetId": "AST-0127",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 127",
    "performedBy": 160,
    "performedAt": "2026-09-08T09:00:00"
  },
  {
    "id": "AH-0396",
    "assetId": "AST-0128",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 128",
    "performedBy": 161,
    "performedAt": "2026-10-15T09:00:00"
  },
  {
    "id": "AH-0397",
    "assetId": "AST-0129",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 129",
    "performedBy": 162,
    "performedAt": "2026-10-22T09:00:00"
  },
  {
    "id": "AH-0398",
    "assetId": "AST-0129",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 162,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0399",
    "assetId": "AST-0130",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 130",
    "performedBy": 163,
    "performedAt": "2026-10-04T09:00:00"
  },
  {
    "id": "AH-0400",
    "assetId": "AST-0130",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 163,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0401",
    "assetId": "AST-0131",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 131",
    "performedBy": 164,
    "performedAt": "2026-11-11T09:00:00"
  },
  {
    "id": "AH-0402",
    "assetId": "AST-0131",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 164,
    "performedAt": "2026-09-04T15:00:00"
  },
  {
    "id": "AH-0403",
    "assetId": "AST-0132",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 132",
    "performedBy": 165,
    "performedAt": "2025-08-05T09:00:00"
  },
  {
    "id": "AH-0404",
    "assetId": "AST-0132",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 165,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0405",
    "assetId": "AST-0133",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 133",
    "performedBy": 166,
    "performedAt": "2025-08-18T09:00:00"
  },
  {
    "id": "AH-0406",
    "assetId": "AST-0133",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 166,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0407",
    "assetId": "AST-0134",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 134",
    "performedBy": 167,
    "performedAt": "2024-01-07T09:00:00"
  },
  {
    "id": "AH-0408",
    "assetId": "AST-0135",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 135",
    "performedBy": 168,
    "performedAt": "2024-01-14T09:00:00"
  },
  {
    "id": "AH-0409",
    "assetId": "AST-0135",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 168,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0410",
    "assetId": "AST-0136",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 136",
    "performedBy": 169,
    "performedAt": "2024-01-21T09:00:00"
  },
  {
    "id": "AH-0411",
    "assetId": "AST-0137",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 137",
    "performedBy": 170,
    "performedAt": "2024-02-03T09:00:00"
  },
  {
    "id": "AH-0412",
    "assetId": "AST-0137",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 170,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0413",
    "assetId": "AST-0138",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 138",
    "performedBy": 171,
    "performedAt": "2024-02-10T09:00:00"
  },
  {
    "id": "AH-0414",
    "assetId": "AST-0138",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 171,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0415",
    "assetId": "AST-0139",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 139",
    "performedBy": 172,
    "performedAt": "2024-02-17T09:00:00"
  },
  {
    "id": "AH-0416",
    "assetId": "AST-0140",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 140",
    "performedBy": 173,
    "performedAt": "2024-03-24T09:00:00"
  },
  {
    "id": "AH-0417",
    "assetId": "AST-0140",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 173,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0418",
    "assetId": "AST-0141",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 141",
    "performedBy": 102,
    "performedAt": "2024-03-06T09:00:00"
  },
  {
    "id": "AH-0419",
    "assetId": "AST-0141",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 102,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0420",
    "assetId": "AST-0142",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 142",
    "performedBy": 105,
    "performedAt": "2024-03-13T09:00:00"
  },
  {
    "id": "AH-0421",
    "assetId": "AST-0142",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0422",
    "assetId": "AST-0143",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 143",
    "performedBy": 109,
    "performedAt": "2024-04-20T09:00:00"
  },
  {
    "id": "AH-0423",
    "assetId": "AST-0143",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 109,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0424",
    "assetId": "AST-0144",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 144",
    "performedBy": 112,
    "performedAt": "2024-04-02T09:00:00"
  },
  {
    "id": "AH-0425",
    "assetId": "AST-0144",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 112,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0426",
    "assetId": "AST-0145",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 145",
    "performedBy": 158,
    "performedAt": "2024-04-09T09:00:00"
  },
  {
    "id": "AH-0427",
    "assetId": "AST-0145",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 158,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0428",
    "assetId": "AST-0146",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 146",
    "performedBy": 159,
    "performedAt": "2025-05-16T09:00:00"
  },
  {
    "id": "AH-0429",
    "assetId": "AST-0146",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 159,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0430",
    "assetId": "AST-0147",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 147",
    "performedBy": 160,
    "performedAt": "2025-05-23T09:00:00"
  },
  {
    "id": "AH-0431",
    "assetId": "AST-0148",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 148",
    "performedBy": 161,
    "performedAt": "2025-05-05T09:00:00"
  },
  {
    "id": "AH-0432",
    "assetId": "AST-0148",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 161,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0433",
    "assetId": "AST-0149",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 149",
    "performedBy": 162,
    "performedAt": "2025-06-12T09:00:00"
  },
  {
    "id": "AH-0434",
    "assetId": "AST-0149",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 162,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0435",
    "assetId": "AST-0150",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 150",
    "performedBy": 163,
    "performedAt": "2025-06-19T09:00:00"
  },
  {
    "id": "AH-0436",
    "assetId": "AST-0151",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 151",
    "performedBy": 164,
    "performedAt": "2025-06-01T09:00:00"
  },
  {
    "id": "AH-0437",
    "assetId": "AST-0151",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 164,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-0438",
    "assetId": "AST-0152",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 152",
    "performedBy": 165,
    "performedAt": "2025-07-08T09:00:00"
  },
  {
    "id": "AH-0439",
    "assetId": "AST-0153",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 153",
    "performedBy": 166,
    "performedAt": "2025-07-15T09:00:00"
  },
  {
    "id": "AH-0440",
    "assetId": "AST-0153",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 166,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-0441",
    "assetId": "AST-0154",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 154",
    "performedBy": 167,
    "performedAt": "2025-07-22T09:00:00"
  },
  {
    "id": "AH-0442",
    "assetId": "AST-0154",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 167,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0443",
    "assetId": "AST-0155",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 155",
    "performedBy": 168,
    "performedAt": "2025-08-04T09:00:00"
  },
  {
    "id": "AH-0444",
    "assetId": "AST-0155",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 168,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0445",
    "assetId": "AST-0156",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 156",
    "performedBy": 169,
    "performedAt": "2025-08-11T09:00:00"
  },
  {
    "id": "AH-0446",
    "assetId": "AST-0156",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 169,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0447",
    "assetId": "AST-0157",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 157",
    "performedBy": 170,
    "performedAt": "2025-08-18T09:00:00"
  },
  {
    "id": "AH-0448",
    "assetId": "AST-0157",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0449",
    "assetId": "AST-0158",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 158",
    "performedBy": 171,
    "performedAt": "2026-09-25T09:00:00"
  },
  {
    "id": "AH-0450",
    "assetId": "AST-0159",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 159",
    "performedBy": 172,
    "performedAt": "2026-09-07T09:00:00"
  },
  {
    "id": "AH-0451",
    "assetId": "AST-0159",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 172,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0452",
    "assetId": "AST-0160",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 160",
    "performedBy": 173,
    "performedAt": "2026-09-14T09:00:00"
  },
  {
    "id": "AH-0453",
    "assetId": "AST-0160",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 173,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0454",
    "assetId": "AST-0161",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 161",
    "performedBy": 102,
    "performedAt": "2026-10-21T09:00:00"
  },
  {
    "id": "AH-0455",
    "assetId": "AST-0161",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 102,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0456",
    "assetId": "AST-0162",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 162",
    "performedBy": 105,
    "performedAt": "2026-10-03T09:00:00"
  },
  {
    "id": "AH-0457",
    "assetId": "AST-0162",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 105,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0458",
    "assetId": "AST-0163",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 163",
    "performedBy": 109,
    "performedAt": "2026-10-10T09:00:00"
  },
  {
    "id": "AH-0459",
    "assetId": "AST-0163",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 109,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0460",
    "assetId": "AST-0164",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 164",
    "performedBy": 112,
    "performedAt": "2026-11-17T09:00:00"
  },
  {
    "id": "AH-0461",
    "assetId": "AST-0165",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 165",
    "performedBy": 158,
    "performedAt": "2025-05-26T09:00:00"
  },
  {
    "id": "AH-0462",
    "assetId": "AST-0165",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 158,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0463",
    "assetId": "AST-0166",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 166",
    "performedBy": 159,
    "performedAt": "2026-11-06T09:00:00"
  },
  {
    "id": "AH-0464",
    "assetId": "AST-0166",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 159,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0465",
    "assetId": "AST-0167",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 167",
    "performedBy": 160,
    "performedAt": "2024-01-13T09:00:00"
  },
  {
    "id": "AH-0466",
    "assetId": "AST-0167",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 160,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0467",
    "assetId": "AST-0168",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 168",
    "performedBy": 161,
    "performedAt": "2024-01-20T09:00:00"
  },
  {
    "id": "AH-0468",
    "assetId": "AST-0168",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 161,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0469",
    "assetId": "AST-0169",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 169",
    "performedBy": 162,
    "performedAt": "2024-01-02T09:00:00"
  },
  {
    "id": "AH-0470",
    "assetId": "AST-0169",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 162,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0471",
    "assetId": "AST-0170",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 170",
    "performedBy": 163,
    "performedAt": "2024-02-09T09:00:00"
  },
  {
    "id": "AH-0472",
    "assetId": "AST-0170",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 163,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0473",
    "assetId": "AST-0171",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 171",
    "performedBy": 164,
    "performedAt": "2024-02-16T09:00:00"
  },
  {
    "id": "AH-0474",
    "assetId": "AST-0171",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 164,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0475",
    "assetId": "AST-0172",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 172",
    "performedBy": 165,
    "performedAt": "2024-02-23T09:00:00"
  },
  {
    "id": "AH-0476",
    "assetId": "AST-0172",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 165,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0477",
    "assetId": "AST-0173",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 173",
    "performedBy": 166,
    "performedAt": "2024-03-05T09:00:00"
  },
  {
    "id": "AH-0478",
    "assetId": "AST-0173",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 166,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0479",
    "assetId": "AST-0174",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 174",
    "performedBy": 167,
    "performedAt": "2024-03-12T09:00:00"
  },
  {
    "id": "AH-0480",
    "assetId": "AST-0174",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 167,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0481",
    "assetId": "AST-0175",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 175",
    "performedBy": 168,
    "performedAt": "2024-03-19T09:00:00"
  },
  {
    "id": "AH-0482",
    "assetId": "AST-0175",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 168,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0483",
    "assetId": "AST-0176",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 176",
    "performedBy": 169,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0484",
    "assetId": "AST-0176",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 169,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0485",
    "assetId": "AST-0177",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 177",
    "performedBy": 170,
    "performedAt": "2024-04-08T09:00:00"
  },
  {
    "id": "AH-0486",
    "assetId": "AST-0177",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0487",
    "assetId": "AST-0178",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 178",
    "performedBy": 171,
    "performedAt": "2024-04-15T09:00:00"
  },
  {
    "id": "AH-0488",
    "assetId": "AST-0178",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 171,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-0489",
    "assetId": "AST-0179",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 179",
    "performedBy": 172,
    "performedAt": "2025-05-22T09:00:00"
  },
  {
    "id": "AH-0490",
    "assetId": "AST-0180",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 180",
    "performedBy": 173,
    "performedAt": "2025-05-04T09:00:00"
  },
  {
    "id": "AH-0491",
    "assetId": "AST-0180",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 173,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-0492",
    "assetId": "AST-0181",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 181",
    "performedBy": 102,
    "performedAt": "2025-05-11T09:00:00"
  },
  {
    "id": "AH-0493",
    "assetId": "AST-0181",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 102,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0494",
    "assetId": "AST-0182",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 182",
    "performedBy": 105,
    "performedAt": "2025-06-18T09:00:00"
  },
  {
    "id": "AH-0495",
    "assetId": "AST-0182",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0496",
    "assetId": "AST-0183",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 183",
    "performedBy": 109,
    "performedAt": "2025-06-25T09:00:00"
  },
  {
    "id": "AH-0497",
    "assetId": "AST-0183",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 109,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0498",
    "assetId": "AST-0184",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 184",
    "performedBy": 112,
    "performedAt": "2025-06-07T09:00:00"
  },
  {
    "id": "AH-0499",
    "assetId": "AST-0184",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 112,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0500",
    "assetId": "AST-0185",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 185",
    "performedBy": 158,
    "performedAt": "2025-07-14T09:00:00"
  },
  {
    "id": "AH-0501",
    "assetId": "AST-0185",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 158,
    "performedAt": "2026-09-04T15:00:00"
  },
  {
    "id": "AH-0502",
    "assetId": "AST-0186",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 186",
    "performedBy": 159,
    "performedAt": "2025-07-21T09:00:00"
  },
  {
    "id": "AH-0503",
    "assetId": "AST-0187",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 187",
    "performedBy": 160,
    "performedAt": "2025-07-03T09:00:00"
  },
  {
    "id": "AH-0504",
    "assetId": "AST-0187",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 160,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0505",
    "assetId": "AST-0188",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 188",
    "performedBy": 161,
    "performedAt": "2025-08-10T09:00:00"
  },
  {
    "id": "AH-0506",
    "assetId": "AST-0189",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 189",
    "performedBy": 162,
    "performedAt": "2025-08-17T09:00:00"
  },
  {
    "id": "AH-0507",
    "assetId": "AST-0189",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 162,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0508",
    "assetId": "AST-0190",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 190",
    "performedBy": 163,
    "performedAt": "2025-08-24T09:00:00"
  },
  {
    "id": "AH-0509",
    "assetId": "AST-0190",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 163,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0510",
    "assetId": "AST-0191",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 191",
    "performedBy": 164,
    "performedAt": "2026-09-06T09:00:00"
  },
  {
    "id": "AH-0511",
    "assetId": "AST-0191",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 164,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0512",
    "assetId": "AST-0192",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 192",
    "performedBy": 165,
    "performedAt": "2026-09-13T09:00:00"
  },
  {
    "id": "AH-0513",
    "assetId": "AST-0193",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 193",
    "performedBy": 166,
    "performedAt": "2026-09-20T09:00:00"
  },
  {
    "id": "AH-0514",
    "assetId": "AST-0193",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 166,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0515",
    "assetId": "AST-0194",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 194",
    "performedBy": 167,
    "performedAt": "2026-10-02T09:00:00"
  },
  {
    "id": "AH-0516",
    "assetId": "AST-0194",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 167,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0517",
    "assetId": "AST-0195",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 195",
    "performedBy": 168,
    "performedAt": "2026-10-09T09:00:00"
  },
  {
    "id": "AH-0518",
    "assetId": "AST-0195",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 168,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0519",
    "assetId": "AST-0196",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 196",
    "performedBy": 169,
    "performedAt": "2026-10-16T09:00:00"
  },
  {
    "id": "AH-0520",
    "assetId": "AST-0197",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 197",
    "performedBy": 170,
    "performedAt": "2025-03-03T09:00:00"
  },
  {
    "id": "AH-0521",
    "assetId": "AST-0197",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 170,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0522",
    "assetId": "AST-0198",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 198",
    "performedBy": 171,
    "performedAt": "2026-11-05T09:00:00"
  },
  {
    "id": "AH-0523",
    "assetId": "AST-0198",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 171,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0524",
    "assetId": "AST-0199",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 199",
    "performedBy": 172,
    "performedAt": "2026-11-12T09:00:00"
  },
  {
    "id": "AH-0525",
    "assetId": "AST-0199",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 172,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0526",
    "assetId": "AST-0200",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 200",
    "performedBy": 173,
    "performedAt": "2024-01-19T09:00:00"
  },
  {
    "id": "AH-0527",
    "assetId": "AST-0200",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 173,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0528",
    "assetId": "AST-0201",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 201",
    "performedBy": 102,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0529",
    "assetId": "AST-0201",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 102,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0530",
    "assetId": "AST-0202",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 202",
    "performedBy": 105,
    "performedAt": "2024-01-08T09:00:00"
  },
  {
    "id": "AH-0531",
    "assetId": "AST-0203",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 203",
    "performedBy": 109,
    "performedAt": "2024-02-15T09:00:00"
  },
  {
    "id": "AH-0532",
    "assetId": "AST-0203",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 109,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0533",
    "assetId": "AST-0204",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 204",
    "performedBy": 112,
    "performedAt": "2024-02-22T09:00:00"
  },
  {
    "id": "AH-0534",
    "assetId": "AST-0204",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 112,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0535",
    "assetId": "AST-0205",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 205",
    "performedBy": 158,
    "performedAt": "2024-02-04T09:00:00"
  },
  {
    "id": "AH-0536",
    "assetId": "AST-0206",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 206",
    "performedBy": 159,
    "performedAt": "2024-03-11T09:00:00"
  },
  {
    "id": "AH-0537",
    "assetId": "AST-0206",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 159,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0538",
    "assetId": "AST-0207",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 207",
    "performedBy": 160,
    "performedAt": "2024-03-18T09:00:00"
  },
  {
    "id": "AH-0539",
    "assetId": "AST-0207",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 160,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-0540",
    "assetId": "AST-0208",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 208",
    "performedBy": 161,
    "performedAt": "2024-03-25T09:00:00"
  },
  {
    "id": "AH-0541",
    "assetId": "AST-0208",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 161,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0542",
    "assetId": "AST-0209",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 209",
    "performedBy": 162,
    "performedAt": "2024-04-07T09:00:00"
  },
  {
    "id": "AH-0543",
    "assetId": "AST-0209",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 162,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0544",
    "assetId": "AST-0210",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 210",
    "performedBy": 163,
    "performedAt": "2024-04-14T09:00:00"
  },
  {
    "id": "AH-0545",
    "assetId": "AST-0210",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 163,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0546",
    "assetId": "AST-0211",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 211",
    "performedBy": 164,
    "performedAt": "2024-04-21T09:00:00"
  },
  {
    "id": "AH-0547",
    "assetId": "AST-0211",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 164,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0548",
    "assetId": "AST-0212",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 212",
    "performedBy": 165,
    "performedAt": "2025-05-03T09:00:00"
  },
  {
    "id": "AH-0549",
    "assetId": "AST-0213",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 213",
    "performedBy": 166,
    "performedAt": "2025-05-10T09:00:00"
  },
  {
    "id": "AH-0550",
    "assetId": "AST-0213",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 166,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0551",
    "assetId": "AST-0214",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 214",
    "performedBy": 167,
    "performedAt": "2025-05-17T09:00:00"
  },
  {
    "id": "AH-0552",
    "assetId": "AST-0214",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 167,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0553",
    "assetId": "AST-0215",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 215",
    "performedBy": 168,
    "performedAt": "2025-06-24T09:00:00"
  },
  {
    "id": "AH-0554",
    "assetId": "AST-0216",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 216",
    "performedBy": 169,
    "performedAt": "2025-06-06T09:00:00"
  },
  {
    "id": "AH-0555",
    "assetId": "AST-0216",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 169,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0556",
    "assetId": "AST-0217",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 217",
    "performedBy": 170,
    "performedAt": "2025-06-13T09:00:00"
  },
  {
    "id": "AH-0557",
    "assetId": "AST-0217",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 170,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0558",
    "assetId": "AST-0218",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 218",
    "performedBy": 171,
    "performedAt": "2025-07-20T09:00:00"
  },
  {
    "id": "AH-0559",
    "assetId": "AST-0218",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 171,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0560",
    "assetId": "AST-0219",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 219",
    "performedBy": 172,
    "performedAt": "2025-07-02T09:00:00"
  },
  {
    "id": "AH-0561",
    "assetId": "AST-0219",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 172,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0562",
    "assetId": "AST-0220",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 220",
    "performedBy": 173,
    "performedAt": "2025-07-09T09:00:00"
  },
  {
    "id": "AH-0563",
    "assetId": "AST-0220",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 173,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0564",
    "assetId": "AST-0221",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 221",
    "performedBy": 102,
    "performedAt": "2025-08-16T09:00:00"
  },
  {
    "id": "AH-0565",
    "assetId": "AST-0221",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 102,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0566",
    "assetId": "AST-0222",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 222",
    "performedBy": 105,
    "performedAt": "2025-08-23T09:00:00"
  },
  {
    "id": "AH-0567",
    "assetId": "AST-0222",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 105,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0568",
    "assetId": "AST-0223",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 223",
    "performedBy": 109,
    "performedAt": "2025-08-05T09:00:00"
  },
  {
    "id": "AH-0569",
    "assetId": "AST-0223",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 109,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0570",
    "assetId": "AST-0224",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 224",
    "performedBy": 112,
    "performedAt": "2026-09-12T09:00:00"
  },
  {
    "id": "AH-0571",
    "assetId": "AST-0224",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 112,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0572",
    "assetId": "AST-0225",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 225",
    "performedBy": 158,
    "performedAt": "2026-09-19T09:00:00"
  },
  {
    "id": "AH-0573",
    "assetId": "AST-0226",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 226",
    "performedBy": 159,
    "performedAt": "2026-09-01T09:00:00"
  },
  {
    "id": "AH-0574",
    "assetId": "AST-0226",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 159,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0575",
    "assetId": "AST-0227",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 227",
    "performedBy": 160,
    "performedAt": "2026-10-08T09:00:00"
  },
  {
    "id": "AH-0576",
    "assetId": "AST-0227",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 160,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0577",
    "assetId": "AST-0228",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 228",
    "performedBy": 161,
    "performedAt": "2026-10-15T09:00:00"
  },
  {
    "id": "AH-0578",
    "assetId": "AST-0228",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 161,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0579",
    "assetId": "AST-0229",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 229",
    "performedBy": 162,
    "performedAt": "2026-10-22T09:00:00"
  },
  {
    "id": "AH-0580",
    "assetId": "AST-0230",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 230",
    "performedBy": 163,
    "performedAt": "2026-11-04T09:00:00"
  },
  {
    "id": "AH-0581",
    "assetId": "AST-0230",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 163,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0582",
    "assetId": "AST-0231",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 231",
    "performedBy": 164,
    "performedAt": "2026-11-11T09:00:00"
  },
  {
    "id": "AH-0583",
    "assetId": "AST-0232",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 232",
    "performedBy": 165,
    "performedAt": "2025-01-17T09:00:00"
  },
  {
    "id": "AH-0584",
    "assetId": "AST-0232",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 165,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-0585",
    "assetId": "AST-0233",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 233",
    "performedBy": 166,
    "performedAt": "2024-01-25T09:00:00"
  },
  {
    "id": "AH-0586",
    "assetId": "AST-0233",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 166,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0587",
    "assetId": "AST-0234",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 234",
    "performedBy": 167,
    "performedAt": "2024-01-07T09:00:00"
  },
  {
    "id": "AH-0588",
    "assetId": "AST-0234",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 167,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-0589",
    "assetId": "AST-0235",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 235",
    "performedBy": 168,
    "performedAt": "2024-01-14T09:00:00"
  },
  {
    "id": "AH-0590",
    "assetId": "AST-0235",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 168,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0591",
    "assetId": "AST-0236",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 236",
    "performedBy": 169,
    "performedAt": "2024-02-21T09:00:00"
  },
  {
    "id": "AH-0592",
    "assetId": "AST-0236",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 169,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0593",
    "assetId": "AST-0237",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 237",
    "performedBy": 170,
    "performedAt": "2024-02-03T09:00:00"
  },
  {
    "id": "AH-0594",
    "assetId": "AST-0237",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 170,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0595",
    "assetId": "AST-0238",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 238",
    "performedBy": 171,
    "performedAt": "2024-02-10T09:00:00"
  },
  {
    "id": "AH-0596",
    "assetId": "AST-0238",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 171,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0597",
    "assetId": "AST-0239",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 239",
    "performedBy": 172,
    "performedAt": "2024-03-17T09:00:00"
  },
  {
    "id": "AH-0598",
    "assetId": "AST-0240",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 240",
    "performedBy": 173,
    "performedAt": "2024-03-24T09:00:00"
  },
  {
    "id": "AH-0599",
    "assetId": "AST-0240",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 173,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0600",
    "assetId": "AST-0241",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 241",
    "performedBy": 102,
    "performedAt": "2024-03-06T09:00:00"
  },
  {
    "id": "AH-0601",
    "assetId": "AST-0241",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 102,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0602",
    "assetId": "AST-0242",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 242",
    "performedBy": 105,
    "performedAt": "2024-04-13T09:00:00"
  },
  {
    "id": "AH-0603",
    "assetId": "AST-0242",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0604",
    "assetId": "AST-0243",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 243",
    "performedBy": 109,
    "performedAt": "2024-04-20T09:00:00"
  },
  {
    "id": "AH-0605",
    "assetId": "AST-0244",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 244",
    "performedBy": 112,
    "performedAt": "2024-04-02T09:00:00"
  },
  {
    "id": "AH-0606",
    "assetId": "AST-0244",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 112,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0607",
    "assetId": "AST-0245",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 245",
    "performedBy": 158,
    "performedAt": "2025-05-09T09:00:00"
  },
  {
    "id": "AH-0608",
    "assetId": "AST-0245",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 158,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0609",
    "assetId": "AST-0246",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 246",
    "performedBy": 159,
    "performedAt": "2025-05-16T09:00:00"
  },
  {
    "id": "AH-0610",
    "assetId": "AST-0246",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 159,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0611",
    "assetId": "AST-0247",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 247",
    "performedBy": 160,
    "performedAt": "2025-05-23T09:00:00"
  },
  {
    "id": "AH-0612",
    "assetId": "AST-0247",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 160,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0613",
    "assetId": "AST-0248",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 248",
    "performedBy": 161,
    "performedAt": "2025-06-05T09:00:00"
  },
  {
    "id": "AH-0614",
    "assetId": "AST-0248",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 161,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0615",
    "assetId": "AST-0249",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 249",
    "performedBy": 162,
    "performedAt": "2025-06-12T09:00:00"
  },
  {
    "id": "AH-0616",
    "assetId": "AST-0249",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 162,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0617",
    "assetId": "AST-0250",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 250",
    "performedBy": 163,
    "performedAt": "2025-06-19T09:00:00"
  },
  {
    "id": "AH-0618",
    "assetId": "AST-0250",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 163,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0619",
    "assetId": "AST-0251",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 251",
    "performedBy": 164,
    "performedAt": "2025-07-01T09:00:00"
  },
  {
    "id": "AH-0620",
    "assetId": "AST-0251",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 164,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0621",
    "assetId": "AST-0252",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 252",
    "performedBy": 165,
    "performedAt": "2025-07-08T09:00:00"
  },
  {
    "id": "AH-0622",
    "assetId": "AST-0252",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 165,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0623",
    "assetId": "AST-0253",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 253",
    "performedBy": 166,
    "performedAt": "2025-07-15T09:00:00"
  },
  {
    "id": "AH-0624",
    "assetId": "AST-0253",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 166,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0625",
    "assetId": "AST-0254",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 254",
    "performedBy": 167,
    "performedAt": "2025-08-22T09:00:00"
  },
  {
    "id": "AH-0626",
    "assetId": "AST-0254",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 167,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0627",
    "assetId": "AST-0255",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 255",
    "performedBy": 168,
    "performedAt": "2025-08-04T09:00:00"
  },
  {
    "id": "AH-0628",
    "assetId": "AST-0256",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 256",
    "performedBy": 169,
    "performedAt": "2025-08-11T09:00:00"
  },
  {
    "id": "AH-0629",
    "assetId": "AST-0257",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 257",
    "performedBy": 170,
    "performedAt": "2026-09-18T09:00:00"
  },
  {
    "id": "AH-0630",
    "assetId": "AST-0257",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 170,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0631",
    "assetId": "AST-0258",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 258",
    "performedBy": 171,
    "performedAt": "2026-09-25T09:00:00"
  },
  {
    "id": "AH-0632",
    "assetId": "AST-0258",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 171,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0633",
    "assetId": "AST-0259",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 259",
    "performedBy": 172,
    "performedAt": "2026-09-07T09:00:00"
  },
  {
    "id": "AH-0634",
    "assetId": "AST-0260",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 260",
    "performedBy": 173,
    "performedAt": "2026-10-14T09:00:00"
  },
  {
    "id": "AH-0635",
    "assetId": "AST-0260",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 173,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0636",
    "assetId": "AST-0261",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 261",
    "performedBy": 102,
    "performedAt": "2026-10-21T09:00:00"
  },
  {
    "id": "AH-0637",
    "assetId": "AST-0262",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 262",
    "performedBy": 105,
    "performedAt": "2026-10-03T09:00:00"
  },
  {
    "id": "AH-0638",
    "assetId": "AST-0262",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0639",
    "assetId": "AST-0263",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 263",
    "performedBy": 109,
    "performedAt": "2026-11-10T09:00:00"
  },
  {
    "id": "AH-0640",
    "assetId": "AST-0263",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 109,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0641",
    "assetId": "AST-0264",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 264",
    "performedBy": 112,
    "performedAt": "2026-11-17T09:00:00"
  },
  {
    "id": "AH-0642",
    "assetId": "AST-0264",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 112,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0643",
    "assetId": "AST-0265",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 265",
    "performedBy": 158,
    "performedAt": "2026-03-22T09:00:00"
  },
  {
    "id": "AH-0644",
    "assetId": "AST-0265",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 158,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0645",
    "assetId": "AST-0266",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 266",
    "performedBy": 159,
    "performedAt": "2024-01-06T09:00:00"
  },
  {
    "id": "AH-0646",
    "assetId": "AST-0266",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 159,
    "performedAt": "2026-09-04T15:00:00"
  },
  {
    "id": "AH-0647",
    "assetId": "AST-0267",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 267",
    "performedBy": 160,
    "performedAt": "2024-01-13T09:00:00"
  },
  {
    "id": "AH-0648",
    "assetId": "AST-0268",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 268",
    "performedBy": 161,
    "performedAt": "2024-01-20T09:00:00"
  },
  {
    "id": "AH-0649",
    "assetId": "AST-0268",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 161,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0650",
    "assetId": "AST-0269",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 269",
    "performedBy": 162,
    "performedAt": "2024-02-02T09:00:00"
  },
  {
    "id": "AH-0651",
    "assetId": "AST-0270",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 270",
    "performedBy": 163,
    "performedAt": "2024-02-09T09:00:00"
  },
  {
    "id": "AH-0652",
    "assetId": "AST-0270",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 163,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0653",
    "assetId": "AST-0271",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 271",
    "performedBy": 164,
    "performedAt": "2024-02-16T09:00:00"
  },
  {
    "id": "AH-0654",
    "assetId": "AST-0271",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 164,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0655",
    "assetId": "AST-0272",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 272",
    "performedBy": 165,
    "performedAt": "2024-03-23T09:00:00"
  },
  {
    "id": "AH-0656",
    "assetId": "AST-0272",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 165,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0657",
    "assetId": "AST-0273",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 273",
    "performedBy": 166,
    "performedAt": "2024-03-05T09:00:00"
  },
  {
    "id": "AH-0658",
    "assetId": "AST-0273",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 166,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0659",
    "assetId": "AST-0274",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 274",
    "performedBy": 167,
    "performedAt": "2024-03-12T09:00:00"
  },
  {
    "id": "AH-0660",
    "assetId": "AST-0275",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 275",
    "performedBy": 168,
    "performedAt": "2024-04-19T09:00:00"
  },
  {
    "id": "AH-0661",
    "assetId": "AST-0276",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 276",
    "performedBy": 169,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0662",
    "assetId": "AST-0276",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 169,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0663",
    "assetId": "AST-0277",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 277",
    "performedBy": 170,
    "performedAt": "2024-04-08T09:00:00"
  },
  {
    "id": "AH-0664",
    "assetId": "AST-0277",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0665",
    "assetId": "AST-0278",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 278",
    "performedBy": 171,
    "performedAt": "2025-05-15T09:00:00"
  },
  {
    "id": "AH-0666",
    "assetId": "AST-0278",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 171,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0667",
    "assetId": "AST-0279",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 279",
    "performedBy": 172,
    "performedAt": "2025-05-22T09:00:00"
  },
  {
    "id": "AH-0668",
    "assetId": "AST-0279",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 172,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0669",
    "assetId": "AST-0280",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 280",
    "performedBy": 173,
    "performedAt": "2025-05-04T09:00:00"
  },
  {
    "id": "AH-0670",
    "assetId": "AST-0280",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 173,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0671",
    "assetId": "AST-0281",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 281",
    "performedBy": 102,
    "performedAt": "2025-06-11T09:00:00"
  },
  {
    "id": "AH-0672",
    "assetId": "AST-0281",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 102,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0673",
    "assetId": "AST-0282",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 282",
    "performedBy": 105,
    "performedAt": "2025-06-18T09:00:00"
  },
  {
    "id": "AH-0674",
    "assetId": "AST-0282",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 105,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0675",
    "assetId": "AST-0283",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 283",
    "performedBy": 109,
    "performedAt": "2025-06-25T09:00:00"
  },
  {
    "id": "AH-0676",
    "assetId": "AST-0283",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 109,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0677",
    "assetId": "AST-0284",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 284",
    "performedBy": 112,
    "performedAt": "2025-07-07T09:00:00"
  },
  {
    "id": "AH-0678",
    "assetId": "AST-0284",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 112,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0679",
    "assetId": "AST-0285",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 285",
    "performedBy": 158,
    "performedAt": "2025-07-14T09:00:00"
  },
  {
    "id": "AH-0680",
    "assetId": "AST-0285",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 158,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0681",
    "assetId": "AST-0286",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 286",
    "performedBy": 159,
    "performedAt": "2025-07-21T09:00:00"
  },
  {
    "id": "AH-0682",
    "assetId": "AST-0287",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 287",
    "performedBy": 160,
    "performedAt": "2025-08-03T09:00:00"
  },
  {
    "id": "AH-0683",
    "assetId": "AST-0288",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 288",
    "performedBy": 161,
    "performedAt": "2025-08-10T09:00:00"
  },
  {
    "id": "AH-0684",
    "assetId": "AST-0289",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 289",
    "performedBy": 162,
    "performedAt": "2025-08-17T09:00:00"
  },
  {
    "id": "AH-0685",
    "assetId": "AST-0289",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 162,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0686",
    "assetId": "AST-0290",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 290",
    "performedBy": 163,
    "performedAt": "2026-09-24T09:00:00"
  },
  {
    "id": "AH-0687",
    "assetId": "AST-0290",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 163,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0688",
    "assetId": "AST-0291",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 291",
    "performedBy": 164,
    "performedAt": "2026-09-06T09:00:00"
  },
  {
    "id": "AH-0689",
    "assetId": "AST-0291",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 164,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0690",
    "assetId": "AST-0292",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 292",
    "performedBy": 165,
    "performedAt": "2026-09-13T09:00:00"
  },
  {
    "id": "AH-0691",
    "assetId": "AST-0292",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 165,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0692",
    "assetId": "AST-0293",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 293",
    "performedBy": 166,
    "performedAt": "2026-10-20T09:00:00"
  },
  {
    "id": "AH-0693",
    "assetId": "AST-0293",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 166,
    "performedAt": "2026-09-04T15:00:00"
  },
  {
    "id": "AH-0694",
    "assetId": "AST-0294",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 294",
    "performedBy": 167,
    "performedAt": "2026-10-02T09:00:00"
  },
  {
    "id": "AH-0695",
    "assetId": "AST-0295",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 295",
    "performedBy": 168,
    "performedAt": "2026-10-09T09:00:00"
  },
  {
    "id": "AH-0696",
    "assetId": "AST-0296",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 296",
    "performedBy": 169,
    "performedAt": "2026-11-16T09:00:00"
  },
  {
    "id": "AH-0697",
    "assetId": "AST-0296",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 169,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0698",
    "assetId": "AST-0297",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 297",
    "performedBy": 170,
    "performedAt": "2025-12-28T09:00:00"
  },
  {
    "id": "AH-0699",
    "assetId": "AST-0298",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 298",
    "performedBy": 171,
    "performedAt": "2026-11-05T09:00:00"
  },
  {
    "id": "AH-0700",
    "assetId": "AST-0298",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 171,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0701",
    "assetId": "AST-0299",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 299",
    "performedBy": 172,
    "performedAt": "2024-01-12T09:00:00"
  },
  {
    "id": "AH-0702",
    "assetId": "AST-0300",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 300",
    "performedBy": 173,
    "performedAt": "2024-01-19T09:00:00"
  },
  {
    "id": "AH-0703",
    "assetId": "AST-0300",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 173,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0704",
    "assetId": "AST-0301",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 301",
    "performedBy": 102,
    "performedAt": "2024-01-01T09:00:00"
  },
  {
    "id": "AH-0705",
    "assetId": "AST-0302",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 302",
    "performedBy": 105,
    "performedAt": "2024-02-08T09:00:00"
  },
  {
    "id": "AH-0706",
    "assetId": "AST-0302",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 105,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0707",
    "assetId": "AST-0303",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 303",
    "performedBy": 109,
    "performedAt": "2024-02-15T09:00:00"
  },
  {
    "id": "AH-0708",
    "assetId": "AST-0303",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 109,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0709",
    "assetId": "AST-0304",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 304",
    "performedBy": 112,
    "performedAt": "2024-02-22T09:00:00"
  },
  {
    "id": "AH-0710",
    "assetId": "AST-0304",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 112,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0711",
    "assetId": "AST-0305",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 305",
    "performedBy": 158,
    "performedAt": "2024-03-04T09:00:00"
  },
  {
    "id": "AH-0712",
    "assetId": "AST-0306",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 306",
    "performedBy": 159,
    "performedAt": "2024-03-11T09:00:00"
  },
  {
    "id": "AH-0713",
    "assetId": "AST-0306",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 159,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0714",
    "assetId": "AST-0307",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 307",
    "performedBy": 160,
    "performedAt": "2024-03-18T09:00:00"
  },
  {
    "id": "AH-0715",
    "assetId": "AST-0307",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 160,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0716",
    "assetId": "AST-0308",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 308",
    "performedBy": 161,
    "performedAt": "2024-04-25T09:00:00"
  },
  {
    "id": "AH-0717",
    "assetId": "AST-0308",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 161,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0718",
    "assetId": "AST-0309",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 309",
    "performedBy": 162,
    "performedAt": "2024-04-07T09:00:00"
  },
  {
    "id": "AH-0719",
    "assetId": "AST-0309",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 162,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0720",
    "assetId": "AST-0310",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 310",
    "performedBy": 163,
    "performedAt": "2024-04-14T09:00:00"
  },
  {
    "id": "AH-0721",
    "assetId": "AST-0310",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 163,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0722",
    "assetId": "AST-0311",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 311",
    "performedBy": 164,
    "performedAt": "2025-05-21T09:00:00"
  },
  {
    "id": "AH-0723",
    "assetId": "AST-0311",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 164,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0724",
    "assetId": "AST-0312",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 312",
    "performedBy": 165,
    "performedAt": "2025-05-03T09:00:00"
  },
  {
    "id": "AH-0725",
    "assetId": "AST-0312",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 165,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0726",
    "assetId": "AST-0313",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 313",
    "performedBy": 166,
    "performedAt": "2025-05-10T09:00:00"
  },
  {
    "id": "AH-0727",
    "assetId": "AST-0313",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 166,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-0728",
    "assetId": "AST-0314",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 314",
    "performedBy": 167,
    "performedAt": "2025-06-17T09:00:00"
  },
  {
    "id": "AH-0729",
    "assetId": "AST-0314",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 167,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0730",
    "assetId": "AST-0315",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 315",
    "performedBy": 168,
    "performedAt": "2025-06-24T09:00:00"
  },
  {
    "id": "AH-0731",
    "assetId": "AST-0316",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 316",
    "performedBy": 169,
    "performedAt": "2025-06-06T09:00:00"
  },
  {
    "id": "AH-0732",
    "assetId": "AST-0316",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 169,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0733",
    "assetId": "AST-0317",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 317",
    "performedBy": 170,
    "performedAt": "2025-07-13T09:00:00"
  },
  {
    "id": "AH-0734",
    "assetId": "AST-0317",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0735",
    "assetId": "AST-0318",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 318",
    "performedBy": 171,
    "performedAt": "2025-07-20T09:00:00"
  },
  {
    "id": "AH-0736",
    "assetId": "AST-0318",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 171,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0737",
    "assetId": "AST-0319",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 319",
    "performedBy": 172,
    "performedAt": "2025-07-02T09:00:00"
  },
  {
    "id": "AH-0738",
    "assetId": "AST-0319",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 172,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0739",
    "assetId": "AST-0320",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 320",
    "performedBy": 173,
    "performedAt": "2025-08-09T09:00:00"
  },
  {
    "id": "AH-0740",
    "assetId": "AST-0321",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 321",
    "performedBy": 102,
    "performedAt": "2025-08-16T09:00:00"
  },
  {
    "id": "AH-0741",
    "assetId": "AST-0321",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 102,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0742",
    "assetId": "AST-0322",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 322",
    "performedBy": 105,
    "performedAt": "2025-08-23T09:00:00"
  },
  {
    "id": "AH-0743",
    "assetId": "AST-0323",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 323",
    "performedBy": 109,
    "performedAt": "2026-09-05T09:00:00"
  },
  {
    "id": "AH-0744",
    "assetId": "AST-0323",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 109,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0745",
    "assetId": "AST-0324",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 324",
    "performedBy": 112,
    "performedAt": "2026-09-12T09:00:00"
  },
  {
    "id": "AH-0746",
    "assetId": "AST-0324",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 112,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0747",
    "assetId": "AST-0325",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 325",
    "performedBy": 158,
    "performedAt": "2026-09-19T09:00:00"
  },
  {
    "id": "AH-0748",
    "assetId": "AST-0325",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 158,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0749",
    "assetId": "AST-0326",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 326",
    "performedBy": 159,
    "performedAt": "2026-10-01T09:00:00"
  },
  {
    "id": "AH-0750",
    "assetId": "AST-0327",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 327",
    "performedBy": 160,
    "performedAt": "2026-10-08T09:00:00"
  },
  {
    "id": "AH-0751",
    "assetId": "AST-0328",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 328",
    "performedBy": 161,
    "performedAt": "2026-10-15T09:00:00"
  },
  {
    "id": "AH-0752",
    "assetId": "AST-0329",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 329",
    "performedBy": 162,
    "performedAt": "2025-10-05T09:00:00"
  },
  {
    "id": "AH-0753",
    "assetId": "AST-0329",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 162,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0754",
    "assetId": "AST-0330",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 330",
    "performedBy": 163,
    "performedAt": "2026-11-04T09:00:00"
  },
  {
    "id": "AH-0755",
    "assetId": "AST-0330",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 163,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0756",
    "assetId": "AST-0331",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 331",
    "performedBy": 164,
    "performedAt": "2026-11-11T09:00:00"
  },
  {
    "id": "AH-0757",
    "assetId": "AST-0331",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 164,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0758",
    "assetId": "AST-0332",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 332",
    "performedBy": 165,
    "performedAt": "2024-01-18T09:00:00"
  },
  {
    "id": "AH-0759",
    "assetId": "AST-0333",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 333",
    "performedBy": 166,
    "performedAt": "2024-01-25T09:00:00"
  },
  {
    "id": "AH-0760",
    "assetId": "AST-0333",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 166,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0761",
    "assetId": "AST-0334",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 334",
    "performedBy": 167,
    "performedAt": "2024-01-07T09:00:00"
  },
  {
    "id": "AH-0762",
    "assetId": "AST-0334",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 167,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0763",
    "assetId": "AST-0335",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 335",
    "performedBy": 168,
    "performedAt": "2024-02-14T09:00:00"
  },
  {
    "id": "AH-0764",
    "assetId": "AST-0335",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 168,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0765",
    "assetId": "AST-0336",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 336",
    "performedBy": 169,
    "performedAt": "2024-02-21T09:00:00"
  },
  {
    "id": "AH-0766",
    "assetId": "AST-0337",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 337",
    "performedBy": 170,
    "performedAt": "2024-02-03T09:00:00"
  },
  {
    "id": "AH-0767",
    "assetId": "AST-0337",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0768",
    "assetId": "AST-0338",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 338",
    "performedBy": 171,
    "performedAt": "2024-03-10T09:00:00"
  },
  {
    "id": "AH-0769",
    "assetId": "AST-0338",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 171,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0770",
    "assetId": "AST-0339",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 339",
    "performedBy": 172,
    "performedAt": "2024-03-17T09:00:00"
  },
  {
    "id": "AH-0771",
    "assetId": "AST-0339",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 172,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0772",
    "assetId": "AST-0340",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 340",
    "performedBy": 173,
    "performedAt": "2024-03-24T09:00:00"
  },
  {
    "id": "AH-0773",
    "assetId": "AST-0340",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 173,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-0774",
    "assetId": "AST-0341",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 341",
    "performedBy": 102,
    "performedAt": "2024-04-06T09:00:00"
  },
  {
    "id": "AH-0775",
    "assetId": "AST-0341",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 102,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0776",
    "assetId": "AST-0342",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 342",
    "performedBy": 105,
    "performedAt": "2024-04-13T09:00:00"
  },
  {
    "id": "AH-0777",
    "assetId": "AST-0342",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 105,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-0778",
    "assetId": "AST-0343",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 343",
    "performedBy": 109,
    "performedAt": "2024-04-20T09:00:00"
  },
  {
    "id": "AH-0779",
    "assetId": "AST-0343",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 109,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0780",
    "assetId": "AST-0344",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 344",
    "performedBy": 112,
    "performedAt": "2025-05-02T09:00:00"
  },
  {
    "id": "AH-0781",
    "assetId": "AST-0344",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 112,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0782",
    "assetId": "AST-0345",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 345",
    "performedBy": 158,
    "performedAt": "2025-05-09T09:00:00"
  },
  {
    "id": "AH-0783",
    "assetId": "AST-0345",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 158,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0784",
    "assetId": "AST-0346",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 346",
    "performedBy": 159,
    "performedAt": "2025-05-16T09:00:00"
  },
  {
    "id": "AH-0785",
    "assetId": "AST-0346",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 159,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0786",
    "assetId": "AST-0347",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 347",
    "performedBy": 160,
    "performedAt": "2025-06-23T09:00:00"
  },
  {
    "id": "AH-0787",
    "assetId": "AST-0347",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 160,
    "performedAt": "2026-09-04T15:00:00"
  },
  {
    "id": "AH-0788",
    "assetId": "AST-0348",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 348",
    "performedBy": 161,
    "performedAt": "2025-06-05T09:00:00"
  },
  {
    "id": "AH-0789",
    "assetId": "AST-0348",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 161,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0790",
    "assetId": "AST-0349",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 349",
    "performedBy": 162,
    "performedAt": "2025-06-12T09:00:00"
  },
  {
    "id": "AH-0791",
    "assetId": "AST-0349",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 162,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0792",
    "assetId": "AST-0350",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 350",
    "performedBy": 163,
    "performedAt": "2025-07-19T09:00:00"
  },
  {
    "id": "AH-0793",
    "assetId": "AST-0350",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 163,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0794",
    "assetId": "AST-0351",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 351",
    "performedBy": 164,
    "performedAt": "2025-07-01T09:00:00"
  },
  {
    "id": "AH-0795",
    "assetId": "AST-0351",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 164,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0796",
    "assetId": "AST-0352",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 352",
    "performedBy": 165,
    "performedAt": "2025-07-08T09:00:00"
  },
  {
    "id": "AH-0797",
    "assetId": "AST-0352",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 165,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0798",
    "assetId": "AST-0353",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 353",
    "performedBy": 166,
    "performedAt": "2025-08-15T09:00:00"
  },
  {
    "id": "AH-0799",
    "assetId": "AST-0353",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 166,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0800",
    "assetId": "AST-0354",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 354",
    "performedBy": 167,
    "performedAt": "2025-08-22T09:00:00"
  },
  {
    "id": "AH-0801",
    "assetId": "AST-0354",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 167,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0802",
    "assetId": "AST-0355",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 355",
    "performedBy": 168,
    "performedAt": "2025-08-04T09:00:00"
  },
  {
    "id": "AH-0803",
    "assetId": "AST-0355",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 168,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0804",
    "assetId": "AST-0356",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 356",
    "performedBy": 169,
    "performedAt": "2026-09-11T09:00:00"
  },
  {
    "id": "AH-0805",
    "assetId": "AST-0356",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 169,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0806",
    "assetId": "AST-0357",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 357",
    "performedBy": 170,
    "performedAt": "2026-09-18T09:00:00"
  },
  {
    "id": "AH-0807",
    "assetId": "AST-0357",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 170,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0808",
    "assetId": "AST-0358",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 358",
    "performedBy": 171,
    "performedAt": "2026-09-25T09:00:00"
  },
  {
    "id": "AH-0809",
    "assetId": "AST-0358",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 171,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0810",
    "assetId": "AST-0359",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 359",
    "performedBy": 172,
    "performedAt": "2026-10-07T09:00:00"
  },
  {
    "id": "AH-0811",
    "assetId": "AST-0359",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 172,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0812",
    "assetId": "AST-0360",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 360",
    "performedBy": 173,
    "performedAt": "2026-10-14T09:00:00"
  },
  {
    "id": "AH-0813",
    "assetId": "AST-0360",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 173,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0814",
    "assetId": "AST-0361",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 361",
    "performedBy": 102,
    "performedAt": "2026-10-21T09:00:00"
  },
  {
    "id": "AH-0815",
    "assetId": "AST-0361",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 102,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0816",
    "assetId": "AST-0362",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 362",
    "performedBy": 105,
    "performedAt": "2026-11-03T09:00:00"
  },
  {
    "id": "AH-0817",
    "assetId": "AST-0362",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0818",
    "assetId": "AST-0363",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 363",
    "performedBy": 109,
    "performedAt": "2026-11-10T09:00:00"
  },
  {
    "id": "AH-0819",
    "assetId": "AST-0364",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 364",
    "performedBy": 112,
    "performedAt": "2026-11-17T09:00:00"
  },
  {
    "id": "AH-0820",
    "assetId": "AST-0364",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 112,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0821",
    "assetId": "AST-0365",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 365",
    "performedBy": 158,
    "performedAt": "2024-01-24T09:00:00"
  },
  {
    "id": "AH-0822",
    "assetId": "AST-0365",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 158,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0823",
    "assetId": "AST-0366",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 366",
    "performedBy": 159,
    "performedAt": "2024-01-06T09:00:00"
  },
  {
    "id": "AH-0824",
    "assetId": "AST-0366",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 159,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0825",
    "assetId": "AST-0367",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 367",
    "performedBy": 160,
    "performedAt": "2024-01-13T09:00:00"
  },
  {
    "id": "AH-0826",
    "assetId": "AST-0367",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 160,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-0827",
    "assetId": "AST-0368",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 368",
    "performedBy": 161,
    "performedAt": "2024-02-20T09:00:00"
  },
  {
    "id": "AH-0828",
    "assetId": "AST-0369",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 369",
    "performedBy": 162,
    "performedAt": "2024-02-02T09:00:00"
  },
  {
    "id": "AH-0829",
    "assetId": "AST-0369",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 162,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-0830",
    "assetId": "AST-0370",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 370",
    "performedBy": 163,
    "performedAt": "2024-02-09T09:00:00"
  },
  {
    "id": "AH-0831",
    "assetId": "AST-0370",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 163,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0832",
    "assetId": "AST-0371",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 371",
    "performedBy": 164,
    "performedAt": "2024-03-16T09:00:00"
  },
  {
    "id": "AH-0833",
    "assetId": "AST-0371",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 164,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0834",
    "assetId": "AST-0372",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 372",
    "performedBy": 165,
    "performedAt": "2024-03-23T09:00:00"
  },
  {
    "id": "AH-0835",
    "assetId": "AST-0372",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 165,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0836",
    "assetId": "AST-0373",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 373",
    "performedBy": 166,
    "performedAt": "2024-03-05T09:00:00"
  },
  {
    "id": "AH-0837",
    "assetId": "AST-0373",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 166,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0838",
    "assetId": "AST-0374",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 374",
    "performedBy": 167,
    "performedAt": "2024-04-12T09:00:00"
  },
  {
    "id": "AH-0839",
    "assetId": "AST-0374",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 167,
    "performedAt": "2026-09-04T15:00:00"
  },
  {
    "id": "AH-0840",
    "assetId": "AST-0375",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 375",
    "performedBy": 168,
    "performedAt": "2024-04-19T09:00:00"
  },
  {
    "id": "AH-0841",
    "assetId": "AST-0375",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 168,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0842",
    "assetId": "AST-0376",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 376",
    "performedBy": 169,
    "performedAt": "2024-04-01T09:00:00"
  },
  {
    "id": "AH-0843",
    "assetId": "AST-0376",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 169,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0844",
    "assetId": "AST-0377",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 377",
    "performedBy": 170,
    "performedAt": "2025-05-08T09:00:00"
  },
  {
    "id": "AH-0845",
    "assetId": "AST-0378",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 378",
    "performedBy": 171,
    "performedAt": "2025-05-15T09:00:00"
  },
  {
    "id": "AH-0846",
    "assetId": "AST-0378",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 171,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0847",
    "assetId": "AST-0379",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 379",
    "performedBy": 172,
    "performedAt": "2025-05-22T09:00:00"
  },
  {
    "id": "AH-0848",
    "assetId": "AST-0379",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 172,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0849",
    "assetId": "AST-0380",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 380",
    "performedBy": 173,
    "performedAt": "2025-06-04T09:00:00"
  },
  {
    "id": "AH-0850",
    "assetId": "AST-0380",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 173,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0851",
    "assetId": "AST-0381",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 381",
    "performedBy": 102,
    "performedAt": "2025-06-11T09:00:00"
  },
  {
    "id": "AH-0852",
    "assetId": "AST-0381",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 102,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0853",
    "assetId": "AST-0382",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 382",
    "performedBy": 105,
    "performedAt": "2025-06-18T09:00:00"
  },
  {
    "id": "AH-0854",
    "assetId": "AST-0382",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 105,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0855",
    "assetId": "AST-0383",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 383",
    "performedBy": 109,
    "performedAt": "2025-07-25T09:00:00"
  },
  {
    "id": "AH-0856",
    "assetId": "AST-0383",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 109,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0857",
    "assetId": "AST-0384",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 384",
    "performedBy": 112,
    "performedAt": "2025-07-07T09:00:00"
  },
  {
    "id": "AH-0858",
    "assetId": "AST-0384",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 112,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0859",
    "assetId": "AST-0385",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 385",
    "performedBy": 158,
    "performedAt": "2025-07-14T09:00:00"
  },
  {
    "id": "AH-0860",
    "assetId": "AST-0385",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 158,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0861",
    "assetId": "AST-0386",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 386",
    "performedBy": 159,
    "performedAt": "2025-08-21T09:00:00"
  },
  {
    "id": "AH-0862",
    "assetId": "AST-0386",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 159,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0863",
    "assetId": "AST-0387",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 387",
    "performedBy": 160,
    "performedAt": "2025-08-03T09:00:00"
  },
  {
    "id": "AH-0864",
    "assetId": "AST-0388",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 388",
    "performedBy": 161,
    "performedAt": "2025-08-10T09:00:00"
  },
  {
    "id": "AH-0865",
    "assetId": "AST-0388",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 161,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0866",
    "assetId": "AST-0389",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 389",
    "performedBy": 162,
    "performedAt": "2026-09-17T09:00:00"
  },
  {
    "id": "AH-0867",
    "assetId": "AST-0389",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 162,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0868",
    "assetId": "AST-0390",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 390",
    "performedBy": 163,
    "performedAt": "2026-09-24T09:00:00"
  },
  {
    "id": "AH-0869",
    "assetId": "AST-0390",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 163,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0870",
    "assetId": "AST-0391",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 391",
    "performedBy": 164,
    "performedAt": "2026-09-06T09:00:00"
  },
  {
    "id": "AH-0871",
    "assetId": "AST-0391",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 164,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0872",
    "assetId": "AST-0392",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 392",
    "performedBy": 165,
    "performedAt": "2026-10-13T09:00:00"
  },
  {
    "id": "AH-0873",
    "assetId": "AST-0392",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 165,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0874",
    "assetId": "AST-0393",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 393",
    "performedBy": 166,
    "performedAt": "2026-10-20T09:00:00"
  },
  {
    "id": "AH-0875",
    "assetId": "AST-0393",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 166,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0876",
    "assetId": "AST-0394",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 394",
    "performedBy": 167,
    "performedAt": "2026-10-02T09:00:00"
  },
  {
    "id": "AH-0877",
    "assetId": "AST-0395",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 395",
    "performedBy": 168,
    "performedAt": "2026-11-09T09:00:00"
  },
  {
    "id": "AH-0878",
    "assetId": "AST-0395",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 168,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0879",
    "assetId": "AST-0396",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 396",
    "performedBy": 169,
    "performedAt": "2026-11-16T09:00:00"
  },
  {
    "id": "AH-0880",
    "assetId": "AST-0397",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 397",
    "performedBy": 170,
    "performedAt": "2025-06-11T09:00:00"
  },
  {
    "id": "AH-0881",
    "assetId": "AST-0397",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0882",
    "assetId": "AST-0398",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 398",
    "performedBy": 171,
    "performedAt": "2024-01-05T09:00:00"
  },
  {
    "id": "AH-0883",
    "assetId": "AST-0398",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 171,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0884",
    "assetId": "AST-0399",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 399",
    "performedBy": 172,
    "performedAt": "2024-01-12T09:00:00"
  },
  {
    "id": "AH-0885",
    "assetId": "AST-0399",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 172,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0886",
    "assetId": "AST-0400",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 400",
    "performedBy": 173,
    "performedAt": "2024-01-19T09:00:00"
  },
  {
    "id": "AH-0887",
    "assetId": "AST-0400",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 173,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0888",
    "assetId": "AST-0401",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 401",
    "performedBy": 102,
    "performedAt": "2024-02-01T09:00:00"
  },
  {
    "id": "AH-0889",
    "assetId": "AST-0402",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 402",
    "performedBy": 105,
    "performedAt": "2024-02-08T09:00:00"
  },
  {
    "id": "AH-0890",
    "assetId": "AST-0402",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-0891",
    "assetId": "AST-0403",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 403",
    "performedBy": 109,
    "performedAt": "2024-02-15T09:00:00"
  },
  {
    "id": "AH-0892",
    "assetId": "AST-0403",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 109,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0893",
    "assetId": "AST-0404",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 404",
    "performedBy": 112,
    "performedAt": "2024-03-22T09:00:00"
  },
  {
    "id": "AH-0894",
    "assetId": "AST-0404",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 112,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0895",
    "assetId": "AST-0405",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 405",
    "performedBy": 158,
    "performedAt": "2024-03-04T09:00:00"
  },
  {
    "id": "AH-0896",
    "assetId": "AST-0405",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 158,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0897",
    "assetId": "AST-0406",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 406",
    "performedBy": 159,
    "performedAt": "2024-03-11T09:00:00"
  },
  {
    "id": "AH-0898",
    "assetId": "AST-0406",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 159,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0899",
    "assetId": "AST-0407",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 407",
    "performedBy": 160,
    "performedAt": "2024-04-18T09:00:00"
  },
  {
    "id": "AH-0900",
    "assetId": "AST-0407",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 160,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0901",
    "assetId": "AST-0408",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 408",
    "performedBy": 161,
    "performedAt": "2024-04-25T09:00:00"
  },
  {
    "id": "AH-0902",
    "assetId": "AST-0408",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 161,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0903",
    "assetId": "AST-0409",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 409",
    "performedBy": 162,
    "performedAt": "2024-04-07T09:00:00"
  },
  {
    "id": "AH-0904",
    "assetId": "AST-0409",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 162,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0905",
    "assetId": "AST-0410",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 410",
    "performedBy": 163,
    "performedAt": "2025-05-14T09:00:00"
  },
  {
    "id": "AH-0906",
    "assetId": "AST-0411",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 411",
    "performedBy": 164,
    "performedAt": "2025-05-21T09:00:00"
  },
  {
    "id": "AH-0907",
    "assetId": "AST-0411",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 164,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0908",
    "assetId": "AST-0412",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 412",
    "performedBy": 165,
    "performedAt": "2025-05-03T09:00:00"
  },
  {
    "id": "AH-0909",
    "assetId": "AST-0412",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 165,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-0910",
    "assetId": "AST-0413",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 413",
    "performedBy": 166,
    "performedAt": "2025-06-10T09:00:00"
  },
  {
    "id": "AH-0911",
    "assetId": "AST-0413",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 166,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-0912",
    "assetId": "AST-0414",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 414",
    "performedBy": 167,
    "performedAt": "2025-06-17T09:00:00"
  },
  {
    "id": "AH-0913",
    "assetId": "AST-0414",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 167,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0914",
    "assetId": "AST-0415",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 415",
    "performedBy": 168,
    "performedAt": "2025-06-24T09:00:00"
  },
  {
    "id": "AH-0915",
    "assetId": "AST-0415",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 168,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0916",
    "assetId": "AST-0416",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 416",
    "performedBy": 169,
    "performedAt": "2025-07-06T09:00:00"
  },
  {
    "id": "AH-0917",
    "assetId": "AST-0416",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 169,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0918",
    "assetId": "AST-0417",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 417",
    "performedBy": 170,
    "performedAt": "2025-07-13T09:00:00"
  },
  {
    "id": "AH-0919",
    "assetId": "AST-0417",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 170,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0920",
    "assetId": "AST-0418",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 418",
    "performedBy": 171,
    "performedAt": "2025-07-20T09:00:00"
  },
  {
    "id": "AH-0921",
    "assetId": "AST-0419",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 419",
    "performedBy": 172,
    "performedAt": "2025-08-02T09:00:00"
  },
  {
    "id": "AH-0922",
    "assetId": "AST-0419",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 172,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0923",
    "assetId": "AST-0420",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 420",
    "performedBy": 173,
    "performedAt": "2025-08-09T09:00:00"
  },
  {
    "id": "AH-0924",
    "assetId": "AST-0420",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 173,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-0925",
    "assetId": "AST-0421",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 421",
    "performedBy": 102,
    "performedAt": "2025-08-16T09:00:00"
  },
  {
    "id": "AH-0926",
    "assetId": "AST-0421",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 102,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-0927",
    "assetId": "AST-0422",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 422",
    "performedBy": 105,
    "performedAt": "2026-09-23T09:00:00"
  },
  {
    "id": "AH-0928",
    "assetId": "AST-0422",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 105,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0929",
    "assetId": "AST-0423",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 423",
    "performedBy": 109,
    "performedAt": "2026-09-05T09:00:00"
  },
  {
    "id": "AH-0930",
    "assetId": "AST-0423",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 109,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-0931",
    "assetId": "AST-0424",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 424",
    "performedBy": 112,
    "performedAt": "2026-09-12T09:00:00"
  },
  {
    "id": "AH-0932",
    "assetId": "AST-0424",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 112,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0933",
    "assetId": "AST-0425",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 425",
    "performedBy": 158,
    "performedAt": "2026-10-19T09:00:00"
  },
  {
    "id": "AH-0934",
    "assetId": "AST-0425",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 158,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-0935",
    "assetId": "AST-0426",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 426",
    "performedBy": 159,
    "performedAt": "2026-10-01T09:00:00"
  },
  {
    "id": "AH-0936",
    "assetId": "AST-0426",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 159,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-0937",
    "assetId": "AST-0427",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 427",
    "performedBy": 160,
    "performedAt": "2026-10-08T09:00:00"
  },
  {
    "id": "AH-0938",
    "assetId": "AST-0427",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 160,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0939",
    "assetId": "AST-0428",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 428",
    "performedBy": 161,
    "performedAt": "2026-11-15T09:00:00"
  },
  {
    "id": "AH-0940",
    "assetId": "AST-0428",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 161,
    "performedAt": "2026-09-04T15:00:00"
  },
  {
    "id": "AH-0941",
    "assetId": "AST-0429",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 429",
    "performedBy": 162,
    "performedAt": "2025-03-19T09:00:00"
  },
  {
    "id": "AH-0942",
    "assetId": "AST-0430",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 430",
    "performedBy": 163,
    "performedAt": "2026-11-04T09:00:00"
  },
  {
    "id": "AH-0943",
    "assetId": "AST-0430",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 163,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-0944",
    "assetId": "AST-0431",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 431",
    "performedBy": 164,
    "performedAt": "2024-01-11T09:00:00"
  },
  {
    "id": "AH-0945",
    "assetId": "AST-0431",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 164,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0946",
    "assetId": "AST-0432",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 432",
    "performedBy": 165,
    "performedAt": "2024-01-18T09:00:00"
  },
  {
    "id": "AH-0947",
    "assetId": "AST-0432",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 165,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0948",
    "assetId": "AST-0433",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 433",
    "performedBy": 166,
    "performedAt": "2024-01-25T09:00:00"
  },
  {
    "id": "AH-0949",
    "assetId": "AST-0434",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 434",
    "performedBy": 167,
    "performedAt": "2024-02-07T09:00:00"
  },
  {
    "id": "AH-0950",
    "assetId": "AST-0434",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 167,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0951",
    "assetId": "AST-0435",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 435",
    "performedBy": 168,
    "performedAt": "2024-02-14T09:00:00"
  },
  {
    "id": "AH-0952",
    "assetId": "AST-0435",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 168,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0953",
    "assetId": "AST-0436",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 436",
    "performedBy": 169,
    "performedAt": "2024-02-21T09:00:00"
  },
  {
    "id": "AH-0954",
    "assetId": "AST-0436",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 169,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-0955",
    "assetId": "AST-0437",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 437",
    "performedBy": 170,
    "performedAt": "2024-03-03T09:00:00"
  },
  {
    "id": "AH-0956",
    "assetId": "AST-0437",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-0957",
    "assetId": "AST-0438",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 438",
    "performedBy": 171,
    "performedAt": "2024-03-10T09:00:00"
  },
  {
    "id": "AH-0958",
    "assetId": "AST-0438",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 171,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-0959",
    "assetId": "AST-0439",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 439",
    "performedBy": 172,
    "performedAt": "2024-03-17T09:00:00"
  },
  {
    "id": "AH-0960",
    "assetId": "AST-0440",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 440",
    "performedBy": 173,
    "performedAt": "2024-04-24T09:00:00"
  },
  {
    "id": "AH-0961",
    "assetId": "AST-0441",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 441",
    "performedBy": 102,
    "performedAt": "2024-04-06T09:00:00"
  },
  {
    "id": "AH-0962",
    "assetId": "AST-0441",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 102,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-0963",
    "assetId": "AST-0442",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 442",
    "performedBy": 105,
    "performedAt": "2024-04-13T09:00:00"
  },
  {
    "id": "AH-0964",
    "assetId": "AST-0442",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-0965",
    "assetId": "AST-0443",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 443",
    "performedBy": 109,
    "performedAt": "2025-05-20T09:00:00"
  },
  {
    "id": "AH-0966",
    "assetId": "AST-0443",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 109,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-0967",
    "assetId": "AST-0444",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 444",
    "performedBy": 112,
    "performedAt": "2025-05-02T09:00:00"
  },
  {
    "id": "AH-0968",
    "assetId": "AST-0444",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 112,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-0969",
    "assetId": "AST-0445",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 445",
    "performedBy": 158,
    "performedAt": "2025-05-09T09:00:00"
  },
  {
    "id": "AH-0970",
    "assetId": "AST-0445",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 158,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-0971",
    "assetId": "AST-0446",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 446",
    "performedBy": 159,
    "performedAt": "2025-06-16T09:00:00"
  },
  {
    "id": "AH-0972",
    "assetId": "AST-0446",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 159,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-0973",
    "assetId": "AST-0447",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 447",
    "performedBy": 160,
    "performedAt": "2025-06-23T09:00:00"
  },
  {
    "id": "AH-0974",
    "assetId": "AST-0448",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 448",
    "performedBy": 161,
    "performedAt": "2025-06-05T09:00:00"
  },
  {
    "id": "AH-0975",
    "assetId": "AST-0448",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 161,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-0976",
    "assetId": "AST-0449",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 449",
    "performedBy": 162,
    "performedAt": "2025-07-12T09:00:00"
  },
  {
    "id": "AH-0977",
    "assetId": "AST-0449",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 162,
    "performedAt": "2026-09-25T15:00:00"
  },
  {
    "id": "AH-0978",
    "assetId": "AST-0450",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 450",
    "performedBy": 163,
    "performedAt": "2025-07-19T09:00:00"
  },
  {
    "id": "AH-0979",
    "assetId": "AST-0451",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 451",
    "performedBy": 164,
    "performedAt": "2025-07-01T09:00:00"
  },
  {
    "id": "AH-0980",
    "assetId": "AST-0451",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 164,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-0981",
    "assetId": "AST-0452",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 452",
    "performedBy": 165,
    "performedAt": "2025-08-08T09:00:00"
  },
  {
    "id": "AH-0982",
    "assetId": "AST-0453",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 453",
    "performedBy": 166,
    "performedAt": "2025-08-15T09:00:00"
  },
  {
    "id": "AH-0983",
    "assetId": "AST-0454",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 454",
    "performedBy": 167,
    "performedAt": "2025-08-22T09:00:00"
  },
  {
    "id": "AH-0984",
    "assetId": "AST-0454",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 167,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-0985",
    "assetId": "AST-0455",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 455",
    "performedBy": 168,
    "performedAt": "2026-09-04T09:00:00"
  },
  {
    "id": "AH-0986",
    "assetId": "AST-0456",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 456",
    "performedBy": 169,
    "performedAt": "2026-09-11T09:00:00"
  },
  {
    "id": "AH-0987",
    "assetId": "AST-0457",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 457",
    "performedBy": 170,
    "performedAt": "2026-09-18T09:00:00"
  },
  {
    "id": "AH-0988",
    "assetId": "AST-0458",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 458",
    "performedBy": 171,
    "performedAt": "2026-10-25T09:00:00"
  },
  {
    "id": "AH-0989",
    "assetId": "AST-0458",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 171,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-0990",
    "assetId": "AST-0459",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 459",
    "performedBy": 172,
    "performedAt": "2026-10-07T09:00:00"
  },
  {
    "id": "AH-0991",
    "assetId": "AST-0459",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 172,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-0992",
    "assetId": "AST-0460",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 460",
    "performedBy": 173,
    "performedAt": "2026-10-14T09:00:00"
  },
  {
    "id": "AH-0993",
    "assetId": "AST-0460",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 173,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-0994",
    "assetId": "AST-0461",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 461",
    "performedBy": 102,
    "performedAt": "2026-05-09T09:00:00"
  },
  {
    "id": "AH-0995",
    "assetId": "AST-0461",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 102,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-0996",
    "assetId": "AST-0462",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 462",
    "performedBy": 105,
    "performedAt": "2026-11-03T09:00:00"
  },
  {
    "id": "AH-0997",
    "assetId": "AST-0462",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 105,
    "performedAt": "2026-09-11T15:00:00"
  },
  {
    "id": "AH-0998",
    "assetId": "AST-0463",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 463",
    "performedBy": 109,
    "performedAt": "2026-11-10T09:00:00"
  },
  {
    "id": "AH-0999",
    "assetId": "AST-0463",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 109,
    "performedAt": "2026-09-12T15:00:00"
  },
  {
    "id": "AH-1000",
    "assetId": "AST-0464",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 464",
    "performedBy": 112,
    "performedAt": "2024-01-17T09:00:00"
  },
  {
    "id": "AH-1001",
    "assetId": "AST-0464",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 112,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-1002",
    "assetId": "AST-0465",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 465",
    "performedBy": 158,
    "performedAt": "2024-01-24T09:00:00"
  },
  {
    "id": "AH-1003",
    "assetId": "AST-0465",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 158,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-1004",
    "assetId": "AST-0466",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 466",
    "performedBy": 159,
    "performedAt": "2024-01-06T09:00:00"
  },
  {
    "id": "AH-1005",
    "assetId": "AST-0466",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 159,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-1006",
    "assetId": "AST-0467",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 467",
    "performedBy": 160,
    "performedAt": "2024-02-13T09:00:00"
  },
  {
    "id": "AH-1007",
    "assetId": "AST-0467",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 160,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-1008",
    "assetId": "AST-0468",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 468",
    "performedBy": 161,
    "performedAt": "2024-02-20T09:00:00"
  },
  {
    "id": "AH-1009",
    "assetId": "AST-0468",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 161,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-1010",
    "assetId": "AST-0469",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 469",
    "performedBy": 162,
    "performedAt": "2024-02-02T09:00:00"
  },
  {
    "id": "AH-1011",
    "assetId": "AST-0470",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 470",
    "performedBy": 163,
    "performedAt": "2024-03-09T09:00:00"
  },
  {
    "id": "AH-1012",
    "assetId": "AST-0470",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 163,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-1013",
    "assetId": "AST-0471",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 471",
    "performedBy": 164,
    "performedAt": "2024-03-16T09:00:00"
  },
  {
    "id": "AH-1014",
    "assetId": "AST-0471",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 164,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-1015",
    "assetId": "AST-0472",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 472",
    "performedBy": 165,
    "performedAt": "2024-03-23T09:00:00"
  },
  {
    "id": "AH-1016",
    "assetId": "AST-0472",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 165,
    "performedAt": "2026-09-21T15:00:00"
  },
  {
    "id": "AH-1017",
    "assetId": "AST-0473",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 473",
    "performedBy": 166,
    "performedAt": "2024-04-05T09:00:00"
  },
  {
    "id": "AH-1018",
    "assetId": "AST-0473",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 166,
    "performedAt": "2026-09-22T15:00:00"
  },
  {
    "id": "AH-1019",
    "assetId": "AST-0474",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 474",
    "performedBy": 167,
    "performedAt": "2024-04-12T09:00:00"
  },
  {
    "id": "AH-1020",
    "assetId": "AST-0474",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 167,
    "performedAt": "2026-09-23T15:00:00"
  },
  {
    "id": "AH-1021",
    "assetId": "AST-0475",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 475",
    "performedBy": 168,
    "performedAt": "2024-04-19T09:00:00"
  },
  {
    "id": "AH-1022",
    "assetId": "AST-0475",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 168,
    "performedAt": "2026-09-24T15:00:00"
  },
  {
    "id": "AH-1023",
    "assetId": "AST-0476",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 476",
    "performedBy": 169,
    "performedAt": "2025-05-01T09:00:00"
  },
  {
    "id": "AH-1024",
    "assetId": "AST-0477",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 477",
    "performedBy": 170,
    "performedAt": "2025-05-08T09:00:00"
  },
  {
    "id": "AH-1025",
    "assetId": "AST-0477",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-26T15:00:00"
  },
  {
    "id": "AH-1026",
    "assetId": "AST-0478",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 478",
    "performedBy": 171,
    "performedAt": "2025-05-15T09:00:00"
  },
  {
    "id": "AH-1027",
    "assetId": "AST-0478",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 171,
    "performedAt": "2026-09-27T15:00:00"
  },
  {
    "id": "AH-1028",
    "assetId": "AST-0479",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop HP ProBook 440 G10 479",
    "performedBy": 172,
    "performedAt": "2025-06-22T09:00:00"
  },
  {
    "id": "AH-1029",
    "assetId": "AST-0479",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 172,
    "performedAt": "2026-09-01T15:00:00"
  },
  {
    "id": "AH-1030",
    "assetId": "AST-0480",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 480",
    "performedBy": 173,
    "performedAt": "2025-06-04T09:00:00"
  },
  {
    "id": "AH-1031",
    "assetId": "AST-0480",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 173,
    "performedAt": "2026-09-02T15:00:00"
  },
  {
    "id": "AH-1032",
    "assetId": "AST-0481",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 481",
    "performedBy": 102,
    "performedAt": "2025-06-11T09:00:00"
  },
  {
    "id": "AH-1033",
    "assetId": "AST-0481",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 102,
    "performedAt": "2026-09-03T15:00:00"
  },
  {
    "id": "AH-1034",
    "assetId": "AST-0482",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 482",
    "performedBy": 105,
    "performedAt": "2025-07-18T09:00:00"
  },
  {
    "id": "AH-1035",
    "assetId": "AST-0483",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 483",
    "performedBy": 109,
    "performedAt": "2025-07-25T09:00:00"
  },
  {
    "id": "AH-1036",
    "assetId": "AST-0483",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 109,
    "performedAt": "2026-09-05T15:00:00"
  },
  {
    "id": "AH-1037",
    "assetId": "AST-0484",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 484",
    "performedBy": 112,
    "performedAt": "2025-07-07T09:00:00"
  },
  {
    "id": "AH-1038",
    "assetId": "AST-0484",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นชำรุด",
    "oldValue": "available",
    "newValue": "damaged",
    "performedBy": 112,
    "performedAt": "2026-09-06T15:00:00"
  },
  {
    "id": "AH-1039",
    "assetId": "AST-0485",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 485",
    "performedBy": 158,
    "performedAt": "2025-08-14T09:00:00"
  },
  {
    "id": "AH-1040",
    "assetId": "AST-0485",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 158,
    "performedAt": "2026-09-07T15:00:00"
  },
  {
    "id": "AH-1041",
    "assetId": "AST-0486",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Dell P2422H 486",
    "performedBy": 159,
    "performedAt": "2025-08-21T09:00:00"
  },
  {
    "id": "AH-1042",
    "assetId": "AST-0486",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 159,
    "performedAt": "2026-09-08T15:00:00"
  },
  {
    "id": "AH-1043",
    "assetId": "AST-0487",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 487",
    "performedBy": 160,
    "performedAt": "2025-08-03T09:00:00"
  },
  {
    "id": "AH-1044",
    "assetId": "AST-0487",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 160,
    "performedAt": "2026-09-09T15:00:00"
  },
  {
    "id": "AH-1045",
    "assetId": "AST-0488",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Monitor Samsung S24C310 488",
    "performedBy": 161,
    "performedAt": "2026-09-10T09:00:00"
  },
  {
    "id": "AH-1046",
    "assetId": "AST-0488",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 161,
    "performedAt": "2026-09-10T15:00:00"
  },
  {
    "id": "AH-1047",
    "assetId": "AST-0489",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Lenovo ThinkPad E14 Gen 5 489",
    "performedBy": 162,
    "performedAt": "2026-09-17T09:00:00"
  },
  {
    "id": "AH-1048",
    "assetId": "AST-0490",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 490",
    "performedBy": 163,
    "performedAt": "2026-09-24T09:00:00"
  },
  {
    "id": "AH-1049",
    "assetId": "AST-0491",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 491",
    "performedBy": 164,
    "performedAt": "2026-10-06T09:00:00"
  },
  {
    "id": "AH-1050",
    "assetId": "AST-0491",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 164,
    "performedAt": "2026-09-13T15:00:00"
  },
  {
    "id": "AH-1051",
    "assetId": "AST-0492",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 492",
    "performedBy": 165,
    "performedAt": "2026-10-13T09:00:00"
  },
  {
    "id": "AH-1052",
    "assetId": "AST-0492",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 165,
    "performedAt": "2026-09-14T15:00:00"
  },
  {
    "id": "AH-1053",
    "assetId": "AST-0493",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "เก้าอี้สำนักงาน Modernform Ergo Chair 493",
    "performedBy": 166,
    "performedAt": "2026-10-20T09:00:00"
  },
  {
    "id": "AH-1054",
    "assetId": "AST-0493",
    "action": "disposed",
    "description": "จำหน่ายทรัพย์สินออกจากการใช้งาน",
    "oldValue": "available",
    "newValue": "disposed",
    "performedBy": 166,
    "performedAt": "2026-09-15T15:00:00"
  },
  {
    "id": "AH-1055",
    "assetId": "AST-0494",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch TP-Link TL-SG108 494",
    "performedBy": 167,
    "performedAt": "2026-11-02T09:00:00"
  },
  {
    "id": "AH-1056",
    "assetId": "AST-0494",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 167,
    "performedAt": "2026-09-16T15:00:00"
  },
  {
    "id": "AH-1057",
    "assetId": "AST-0495",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Laptop Dell Latitude 5440 495",
    "performedBy": 168,
    "performedAt": "2026-11-09T09:00:00"
  },
  {
    "id": "AH-1058",
    "assetId": "AST-0495",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังซ่อม",
    "oldValue": "available",
    "newValue": "repair",
    "performedBy": 168,
    "performedAt": "2026-09-17T15:00:00"
  },
  {
    "id": "AH-1059",
    "assetId": "AST-0496",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer HP LaserJet Pro M404dn 496",
    "performedBy": 169,
    "performedAt": "2026-11-16T09:00:00"
  },
  {
    "id": "AH-1060",
    "assetId": "AST-0496",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 169,
    "performedAt": "2026-09-18T15:00:00"
  },
  {
    "id": "AH-1061",
    "assetId": "AST-0497",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 497",
    "performedBy": 170,
    "performedAt": "2024-01-23T09:00:00"
  },
  {
    "id": "AH-1062",
    "assetId": "AST-0497",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 170,
    "performedAt": "2026-09-19T15:00:00"
  },
  {
    "id": "AH-1063",
    "assetId": "AST-0498",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Printer Canon imageCLASS LBP6030 498",
    "performedBy": 171,
    "performedAt": "2024-01-05T09:00:00"
  },
  {
    "id": "AH-1064",
    "assetId": "AST-0498",
    "action": "status_changed",
    "description": "เปลี่ยนสถานะทรัพย์สินเป็นกำลังยืม",
    "oldValue": "available",
    "newValue": "borrowed",
    "performedBy": 171,
    "performedAt": "2026-09-20T15:00:00"
  },
  {
    "id": "AH-1065",
    "assetId": "AST-0499",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Network Switch Cisco CBS110-8T-D 499",
    "performedBy": 172,
    "performedAt": "2024-01-12T09:00:00"
  },
  {
    "id": "AH-1066",
    "assetId": "AST-0500",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "โต๊ะทำงาน Modernform Workstation 120 500",
    "performedBy": 173,
    "performedAt": "2024-02-19T09:00:00"
  },
  {
    "id": "AH-1077",
    "assetId": "AST-0003",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Samsung Monitor 24”",
    "performedBy": 112,
    "performedAt": "2025-03-05T09:00:00"
  },
  {
    "id": "AH-1078",
    "assetId": "AST-0004",
    "action": "created",
    "description": "เพิ่มทรัพย์สินใหม่เข้าสู่ระบบ",
    "oldValue": null,
    "newValue": "Canon Printer",
    "performedBy": 112,
    "performedAt": "2024-08-20T09:00:00"
  },
  {
    "id": "AH-1079",
    "assetId": "AST-0001",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 103",
    "performedBy": 112,
    "performedAt": "2026-10-26T13:00:00"
  },
  {
    "id": "AH-1080",
    "assetId": "AST-0002",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 102",
    "performedBy": 112,
    "performedAt": "2026-10-22T10:00:00"
  },
  {
    "id": "AH-1081",
    "assetId": "AST-0003",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 103",
    "performedBy": 112,
    "performedAt": "2026-10-11T10:00:00"
  },
  {
    "id": "AH-1082",
    "assetId": "AST-0004",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 104",
    "performedBy": 112,
    "performedAt": "2026-10-15T15:00:00"
  },
  {
    "id": "AH-1083",
    "assetId": "AST-0006",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 103",
    "newValue": "Staff ID: 101",
    "performedBy": 112,
    "performedAt": "2024-12-22T10:00:00"
  },
  {
    "id": "AH-1084",
    "assetId": "AST-0007",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 102",
    "performedBy": 112,
    "performedAt": "2024-12-23T10:00:00"
  },
  {
    "id": "AH-1085",
    "assetId": "AST-0008",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 103",
    "performedBy": 112,
    "performedAt": "2024-12-24T10:00:00"
  },
  {
    "id": "AH-1086",
    "assetId": "AST-0009",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 104",
    "performedBy": 112,
    "performedAt": "2024-12-25T10:00:00"
  },
  {
    "id": "AH-1087",
    "assetId": "AST-0010",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 103",
    "newValue": "Staff ID: 101",
    "performedBy": 112,
    "performedAt": "2025-05-02T14:30:00"
  },
  {
    "id": "AH-1088",
    "assetId": "AST-0011",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 102",
    "performedBy": 112,
    "performedAt": "2024-12-27T10:00:00"
  },
  {
    "id": "AH-1089",
    "assetId": "AST-0012",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 103",
    "performedBy": 112,
    "performedAt": "2024-12-28T10:00:00"
  },
  {
    "id": "AH-1090",
    "assetId": "AST-0013",
    "action": "assigned",
    "description": "เปลี่ยนผู้รับผิดชอบทรัพย์สิน",
    "oldValue": "Staff ID: 101",
    "newValue": "Staff ID: 104",
    "performedBy": 112,
    "performedAt": "2024-12-29T10:00:00"
  },
  {
    "id": "AH-1091",
    "assetId": "AST-0014",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Lenovo ThinkPad E14 014 (ข้อมูลเดิม)",
    "newValue": "Lenovo ThinkPad E14 014",
    "performedBy": 112,
    "performedAt": "2025-01-04T10:00:00"
  },
  {
    "id": "AH-1092",
    "assetId": "AST-0015",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "HP ProBook 440 015 (ข้อมูลเดิม)",
    "newValue": "HP ProBook 440 015",
    "performedBy": 112,
    "performedAt": "2025-01-05T10:00:00"
  },
  {
    "id": "AH-1093",
    "assetId": "AST-0016",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Dell Latitude 5440 016 (ข้อมูลเดิม)",
    "newValue": "Dell Latitude 5440 016",
    "performedBy": 112,
    "performedAt": "2025-01-06T10:00:00"
  },
  {
    "id": "AH-1094",
    "assetId": "AST-0017",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Samsung Monitor 24-inch 017 (ข้อมูลเดิม)",
    "newValue": "Samsung Monitor 24-inch 017",
    "performedBy": 112,
    "performedAt": "2025-01-07T10:00:00"
  },
  {
    "id": "AH-1095",
    "assetId": "AST-0018",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Canon Printer 018 (ข้อมูลเดิม)",
    "newValue": "Canon Printer 018",
    "performedBy": 112,
    "performedAt": "2025-01-08T10:00:00"
  },
  {
    "id": "AH-1096",
    "assetId": "AST-0019",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "HP LaserJet Pro 019 (ข้อมูลเดิม)",
    "newValue": "HP LaserJet Pro 019",
    "performedBy": 112,
    "performedAt": "2025-01-09T10:00:00"
  },
  {
    "id": "AH-1097",
    "assetId": "AST-0020",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Cisco Network Switch 020 (ข้อมูลเดิม)",
    "newValue": "Cisco Network Switch 020",
    "performedBy": 112,
    "performedAt": "2025-08-15T11:00:00"
  },
  {
    "id": "AH-1098",
    "assetId": "AST-0021",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Office Desk 021 (ข้อมูลเดิม)",
    "newValue": "Office Desk 021",
    "performedBy": 112,
    "performedAt": "2025-01-11T10:00:00"
  },
  {
    "id": "AH-1099",
    "assetId": "AST-0022",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Lenovo ThinkPad E14 022 (ข้อมูลเดิม)",
    "newValue": "Lenovo ThinkPad E14 022",
    "performedBy": 112,
    "performedAt": "2025-01-12T10:00:00"
  },
  {
    "id": "AH-1100",
    "assetId": "AST-0023",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "HP ProBook 440 023 (ข้อมูลเดิม)",
    "newValue": "HP ProBook 440 023",
    "performedBy": 112,
    "performedAt": "2025-01-13T10:00:00"
  },
  {
    "id": "AH-1101",
    "assetId": "AST-0024",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Dell Latitude 5440 024 (ข้อมูลเดิม)",
    "newValue": "Dell Latitude 5440 024",
    "performedBy": 112,
    "performedAt": "2025-01-14T10:00:00"
  },
  {
    "id": "AH-1102",
    "assetId": "AST-0025",
    "action": "updated",
    "description": "แก้ไขรายละเอียดทรัพย์สิน",
    "oldValue": "Samsung Monitor 24-inch 025 (ข้อมูลเดิม)",
    "newValue": "Samsung Monitor 24-inch 025",
    "performedBy": 112,
    "performedAt": "2025-01-15T10:00:00"
  },
  {
    "id": "AH-1067",
    "assetId": "AST-0056",
    "action": "transferred",
    "description": "โอนทรัพย์สินจาก BR-001 ไปยัง BR-002",
    "oldValue": "BR-001",
    "newValue": "BR-002",
    "performedBy": 112,
    "performedAt": "2024-03-31T09:00:00"
  },
  {
    "id": "AH-1068",
    "assetId": "AST-0056",
    "action": "transferred",
    "description": "โอนทรัพย์สินกลับจาก BR-002 ไปยัง BR-001",
    "oldValue": "BR-002",
    "newValue": "BR-001",
    "performedBy": 112,
    "performedAt": "2024-05-30T09:00:00"
  },
  {
    "id": "AH-1069",
    "assetId": "AST-0052",
    "action": "transferred",
    "description": "โอนทรัพย์สินจาก BR-002 ไปยัง BR-003",
    "oldValue": "BR-002",
    "newValue": "BR-003",
    "performedBy": 112,
    "performedAt": "2024-12-01T09:00:00"
  },
  {
    "id": "AH-1070",
    "assetId": "AST-0052",
    "action": "transferred",
    "description": "โอนทรัพย์สินกลับจาก BR-003 ไปยัง BR-002",
    "oldValue": "BR-003",
    "newValue": "BR-002",
    "performedBy": 112,
    "performedAt": "2025-01-30T09:00:00"
  },
  {
    "id": "AH-1071",
    "assetId": "AST-0005",
    "action": "transferred",
    "description": "โอนทรัพย์สินจาก BR-003 ไปยัง BR-004",
    "oldValue": "BR-003",
    "newValue": "BR-004",
    "performedBy": 112,
    "performedAt": "2026-06-09T09:00:00"
  },
  {
    "id": "AH-1072",
    "assetId": "AST-0005",
    "action": "transferred",
    "description": "โอนทรัพย์สินกลับจาก BR-004 ไปยัง BR-003",
    "oldValue": "BR-004",
    "newValue": "BR-003",
    "performedBy": 112,
    "performedAt": "2026-08-08T09:00:00"
  },
  {
    "id": "AH-1073",
    "assetId": "AST-0054",
    "action": "transferred",
    "description": "โอนทรัพย์สินจาก BR-004 ไปยัง BR-005",
    "oldValue": "BR-004",
    "newValue": "BR-005",
    "performedBy": 112,
    "performedAt": "2024-01-31T09:00:00"
  },
  {
    "id": "AH-1074",
    "assetId": "AST-0054",
    "action": "transferred",
    "description": "โอนทรัพย์สินกลับจาก BR-005 ไปยัง BR-004",
    "oldValue": "BR-005",
    "newValue": "BR-004",
    "performedBy": 112,
    "performedAt": "2024-03-31T09:00:00"
  },
  {
    "id": "AH-1075",
    "assetId": "AST-0055",
    "action": "transferred",
    "description": "โอนทรัพย์สินจาก BR-005 ไปยัง BR-001",
    "oldValue": "BR-005",
    "newValue": "BR-001",
    "performedBy": 112,
    "performedAt": "2024-03-02T09:00:00"
  },
  {
    "id": "AH-1076",
    "assetId": "AST-0055",
    "action": "transferred",
    "description": "โอนทรัพย์สินกลับจาก BR-001 ไปยัง BR-005",
    "oldValue": "BR-001",
    "newValue": "BR-005",
    "performedBy": 112,
    "performedAt": "2024-05-01T09:00:00"
  }
];
