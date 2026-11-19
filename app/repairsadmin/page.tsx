"use client";
import {
  formatLocalizedDate,
  useLanguage,
  useTheme,
  useTranslate,
} from "@/lib/language";


// หน้านี้ให้ Admin ค้นหา ตรวจสอบ และอัปเดตคำร้องแจ้งซ่อม
// Admin เปลี่ยนสถานะและเขียนคำตอบได้; คำตอบจะถูกเก็บและส่งแจ้งเตือนไปยัง User
import { Suspense, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccountNames } from "@/lib/accounts";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  CheckCircle1,
  FileText,
  Gear1,
  LaptopPhone,
  MapMarker5,
  Paperclip2,
  Phone,
  RefreshCircle1Clockwise,
  Search1,
  User2,
} from "@tailgrids/icons";
import { assets } from "@/data/asset";
import { branches } from "@/data/branches";
import RepairImageGallery from "@/components/repairs/RepairImageGallery";
import {
  repairRequests as initialRequests,
  type RepairRequest,
  type RepairStatus,
} from "@/data/repairRequests";
import {
  getServerUserRepairRequestsSnapshot,
  getUserRepairRequestsSnapshot,
  parseUserRepairRequestsSnapshot,
  subscribeToUserRepairRequests,
  upsertUserRepairRequest,
} from "@/lib/userRepairRequests";
import { publishUserActionNotification } from "@/lib/userActionNotifications";
import { vendors } from "@/data/vendor";

const pageSize = 5;

// ชื่อและสีที่แสดงให้แต่ละสถานะ ถ้าเพิ่มสถานะใหม่ให้เพิ่มในรายการเหล่านี้ด้วย
const statusLabels: Record<RepairStatus, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังซ่อม",
  completed: "เสร็จสิ้น",
  rejected: "ไม่อนุมัติ",
};

const statusStyles: Record<RepairStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  in_progress: "bg-indigo-50 text-indigo-600",
  completed: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-600",
};

const statuses: RepairStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "rejected",
];
const allowedFileTypes = new Set([
  // ชนิดไฟล์ที่อนุญาตให้แนบ
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const maxFileSize = 10 * 1024 * 1024;

// จำรายการ ตัวกรอง หน้าที่กำลังดู ข้อมูลที่กำลังแก้ และข้อความแจ้งผล
function RepairsAdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const language = useLanguage();
  const isDark = useTheme() === "dark";
  const translateText = useTranslate();
  const { accountNames, error: accountNamesError } = useAccountNames();
  // แสดง username จาก API แทน reporterId; ใช้รหัสเดิมเป็น fallback เมื่อไม่พบ
  const getReporterName = (reporterId: number) =>
    accountNames.get(String(reporterId)) ??
    `${translateText("ผู้ใช้งาน #")}${reporterId}`;
  // อ่าน Local Storage เดียวกับหน้า User; event ทำให้รายการใหม่อัปเดตทันที
  const userRequestsSnapshot = useSyncExternalStore(
    subscribeToUserRepairRequests,
    getUserRepairRequestsSnapshot,
    getServerUserRepairRequestsSnapshot,
  );
  const createdRequests = useMemo(
    () => parseUserRepairRequestsSnapshot(userRequestsSnapshot),
    [userRequestsSnapshot],
  );
  // เก็บการแก้ไขของ Admin ใน state ชั่วคราว โดยไม่แก้ข้อมูลต้นทางของ User
  const [requestOverrides, setRequestOverrides] = useState<
    Record<string, RepairRequest>
  >({});
  const requests = useMemo(() => {
    // รวมคำร้องตัวอย่างกับคำร้องที่ User ส่ง; ถ้า Admin แก้แล้วให้ใช้ค่าล่าสุด
    const requestsById = new Map<string, RepairRequest>();
    [...initialRequests, ...createdRequests].forEach((request) =>
      requestsById.set(request.id, request),
    );
    Object.values(requestOverrides).forEach((request) =>
      requestsById.set(request.id, request),
    );
    return [...requestsById.values()];
  }, [createdRequests, requestOverrides]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [manuallySelectedRequest, setManuallySelectedRequest] = useState<RepairRequest | null>(
    null,
  );
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RepairStatus>("pending");
  const [adminNote, setAdminNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // ใช้ requestId จาก URL เปิดรายละเอียดจากแจ้งเตือน; ถ้าไม่มีจึงใช้รายการที่คลิก
  const selectedRequest =
    requests.find((request) => request.id === requestId) ??
    manuallySelectedRequest;
  const activeEditStatus =
    selectedRequest && editingRequestId === selectedRequest.id
      ? editStatus
      : selectedRequest?.status ?? editStatus;
  const activeAdminNote =
    selectedRequest && editingRequestId === selectedRequest.id
      ? adminNote
      : selectedRequest?.adminNote ?? adminNote;

  // เลือกแสดงรายการตามคำค้นหา สถานะ สาขา และวันที่
  const filteredRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th");
    return [...requests]
      .filter((request) => {
        const asset = assets.find((item) => item.id === request.assetId);
        const branch = branches.find((item) => item.id === request.branchId);
        const matchesSearch =
          !query ||
          [
            request.id,
            request.assetId,
            asset?.name,
            request.issue,
            branch?.name,
            accountNames.get(String(request.reporterId)),
            String(request.reporterId),
          ].some((value) => value?.toLocaleLowerCase("th").includes(query));

        return (
          matchesSearch &&
          (statusFilter === "all" || request.status === statusFilter) &&
          (branchFilter === "all" || request.branchId === branchFilter) &&
          (!dateFrom || request.reportedAt.slice(0, 10) >= dateFrom)
        );
      })
      .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  }, [requests, search, statusFilter, branchFilter, dateFrom, accountNames]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRequests.length / pageSize),
  );
  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const asset = selectedRequest
    ? assets.find((item) => item.id === selectedRequest.assetId)
    : undefined;
  const branch = selectedRequest
    ? branches.find((item) => item.id === selectedRequest.branchId)
    : undefined;
  const vendor = selectedRequest
    ? vendors.find((item) => item.id === selectedRequest.vendorId)
    : undefined;

  const updateFilter = (update: () => void) => {
    // เปลี่ยนตัวกรองแล้วกลับไปหน้าแรก
    update();
    setCurrentPage(1);
  };

  const showDetails = (request: RepairRequest) => {
    // เปิดรายละเอียดพร้อมใส่ข้อมูลเดิมลงในช่องแก้ไข
    setManuallySelectedRequest(request);
    setEditingRequestId(request.id);
    setEditStatus(request.status);
    setAdminNote(request.adminNote);
    setFiles([]);
    setError("");
    setSuccess("");
  };

  const closeDetails = () => {
    setManuallySelectedRequest(null);
    if (requestId) router.replace("/repairsadmin", { scroll: false });
  };

  const handleFiles = (selectedFiles: File[]) => {
    // ตรวจไฟล์ที่เลือกหรือวาง; ไม่รับไฟล์ที่ชนิดไม่ตรงหรือใหญ่กว่า 10 MB
    const invalidFile = selectedFiles.find(
      (file) => !allowedFileTypes.has(file.type) || file.size > maxFileSize,
    );
    if (invalidFile) {
      setFiles([]);
      setError(
        invalidFile.size > maxFileSize
          ? "ไฟล์แนบต้องมีขนาดไม่เกิน 10 MB"
          : "รองรับไฟล์รูปภาพ, PDF และ DOC เท่านั้น",
      );
      return;
    }
    setError("");
    setFiles(selectedFiles);
  };

  const updateRequest = () => {
    // บันทึกสถานะล่าสุดเพื่อให้ User เห็นผลและอ่านข้อความตอบกลับได้หลังรีเฟรช
    if (!selectedRequest) return;
    setError("");
    setSuccess("");
    const updatedRequest: RepairRequest = {
      ...selectedRequest,
      status: activeEditStatus,
      adminNote: activeAdminNote.trim(),
    };
    try {
      upsertUserRepairRequest(updatedRequest);
    } catch {
      setError("บันทึกการอัปเดตไม่สำเร็จ กรุณาลองอีกครั้ง");
      return;
    }
    setRequestOverrides((current) => ({
      ...current,
      [updatedRequest.id]: updatedRequest,
    }));
    setManuallySelectedRequest(updatedRequest);
    setEditingRequestId(updatedRequest.id);
    setSuccess("อัปเดตสถานะเรียบร้อยแล้ว");
    if (updatedRequest.reporterId > 0) {
      const asset = assets.find((item) => item.id === updatedRequest.assetId);
      const statusText = statusLabels[activeEditStatus];
      const adminReply = updatedRequest.adminNote.trim();
      try {
        publishUserActionNotification({
          key: `repair:${updatedRequest.id}`,
          recipientId: updatedRequest.reporterId,
          category:
            activeEditStatus === "pending"
              ? "new"
              : activeEditStatus === "in_progress"
                ? "updated"
                : activeEditStatus,
          title: statusText,
          assetName: asset?.name ?? updatedRequest.assetId,
          branchId: updatedRequest.branchId,
          issue: adminReply,
          reference: updatedRequest.id,
          href: `/repairsuser?requestId=${encodeURIComponent(updatedRequest.id)}`,
        });
      } catch (notificationError) {
        console.error("แจ้งผู้ยื่นคำร้องซ่อมไม่สำเร็จ:", notificationError);
        setError("อัปเดตคำร้องแล้ว แต่ส่งการแจ้งเตือนไม่สำเร็จ");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f8] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        {accountNamesError && (
          <p role="alert" className="mb-4 text-sm text-rose-600">
            {translateText(accountNamesError)}
          </p>
        )}
        {/* เลือกรายการแล้วจะแสดงหน้ารายละเอียด; ถ้ายังไม่เลือกจะแสดงรายการทั้งหมด */}
        {selectedRequest ? (
          <div className="mx-auto max-w-4xl">
            <button
              type="button"
              onClick={closeDetails}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-700"
            >
              <ArrowLeft className="size-4" />

              {translateText("กลับไปหน้ารายการคำร้อง")}
            </button>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-lg font-semibold text-slate-900">

                  {translateText("รายละเอียดคำร้อง")}
                </h1>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="break-all text-xs font-semibold text-slate-700 sm:text-sm">
                    {selectedRequest.id}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[selectedRequest.status]}`}
                  >
                    {translateText(statusLabels[selectedRequest.status])}
                  </span>
                </div>
              </header>

              <div className="grid gap-5 border-b border-slate-200 pb-5 md:grid-cols-2">
                <dl className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User2 className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <dt className="w-24 shrink-0 text-xs text-slate-500">

                      {translateText("ผู้แจ้ง")}
                    </dt>
                    <dd className="min-w-0 break-words text-xs font-medium text-slate-700">

                      {getReporterName(selectedRequest.reporterId)}
                    </dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <LaptopPhone className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <dt className="w-24 shrink-0 text-xs text-slate-500">

                      {translateText("Asset")}
                    </dt>
                    <dd className="text-xs font-medium text-slate-700">
                      {asset?.name ?? "ไม่พบข้อมูลทรัพย์สิน"}{" "}
                      <span className="break-all text-slate-400">
                        {selectedRequest.assetId}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapMarker5 className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <dt className="w-24 shrink-0 text-xs text-slate-500">

                      {translateText("สาขา")}
                    </dt>
                    <dd className="text-xs font-medium text-slate-700">
                      {translateText(branch?.name ?? "ไม่ระบุสาขา")}
                    </dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <dt className="w-24 shrink-0 text-xs text-slate-500">

                      {translateText("วันที่แจ้ง")}
                    </dt>
                    <dd className="text-xs font-medium text-slate-700">
                      {formatLocalizedDate(selectedRequest.reportedAt, language, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </dd>
                  </div>
                </dl>
                <dl className="space-y-4 border-slate-200 md:border-l md:pl-5">
                  <div className="flex items-start gap-3">
                    <Gear1 className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <dt className="w-24 shrink-0 text-xs text-slate-500">

                      {translateText("ผู้จัดจำหน่าย")}
                    </dt>
                    <dd className="text-xs font-medium text-slate-700">
                      {vendor?.name ?? "ไม่ระบุผู้จัดจำหน่าย"}
                    </dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <dt className="w-24 shrink-0 text-xs text-slate-500">

                      {translateText("ช่องทางติดต่อ Vendor")}
                    </dt>
                    <dd className="min-w-0 break-words text-xs leading-5 text-slate-700">
                      {vendor?.phone ?? "-"}
                      <br />
                      {vendor?.email ?? "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border-b border-slate-200 py-4">
                <p className="mb-1 text-xs font-medium text-slate-500">

                  {translateText("อาการที่แจ้ง")}
                </p>
                <p className="break-words text-sm text-slate-700">
                  {selectedRequest.issue}
                </p>
              </div>
              {selectedRequest.images?.length ? (
                <div className="border-b border-slate-200 py-4">
                  <RepairImageGallery
                    images={selectedRequest.images}
                    label={translateText("รูปภาพประกอบ")}
                  />
                </div>
              ) : null}

              {/* ช่องแก้สถานะ หมายเหตุ และแนบไฟล์ */}
              <div className="space-y-5 pt-4">
                <label className="block text-xs font-medium text-slate-600">

                  {translateText("สถานะ")} <span className="text-rose-500">*</span>
                  <span className="relative mt-2 block">
                    <CheckCircle1 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <select
                      required
                      value={activeEditStatus}
                      onChange={(event) => {
                        if (selectedRequest) {
                          setEditingRequestId(selectedRequest.id);
                        }
                        setEditStatus(event.target.value as RepairStatus);
                      }}
                      className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-normal text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {translateText(statusLabels[status])}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                <label className="block text-xs font-medium text-slate-600">

                  {translateText("หมายเหตุ (ภายใน)")}
                  <textarea
                    rows={3}
                    value={activeAdminNote}
                    onChange={(event) => {
                      if (selectedRequest) {
                        setEditingRequestId(selectedRequest.id);
                      }
                      setAdminNote(event.target.value);
                    }}
                    placeholder={translateText("ระบุหมายเหตุการดำเนินการ...")}
                    className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-xs font-normal outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                {/* เลือกไฟล์จากเครื่องหรือลากไฟล์มาวางตรงนี้ */}
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-600">

                    {translateText("ไฟล์แนบ (ถ้ามี)")}
                  </p>
                  <label
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleFiles(Array.from(event.dataTransfer.files));
                    }}
                    className="flex min-h-16 cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 px-4 py-3 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
                  >
                    <Paperclip2 className="size-5 shrink-0 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {files.length
                        ? files.map((file) => file.name).join(", ")
                        : "ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์"}
                      <span className="mt-1 block text-[10px] text-slate-400">

                        {translateText("รองรับไฟล์รูปภาพ, PDF, DOC (ไม่เกิน 10 MB)")}
                      </span>
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(event) =>
                        handleFiles(Array.from(event.currentTarget.files ?? []))
                      }
                      className="sr-only"
                    />
                  </label>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-rose-600">
                    {error}
                  </p>
                )}
                {success && (
                  <p role="status" className="text-sm text-emerald-700">
                    {success}
                  </p>
                )}
                {/* กดเพื่ออัปเดตข้อมูลที่แก้ */}
                <button
                  type="button"
                  onClick={updateRequest}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-indigo-600 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  <RefreshCircle1Clockwise className="size-4" />

                  {translateText("อัปเดตสถานะ")}
                </button>
              </div>
            </section>
          </div>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">

                {translateText("รายการแจ้งซ่อม")}
              </h1>
              <p className="mt-1 text-xs text-slate-500">

                {translateText("ตรวจสอบคำร้องแจ้งซ่อมและติดตามสถานะการดำเนินงาน")}
              </p>
            </header>

            {/* แสดงสาขาที่กำลังดู */}
            <section className="mb-5 flex flex-col items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                <FileText className="size-4 text-slate-500" />
                <span>{translateText("สาขาที่ดูแล")}</span>
                <span className="break-words font-semibold text-slate-900">
                  {branchFilter === "all"
                    ? translateText("ทุกสาขา")
                    : `${translateText(branches.find((item) => item.id === branchFilter)?.name ?? "ไม่ระบุสาขา")} · ${branches.find((item) => item.id === branchFilter)?.code}`}
                </span>
              </div>
              <p className="text-xs text-slate-400">

                {translateText("แสดงรายการแจ้งซ่อมทั้งหมดในระบบ")}
              </p>
            </section>

            {/* ช่องค้นหาและตัวเลือกกรองรายการ */}
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row">
                <label className="relative min-w-0 flex-1">
                  <Search1 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      updateFilter(() => setSearch(event.target.value))
                    }
                    placeholder={translateText("ค้นหาคำร้อง, อุปกรณ์, ผู้แจ้ง...")}
                    aria-label={translateText("ค้นหารายการแจ้งซ่อม")}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="relative">
                  <span className="sr-only">{translateText("กรองตามสถานะ")}</span>
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      updateFilter(() => setStatusFilter(event.target.value))
                    }
                    className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44"
                  >
                    <option value="all">{translateText("สถานะทั้งหมด")}</option>
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <option key={status} value={status}>
                        {translateText(label)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </label>
                <label>
                  <span className="sr-only">{translateText("แสดงรายการตั้งแต่วันที่")}</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) =>
                      updateFilter(() => setDateFrom(event.target.value))
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44"
                  />
                </label>
                <label className="relative">
                  <span className="sr-only">{translateText("กรองตามสาขา")}</span>
                  <select
                    value={branchFilter}
                    onChange={(event) =>
                      updateFilter(() => setBranchFilter(event.target.value))
                    }
                    className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44"
                  >
                    <option value="all">{translateText("ทุกสาขา")}</option>
                    {branches.map((item) => (
                      <option key={item.id} value={item.id}>
                        {translateText(item.name)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </label>
              </div>

              {/* หน้าจอมือถือแสดงรายการเป็นการ์ด */}
              <div className="divide-y divide-slate-100 md:hidden">
                {visibleRequests.map((request) => {
                  const rowAsset = assets.find(
                    (item) => item.id === request.assetId,
                  );
                  const rowBranch = branches.find(
                    (item) => item.id === request.branchId,
                  );

                  return (
                    <article key={request.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-800">
                          {request.id}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[request.status]}`}
                        >
                          {translateText(statusLabels[request.status])}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-slate-800">
                          {rowAsset?.name ?? "ไม่พบข้อมูลทรัพย์สิน"}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {request.assetId}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400">{translateText("ผู้แจ้ง")}</p>
                          <p className="mt-1 break-words text-slate-700">

                            {getReporterName(request.reporterId)}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400">{translateText("สาขา")}</p>
                          <p className="mt-1 break-words text-slate-700">
                            {rowBranch?.name ?? "ไม่ระบุสาขา"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-400">

                            {translateText("วันที่แจ้ง")}
                          </p>
                          <p className="mt-1 text-slate-700">
                            {formatLocalizedDate(request.reportedAt, language)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showDetails(request)}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >

                        {translateText("ดูรายละเอียด")}
                      </button>
                    </article>
                  );
                })}
                {visibleRequests.length === 0 && (
                  <p className="px-4 py-10 text-center text-sm text-slate-500">

                    {translateText("ไม่พบรายการแจ้งซ่อมที่ตรงกับการค้นหา")}
                  </p>
                )}
              </div>

              {/* หน้าจอใหญ่แสดงรายการเป็นตาราง */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead className="bg-slate-50 text-[11px] font-medium text-slate-500">
                    <tr>
                      <th className="px-4 py-3">{translateText("เลขที่คำร้อง")}</th>
                      <th className="px-4 py-3">{translateText("Asset / อุปกรณ์")}</th>
                      <th className="px-4 py-3">{translateText("ผู้แจ้ง")}</th>
                      <th className="px-4 py-3">{translateText("สาขา / ID")}</th>
                      <th className="px-4 py-3">{translateText("วันที่แจ้ง")}</th>
                      <th className="px-4 py-3">{translateText("สถานะ")}</th>
                      <th className="px-4 py-3 text-center">{translateText("ดำเนินการ")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleRequests.map((request) => {
                      const rowAsset = assets.find(
                        (item) => item.id === request.assetId,
                      );
                      const rowBranch = branches.find(
                        (item) => item.id === request.branchId,
                      );
                      return (
                        <tr
                          key={request.id}
                          className={`text-xs text-slate-700 transition ${
                            isDark ? "hover:bg-slate-700" : "hover:bg-slate-50/70"
                          }`}
                        >
                          <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-800">
                            {request.id}
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-slate-800">
                              {rowAsset?.name ?? "ไม่พบข้อมูลทรัพย์สิน"}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {request.assetId}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">

                            {getReporterName(request.reporterId)}
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-slate-700">
                              {rowBranch?.name ?? "ไม่ระบุสาขา"}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {rowBranch?.code ?? request.branchId}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                            {formatLocalizedDate(request.reportedAt, language)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[request.status]}`}
                            >
                              {translateText(statusLabels[request.status])}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => showDetails(request)}
                              className="whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >

                              {translateText("ดูรายละเอียด")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {visibleRequests.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-sm text-slate-500"
                        >

                          {translateText("ไม่พบรายการแจ้งซ่อมที่ตรงกับการค้นหา")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ปุ่มเปลี่ยนหน้า; จำนวนรายการต่อหน้าปรับได้ที่ pageSize ด้านบน */}
              <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
                <p className="text-[11px] text-slate-500">

                  {translateText("แสดง")}{" "}
                  {filteredRequests.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}{" "}
                  - {Math.min(currentPage * pageSize, filteredRequests.length)}{" "}

                  {translateText("จาก")} {filteredRequests.length}  {translateText("รายการ")}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={translateText("หน้าก่อนหน้า")}
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  {Array.from(
                    { length: pageCount },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      aria-label={`หน้า ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      className={`size-8 rounded-md text-xs font-medium transition ${page === currentPage
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-500 hover:bg-slate-100"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label={translateText("หน้าถัดไป")}
                    disabled={currentPage === pageCount}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(pageCount, page + 1))
                    }
                    className="flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </footer>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default function RepairsAdminPage() {
  return (
    <Suspense fallback={null}>
      <RepairsAdminPageContent />
    </Suspense>
  );
}
