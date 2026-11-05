export type BorrowStatus =
  | "pending"
  | "approved"
  | "borrowed"
  | "returned"
  | "rejected"
  | "overdue";

export type BorrowRequest = {
  id: string;
  assetId: string;
  borrowerId: number;
  branchId: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  purpose: string;
  status: BorrowStatus;
  note: string;
  createdAt: string;
};

export const borrowRequests: BorrowRequest[] = [
  {
    id: "BRQ-0001",
    assetId: "AST-0005",
    borrowerId: 102,
    branchId: "BR-003",
    borrowDate: "2026-11-10",
    expectedReturnDate: "2026-11-15",
    actualReturnDate: null,
    purpose: "นำ Notebook ไปใช้ประชุมนอกสถานที่",
    status: "pending",
    note: "",
    createdAt: "2026-11-05T09:00:00",
  },
  {
    id: "BRQ-0002",
    assetId: "AST-0002",
    borrowerId: 103,
    branchId: "BR-001",
    borrowDate: "2026-10-20",
    expectedReturnDate: "2026-10-25",
    actualReturnDate: "2026-10-25",
    purpose: "ใช้ทำงานที่บ้าน",
    status: "returned",
    note: "คืนทรัพย์สินเรียบร้อย",
    createdAt: "2026-10-18T10:00:00",
  },
  {
    id: "BRQ-0003",
    assetId: "AST-0003",
    borrowerId: 104,
    branchId: "BR-002",
    borrowDate: "2026-10-22",
    expectedReturnDate: "2026-10-24",
    actualReturnDate: null,
    purpose: "ใช้สำหรับงานนำเสนอ",
    status: "rejected",
    note: "ทรัพย์สินอยู่ระหว่างซ่อม",
    createdAt: "2026-10-20T11:00:00",
  },
  {
    id: "BRQ-0004",
    assetId: "AST-0001",
    borrowerId: 103,
    branchId: "BR-001",
    borrowDate: "2026-09-01",
    expectedReturnDate: "2026-09-05",
    actualReturnDate: "2026-09-04",
    purpose: "ใช้สำหรับอบรมพนักงาน",
    status: "returned",
    note: "คืนทรัพย์สินเรียบร้อย",
    createdAt: "2026-08-30T09:00:00",
  },
  {
    id: "BRQ-0005",
    assetId: "AST-0002",
    borrowerId: 104,
    branchId: "BR-001",
    borrowDate: "2026-11-01",
    expectedReturnDate: "2026-11-10",
    actualReturnDate: null,
    purpose: "ใช้ปฏิบัติงานนอกสำนักงาน",
    status: "borrowed",
    note: "",
    createdAt: "2026-10-30T14:00:00",
  },
  {
    id: "BRQ-0006",
    assetId: "AST-0004",
    borrowerId: 102,
    branchId: "BR-002",
    borrowDate: "2026-11-12",
    expectedReturnDate: "2026-11-14",
    actualReturnDate: null,
    purpose: "นำเครื่องพิมพ์ไปใช้ในงานกิจกรรม",
    status: "rejected",
    note: "ทรัพย์สินชำรุด ไม่สามารถให้ยืมได้",
    createdAt: "2026-11-05T10:00:00",
  },
  {
    id: "BRQ-0007",
    assetId: "AST-0001",
    borrowerId: 104,
    branchId: "BR-001",
    borrowDate: "2026-08-10",
    expectedReturnDate: "2026-08-15",
    actualReturnDate: "2026-08-16",
    purpose: "ใช้สำหรับการเดินทางไปพบลูกค้า",
    status: "returned",
    note: "คืนทรัพย์สินล่าช้า",
    createdAt: "2026-08-08T13:00:00",
  },
  {
    id: "BRQ-0008",
    assetId: "AST-0003",
    borrowerId: 102,
    branchId: "BR-002",
    borrowDate: "2026-09-15",
    expectedReturnDate: "2026-09-20",
    actualReturnDate: null,
    purpose: "นำไปใช้ในงานสัมมนา",
    status: "rejected",
    note: "ไม่อนุมัติเนื่องจากมีการใช้งานภายในสาขา",
    createdAt: "2026-09-13T10:00:00",
  },
  {
    id: "BRQ-0009",
    assetId: "AST-0002",
    borrowerId: 103,
    branchId: "BR-001",
    borrowDate: "2026-07-01",
    expectedReturnDate: "2026-07-05",
    actualReturnDate: "2026-07-05",
    purpose: "ใช้สำหรับทำรายงาน",
    status: "returned",
    note: "คืนตรงตามกำหนด",
    createdAt: "2026-06-29T09:00:00",
  },
  {
    id: "BRQ-0010",
    assetId: "AST-0001",
    borrowerId: 102,
    branchId: "BR-001",
    borrowDate: "2026-11-03",
    expectedReturnDate: "2026-11-08",
    actualReturnDate: "2026-11-04",
    purpose: "ใช้ทำงานโครงการ",
    status: "returned",
    note: "คืนก่อนกำหนดเพื่อนำทรัพย์สินเข้าตรวจซ่อม",
    createdAt: "2026-11-02T09:00:00",
  },
];
