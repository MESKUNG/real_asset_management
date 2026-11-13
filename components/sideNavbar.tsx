"use client";
///////////////////////////////////////////////////
///////////////////////////////////////////////////

import Link from "next/link";
import { useSyncExternalStore } from "react";
import Image from "next/image";
///////////////////////////////////////////////////


type RoleKey = "user" | "admin" | "president" | "superadmin"; //สร้าง Type ชื่อ RoleKey โดยกำหนดให้สามารถรับค่าได้เพียง 4 ค่าเท่านั้น

type MenuItem = {   
  name: string;
  path: string;
};

const menus: Record<RoleKey, MenuItem[]> = {      //Key ต้องเป็นค่าที่อยู่ใน RoleKey และ Value ต้องเป็น Array ที่ประกอบด้วยข้อมูลประเภท MenuItem
  user: [
    { name: "ภาพรวม", path: "/dashboardUser" },
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการ Asset", path: "/assets" },
    { name: "เบิก / คืน / ขอโอนย้ายทรัพย์สิน", path: "/Borrow" },
    { name: "ซ่อมบำรุง", path: "/repairs" },
    { name: "รายงาน", path: "/reports" },
    { name: "ตรวจนับ / รอบการตรวจนับ", path: "/inventories" },
    { name: "ประวัติการเข้าสู่ระบบ", path: "/account_history" },
  ],
  admin: [
    { name: "ภาพรวม", path: "/dashboard" },
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการ Asset", path: "/assets" },
    { name: "เบิก / คืน / ขอโอนย้ายทรัพย์สิน", path: "/Borrow" },
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
    { name: "เบิก / คืน / ขอโอนย้ายทรัพย์สิน", path: "/Borrow" },
    
  ],
  superadmin: [
    { name: "ศูนย์รวมการแจ้งเตือน", path: "/notifications-center" },
    { name: "จัดการบัญชี Admin / President", path: "/admin_and_presidents" },
  ],
};

function subscribeToCredentialChanges(onChange: () => void) {   //ฟังก์ชันนี้รับ Parameter ชื่อ onChange ซึ่งเป็น Function ที่ไม่รับ Argument และไม่ส่งค่ากลับมา   onChange จะได้รับมาจาก useSyncExternalStore() โดยอัตโนมัติ
  window.addEventListener("storage", onChange);        //Event Listener เพื่อรับฟัง Event ชื่อ storage          Event นี้จะเกิดขึ้นเมื่อมีการเปลี่ยนแปลง localStorage จากเอกสารหรือ Tab อื่นที่อยู่ใน Origin เดียวกัน
  window.addEventListener("credentialchange", onChange);    //แจ้งเตือนเมื่อมีการเปลี่ยนแปลง Credential ภายใน Tab ปัจจุบัน

  return () => {          //Cleanup Function ยกเลิกการรับฟัง Event เมื่อ Component ไม่ต้องการติดตามข้อมูลแล้ว ป้องกัน mememory leak
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

function getRoleSnapshot(): RoleKey | null {       //ฟังก์ชันนี้จะคืนค่ากลับมาได้ 2 รูปแบบ  ค่า Role ที่อยู่ใน RoleKey และ null หากไม่พบค่า
  const credentialString = localStorage.getItem("credential");         //อ่านข้อมูลจาก Local Storage
  if (!credentialString) return null;   //ถ้าไม่มี

  try {                                                    //ถ้ามีลองแปลงเป็น Object
    const credential: unknown = JSON.parse(credentialString);               //แปลงเป็น object       : unknown เป็นการกำหนด Type ของตัวแปร credential
    if (typeof credential !== "object" || credential === null) return null;          //ถ้าไม่ใช่ Object หรือ เป็นnull ให้ return null

    const role = "role" in credential ? credential.role : null;             //ถ้ามี role ให้ return role ถ้าไม่มีให้ return null
    if (
      role === "user" ||
      role === "admin" ||
      role === "president" ||
      role === "superadmin"
    ) {
      return role;
    }

    return null;     //นอกเหนือจาก user, admin, president, superadmin ให้ return null
  } catch (error) {        //จับข้อผิดพลาดที่เกิดขึ้นภายใน try
    console.error("Invalid credential:", error);
    return null;
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
///////////////////////////////////////

export default function Sidebar() {
  const role = useSyncExternalStore(          // WTF is this?? บอกทีว่าสิ่งนี้จะได้เรียนในเทอม 2
    subscribeToCredentialChanges,
    getRoleSnapshot,
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
        alt='logo'
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
