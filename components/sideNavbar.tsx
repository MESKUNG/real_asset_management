"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

type RoleKey = "user" | "admin" | "president" | "superadmin";

type MenuItem = {
  name: string;
  path: string;
};

const menus: Record<RoleKey, MenuItem[]> = {
  user: [
    { name: "ภาพรวม", path: "/user/dashboard" },
    { name: "เบิกจ่าย Asset", path: "/user/borrow" },
    { name: "แจ้งซ่อม", path: "/user/repair" },
  ],
  admin: [
    { name: "ภาพรวม", path: "/admin/dashboard" },
    { name: "จัดการ Asset", path: "/admin/assets" },
    { name: "จัดการ Staff", path: "/admin/staff" },
    { name: "จัดการระบบ", path: "/admin/settings" },
  ],
  president: [
    { name: "ภาพรวม", path: "/president/dashboard" },
    { name: "รายงาน", path: "/president/reports" },
    { name: "จัดการสิทธิ์", path: "/president/permissions" },
  ],
  superadmin: [
    { name: "ภาพรวม", path: "/superadmin/dashboard" },
    { name: "จัดการผู้ใช้", path: "/superadmin/users" },
    { name: "จัดการระบบ", path: "/superadmin/settings" },
  ],
};

function subscribeToCredentialChanges(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("credentialchange", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

function getRoleSnapshot(): RoleKey | null {
  const credentialString = localStorage.getItem("credential");
  if (!credentialString) return null;

  try {
    const credential: unknown = JSON.parse(credentialString);
    if (typeof credential !== "object" || credential === null) return null;

    const role = "role" in credential ? credential.role : null;
    if (
      role === "user" ||
      role === "admin" ||
      role === "president" ||
      role === "superadmin"
    ) {
      return role;
    }

    return null;
  } catch (error) {
    console.error("Invalid credential:", error);
    return null;
  }
}

function getServerRoleSnapshot(): null {
  return null;
}

export default function Sidebar() {
  const role = useSyncExternalStore(
    subscribeToCredentialChanges,
    getRoleSnapshot,
    getServerRoleSnapshot,
  );

  if (!role) return null;

  return (
    <aside className="w-64 min-h-screen bg-gray-100 p-4">
      <nav className="flex flex-col gap-3">
        {menus[role].map((menu) => (
          <Link
            key={menu.path}
            href={menu.path}
            className="p-3 rounded-lg hover:bg-gray-200"
          >
            {menu.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
