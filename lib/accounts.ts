"use client";

import { useEffect, useState } from "react";

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
  branch_id?: string;
  profile_image: string;
  status: "Active" | "Inactive";
  created_at: number;
  updated_at: number;
  last_login: number | null;
};

const API_URL = "https://6aeb6e4dee39618d7bf84fa7.mockapi.io/api/v1/account";

// ดึงข้อมูลบัญชีทั้งหมด; ส่ง signal มาได้เพื่อยกเลิก request เมื่อออกจากหน้า
export async function fetchAccounts(signal?: AbortSignal): Promise<Account[]> {
  const response = await fetch(API_URL, { signal });

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

// จับคู่ reporterId กับ username โดยใช้ staff_id จากบัญชีที่โหลดผ่าน fetchAccounts
export function useAccountNames() {
  const [accountNames, setAccountNames] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadAccounts = async () => {
      try {
        const accounts = await fetchAccounts(controller.signal);
        const names = new Map<string, string>();

        for (const account of accounts) {
          if (account.staff_id !== null && account.username.trim()) {
            names.set(String(account.staff_id), account.username.trim());
          }
        }

        setAccountNames(names);
        setError(null);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Could not load reporter names from the accounts API:", error);
        setError("โหลดชื่อผู้แจ้งจาก API ไม่สำเร็จ");
      }
    };

    void loadAccounts();
    return () => controller.abort();
  }, []);

  return { accountNames, error };
}
