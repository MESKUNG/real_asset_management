export type InventorySessionStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type InventorySession = {
  id: string;
  name: string;
  branchId: string;

  startDate: string;
  endDate: string;

  status: InventorySessionStatus;

  totalAssets: number;
  checkedAssets: number;

  createdBy: number;
  createdAt: string;

  completedBy: number | null;
  completedAt: string | null;

  note: string;
};

export const inventorySessions: InventorySession[] = [
  {
    id: "IS-0001",
    name: "ตรวจนับทรัพย์สินประจำเดือนตุลาคม 2569 - สำนักงานใหญ่",
    branchId: "BR-001",
    startDate: "2026-10-20",
    endDate: "2026-10-22",
    status: "completed",
    totalAssets: 2,
    checkedAssets: 2,
    createdBy: 112,
    createdAt: "2026-10-18T09:00:00",
    completedBy: 112,
    completedAt: "2026-10-20T10:30:00",
    note: "ตรวจนับทรัพย์สินประจำเดือนตุลาคม",
  },
  {
    id: "IS-0002",
    name: "ตรวจนับทรัพย์สินประจำเดือนตุลาคม 2569 - สาขาเชียงใหม่",
    branchId: "BR-002",
    startDate: "2026-10-25",
    endDate: "2026-10-27",
    status: "completed",
    totalAssets: 2,
    checkedAssets: 2,
    createdBy: 112,
    createdAt: "2026-10-22T09:00:00",
    completedBy: 112,
    completedAt: "2026-10-25T10:30:00",
    note: "ตรวจนับทรัพย์สินประจำเดือนตุลาคม",
  },
  {
    id: "IS-0003",
    name: "ตรวจนับทรัพย์สินประจำเดือนพฤศจิกายน 2569 - สำนักงานใหญ่",
    branchId: "BR-001",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    status: "planned",
    totalAssets: 2,
    checkedAssets: 0,
    createdBy: 112,
    createdAt: "2026-11-01T09:00:00",
    completedBy: null,
    completedAt: null,
    note: "รอเริ่มดำเนินการตรวจนับ",
  },
  {
    id: "IS-0004",
    name: "ตรวจนับทรัพย์สินประจำเดือนพฤศจิกายน 2569 - สาขาภูเก็ต",
    branchId: "BR-003",
    startDate: "2026-11-05",
    endDate: "2026-11-07",
    status: "in_progress",
    totalAssets: 1,
    checkedAssets: 0,
    createdBy: 112,
    createdAt: "2026-11-01T10:00:00",
    completedBy: null,
    completedAt: null,
    note: "กำลังดำเนินการตรวจนับ",
  },
  {
    id: "IS-0005",
    name: "ตรวจนับทรัพย์สินประจำเดือนธันวาคม 2569 - สำนักงานใหญ่",
    branchId: "BR-001",
    startDate: "2026-12-15",
    endDate: "2026-12-17",
    status: "planned",
    totalAssets: 2,
    checkedAssets: 0,
    createdBy: 112,
    createdAt: "2026-11-01T11:00:00",
    completedBy: null,
    completedAt: null,
    note: "กำหนดการตรวจนับรอบถัดไป",
  },
];
