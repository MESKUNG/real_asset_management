"use client";


import { useT } from "@/lib/i18n";
// เมนูตรวจนับของ User และ Admin ลิงก์มาที่ URL เดียวกัน
// หน้านี้อ่าน role แล้วเลือกว่าจะแสดงหน้าไหน
import { useCredential } from "@/lib/inventory";
import AdminTracking from "./_components/AdminTracking";
import UserSchedulePage from "./_components/userSchedulePage";
import { Loading, NoAccess } from "./_components/ui";

export default function InventoriesPage() {
  const translateText = useT();
  const { credential, ready } = useCredential();

  if (!ready) return <Loading />;
  if (credential?.role === "admin") return <AdminTracking />;
  if (credential?.role === "user") return <UserSchedulePage />;

  return <NoAccess message={translateText("ไม่มีสิทธิ์เข้าถึงหน้านี้")} />;
}
