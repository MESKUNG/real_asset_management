export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Approval = {
  id: string;
  requestId: string;
  requestType: "borrow";
  requesterId: number;
  approverId: number | null;
  status: ApprovalStatus;
  comment: string;
  requestedAt: string;
  approvedAt: string | null;
};

export const approvals: Approval[] = [
  {
    id: "APR-0001",
    requestId: "BRQ-0001",
    requestType: "borrow",
    requesterId: 102,
    approverId: null,
    status: "pending",
    comment: "",
    requestedAt: "2026-11-05T09:00:00",
    approvedAt: null,
  },
  {
    id: "APR-0002",
    requestId: "BRQ-0002",
    requestType: "borrow",
    requesterId: 103,
    approverId: 101,
    status: "approved",
    comment: "อนุมัติให้ยืมได้",
    requestedAt: "2026-10-18T10:00:00",
    approvedAt: "2026-10-18T13:00:00",
  },
  {
    id: "APR-0003",
    requestId: "BRQ-0003",
    requestType: "borrow",
    requesterId: 104,
    approverId: 101,
    status: "rejected",
    comment: "ทรัพย์สินอยู่ระหว่างซ่อม",
    requestedAt: "2026-10-20T11:00:00",
    approvedAt: "2026-10-20T15:00:00",
  },
  {
    id: "APR-0004",
    requestId: "BRQ-0004",
    requestType: "borrow",
    requesterId: 103,
    approverId: 101,
    status: "approved",
    comment: "อนุมัติเรียบร้อย",
    requestedAt: "2026-08-30T09:00:00",
    approvedAt: "2026-08-30T11:00:00",
  },
  {
    id: "APR-0005",
    requestId: "BRQ-0005",
    requestType: "borrow",
    requesterId: 104,
    approverId: 101,
    status: "approved",
    comment: "อนุมัติการยืม",
    requestedAt: "2026-10-30T14:00:00",
    approvedAt: "2026-10-30T16:00:00",
  },
  {
    id: "APR-0006",
    requestId: "BRQ-0006",
    requestType: "borrow",
    requesterId: 102,
    approverId: 101,
    status: "rejected",
    comment: "ไม่อนุมัติ เนื่องจากทรัพย์สินชำรุด",
    requestedAt: "2026-11-05T10:00:00",
    approvedAt: "2026-11-05T11:00:00",
  },
  {
    id: "APR-0007",
    requestId: "BRQ-0007",
    requestType: "borrow",
    requesterId: 104,
    approverId: 101,
    status: "approved",
    comment: "อนุมัติการยืม",
    requestedAt: "2026-08-08T13:00:00",
    approvedAt: "2026-08-08T15:00:00",
  },
  {
    id: "APR-0008",
    requestId: "BRQ-0008",
    requestType: "borrow",
    requesterId: 102,
    approverId: 101,
    status: "rejected",
    comment: "จำเป็นต้องใช้งานภายในสาขา",
    requestedAt: "2026-09-13T10:00:00",
    approvedAt: "2026-09-13T14:00:00",
  },
  {
    id: "APR-0009",
    requestId: "BRQ-0009",
    requestType: "borrow",
    requesterId: 103,
    approverId: 101,
    status: "approved",
    comment: "อนุมัติเรียบร้อย",
    requestedAt: "2026-06-29T09:00:00",
    approvedAt: "2026-06-29T11:00:00",
  },
  {
    id: "APR-0010",
    requestId: "BRQ-0010",
    requestType: "borrow",
    requesterId: 102,
    approverId: 101,
    status: "approved",
    comment: "อนุมัติให้ยืมได้",
    requestedAt: "2026-11-02T09:00:00",
    approvedAt: "2026-11-02T11:00:00",
  },
];
