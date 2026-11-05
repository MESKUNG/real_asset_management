export type Account = {
  id: number;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_id: number;
  staff_id: number | null;
  profile_image: string;
  status: "Active" | "Inactive";
  created_at: number;
  updated_at: number;
  last_login: number | null;
};

const API_URL = "https://6aeb6e4dee39618d7bf84fa7.mockapi.io/api/v1/account";

// ดึงข้อมูลบัญชีทั้งหมด
export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }

  return response.json();
}

// ดึงข้อมูลบัญชีตาม ID
export async function fetchAccountById(id: number): Promise<Account> {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch account");
  }

  return response.json();
}
