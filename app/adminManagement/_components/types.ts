export type AccountStatus = "Active" | "Inactive";
export type ManagedRole = "Admin" | "President";

export type AdminAccount = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  phone: string;
  role: ManagedRole;
  staff_id: number | null;
  branch_id?: string;
  status: AccountStatus;
  created_at: number;
};

export type AdminAccountChanges = {
  role: ManagedRole;
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  branch_id: string;
};
