"use client";

import { useSyncExternalStore } from "react";

import AuditBoard from "./_components/auditBoard";
import UserSchedulePage from "./_components/userSchedulePage";

function subscribeToCredential(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("credentialchange", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

function getRole(): string | null {
  try {
    const credential = JSON.parse(localStorage.getItem("credential") ?? "null");
    return credential?.role ?? null;
  } catch {
    return null;
  }
}

// ฝั่ง server อ่าน localStorage ไม่ได้ เลยต้องรอให้โหลดบน browser ก่อน
function getServerRole() {
  return "loading";
}

export default function InventoriesPage() {
  const role = useSyncExternalStore(subscribeToCredential, getRole, getServerRole);

  if (role === "loading") return null;
  if (role === "user") return <UserSchedulePage />;
  if (role === "admin") return <AuditBoard canScan={false} />;

  return <p className="p-8 text-sm text-slate-500">ไม่มีสิทธิ์เข้าถึงหน้านี้</p>;
}
