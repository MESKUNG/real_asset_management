"use client";

import TopNavbar from "./topNavbar";
import Sidebar from "./sideNavbar";
import { usePathname } from "next/navigation";

type NavbarProps = {
  children: React.ReactNode;
};

export default function Navbar({ children }: NavbarProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        {pathname !== "/" && <TopNavbar />}  {/* ถ้าหน้าแรกไม่ต้องแสดง TopNavbar */}
        <main>{children}</main>
      </div>
    </div>
  );
}