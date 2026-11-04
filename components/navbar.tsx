"use client";

import TopNavbar from "./topNavbar";
import Sidebar from "./sideNavbar";

type NavbarProps = {
  children: React.ReactNode;
};

export default function Navbar({ children }: NavbarProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopNavbar />
        <main>{children}</main>
      </div>
    </div>
  );
}