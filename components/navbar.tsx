"use client";

import TopNavbar from "./topNavbar";
import Sidebar from "./sideNavbar";

export default function Navbar() {
  return (
    <>
      <TopNavbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          {/* Content ของแต่ละหน้า */}
        </main>
      </div>
    </>
  );
}