"use client";

import TopNavbar from "./topNavbar";
import Sidebar from "./sideNavbar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
<<<<<<< HEAD
=======
import { useLanguage, useTheme } from "@/lib/language";
>>>>>>> feat/engtext

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

  useEffect(() => {
    const applyTheme = () => {
      try {
        const settings = localStorage.getItem("asset-management-settings");
        const parsed: unknown = settings ? JSON.parse(settings) : null;
        const darkMode =
          typeof parsed === "object" &&
          parsed !== null &&
          !Array.isArray(parsed) &&
          "darkMode" in parsed &&
          parsed.darkMode === true;
        document.documentElement.classList.toggle("dark", darkMode);
      } catch (error) {
        console.error("โหลดธีมไม่สำเร็จ:", error);
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();
    window.addEventListener("storage", applyTheme);
    window.addEventListener("asset-management-settings-change", applyTheme);

    return () => {
      window.removeEventListener("storage", applyTheme);
      window.removeEventListener("asset-management-settings-change", applyTheme);
    };
  }, []);

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