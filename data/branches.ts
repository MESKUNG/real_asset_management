export type Branch = {
  id: string;
  name: string;
  code: string;
  address: string;
  province?: string;
  postalCode?: string;
  phone: string;
  status: "active" | "inactive";
  createdAt: string;
};

// ใช้ล็อกคำร้องของ User และกรองรายการให้เห็นเฉพาะสำนักงานใหญ่
export const HEAD_OFFICE_BRANCH_ID = "BR-001";

export const branches: Branch[] = [
  {
    id: "BR-001",
    name: "สำนักงานใหญ่",
    code: "BKK",
    address: "กรุงเทพมหานคร",
    province: "กรุงเทพมหานคร",
    phone: "021000001",
    status: "active",
    createdAt: "2025-01-01T09:00:00",
  },
  {
    id: "BR-002",
    name: "สาขาเชียงใหม่",
    code: "CNX",
    address: "เชียงใหม่",
    province: "เชียงใหม่",
    phone: "021000002",
    status: "active",
    createdAt: "2025-01-01T09:00:00",
  },
  {
    id: "BR-003",
    name: "สาขาภูเก็ต",
    code: "HKT",
    address: "ภูเก็ต",
    province: "ภูเก็ต",
    phone: "021000003",
    status: "active",
    createdAt: "2025-01-01T09:00:00",
  },
  {
    id: "BR-004",
    name: "สาขาขอนแก่น",
    code: "KKC",
    address: "ขอนแก่น",
    province: "ขอนแก่น",
    phone: "021000004",
    status: "active",
    createdAt: "2025-01-01T09:00:00",
  },
  {
    id: "BR-005",
    name: "สาขาชลบุรี",
    code: "CBI",
    address: "ชลบุรี",
    province: "ชลบุรี",
    phone: "021000005",
    status: "active",
    createdAt: "2025-01-01T09:00:00",
  },
];
