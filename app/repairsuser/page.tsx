"use client";

// หน้านี้ให้ User ค้นหา ดูรายละเอียด และส่งคำร้องแจ้งซ่อม
// ตอนนี้แก้รายการได้ชั่วคราว ถ้ารีเฟรชหน้ารายการที่สร้างใหม่จะหายไป
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  FileText,
  Search1,
} from "@tailgrids/icons";
import { assets } from "@/data/asset";
import { branches } from "@/data/branches";
import CreateRepairModal from "./modal";
import {
  repairRequests as initialRepairRequests,
  type RepairRequest,
  type RepairStatus,
} from "@/data/repairRequests";

const pageSize = 5;

// ข้อความและสีของแต่ละสถานะที่เห็นในหน้า
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

function formatThaiDate(date: string) {
  // แสดงวันที่เป็นรูปแบบภาษาไทย
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getBranch(branchId: string) {
  // หาชื่อสาขาจากรหัสสาขา
  return branches.find((branch) => branch.id === branchId);
}

function getAsset(assetId: string) {
  // หาชื่ออุปกรณ์จากรหัสอุปกรณ์
  return assets.find((asset) => asset.id === assetId);
}

export default function RepairsPage() {
  // จำรายการซ่อม คำค้นหา ตัวกรอง หน้าที่กำลังดู และรายการที่เลือกเปิด
  const [requests, setRequests] = useState(initialRepairRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // แสดงเฉพาะรายการที่ตรงกับคำค้นหา สถานะ สาขา และวันที่
  const filteredRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th");

    return [...requests]
      .filter((request) => {
        const asset = getAsset(request.assetId);
        const branch = getBranch(request.branchId);
        const matchesSearch =
          !query ||
          [
            request.id,
            request.assetId,
            asset?.name,
            request.issue,
            branch?.name,
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
  }, [requests, search, statusFilter, branchFilter, dateFrom]);

  // เลือกรายการที่จะเห็นในหน้านี้; เปลี่ยนจำนวนต่อหน้าได้ที่ pageSize ด้านบน
  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const updateFilter = (update: () => void) => {
    // เมื่อเปลี่ยนตัวกรอง ให้กลับไปดูหน้าแรก
    update();
    setCurrentPage(1);
  };

  const handleCreateRequest = (event: FormEvent<HTMLFormElement>) => {
    // อ่านข้อมูลที่กรอกจากหน้าต่างสร้างคำร้อง
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const assetId = String(formData.get("assetId") ?? "");
    const branchId = String(formData.get("branchId") ?? "");
    const issue = String(formData.get("issue") ?? "").trim();
    const priority = String(formData.get("priority") ?? "medium") as
      | "low"
      | "medium"
      | "high"
      | "urgent";

    if (!assetId || !branchId || !issue) return;

    // สร้างเลขคำร้องถัดไปจากรายการที่มีอยู่
    const nextNumber =
      Math.max(
        0,
        ...requests.map((request) => Number(request.id.split("-")[1]) || 0),
      ) + 1;
    // คำร้องที่เพิ่งส่งจะมีสถานะ "รอดำเนินการ"
    const newRequest: RepairRequest = {
      id: `REP-${String(nextNumber).padStart(4, "0")}`,
      assetId,
      reporterId: 101,
      branchId,
      issue,
      priority,
      status: "pending",
      vendorId: getAsset(assetId)?.vendorId ?? "",
      reportedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      estimatedCost: null,
      actualCost: null,
      solution: "",
      adminNote: "",
    };

    setRequests((current) => [newRequest, ...current]);
    setCurrentPage(1);
    setIsCreateOpen(false);
    event.currentTarget.reset();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f8] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        {/* หัวข้อหน้าและปุ่มเปิดหน้าต่างสร้างคำร้อง */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              รายการแจ้งซ่อม
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              ประวัติการแจ้งซ่อมครุภัณฑ์และติดตามสถานะการดำเนินงาน
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 sm:w-auto"
          >
            <FileText className="size-4" />
            สร้างคำร้องแจ้งซ่อม
          </button>
        </header>

        {/* แสดงสาขาที่กำลังเลือกดู */}
        <section className="mb-5 flex flex-col items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <FileText className="size-4 text-slate-500" />
            <span>สาขาที่ดูแล</span>
            <span className="font-semibold text-slate-900">
              {branchFilter === "all"
                ? "ทุกสาขา"
                : `${getBranch(branchFilter)?.name} · ${getBranch(branchFilter)?.code}`}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            แสดงรายการแจ้งซ่อมทั้งหมดในระบบ
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
                placeholder="ค้นหาคำร้อง, อุปกรณ์, ผู้แจ้ง..."
                aria-label="ค้นหารายการแจ้งซ่อม"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="relative">
              <span className="sr-only">กรองตามสถานะ</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  updateFilter(() => setStatusFilter(event.target.value))
                }
                className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44"
              >
                <option value="all">สถานะทั้งหมด</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </label>

            <label className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">แสดงรายการตั้งแต่วันที่</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  updateFilter(() => setDateFrom(event.target.value))
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44"
              />
            </label>

            <label className="relative">
              <span className="sr-only">กรองตามสาขา</span>
              <select
                value={branchFilter}
                onChange={(event) =>
                  updateFilter(() => setBranchFilter(event.target.value))
                }
                className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44"
              >
                <option value="all">ทุกสาขา</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </label>
          </div>

          {/* หน้าจอมือถือแสดงรายการเป็นการ์ด */}
          <div className="divide-y divide-slate-100 md:hidden">
            {visibleRequests.map((request) => {
              const asset = getAsset(request.assetId);
              const branch = getBranch(request.branchId);

              return (
                <article key={request.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800">
                      {request.id}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[request.status]}`}
                    >
                      {statusLabels[request.status]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-slate-800">
                      {asset?.name ?? "ไม่พบข้อมูลทรัพย์สิน"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {request.assetId}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">ผู้แจ้ง</p>
                      <p className="mt-1 break-words text-slate-700">
                        ผู้ใช้งาน #{request.reporterId}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">สาขา</p>
                      <p className="mt-1 break-words text-slate-700">
                        {branch?.name ?? "ไม่ระบุสาขา"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-400">วันที่แจ้ง</p>
                      <p className="mt-1 text-slate-700">
                        {formatThaiDate(request.reportedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    ดูรายละเอียด
                  </button>
                </article>
              );
            })}
            {visibleRequests.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                ไม่พบรายการแจ้งซ่อมที่ตรงกับการค้นหา
              </p>
            )}
          </div>

          {/* หน้าจอใหญ่แสดงรายการเป็นตาราง */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="bg-slate-50 text-[11px] font-medium text-slate-500">
                <tr>
                  <th className="px-4 py-3">เลขที่คำร้อง</th>
                  <th className="px-4 py-3">Asset / อุปกรณ์</th>
                  <th className="px-4 py-3">ผู้แจ้ง</th>
                  <th className="px-4 py-3">สาขา / ID</th>
                  <th className="px-4 py-3">วันที่แจ้ง</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRequests.map((request) => {
                  const asset = getAsset(request.assetId);
                  const branch = getBranch(request.branchId);

                  return (
                    <tr
                      key={request.id}
                      className="text-xs text-slate-700 transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-800">
                        {request.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">
                          {asset?.name ?? "ไม่พบข้อมูลทรัพย์สิน"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {request.assetId}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        ผู้ใช้งาน #{request.reporterId}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-700">
                          {branch?.name ?? "ไม่ระบุสาขา"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {branch?.code ?? request.branchId}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                        {formatThaiDate(request.reportedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[request.status]}`}
                        >
                          {statusLabels[request.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(request)}
                          className="whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          ดูรายละเอียด
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
                      ไม่พบรายการแจ้งซ่อมที่ตรงกับการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ปุ่มเปลี่ยนหน้า; จำนวนรายการต่อหน้าปรับได้ที่ pageSize */}
          <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
            <p className="text-[11px] text-slate-500">
              แสดง{" "}
              {filteredRequests.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}{" "}
              - {Math.min(currentPage * pageSize, filteredRequests.length)} จาก{" "}
              {filteredRequests.length} รายการ
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="หน้าก่อนหน้า"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="size-4" />
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    aria-label={`หน้า ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    onClick={() => setCurrentPage(page)}
                    className={`size-8 rounded-md text-xs font-medium transition ${
                      page === currentPage
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label="หน้าถัดไป"
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
      </div>

      {/* กด "ดูรายละเอียด" เพื่อเปิดหน้าต่างข้อมูลคำร้อง */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-3 sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="repair-dialog-title"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:p-5"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="repair-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  รายละเอียดคำร้องแจ้งซ่อม
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedRequest.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                }}
                aria-label="ปิดหน้าต่าง"
                className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">อุปกรณ์</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {getAsset(selectedRequest.assetId)?.name} (
                  {selectedRequest.assetId})
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">ผู้แจ้ง</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  ผู้ใช้งาน #{selectedRequest.reporterId}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">สาขา</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {getBranch(selectedRequest.branchId)?.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">วันที่แจ้ง</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {formatThaiDate(selectedRequest.reportedAt)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">อาการที่แจ้ง</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {selectedRequest.issue}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">สถานะ</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {statusLabels[selectedRequest.status]}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">หมายเหตุ</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {selectedRequest.adminNote || "-"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
      {/* หน้าต่างนี้เปิดจากปุ่ม "สร้างคำร้องแจ้งซ่อม" ด้านบน */}
      {isCreateOpen && (
        <CreateRepairModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateRequest}
        />
      )}
    </div>
  );
}
