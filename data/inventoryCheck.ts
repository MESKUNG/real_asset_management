export type InventoryResult = "found" | "missing" | "damaged" | "mismatch";

export type InventoryCheck = {
  id: string;
  sessionId: string;
  assetId: string;
  branchId: string;
  checkerId: number;

  result: InventoryResult;
  checkedAt: string;
  note: string;
};

export const inventoryChecks: InventoryCheck[] = [
  {
    id: "IC-0001",
    sessionId: "IS-0001",
    assetId: "AST-0001",
    branchId: "BR-001",
    checkerId: 101,
    result: "damaged",
    checkedAt: "2026-10-20T09:00:00",
    note: "พบอาการผิดปกติและส่งตรวจสอบ",
  },
  {
    id: "IC-0002",
    sessionId: "IS-0001",
    assetId: "AST-0002",
    branchId: "BR-001",
    checkerId: 102,
    result: "found",
    checkedAt: "2026-10-20T09:15:00",
    note: "ตรวจพบทรัพย์สิน สภาพปกติ",
  },
  {
    id: "IC-0003",
    sessionId: "IS-0002",
    assetId: "AST-0003",
    branchId: "BR-002",
    checkerId: 102,
    result: "damaged",
    checkedAt: "2026-10-25T09:00:00",
    note: "พบความเสียหายบริเวณหน้าจอ",
  },
  {
    id: "IC-0004",
    sessionId: "IS-0002",
    assetId: "AST-0004",
    branchId: "BR-002",
    checkerId: 103,
    result: "damaged",
    checkedAt: "2026-10-25T09:20:00",
    note: "พบความเสียหายบริเวณตัวเครื่อง",
  },
];
