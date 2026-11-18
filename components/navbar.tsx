"use client";

import TopNavbar from "./topNavbar";
import Sidebar from "./sideNavbar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLanguage, useTheme } from "@/lib/language";

type NavbarProps = {
  children: React.ReactNode;
};

export default function Navbar({ children }: NavbarProps) {
  const pathname = usePathname();
  const language = useLanguage();
  const theme = useTheme();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [language, theme]);

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