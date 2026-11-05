
export type RepairStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "rejected";

export type RepairPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type RepairRequest = {
  id: string;
  assetId: string;
  reporterId: number;
  branchId: string;
  issue: string;
  priority: RepairPriority;
  status: RepairStatus;
  vendorId: string;
  reportedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  solution: string;
  adminNote: string;
};

export const repairRequests: RepairRequest[] = [
  {
    id: "REP-0001",
    assetId: "AST-0003",
    reporterId: 103,
    branchId: "BR-002",
    issue: "หน้าจอมีเส้นแนวตั้งและภาพกระพริบ",
    priority: "high",
    status: "in_progress",
    vendorId: "VEN-003",
    reportedAt: "2026-10-20T09:00:00",
    startedAt: "2026-10-21T10:00:00",
    completedAt: null,
    estimatedCost: 2500,
    actualCost: null,
    solution: "",
    adminNote: "ติดต่อศูนย์บริการแล้ว รออะไหล่"
  },
  {
    id: "REP-0002",
    assetId: "AST-0004",
    reporterId: 104,
    branchId: "BR-002",
    issue: "เครื่องพิมพ์ไม่สามารถดึงกระดาษได้",
    priority: "medium",
    status: "pending",
    vendorId: "VEN-001",
    reportedAt: "2026-11-02T09:00:00",
    startedAt: null,
    completedAt: null,
    estimatedCost: null,
    actualCost: null,
    solution: "",
    adminNote: "รอ Admin ติดต่อผู้จำหน่าย"
  },
  {
    id: "REP-0003",
    assetId: "AST-0001",
    reporterId: 102,
    branchId: "BR-001",
    issue: "แบตเตอรี่เสื่อม ใช้งานได้ไม่นาน",
    priority: "medium",
    status: "completed",
    vendorId: "VEN-001",
    reportedAt: "2026-09-01T09:00:00",
    startedAt: "2026-09-02T10:00:00",
    completedAt: "2026-09-04T15:00:00",
    estimatedCost: 4500,
    actualCost: 4200,
    solution: "เปลี่ยนแบตเตอรี่ใหม่",
    adminNote: "ดำเนินการเรียบร้อย"
  },
  {
    id: "REP-0004",
    assetId: "AST-0002",
    reporterId: 104,
    branchId: "BR-001",
    issue: "คีย์บอร์ดบางปุ่มกดไม่ติด",
    priority: "low",
    status: "completed",
    vendorId: "VEN-002",
    reportedAt: "2026-08-10T09:00:00",
    startedAt: "2026-08-11T10:00:00",
    completedAt: "2026-08-12T14:00:00",
    estimatedCost: 1200,
    actualCost: 1000,
    solution: "เปลี่ยนชุดคีย์บอร์ด",
    adminNote: "ซ่อมเสร็จและทดสอบแล้ว"
  },
  {
    id: "REP-0005",
    assetId: "AST-0003",
    reporterId: 103,
    branchId: "BR-002",
    issue: "ขาตั้งจอภาพหลวม",
    priority: "low",
    status: "rejected",
    vendorId: "VEN-003",
    reportedAt: "2026-07-15T09:00:00",
    startedAt: null,
    completedAt: null,
    estimatedCost: null,
    actualCost: null,
    solution: "",
    adminNote: "ไม่ดำเนินการซ่อม เนื่องจากอยู่ระหว่างพิจารณาจำหน่าย"
  },
  {
    id: "REP-0006",
    assetId: "AST-0001",
    reporterId: 101,
    branchId: "BR-001",
    issue: "พัดลมระบายความร้อนมีเสียงดังผิดปกติ",
    priority: "high",
    status: "in_progress",
    vendorId: "VEN-001",
    reportedAt: "2026-11-04T10:00:00",
    startedAt: "2026-11-05T13:00:00",
    completedAt: null,
    estimatedCost: null,
    actualCost: null,
    solution: "",
    adminNote: "กำลังตรวจสอบอาการ"
  },
  {
    id: "REP-0007",
    assetId: "AST-0002",
    reporterId: 102,
    branchId: "BR-001",
    issue: "Adapter ชาร์จไฟไม่เข้า",
    priority: "urgent",
    status: "completed",
    vendorId: "VEN-002",
    reportedAt: "2026-10-25T09:00:00",
    startedAt: "2026-10-25T13:00:00",
    completedAt: "2026-10-26T15:00:00",
    estimatedCost: 1800,
    actualCost: null,
    solution: "เปลี่ยน Adapter และทดสอบการชาร์จแล้ว",
    adminNote: "ส่งตรวจสอบกับผู้จำหน่าย"
  },
  {
    id: "REP-0008",
    assetId: "AST-0004",
    reporterId: 104,
    branchId: "BR-002",
    issue: "คุณภาพงานพิมพ์ไม่ชัดเจน",
    priority: "medium",
    status: "completed",
    vendorId: "VEN-001",
    reportedAt: "2026-06-01T09:00:00",
    startedAt: "2026-06-02T10:00:00",
    completedAt: "2026-06-03T15:00:00",
    estimatedCost: 800,
    actualCost: 750,
    solution: "ทำความสะอาดชุด Drum และเปลี่ยน Toner",
    adminNote: "ทดสอบพิมพ์แล้วใช้งานได้ปกติ"
  },
  {
    id: "REP-0009",
    assetId: "AST-0001",
    reporterId: 103,
    branchId: "BR-001",
    issue: "พอร์ต USB ใช้งานไม่ได้",
    priority: "medium",
    status: "completed",
    vendorId: "VEN-001",
    reportedAt: "2026-05-10T09:00:00",
    startedAt: "2026-05-11T10:00:00",
    completedAt: "2026-05-13T16:00:00",
    estimatedCost: 1500,
    actualCost: 1500,
    solution: "ซ่อมแผงวงจร USB",
    adminNote: "ทดสอบการเชื่อมต่อเรียบร้อย"
  },
  {
    id: "REP-0010",
    assetId: "AST-0002",
    reporterId: 104,
    branchId: "BR-001",
    issue: "เครื่องเปิดไม่ติด",
    priority: "urgent",
    status: "rejected",
    vendorId: "VEN-002",
    reportedAt: "2026-11-05T11:00:00",
    startedAt: null,
    completedAt: null,
    estimatedCost: null,
    actualCost: null,
    solution: "",
    adminNote: "ไม่พบความผิดปกติหลังตรวจสอบ ไม่ต้องซ่อม"
  }
];
