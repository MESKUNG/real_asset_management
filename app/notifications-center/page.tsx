"use client";

// หน้ารวมการแจ้งเตือน ใช้ข้อมูลชุดเดียวกับกล่องกระดิ่ง
// กดรายการเพื่อทำเครื่องหมายว่าอ่านแล้วและไปยังหน้ารายละเอียดที่เกี่ยวข้อง
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, useTheme, useTranslate } from "@/lib/language";
import {
  formatNotificationTime,
  getCredentialRoleSnapshot,
  getNotificationHref,
  getNotificationsForRole,
  getNotificationSourcesSnapshot,
  getReadNotificationsSnapshot,
  getServerCredentialRoleSnapshot,
  getServerNotificationSourcesSnapshot,
  getServerReadNotificationsSnapshot,
  markNotificationsRead,
  parseReadNotifications,
  subscribeToCredentialChanges,
  subscribeToNotificationSources,
  subscribeToNotificationChanges,
  type NotificationItem,
} from "@/components/notifications/notifications";
import {
  getServerUserRepairRequestsSnapshot,
  getUserRepairRequestsSnapshot,
  parseUserRepairRequestsSnapshot,
  subscribeToUserRepairRequests,
} from "@/lib/userRepairRequests";

export default function NotificationsCenterPage() {
  const router = useRouter();
  const language = useLanguage();
  const isDark = useTheme() === "dark";
  const translateText = useTranslate();
  const [error, setError] = useState("");
  // อ่าน role ล่าสุดจาก credential เพื่อใช้กำหนดว่าควรเห็นแจ้งเตือนชุดใด
  const role = useSyncExternalStore(
    subscribeToCredentialChanges,
    getCredentialRoleSnapshot,
    getServerCredentialRoleSnapshot,
  );
  // อ่านคำร้องที่ User สร้างจาก Local Storage เพื่อรวมในรายการแจ้งเตือน
  const userRequestsSnapshot = useSyncExternalStore(
    subscribeToUserRepairRequests,
    getUserRepairRequestsSnapshot,
    getServerUserRepairRequestsSnapshot,
  );
  const userRequests = useMemo(
    () => parseUserRepairRequestsSnapshot(userRequestsSnapshot),
    [userRequestsSnapshot],
  );
  // ใช้แหล่งข้อมูลชุดเดียวกับ dropdown เพื่อให้รายการแจ้งเตือนตรงกัน
  const notificationSourcesSnapshot = useSyncExternalStore(
    subscribeToNotificationSources,
    getNotificationSourcesSnapshot,
    getServerNotificationSourcesSnapshot,
  );
  // คัดกรองแจ้งเตือนตาม role และสาขาที่มีสิทธิ์ รวมข้อมูลจาก Local Storage
  const visibleNotifications = getNotificationsForRole(
    role,
    userRequests,
    notificationSourcesSnapshot,
  );
  // อ่านสถานะอ่านแล้วและรับการเปลี่ยนแปลงชุดเดียวกับกล่องกระดิ่ง เพื่อให้สองหน้าตรงกัน
  const snapshot = useSyncExternalStore(
    subscribeToNotificationChanges,
    getReadNotificationsSnapshot,
    getServerReadNotificationsSnapshot,
  );
  const readIds = parseReadNotifications(snapshot);

  // กดปุ่มนี้เพื่อทำให้ทุกรายการเป็น "อ่านแล้ว"
  const markAllAsRead = () => {
    try {
      markNotificationsRead(visibleNotifications.map(({ id }) => id));
      setError("");
    } catch {
      setError("บันทึกสถานะไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  };

  const openNotification = (notification: NotificationItem) => {
    // กดรายการเพื่อทำเครื่องหมายว่าอ่านแล้ว และเปิดหน้าข้อมูลที่เกี่ยวข้อง
    try {
      markNotificationsRead([notification.id]);
      setError("");
    } catch {
      setError("บันทึกสถานะไม่สำเร็จ กรุณาลองอีกครั้ง");
      return;
    }

    router.push(getNotificationHref(role, notification));
  };

  return (
    // ส่วนนี้กำหนดความกว้างและขอบของหน้า
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f8] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {translateText("การแจ้งเตือน")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {translateText("ติดตามความเคลื่อนไหวของรายการในระบบ")}
            </p>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={visibleNotifications.every(({ id }) => readIds.has(id))}
            className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-default disabled:text-slate-400 sm:w-auto sm:shrink-0 sm:text-center ${
              isDark
                ? "text-indigo-300 hover:bg-slate-700 hover:text-indigo-200"
                : "text-indigo-600 hover:bg-indigo-50"
            }`}
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
          {/* แสดงไม่เกิน 20 รายการของสาขาที่ผู้ใช้มีสิทธิ์เห็น */}
          {visibleNotifications.map((notification) => {
            const isUnread = !readIds.has(notification.id);

            return (
              <button
                type="button"
                key={notification.id}
                onClick={() => openNotification(notification)}
                className={`flex w-full cursor-pointer items-start gap-3 border-b border-slate-100 border-l-2 border-l-transparent p-3 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:gap-4 sm:p-5 ${
                  isDark
                    ? `hover:border-l-indigo-400 hover:bg-slate-700 active:bg-slate-600 ${
                        isUnread ? "bg-indigo-950/40" : "bg-slate-800"
                      }`
                    : `hover:border-l-indigo-500 hover:bg-indigo-100 active:bg-indigo-200 ${
                        isUnread ? "bg-indigo-50/70" : "bg-white"
                      }`
                }`}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10 ${
                  isDark
                    ? "bg-indigo-900/60 text-indigo-200"
                    : "bg-indigo-50 text-indigo-600"
                }`}>
                  <span className="text-sm font-semibold" aria-hidden="true">
                    {["completed", "returned", "warranty_expiring"].includes(notification.category)
                      ? "✓"
                      : ["rejected", "warranty_expired"].includes(notification.category)
                        ? "!"
                        : "•"}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 break-words text-sm font-semibold text-slate-800">
                      {translateText(notification.title)}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatNotificationTime(notification.createdAt, language)}
                    </span>
                  </span>
                  <span className="mt-1 block break-words text-sm text-slate-600">
                    {translateText(notification.assetName)}
                    {notification.issue &&
                      ` · ${translateText(notification.issue)}`}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {translateText(notification.branchName)} ·{" "}
                    {notification.branchCode}
                    {notification.destinationBranchName &&
                      ` → ${translateText(notification.destinationBranchName)}`}{" "}
                    · {notification.reference}
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