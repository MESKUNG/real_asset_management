"use client";

// เมนู "รายงาน" ของทุก role ชี้มาที่ URL เดียวกัน หน้านี้อ่าน role แล้วเลือกหน้าที่ถูกต้อง
// User = สรุปรายงานทั้งหมด, Admin = รับรายงาน, President = รับรายงาน + รายงานจาก Admin
import { useCredential } from "@/lib/inventory";
import { useTranslate } from "@/lib/language";
import { Loading, NoAccess } from "../inventories/_components/ui";
import ReceiveReports from "./_components/ReceiveReports";
import UserSummary from "./_components/UserSummary";

export default function ReportsPage() {
  const { credential, ready } = useCredential();
  const translateText = useTranslate();

  if (!ready) return <Loading />;
  if (!credential) return <NoAccess message={translateText("กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้")} />;
  if (credential.role === "user") return <UserSummary />;
  if (credential.role === "admin") return <ReceiveReports role="admin" />;
  if (credential.role === "president") return <ReceiveReports role="president" />;
  return <NoAccess message={translateText("ไม่มีสิทธิ์เข้าถึงหน้านี้")} />;
}
