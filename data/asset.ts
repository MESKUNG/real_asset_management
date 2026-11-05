
////////////////////////////////////////////////////
/////////////// Asset Types ////////////////////////

export type AssetStatus =
  | "available"
  | "borrowed"
  | "repair"
  | "damaged"
  | "disposed";

export type Asset = {
  // ข้อมูลทั่วไป
  id: string;
  name: string;
  category: string;
  status: AssetStatus;
  brand: string;
  model: string;
  serialNumber: string;

  // สาขาและผู้รับผิดชอบ
  branchId: string;
  responsiblePersonId: number;

  // การรับประกันและค่าใช้จ่าย
  purchasePrice: number;
  purchaseDate: string;
  warrantyEndDate: string;

  // ผู้จำหน่าย
  vendorId: string;

  // QR Code / Barcode
  qrCode: string;
  barcode: string;

  // System Information
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
};

////////////////////////////////////////////////////
/////////////// Asset Data /////////////////////////

export const assets: Asset[] = [
  {
    id: "AST-0001",
    name: "MacBook Pro 14”",
    category: "CAT-001",
    status: "repair",
    brand: "Apple",
    model: "MacBook Pro M3 Pro",
    serialNumber: "C02XK7QLMD6T",

    branchId: "BR-001",
    responsiblePersonId: 103,

    purchasePrice: 79900,
    purchaseDate: "2026-01-15",
    warrantyEndDate: "2029-01-14",

    vendorId: "VEN-001",

    qrCode: "AST-0001",
    barcode: "AST-0001",

    createdAt: "2026-01-15T09:00:00",
    updatedAt: "2026-11-05T13:00:00",
    createdBy: 101,
    updatedBy: 101
  },
  {
    id: "AST-0002",
    name: "Dell Latitude 5440",
    category: "CAT-001",
    status: "borrowed",
    brand: "Dell",
    model: "Latitude 5440",
    serialNumber: "DL5440-002",

    branchId: "BR-001",
    responsiblePersonId: 102,

    purchasePrice: 32900,
    purchaseDate: "2025-08-10",
    warrantyEndDate: "2028-08-09",

    vendorId: "VEN-002",

    qrCode: "AST-0002",
    barcode: "AST-0002",

    createdAt: "2025-08-10T10:00:00",
    updatedAt: "2026-11-01T09:00:00",
    createdBy: 101,
    updatedBy: 102
  },
  {
    id: "AST-0003",
    name: "Samsung Monitor 24”",
    category: "CAT-002",
    status: "repair",
    brand: "Samsung",
    model: "S24C310",
    serialNumber: "SM24C310-003",

    branchId: "BR-002",
    responsiblePersonId: 103,

    purchasePrice: 4500,
    purchaseDate: "2025-03-05",
    warrantyEndDate: "2027-03-04",

    vendorId: "VEN-003",

    qrCode: "AST-0003",
    barcode: "AST-0003",

    createdAt: "2025-03-05T09:00:00",
    updatedAt: "2026-10-21T10:00:00",
    createdBy: 101,
    updatedBy: 103
  },
  {
    id: "AST-0004",
    name: "Canon Printer",
    category: "CAT-003",
    status: "damaged",
    brand: "Canon",
    model: "imageCLASS LBP6030",
    serialNumber: "CN6030-004",

    branchId: "BR-002",
    responsiblePersonId: 104,

    purchasePrice: 3900,
    purchaseDate: "2024-08-20",
    warrantyEndDate: "2026-08-19",

    vendorId: "VEN-001",

    qrCode: "AST-0004",
    barcode: "AST-0004",

    createdAt: "2024-08-20T09:00:00",
    updatedAt: "2026-10-25T15:00:00",
    createdBy: 101,
    updatedBy: 104
  },
  {
    id: "AST-0005",
    name: "Lenovo ThinkPad E14",
    category: "CAT-001",
    status: "available",
    brand: "Lenovo",
    model: "ThinkPad E14 Gen 5",
    serialNumber: "LNV-E14-005",

    branchId: "BR-003",
    responsiblePersonId: 102,

    purchasePrice: 28900,
    purchaseDate: "2026-05-10",
    warrantyEndDate: "2029-05-09",

    vendorId: "VEN-002",

    qrCode: "AST-0005",
    barcode: "AST-0005",

    createdAt: "2026-05-10T09:00:00",
    updatedAt: "2026-05-10T09:00:00",
    createdBy: 101,
    updatedBy: 101
  }
];
