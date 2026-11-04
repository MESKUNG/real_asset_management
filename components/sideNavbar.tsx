"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import Image from "next/image";

type RoleKey = "user" | "admin" | "president" | "superadmin";

type MenuItem = {
  name: string;
  path: string;
};

const menus: Record<RoleKey, MenuItem[]> = {
  user: [
    { name: "ภาพรวม", path: "/dashboard" },
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการ Asset", path: "/assets" },
    { name: "เบิก / ยืมคืน / ขอโอนย้ายทรัพย์สิน", path: "/requests" },
    { name: "ซ่อมบำรุง", path: "/repairs" },
    { name: "รายงาน", path: "/reports" },
    { name: "ตรวจนับ / รอบการตรวจนับ", path: "/inventories" },
    { name: "ประวัติการเข้าสู่ระบบ", path: "/account_history" },
  ],
  admin: [
    { name: "ภาพรวม", path: "/dashboard" },
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการ Asset", path: "/assets" },
    { name: "เบิก / ยืมคืน / ขอโอนย้ายทรัพย์สิน", path: "/requests" },
    { name: "ติดตามการนับ / มอบหมายงาน", path: "/inventories" },
    { name: "ซ่อมบำรุง", path: "/repairs" },
    { name: "ตรวจสอบคำร้อง", path: "/complains" },
    { name: "จัดการ Staff และสาขา", path: "/staffandbranches" },
    { name: "รายงาน", path: "/reports" },
    { name: "ประวัติการเข้าสู่ระบบ", path: "/account_history" },
  ],
  president: [
    { name: "ภาพรวม", path: "/dashboard" },
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการ Asset", path: "/assets" },
    { name: "ตรวจสอบและอนุมัติคําร้อง", path: "/approve_center" },
    { name: "รายงาน", path: "/reports" },
    { name: "ประวัติการโอนย้าย Asset", path: "/transfer_history" },
    { name: "ประวัติการเข้าสู่ระบบ", path: "/account_history" },
  ],
  superadmin: [
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการบัญชี Admin / President", path: "/admin_and_presidents" },
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
    <aside className="w-80 min-h-screen bg-blue-950 p-4">
      <Image
        src="/All images/compose.webp"
        width={800}
        height={100}
        className="mb-4 rounded-2xl"
      />
      <nav className="flex flex-col gap-3">
        {menus[role].map((menu) => (
          <Link
            key={menu.path}
            href={menu.path}
            className={`
        rounded-lg font-medium text-white
        hover:bg-indigo-100 hover:text-violet-800
        ${menu.name === "ตรวจนับ / รอบการตรวจนับ" ? "bg-yellow-400 text-blue-950! flex p-6 text-xl justify-center item-center" : "p-3 text-base"}
      `}
          >
            {menu.name}
          </Link>

          
        ))}
      </nav>
    </aside>
  );
}
