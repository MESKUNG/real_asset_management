export type BorrowStatus =
  | "pending"
  | "approved"
  | "returned"
  | "rejected"
  | "overdue";

// เบิก / คืน / ขอโอนย้าย
export type BorrowRequestType = "withdraw" | "return" | "transfer";

export type BorrowRequest = {
  id: string;
  type: BorrowRequestType;
  assetId: string;
  borrowerId: number;
  branchId: string; // สาขาต้นทาง (สาขาของทรัพย์สิน)
  toBranchId: string | null; // สาขาปลายทาง ใช้เฉพาะ type = "transfer"
  borrowDate: string; // เบิก/โอนย้าย = วันที่ต้องการ, คืน = ไม่ใช้ (ว่าง)
  expectedReturnDate: string; // ใช้เฉพาะ type = "return"
  actualReturnDate: string | null;
  purpose: string;
  status: BorrowStatus;
  note: string;
  createdAt: string;
};

export const borrowRequests: BorrowRequest[] = [
  {
    id: "BRQ-0001",
    type: "withdraw",
    assetId: "AST-0005",
    borrowerId: 102,
    branchId: "BR-003",
    toBranchId: null,
    borrowDate: "2026-11-10",
    expectedReturnDate: "",
    actualReturnDate: null,
    purpose: "ขอเบิก Notebook ไปใช้ประชุมนอกสถานที่",
    status: "pending",
    note: "",
    createdAt: "2026-11-05T09:00:00",
  },
  {
    id: "BRQ-0002",
    type: "return",
    assetId: "AST-0002",
    borrowerId: 103,
    branchId: "BR-001",
    toBranchId: null,
    borrowDate: "",
    expectedReturnDate: "2026-10-25",
    actualReturnDate: "2026-10-25",
    purpose: "คืน Notebook ที่ยืมไปใช้ทำงานที่บ้าน",
    status: "returned",
    note: "คืนทรัพย์สินเรียบร้อย",
    createdAt: "2026-10-18T10:00:00",
  },
  {
    id: "BRQ-0003",
    type: "withdraw",
    assetId: "AST-0003",
    borrowerId: 104,
    branchId: "BR-002",
    toBranchId: null,
    borrowDate: "2026-10-22",
    expectedReturnDate: "",
    actualReturnDate: null,
    purpose: "ขอเบิกจอภาพไปใช้สำหรับงานนำเสนอ",
    status: "rejected",
    note: "ทรัพย์สินอยู่ระหว่างซ่อม",
    createdAt: "2026-10-20T11:00:00",
  },
  {
    id: "BRQ-0004",
    type: "return",
    assetId: "AST-0001",
    borrowerId: 103,
    branchId: "BR-001",
    toBranchId: null,
    borrowDate: "",
    expectedReturnDate: "2026-09-05",
    actualReturnDate: "2026-09-04",
    purpose: "คืน MacBook ที่ยืมไปใช้อบรมพนักงาน",
    status: "returned",
    note: "คืนทรัพย์สินเรียบร้อย",
    createdAt: "2026-08-30T09:00:00",
  },
  {
    id: "BRQ-0005",
    type: "return",
    assetId: "AST-0002",
    borrowerId: 104,
    branchId: "BR-001",
    toBranchId: null,
    borrowDate: "",
    expectedReturnDate: "2026-11-10",
    actualReturnDate: null,
    purpose: "คืน Notebook ที่ยืมไปปฏิบัติงานนอกสำนักงาน",
    status: "approved",
    note: "",
    createdAt: "2026-10-30T14:00:00",
  },
  {
    id: "BRQ-0006",
    type: "transfer",
    assetId: "AST-0004",
    borrowerId: 102,
    branchId: "BR-002",
    toBranchId: "BR-001",
    borrowDate: "2026-11-12",
    expectedReturnDate: "",
    actualReturnDate: null,
    purpose: "ขอโอนย้ายเครื่องพิมพ์ไปสำนักงานใหญ่เพื่อใช้ในงานกิจกรรม",
    status: "rejected",
    note: "ทรัพย์สินชำรุด ไม่สามารถโอนย้ายได้",
    createdAt: "2026-11-05T10:00:00",
  },
  {
    id: "BRQ-0007",
    type: "return",
    assetId: "AST-0001",
    borrowerId: 104,
    branchId: "BR-001",
    toBranchId: null,
    borrowDate: "",
    expectedReturnDate: "2026-08-15",
    actualReturnDate: "2026-08-16",
    purpose: "คืน MacBook ที่ยืมไปพบลูกค้า",
    status: "returned",
    note: "คืนทรัพย์สินล่าช้า",
    createdAt: "2026-08-08T13:00:00",
  },
  {
    id: "BRQ-0008",
    type: "transfer",
    assetId: "AST-0003",
    borrowerId: 102,
    branchId: "BR-002",
    toBranchId: "BR-004",
    borrowDate: "2026-09-15",
    expectedReturnDate: "",
    actualReturnDate: null,
    purpose: "ขอโอนย้ายจอภาพไปใช้ในงานสัมมนาที่สาขาขอนแก่น",
    status: "rejected",
    note: "ไม่อนุมัติเนื่องจากมีการใช้งานภายในสาขา",
    createdAt: "2026-09-13T10:00:00",
  },
  {
    id: "BRQ-0009",
    type: "withdraw",
    assetId: "AST-0002",
    borrowerId: 103,
    branchId: "BR-001",
    toBranchId: null,
    borrowDate: "2026-07-01",
    expectedReturnDate: "",
    actualReturnDate: null,
    purpose: "ขอเบิก Notebook ไปใช้สำหรับทำรายงาน",
    status: "approved",
    note: "อนุมัติการเบิกเรียบร้อย",
    createdAt: "2026-06-29T09:00:00",
  },
  {
    id: "BRQ-0010",
    type: "transfer",
    assetId: "AST-0005",
    borrowerId: 102,
    branchId: "BR-003",
    toBranchId: "BR-001",
    borrowDate: "2026-11-03",
    expectedReturnDate: "",
    actualReturnDate: null,
    purpose: "ขอโอนย้าย Notebook ไปสำนักงานใหญ่เพื่อใช้ในโครงการ",
    status: "approved",
    note: "อนุมัติการโอนย้ายเรียบร้อย",
    createdAt: "2026-11-02T09:00:00",
  },
];
