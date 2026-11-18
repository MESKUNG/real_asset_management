"use client";
///////////////////////////////////////////////////
///////////////////////////////////////////////////

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslate } from "@/lib/language";
///////////////////////////////////////////////////

type RoleKey = "user" | "admin" | "president" | "superadmin"; //สร้าง Type ชื่อ RoleKey โดยกำหนดให้สามารถรับค่าได้เพียง 4 ค่าเท่านั้น

type MenuItem = {
  name: string;
  path: string;
};

type MenuGroup = {
  name: string;
  items: MenuItem[];
};

type MenuEntry = MenuItem | MenuGroup;

const menus: Record<RoleKey, MenuEntry[]> = {
  //Key ต้องเป็นค่าที่อยู่ใน RoleKey และ Value ต้องเป็น Array ที่ประกอบด้วยข้อมูลประเภท MenuItem
  user: [
    { name: "ภาพรวม", path: "/dashboardUser" },
    { name: "จัดการ Asset", path: "/assets" },
    { name: "เบิก / รับคืน / ขอโอนย้ายทรัพย์สิน", path: "/Borrow" },
    {
      name: "ซ่อมบำรุง",
      path: "/repairs",
      items: [
        { name: "รายการแจ้งซ่อม", path: "/repairsuser" },
        { name: "ประวัติซ่อม", path: "/repair-historyuser" },
      ],
    },
    { name: "รายงาน", path: "/reports" },
    { name: "ตรวจนับ / รอบการตรวจนับ", path: "/inventories" },
    { name: "ประวัติการเข้าสู่ระบบ", path: "/login-history" },
  ],
  admin: [
    { name: "ภาพรวม", path: "/dashboardAdmin" },
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการ Asset", path: "/assets" },
    { name: "เบิก / รับคืน / ขอโอนย้ายทรัพย์สิน", path: "/Borrow" },
    { name: "ติดตามการนับ / มอบหมายงาน", path: "/inventories" },
    {
      name: "ซ่อมบำรุง",
      path: "/repairs",
      items: [
        { name: "รายการแจ้งซ่อม", path: "/repairsadmin" },
        { name: "ประวัติซ่อม", path: "/repair-historyadmin" },
      ],
    },
    { name: "จัดการ Staff", path: "/staffManagement" },
    {
      name: "รายงาน",
      path: "/reports",
      items: [
        { name: "รับรายงาน", path: "/" },
        { name: "ส่งรายงาน", path: "/" },
      ],
    },
    { name: "สถานที่และแผนก", path: "/locations" },
    { name: "ประวัติการเข้าสู่ระบบ", path: "/login-history" },
  ],
  president: [
    { name: "ภาพรวม", path: "/dashboardPresident" },
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการ Asset", path: "/assets" },
    {
      name: "ตรวจสอบและอนุมัติ",
      items: [
        { name: "ภาพรวมคำขอ", path: "/approve_center" },
        { name: "อนุมัติโยกย้าย", path: "/approve_transfer" },
        { name: "ประวัติการโอนย้าย", path: "/transfer_history" },
      ],
    },
    { name: "รายงาน", path: "/reports" },
    {
      name: "สถานที่และแผนก",
      items: [
        { name: "จัดการสาขา", path: "/staffandbranches" },
        { name: "จัดการ Admin", path: "/admin_and_presidents" },
      ],
    },
    { name: "ประวัติการเข้าสู่ระบบ", path: "/login-history" },
  ],
  superadmin: [
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการบัญชี Admin / President", path: "/admin_and_presidents" },
    {
      name: "สถานที่และแผนก",
      items: [
        { name: "จัดการสาขา", path: "/staffandbranches" },
        { name: "จัดการ Admin", path: "/admin_and_presidents" },
      ],
    },
    { name: "ประวัติการเข้าสู่ระบบ", path: "/login-history" },
  ],
};

function subscribeToCredentialChanges(onChange: () => void) {
  //ฟังก์ชันนี้รับ Parameter ชื่อ onChange ซึ่งเป็น Function ที่ไม่รับ Argument และไม่ส่งค่ากลับมา   onChange จะได้รับมาจาก useSyncExternalStore() โดยอัตโนมัติ
  window.addEventListener("storage", onChange); //Event Listener เพื่อรับฟัง Event ชื่อ storage          Event นี้จะเกิดขึ้นเมื่อมีการเปลี่ยนแปลง localStorage จากเอกสารหรือ Tab อื่นที่อยู่ใน Origin เดียวกัน
  window.addEventListener("credentialchange", onChange); //แจ้งเตือนเมื่อมีการเปลี่ยนแปลง Credential ภายใน Tab ปัจจุบัน

  return () => {
    //Cleanup Function ยกเลิกการรับฟัง Event เมื่อ Component ไม่ต้องการติดตามข้อมูลแล้ว ป้องกัน mememory leak
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

function getServerRoleSnapshot(): RoleKey | null {
  return null;
}

function getRoleSnapshot(): RoleKey | null {
  //ฟังก์ชันนี้จะคืนค่ากลับมาได้ 2 รูปแบบ  ค่า Role ที่อยู่ใน RoleKey และ null หากไม่พบค่า
  const credentialString = localStorage.getItem("credential"); //อ่านข้อมูลจาก Local Storage
  if (!credentialString) return null; //ถ้าไม่มี

  try {
    //ถ้ามีลองแปลงเป็น Object
    const credential: unknown = JSON.parse(credentialString); //แปลงเป็น object       : unknown เป็นการกำหนด Type ของตัวแปร credential
    if (typeof credential !== "object" || credential === null) return null; //ถ้าไม่ใช่ Object หรือ เป็นnull ให้ return null

    const role = "role" in credential ? credential.role : null; //ถ้ามี role ให้ return role ถ้าไม่มีให้ return null
    if (
      role === "user" ||
      role === "admin" ||
      role === "president" ||
      role === "superadmin"
    ) {
      return role;
    }

    return null; //นอกเหนือจาก user, admin, president, superadmin ให้ return null
  } catch (error) {
    //จับข้อผิดพลาดที่เกิดขึ้นภายใน try
    console.error("Invalid credential:", error);
    return null;
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
///////////////////////////////////////

export default function Sidebar() {
  const pathname = usePathname();
  const translateText = useTranslate();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    ตรวจสอบและอนุมัติ: true,
    สถานที่และแผนก: true,
  });
  const role = useSyncExternalStore(
    //Wtf is this???? ยอกทีว่าจะได้เรียนตอน เทอม 2
    subscribeToCredentialChanges,
    getRoleSnapshot,
    getServerRoleSnapshot,
  );

  if (!role) return null;

  return (
    <aside className="w-80 min-h-screen bg-blue-950 p-4">
      <Image
        alt="Compose Logo"
        src="/All images/compose.webp"
        width={800}
        height={100}
        className="mb-4 rounded-2xl"
        priority
      />
      <nav className="flex flex-col gap-3">
        {menus[role].map((menu) =>
          "items" in menu ? (
            <div key={menu.name}>
              <button
                type="button"
                aria-expanded={openMenus[menu.name] ?? false}
                onClick={() =>
                  setOpenMenus((current) => ({
                    ...current,
                    [menu.name]: !(current[menu.name] ?? false),
                  }))
                }
                className="flex w-full items-center justify-between rounded-lg p-3 text-left font-medium text-white hover:bg-indigo-100 hover:text-violet-800"
              >
                {translateText(menu.name)}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className={`h-4 w-4 transition-transform ${
                    openMenus[menu.name] ? "rotate-180" : ""
                  }`}
                  fill="none"
                >
                  <path
                    d="m5 7.5 5 5 5-5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              {openMenus[menu.name] && (
                <div className="flex flex-col">
                  {menu.items.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`rounded-lg p-3 pl-10 font-medium ${
                        pathname === item.path
                          ? "bg-indigo-100 text-violet-800"
                          : "text-white hover:bg-indigo-100 hover:text-violet-800"
                      }`}
                    >
                      {translateText(item.name)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={menu.path}
              href={menu.path}
              className={`
        rounded-lg font-medium text-white
        hover:bg-indigo-100 hover:text-violet-800
        ${
          menu.name === "ตรวจนับ / รอบการตรวจนับ"
            ? "bg-yellow-400 text-blue-950! flex p-6 text-xl justify-center item-center"
            : pathname === menu.path
              ? "bg-indigo-100 text-violet-800 p-3 text-base"
              : "p-3 text-base"
        }
      `}
          >
            {translateText(menu.name)}
          </Link>
        ))}
        <Link
          href="/setting"
          className={`rounded-lg p-3 font-medium ${
            pathname === "/setting"
              ? "bg-indigo-100 text-violet-800"
              : "text-white hover:bg-indigo-100 hover:text-violet-800"
          }`}
        >
          {translateText("ตั้งค่าระบบ")}
        </Link>
      </nav>
    </aside>
  );
}
