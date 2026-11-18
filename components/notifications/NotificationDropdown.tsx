"use client";

// ปุ่มกระดิ่งและกล่องแจ้งเตือนด้านบนของเว็บ
// ถ้าจะเปลี่ยนหน้าตา ให้ดู className ในส่วน return ด้านล่าง
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Bell1, CheckCircle1, Gear1, RefreshCircle1Clockwise } from "@tailgrids/icons";
import { useRouter } from "next/navigation";
import { useLanguage, useTranslate } from "@/lib/language";
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
} from "./notifications";
import {
  getServerUserRepairRequestsSnapshot,
  getUserRepairRequestsSnapshot,
  parseUserRepairRequestsSnapshot,
  subscribeToUserRepairRequests,
} from "@/lib/userRepairRequests";

function NotificationIcon({
  category,
}: {
  category: NotificationItem["category"];
}) {
  // เลือกรูปไอคอนตามประเภทแจ้งเตือน ถ้าเพิ่มประเภทใหม่ให้เพิ่มรูปตรงนี้ด้วย
  const iconClass = "size-4";
  const iconByCategory = {
    new: <Bell1 className={iconClass} />,
    updated: <RefreshCircle1Clockwise className={iconClass} />,
    completed: <CheckCircle1 className={iconClass} />,
    rejected: <Gear1 className={iconClass} />,
    withdraw: <Bell1 className={iconClass} />,
    return: <CheckCircle1 className={iconClass} />,
    transfer: <RefreshCircle1Clockwise className={iconClass} />,
    inventory: <Gear1 className={iconClass} />,
    warranty_expired: <Gear1 className={iconClass} />,
    warranty_expiring: <RefreshCircle1Clockwise className={iconClass} />,
  };

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
      {iconByCategory[category]}
    </span>
  );
}

export default function NotificationDropdown() {
  const router = useRouter();
  const language = useLanguage();
  const translateText = useTranslate();
  const role = useSyncExternalStore(
    subscribeToCredentialChanges,
    getCredentialRoleSnapshot,
    getServerCredentialRoleSnapshot,
  );
  // โหลดคำร้องจาก Local Storage เพื่อให้แจ้งเตือนอัปเดตหลัง User ส่งคำร้อง
  const userRequestsSnapshot = useSyncExternalStore(
    subscribeToUserRepairRequests,
    getUserRepairRequestsSnapshot,
    getServerUserRepairRequestsSnapshot,
  );
  const userRequests = useMemo(
    () => parseUserRepairRequestsSnapshot(userRequestsSnapshot),
    [userRequestsSnapshot],
  );
  // ติดตามคำขอเบิก, รอบตรวจนับ และการเปลี่ยนแปลงข้อมูลทรัพย์สิน
  const notificationSourcesSnapshot = useSyncExternalStore(
    subscribeToNotificationSources,
    getNotificationSourcesSnapshot,
    getServerNotificationSourcesSnapshot,
  );
  const visibleNotifications = getNotificationsForRole(
    role,
    userRequests,
    notificationSourcesSnapshot,
  );
  // จำไว้ว่ากล่องอยู่ตรงไหน และตอนนี้เปิดอยู่หรือปิดอยู่
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  // อ่านว่ารายการไหนอ่านแล้ว เพื่ออัปเดตเลขบนกระดิ่งทันที
  const snapshot = useSyncExternalStore(
    subscribeToNotificationChanges,
    getReadNotificationsSnapshot,
    getServerReadNotificationsSnapshot,
  );
  const readIds = parseReadNotifications(snapshot);
  const unreadCount = visibleNotifications.filter(
    (notification) => !readIds.has(notification.id),
  ).length;

  // ปิดกล่องเมื่อคลิกข้างนอกหรือกดปุ่ม Esc
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // ปุ่ม "อ่านทั้งหมด" ทำให้จุดแจ้งเตือนของทุกรายการหายไป
  const markAllAsRead = () => {
    try {
      markNotificationsRead(visibleNotifications.map(({ id }) => id));
      setError("");
    } catch {
      setError("บันทึกสถานะไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  };

  // กดรายการแล้วไปดูคำร้องนั้น หรือประวัติซ่อม ถ้าซ่อมเสร็จแล้ว
  const openNotification = (notification: NotificationItem) => {
    try {
      markNotificationsRead([notification.id]);
      setError("");
    } catch {
      setError("บันทึกสถานะไม่สำเร็จ กรุณาลองอีกครั้ง");
      return;
    }
    setIsOpen(false);
    router.push(getNotificationHref(role, notification));
  };

  return (
    <div ref={rootRef} className="relative">
      {/* กระดิ่งและตัวเลขสีแดงแสดงจำนวนรายการที่ยังไม่ได้เปิดอ่าน */}
      <button
        type="button"
        aria-label={`${translateText("การแจ้งเตือน")}${unreadCount ? ` ${unreadCount} ${translateText("รายการที่ยังไม่อ่าน")}` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex size-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Bell1 className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label={translateText("การแจ้งเตือน")}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl"
        >
          {/* กล่องนี้จะแสดงหลังจากกดกระดิ่ง */}
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">
                {translateText("การแจ้งเตือน")}
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                  {unreadCount} {translateText("รายการใหม่")}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-default disabled:text-slate-400"
            >
              {translateText("อ่านทั้งหมด")}
            </button>
          </header>

          {/* แจ้งเตือนตรงนี้ถ้าบันทึกว่าอ่านแล้วไม่สำเร็จ */}
          {error && (
            <p role="alert" className="bg-rose-50 px-4 py-2 text-xs text-rose-700">
              {translateText(error)}
            </p>
          )}

          <div className="max-h-[min(26rem,70vh)] overflow-y-auto">
            {/* กล่องย่อแสดง 4 รายการล่าสุดที่ผู้ใช้มีสิทธิ์เห็น */}
            {visibleNotifications.slice(0, 4).map((notification) => {
              const isUnread = !readIds.has(notification.id);

              return (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => openNotification(notification)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-indigo-50 ${
                    isUnread ? "bg-indigo-50/70" : "bg-white"
                  }`}
                >
                  <NotificationIcon category={notification.category} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {translateText(notification.title)}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatNotificationTime(notification.createdAt, language)}
                      </span>
                    </span>
                    <span className="mt-1 block line-clamp-2 whitespace-normal text-xs text-slate-600">
                      {translateText(notification.assetName)}
                      {notification.issue &&
                        ` · ${translateText(notification.issue)}`}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-400">
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
                      className="mt-4 size-2 shrink-0 rounded-full bg-indigo-600"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ปุ่มนี้เปิดหน้ารวมการแจ้งเตือนทั้งหมด */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              router.push("/notifications-center");
            }}
            className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-xs font-semibold text-indigo-600 transition hover:bg-slate-50"
          >
            {translateText("ดูการแจ้งเตือนทั้งหมด")}{" "}
            <span aria-hidden="true">›</span>
          </button>
        </section>
      )}
    </div>
  );
}
