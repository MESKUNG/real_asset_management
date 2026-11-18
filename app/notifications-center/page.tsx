"use client";

// หน้านี้เปิดจากปุ่ม "ดูการแจ้งเตือนทั้งหมด" ในกล่องกระดิ่ง
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, useTranslate } from "@/lib/language";
import {
  formatNotificationTime,
  getNotificationsPath,
  getReadNotificationsSnapshot,
  getServerReadNotificationsSnapshot,
  markNotificationsRead,
  notifications,
  parseReadNotifications,
  subscribeToNotificationChanges,
} from "@/components/notifications/notifications";

export default function NotificationsCenterPage() {
  const router = useRouter();
  const language = useLanguage();
  const translateText = useTranslate();
  const [error, setError] = useState("");
  // สมัครรับการเปลี่ยนสถานะอ่านแล้วชุดเดียวกับกล่องกระดิ่ง เพื่อให้สองหน้าตรงกัน
  const snapshot = useSyncExternalStore(
    subscribeToNotificationChanges,
    getReadNotificationsSnapshot,
    getServerReadNotificationsSnapshot,
  );
  const readIds = parseReadNotifications(snapshot);

  // กดปุ่มนี้เพื่อทำให้ทุกรายการเป็น "อ่านแล้ว"
  const markAllAsRead = () => {
    try {
      markNotificationsRead(notifications.map(({ id }) => id));
      setError("");
    } catch {
      setError("บันทึกสถานะไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  };

  const openNotification = (
    notification: (typeof notifications)[number],
  ) => {
    // กดรายการเพื่อทำเครื่องหมายว่าอ่านแล้ว และเปิดหน้าซ่อมที่เกี่ยวข้อง
    try {
      markNotificationsRead([notification.id]);
      setError("");
    } catch {
      setError("บันทึกสถานะไม่สำเร็จ กรุณาลองอีกครั้ง");
      return;
    }

    let role: string | null = null;
    try {
      const credential = localStorage.getItem("credential");
      if (credential) {
        const parsed: unknown = JSON.parse(credential);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "role" in parsed &&
          typeof parsed.role === "string"
        ) {
          role = parsed.role;
        }
      }
    } catch (error) {
      console.error("อ่านข้อมูลบัญชีไม่สำเร็จ:", error);
    }
    router.push(
      getNotificationsPath(
        role,
        notification.request.status,
        notification.request.id,
      ),
    );
  };

  return (
    // ส่วนนี้กำหนดความกว้างและขอบของหน้า
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f8] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {translateText("การแจ้งเตือน")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {translateText("ติดตามความเคลื่อนไหวของรายการแจ้งซ่อม")}
            </p>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={notifications.every(({ id }) => readIds.has(id))}
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-default disabled:text-slate-400"
          >
            {translateText("อ่านทั้งหมด")}
          </button>
        </header>

        {/* ถ้าบันทึกไม่ได้ จะแสดงข้อความเตือนตรงนี้ */}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {translateText(error)}
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* แต่ละแถวคือการแจ้งเตือนหนึ่งรายการ; จุดสีน้ำเงินหมายถึงยังไม่อ่าน */}
          {/* notifications เรียงจากใหม่ไปเก่า; หน้านี้แสดงไม่เกิน 20 รายการ */}
          {notifications.slice(0, 20).map((notification) => {
            const isUnread = !readIds.has(notification.id);

            return (
              <button
                type="button"
                key={notification.id}
                onClick={() => openNotification(notification)}
                className={`flex w-full items-start gap-4 border-b border-slate-100 p-4 text-left transition last:border-b-0 hover:bg-indigo-50 sm:p-5 ${
                  isUnread ? "bg-indigo-50/70" : "bg-white"
                }`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <span className="text-sm font-semibold" aria-hidden="true">
                    {notification.category === "completed"
                      ? "✓"
                      : notification.category === "rejected"
                        ? "!"
                        : "•"}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {translateText(notification.title)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatNotificationTime(notification.createdAt, language)}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    {translateText(notification.assetName)} ·{" "}
                    {translateText(notification.issue)}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {notification.reference}
                  </span>
                </span>
                {isUnread && (
                  <span
                    aria-label={translateText("ยังไม่อ่าน")}
                    className="mt-2 size-2 shrink-0 rounded-full bg-indigo-600"
                  />
                )}
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
}