"use client";

// เมนูตรวจนับของ User และ Admin ลิงก์มาที่ URL เดียวกัน
// หน้านี้อ่าน role แล้วเลือกว่าจะแสดงหน้าไหน
import { useCredential } from "@/lib/inventory";
import AdminTracking from "./_components/AdminTracking";
import UserSchedulePage from "./_components/userSchedulePage";
import { Loading, NoAccess } from "./_components/ui";

export default function InventoriesPage() {
  const { credential, ready } = useCredential();

  if (!ready) return <Loading />;
  if (credential?.role === "admin") return <AdminTracking />;
  if (credential?.role === "user") return <UserSchedulePage />;
  return <NoAccess message="หน้านี้สำหรับบัญชี User และ Admin เท่านั้น" />;
}
