"use client";
///////////////////////////////////////////////////
///////////////////////////////////////////////////

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Bell,
  Building2,
  ChartNoAxesColumnIncreasing,
  CheckSquare,
  CircleCheck,
  Clock3,
  LayoutDashboard,
  Boxes,
  Send,
  UsersRound,
  UserRoundCog,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslate } from "@/lib/language";
///////////////////////////////////////////////////

type RoleKey = "user" | "admin" | "president" | "superadmin"; //สร้าง Type ชื่อ RoleKey โดยกำหนดให้สามารถรับค่าได้เพียง 4 ค่าเท่านั้น

type MenuItem = {
  name: string;
  path?: string;
  icon: LucideIcon;
  highlight?: "audit";
  items?: MenuItem[];
};

type MenuSection = {
  heading: string;
  items: MenuItem[];
};

const menus: Record<RoleKey, MenuSection[]> = {
  user: [
    {
      heading: "ทั่วไป",
      items: [
        { name: "ภาพรวม", path: "/dashboardUser", icon: LayoutDashboard },
      ],
    },
    {
      heading: "งานปฏิบัติการ",
      items: [
        { name: "จัดการ Asset", path: "/assets", icon: Boxes },
        {
          name: "เบิก / รับคืน / ขอโอนย้ายทรัพย์สิน",
          path: "/Borrow",
          icon: ArrowLeftRight,
        },
        {
          name: "ซ่อมบำรุง",
          icon: Wrench,
          items: [
            { name: "รายการแจ้งซ่อม", path: "/repairsuser", icon: Wrench },
            { name: "ประวัติซ่อม", path: "/repair-historyuser", icon: Clock3 },
          ],
        },
        { name: "รายงาน", path: "/reports", icon: ChartNoAxesColumnIncreasing },
        {
          name: "ตรวจนับ / รอบการตรวจนับ",
          path: "/inventories",
          icon: CheckSquare,
          highlight: "audit",
        },
      ],
    },
    {
      heading: "จัดการระบบ",
      items: [
        { name: "ดูสาขา", path: "/branchsButSee", icon: Building2 },
        { name: "ประวัติการเข้าสู่ระบบ", path: "/login-history", icon: Clock3 },
      ],
    },
  ],
  admin: [
    {
      heading: "ภาพรวม",
      items: [
        { name: "ภาพรวม", path: "/dashboardAdmin", icon: LayoutDashboard },
        {
          name: "ศูนย์รวมการแจ้งเตือน",
          path: "/notifications-center",
          icon: Bell,
        },
      ],
    },
    {
      heading: "งานปฏิบัติการ",
      items: [
        { name: "จัดการ Asset", path: "/assets", icon: Boxes },
        {
          name: "เบิก / รับคืน / ขอโอนย้ายทรัพย์สิน",
          path: "/Borrow",
          icon: ArrowLeftRight,
        },
        {
          name: "ติดตามการนับ / มอบหมายงาน",
          path: "/inventories",
          icon: CircleCheck,
        },
        {
          name: "ซ่อมบำรุง",
          icon: Wrench,
          items: [
            { name: "รายการแจ้งซ่อม", path: "/repairsadmin", icon: Wrench },
            { name: "ประวัติซ่อม", path: "/repair-historyadmin", icon: Clock3 },
          ],
        },
        { name: "จัดการ Staff", path: "/staffManagement", icon: UsersRound },
        {
          name: "รายงาน",
          icon: ChartNoAxesColumnIncreasing,
          items: [
            {
              name: "รับรายงาน",
              path: "/reports",
              icon: ChartNoAxesColumnIncreasing,
            },
            { name: "ส่งรายงาน", path: "/reports/send", icon: Send },
          ],
        },
      ],
    },
    {
      heading: "จัดการระบบ",
      items: [
        { name: "ดูสาขา", path: "/branchsButSee", icon: Building2 },
        { name: "ประวัติการเข้าสู่ระบบ", path: "/login-history", icon: Clock3 },
      ],
    },
  ],
  president: [
    {
      heading: "ภาพรวม",
      items: [
        { name: "ภาพรวม", path: "/dashboardPresident", icon: LayoutDashboard },
        {
          name: "ศูนย์รวมการแจ้งเตือน",
          path: "/notifications-center",
          icon: Bell,
        },
      ],
    },
    {
      heading: "งานปฏิบัติการ",
      items: [
        { name: "จัดการ Asset", path: "/assets", icon: Boxes },
        {
          name: "ตรวจสอบและอนุมัติ",
          icon: Send,
          items: [
            { name: "ภาพรวมคำขอ", path: "/approve_center", icon: Send },
            {
              name: "อนุมัติโยกย้าย",
              path: "/approve_transfer",
              icon: CircleCheck,
            },
            {
              name: "ประวัติการโอนย้าย",
              path: "/transfer_history",
              icon: Clock3,
            },
          ],
        },
        { name: "รายงาน", path: "/reports", icon: ChartNoAxesColumnIncreasing },
      ],
    },
    {
      heading: "จัดการระบบ",
      items: [
        {
          name: "สถานที่และแผนก",
          icon: Building2,
          items: [
            { name: "จัดการสาขา", path: "/branchsManagement", icon: Building2 },
            {
              name: "จัดการ Admin",
              path: "/adminManagement",
              icon: UserRoundCog,
            },
          ],
        },
        { name: "ประวัติการเข้าสู่ระบบ", path: "/login-history", icon: Clock3 },
      ],
    },
  ],
  superadmin: [
    {
      heading: "ภาพรวม",
      items: [
        {
          name: "ศูนย์รวมการแจ้งเตือน",
          path: "/notifications-center",
          icon: Bell,
        },
      ],
    },
    {
      heading: "งานปฏิบัติการ",
      items: [
        {
          name: "จัดการบัญชี Admin",
          path: "/adminManagement",
          icon: UsersRound,
        },
      ],
    },
    {
      heading: "จัดการระบบ",
      items: [
        {
          name: "สถานที่และแผนก",
          icon: Building2,
          items: [
            { name: "จัดการสาขา", path: "/branchsManagement", icon: Building2 },
            {
              name: "จัดการ Admin",
              path: "/adminManagement",
              icon: UserRoundCog,
            },
          ],
        },
        { name: "ประวัติการเข้าสู่ระบบ", path: "/login-history", icon: Clock3 },
      ],
    },
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

/////////////////////////////////////////
///////Responsive//////////////////////
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

/////////////////////////////////////////
/////////////////////////////////////
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const translateText = useTranslate();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    ซ่อมบำรุง: true,
    รายงาน: true,
    ตรวจสอบและอนุมัติ: true,
    สถานที่และแผนก: true,
  });
  const role = useSyncExternalStore(
    //Wtf is this???? ยอกทีว่าจะได้เรียนตอน เทอม 2
    subscribeToCredentialChanges,
    getRoleSnapshot,
    getServerRoleSnapshot,
  );

  ///////////////////////////////////////////
  ///////Responsive//////////////////////
  useEffect(() => {
    if (!isOpen || !role) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, onClose, role]);

  if (!role) return null;

  const renderSidebarContent = (isMobile: boolean) => (
    <>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Image
            alt="Compose Logo"
            src="/All images/compose.webp"
            width={800}
            height={100}
            className="h-auto w-full rounded-2xl"
            priority
          />
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label={translateText("ปิดเมนู")}
            className="grid size-10 shrink-0 place-items-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        )}
      </div>
      <nav
        aria-label={translateText("เมนูหลัก")}
        className="flex flex-col gap-5"
      >
        {menus[role].map((section) => (
          <section key={section.heading}>
            <h2 className="mb-1.5 px-1 text-[11px] font-medium text-slate-500">
              {translateText(section.heading)}
            </h2>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.items?.length);
                const isOpen = openMenus[item.name] ?? false;
                const isPathActive = (path?: string) =>
                  Boolean(
                    path &&
                    (pathname === path || pathname.startsWith(`${path}/`)),
                  );
                const isActive =
                  item.items?.some((child) => isPathActive(child.path)) ??
                  isPathActive(item.path);
                const itemClass = `flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                  item.highlight === "audit"
                    ? "my-1 min-h-[68px] rounded-2xl bg-yellow-400 px-3 text-base text-blue-950 hover:bg-yellow-300"
                    : isActive
                      ? "bg-indigo-50 text-violet-700"
                      : "text-white hover:bg-white/10"
                }`;
                const iconClass =
                  item.highlight === "audit" ? "size-6" : "size-5";

                return (
                  <div key={item.name}>
                    {hasChildren ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenMenus((current) => ({
                            ...current,
                            [item.name]: !isOpen,
                          }))
                        }
                        className={itemClass}
                      >
                        <Icon
                          className={`${iconClass} shrink-0 ${isActive ? "text-violet-600" : "text-slate-400"}`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          {translateText(item.name)}
                        </span>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
                    ) : item.path ? (
                      <Link
                        href={item.path}
                        onClick={isMobile ? onClose : undefined}
                        className={itemClass}
                      >
                        <Icon
                          className={`${iconClass} shrink-0 ${item.highlight === "audit" ? "text-blue-950" : isActive ? "text-violet-600" : "text-slate-400"}`}
                          aria-hidden="true"
                        />
                        <span>{translateText(item.name)}</span>
                      </Link>
                    ) : null}
                    {hasChildren && isOpen && (
                      <div className="flex flex-col pt-1">
                        {item.items?.map((child) => {
                          if (!child.path) return null;
                          const isChildActive =
                            pathname === child.path ||
                            pathname.startsWith(`${child.path}/`);
                          return (
                            <Link
                              key={child.path}
                              href={child.path}
                              onClick={isMobile ? onClose : undefined}
                              className={`rounded-lg py-2.5 pl-11 pr-3 text-sm font-medium ${isChildActive ? "text-violet-300" : "text-white hover:bg-white/10"}`}
                            >
                              {translateText(child.name)}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden min-h-screen w-80 shrink-0 bg-blue-950 p-4 md:block">
        {renderSidebarContent(false)}
      </aside>

      <div
        id="mobile-sidebar-dialog"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 md:hidden ${
          isOpen ? "visible" : "pointer-events-none invisible"
        }`}
      >
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          aria-label={translateText("ปิดเมนู")}
          onClick={onClose}
          className={`absolute inset-0 bg-slate-950/45 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          role="dialog"
          aria-modal={isOpen}
          aria-label={translateText("เมนูหลัก")}
          inert={!isOpen}
          className={`absolute inset-y-0 left-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-blue-950 p-4 shadow-xl transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {renderSidebarContent(true)}
        </aside>
      </div>
      {/* ///////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////// */}
    </>
  );
}
