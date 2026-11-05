export type Vendor = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
};

export const vendors: Vendor[] = [
  {
    id: "VEN-001",
    name: "Synnex",
    address: "433 ถ. สุคนธสวัสดิ์ แขวงลาดพร้าว กรุงเทพฯ 10230",
    phone: "025538899",
    email: "service_fl@synnex.co.th",
  },
  {
    id: "VEN-002",
    name: "Dell Thailand",
    address: "กรุงเทพมหานคร",
    phone: "026705000",
    email: "support@dell.com",
  },
  {
    id: "VEN-003",
    name: "Samsung Thailand",
    address: "กรุงเทพมหานคร",
    phone: "1282",
    email: "support@samsung.com",
  },
];
