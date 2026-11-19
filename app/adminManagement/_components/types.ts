export type AccountStatus = "Active" | "Inactive";

export type AdminAccount = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  phone: string;
  role_id: 2;
  staff_id: number | null;
  branch_id?: string;
  status: AccountStatus;
  created_at: number;
};

export type AdminAccountChanges = {
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  branch_id: string;
};
