"use client";
import {
  formatLocalizedDate,
  useLanguage,
  useTheme,
  useTranslate,
} from "@/lib/language";


// หน้านี้ให้ User ค้นหา ดูรายละเอียด และส่งคำร้องแจ้งซ่อม
// คำร้องใหม่จะถูกเก็บใน Local Storage ของเบราว์เซอร์ และแสดงรายการสาขาเชียงใหม่
import {
  Suspense,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccountNames } from "@/lib/accounts";
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
import { getCurrentStaffId } from "@/lib/userActionNotifications";
import {
  repairRequests as initialRepairRequests,
  type RepairRequest,
  type RepairStatus,
} from "@/data/repairRequests";
import {
  getServerUserRepairRequestsSnapshot,
  getUserRepairRequestsSnapshot,
  parseUserRepairRequestsSnapshot,
  saveUserRepairRequest,
  subscribeToUserRepairRequests,
} from "@/lib/userRepairRequests";

const pageSize = 5;
const CHIANG_MAI_BRANCH_ID = "BR-002";

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

function getBranch(branchId: string) {
  // หาชื่อสาขาจากรหัสสาขา
  return branches.find((branch) => branch.id === branchId);
}

function getAsset(assetId: string) {
  // หาชื่ออุปกรณ์จากรหัสอุปกรณ์
  return assets.find((asset) => asset.id === assetId);
}

// เตรียมรายการคำร้อง ตัวกรอง และหน้าต่างรายละเอียดของ User
function RepairsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const language = useLanguage();
  const isDark = useTheme() === "dark";
  const translateText = useTranslate();
  const surfaceClass = isDark
    ? "border-slate-700 bg-slate-900"
    : "border-slate-200 bg-white";
  const fieldClass = isDark
    ? "border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";
  const primaryTextClass = isDark ? "text-slate-100" : "text-slate-900";
  const bodyTextClass = isDark ? "text-slate-200" : "text-slate-800";
  const secondaryTextClass = isDark ? "text-slate-300" : "text-slate-700";
  const mutedTextClass = isDark ? "text-slate-400" : "text-slate-500";
  const dividerClass = isDark ? "border-slate-700" : "border-slate-100";
  const detailsButtonClass = isDark
    ? "border-slate-600 bg-slate-800 text-slate-200 hover:border-indigo-400 hover:bg-slate-700 hover:text-indigo-200 focus:ring-indigo-400"
    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-indigo-200";
  const { accountNames, error: accountNamesError } = useAccountNames();
  // ใช้ username จาก API แทนรหัสผู้แจ้ง; ถ้าไม่พบข้อมูลจึงแสดงรหัสเดิม
  const getReporterName = (reporterId: number) =>
    accountNames.get(String(reporterId)) ??
    `${translateText("ผู้ใช้งาน #")}${reporterId}`;
  const [saveError, setSaveError] = useState("");
  // อ่าน Local Storage ที่ใช้ร่วมกับหน้า Admin และรับ event เมื่อมีคำร้องใหม่
  const storedRequestsSnapshot = useSyncExternalStore(
    subscribeToUserRepairRequests,
    getUserRepairRequestsSnapshot,
    getServerUserRepairRequestsSnapshot,
  );
  // แปลง JSON ใน snapshot เป็นรายการที่มีชนิดข้อมูลถูกต้อง
  const createdRequests = useMemo(
    () => parseUserRepairRequestsSnapshot(storedRequestsSnapshot),
    [storedRequestsSnapshot],
  );
  // รวมคำร้องตัวอย่างกับคำร้องที่ User ส่ง แล้วเลือกเฉพาะสาขาเชียงใหม่
  const allRequests = useMemo(
    () => [...createdRequests, ...initialRepairRequests],
    [createdRequests],
  );
  const requests = useMemo(
    () =>
      allRequests.filter(
        (request) => request.branchId === CHIANG_MAI_BRANCH_ID,
      ),
    [allRequests],
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [manuallySelectedRequest, setManuallySelectedRequest] = useState<RepairRequest | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const selectedRequest =
    requests.find((request) => request.id === requestId) ??
    manuallySelectedRequest;
  const chiangMaiBranch = getBranch(CHIANG_MAI_BRANCH_ID);

  const closeDetails = () => {
    setManuallySelectedRequest(null);
    if (requestId) router.replace("/repairsuser", { scroll: false });
  };

  // แสดงเฉพาะคำร้องสาขาเชียงใหม่ที่ตรงกับคำค้นหา สถานะ และวันที่
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
            accountNames.get(String(request.reporterId)),
            String(request.reporterId),
          ].some((value) => value?.toLocaleLowerCase("th").includes(query));

        return (
          matchesSearch &&
          (statusFilter === "all" || request.status === statusFilter) &&
          (!dateFrom || request.reportedAt.slice(0, 10) >= dateFrom)
        );
      })
      .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  }, [requests, search, statusFilter, dateFrom, accountNames]);

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

  // ตรวจข้อมูลฟอร์ม แล้วบันทึกคำร้องใหม่เมื่อกดส่ง
  const handleCreateRequest = (event: FormEvent<HTMLFormElement>) => {
    // อ่านเฉพาะค่าจากฟอร์ม แล้วตรวจให้มีทรัพย์สิน สาขา และอาการก่อนบันทึก
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const assetId = String(formData.get("assetId") ?? "");
    const branchId = CHIANG_MAI_BRANCH_ID;
    const issue = String(formData.get("issue") ?? "").trim();
    const priority = String(formData.get("priority") ?? "medium") as
      | "low"
      | "medium"
      | "high"
      | "urgent";

    if (!assetId || !branchId || !issue) return;
    const reporterId = getCurrentStaffId();
    if (reporterId === null) {
      setSaveError("ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    // ใช้ทุกสาขาตรวจเลขคำร้องซ้ำ แม้หน้านี้จะแสดงเฉพาะสาขาเชียงใหม่
    const nextNumber =
      Math.max(
        0,
        ...allRequests.map((request) => Number(request.id.split("-")[1]) || 0),
      ) + 1;
    // คำร้องที่เพิ่งส่งจะมีสถานะ "รอดำเนินการ"
    const newRequest: RepairRequest = {
      id: `REP-${String(nextNumber).padStart(4, "0")}`,
      assetId,
      reporterId,
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

    try {
      // บันทึกลง Local Storage แล้วแจ้งหน้า User/Admin ให้รีเฟรชรายการ
      saveUserRepairRequest(newRequest);
      setSaveError("");
    } catch {
      setSaveError(
        "บันทึกคำร้องไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บในเบราว์เซอร์แล้วลองอีกครั้ง",
      );
      return;
    }

    setCurrentPage(1);
    setIsCreateOpen(false);
    event.currentTarget.reset();
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#f3f4f8] text-slate-800"}`}>
      <div className="mx-auto max-w-[1440px]">
        {accountNamesError && (
          <p
            role="alert"
            className={`mb-4 rounded-md px-3 py-2 text-sm ${
              isDark ? "bg-rose-950/50 text-rose-200" : "text-rose-600"
            }`}
          >
            {translateText(accountNamesError)}
          </p>
        )}
        {/* หัวข้อหน้าและปุ่มเปิดหน้าต่างสร้างคำร้อง */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className={`text-lg font-semibold tracking-tight sm:text-xl ${primaryTextClass}`}>
              
              {translateText("รายการแจ้งซ่อม")}
            </h1>
            <p className={`mt-1 text-xs ${mutedTextClass}`}>
              
              {translateText("ประวัติการแจ้งซ่อมครุภัณฑ์และติดตามสถานะการดำเนินงาน")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSaveError("");
              setIsCreateOpen(true);
            }}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 sm:w-auto"
          >
            <FileText className="size-4" />
            
            {translateText("สร้างคำร้องแจ้งซ่อม")}
          </button>
        </header>

        {/* หน้าผู้ใช้แสดงข้อมูลสาขาเชียงใหม่เท่านั้น */}
        <section className={`mb-5 flex flex-col items-start justify-between gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 ${surfaceClass}`}>
          <div className={`flex items-center gap-2 text-sm ${secondaryTextClass}`}>
            <FileText className={`size-4 ${mutedTextClass}`} />
            <span>{translateText("สาขาที่ดูแล")}</span>
            <span className={`font-semibold ${primaryTextClass}`}>
              {translateText(chiangMaiBranch?.name ?? "สาขาเชียงใหม่")}
              {chiangMaiBranch?.code ? ` · ${chiangMaiBranch.code}` : ""}
            </span>
          </div>
        </section>

        {/* ช่องค้นหาและตัวเลือกกรองรายการ */}
        <section className={`rounded-lg border shadow-sm ${surfaceClass}`}>
          <div className={`flex flex-col gap-3 border-b p-4 lg:flex-row ${dividerClass}`}>
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
                className={`h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${fieldClass}`}
              />
            </label>

            <label className="relative">
              <span className="sr-only">{translateText("กรองตามสถานะ")}</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  updateFilter(() => setStatusFilter(event.target.value))
                }
                className={`h-10 w-full appearance-none rounded-md border py-2 pl-3 pr-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44 ${fieldClass}`}
                style={{ colorScheme: isDark ? "dark" : "light" }}
              >
                <option value="all">{translateText("สถานะทั้งหมด")}</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {translateText(label)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </label>

            <label className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">{translateText("แสดงรายการตั้งแต่วันที่")}</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  updateFilter(() => setDateFrom(event.target.value))
                }
                className={`h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44 ${fieldClass}`}
                style={{ colorScheme: isDark ? "dark" : "light" }}
              />
            </label>

          </div>

          {/* หน้าจอมือถือแสดงรายการเป็นการ์ด */}
          <div className={`divide-y md:hidden ${isDark ? "divide-slate-700" : "divide-slate-100"}`}>
            {visibleRequests.map((request) => {
              const asset = getAsset(request.assetId);
              const branch = getBranch(request.branchId);

              return (
                <article key={request.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-xs font-semibold ${bodyTextClass}`}>
                      {request.id}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[request.status]}`}
                    >
                      {translateText(statusLabels[request.status])}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className={`break-words text-sm font-medium ${bodyTextClass}`}>
                      {asset?.name ?? "ไม่พบข้อมูลทรัพย์สิน"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {request.assetId}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{translateText("ผู้แจ้ง")}</p>
                      <p className={`mt-1 break-words ${secondaryTextClass}`}>
                        
                        {getReporterName(request.reporterId)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{translateText("สาขา")}</p>
                      <p className={`mt-1 break-words ${secondaryTextClass}`}>
                        {translateText(branch?.name ?? "ไม่ระบุสาขา")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-400">{translateText("วันที่แจ้ง")}</p>
                      <p className={`mt-1 ${secondaryTextClass}`}>
                        {formatLocalizedDate(request.reportedAt, language)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManuallySelectedRequest(request)}
                    className={`w-full rounded-md border px-3 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 ${detailsButtonClass}`}
                  >
                    
                    {translateText("ดูรายละเอียด")}
                  </button>
                </article>
              );
            })}
            {visibleRequests.length === 0 && (
              <p               className={`px-4 py-10 text-center text-sm ${mutedTextClass}`}>
                
                {translateText("ไม่พบรายการแจ้งซ่อมที่ตรงกับการค้นหา")}
              </p>
            )}
          </div>

          {/* หน้าจอใหญ่แสดงรายการเป็นตาราง */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className={`text-[11px] font-medium ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-500"}`}>
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
              <tbody className={`divide-y ${isDark ? "divide-slate-700" : "divide-slate-100"}`}>
                {visibleRequests.map((request) => {
                  const asset = getAsset(request.assetId);
                  const branch = getBranch(request.branchId);

                  return (
                    <tr
                      key={request.id}
                      className={`text-xs transition ${
                        isDark
                          ? "text-slate-300 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-50/70"
                      }`}
                    >
                      <td className={`whitespace-nowrap px-4 py-3.5 font-semibold ${bodyTextClass}`}>
                        {request.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`font-medium ${bodyTextClass}`}>
                          {asset?.name ?? "ไม่พบข้อมูลทรัพย์สิน"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {request.assetId}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        
                        {getReporterName(request.reporterId)}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`font-medium ${secondaryTextClass}`}>
                          {translateText(branch?.name ?? "ไม่ระบุสาขา")}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {branch?.code ?? request.branchId}
                        </p>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3.5 ${mutedTextClass}`}>
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
                          onClick={() => setManuallySelectedRequest(request)}
                          className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-[11px] font-medium transition focus:outline-none focus:ring-2 ${detailsButtonClass}`}
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
                      className={`px-4 py-12 text-center text-sm ${mutedTextClass}`}
                    >
                      
                      {translateText("ไม่พบรายการแจ้งซ่อมที่ตรงกับการค้นหา")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ปุ่มเปลี่ยนหน้า; จำนวนรายการต่อหน้าปรับได้ที่ pageSize */}
          <footer className={`flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row ${dividerClass}`}>
            <p className={`text-[11px] ${mutedTextClass}`}>
              
              {translateText("แสดง")}{" "}
              {filteredRequests.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}{" "}
              - {Math.min(currentPage * pageSize, filteredRequests.length)}  {translateText("จาก")}{" "}
              {filteredRequests.length}  {translateText("รายการ")}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={translateText("หน้าก่อนหน้า")}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className={`flex size-8 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-40 ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
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
                        ? isDark
                          ? "bg-indigo-500/20 text-indigo-200"
                          : "bg-indigo-50 text-indigo-700"
                        : isDark
                          ? "text-slate-400 hover:bg-slate-800"
                          : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label={translateText("หน้าถัดไป")}
                disabled={currentPage === pageCount}
                onClick={() =>
                  setCurrentPage((page) => Math.min(pageCount, page + 1))
                }
                className={`flex size-8 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-40 ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
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
            className={`max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-xl p-4 shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:p-5 ${isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="repair-dialog-title"
                  className={`text-lg font-semibold ${primaryTextClass}`}
                >
                  
                  {translateText("รายละเอียดคำร้องแจ้งซ่อม")}
                </h2>
                <p className={`mt-1 text-xs ${mutedTextClass}`}>
                  {selectedRequest.id}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                aria-label={translateText("ปิดหน้าต่าง")}
                className={`rounded-md px-2 py-1 text-xl leading-none transition ${isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
              >
                ×
              </button>
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className={`text-xs ${mutedTextClass}`}>{translateText("อุปกรณ์")}</dt>
                <dd className={`mt-1 font-medium ${bodyTextClass}`}>
                  {getAsset(selectedRequest.assetId)?.name} (
                  {selectedRequest.assetId})
                </dd>
              </div>
              <div>
                <dt className={`text-xs ${mutedTextClass}`}>{translateText("ผู้แจ้ง")}</dt>
                <dd className={`mt-1 font-medium ${bodyTextClass}`}>
                  
                  {getReporterName(selectedRequest.reporterId)}
                </dd>
              </div>
              <div>
                <dt className={`text-xs ${mutedTextClass}`}>{translateText("สาขา")}</dt>
                <dd className={`mt-1 font-medium ${bodyTextClass}`}>
                  {translateText(
                    getBranch(selectedRequest.branchId)?.name ?? "ไม่ระบุสาขา",
                  )}
                </dd>
              </div>
              <div>
                <dt className={`text-xs ${mutedTextClass}`}>{translateText("วันที่แจ้ง")}</dt>
                <dd className={`mt-1 font-medium ${bodyTextClass}`}>
                  {formatLocalizedDate(selectedRequest.reportedAt, language)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={`text-xs ${mutedTextClass}`}>{translateText("อาการที่แจ้ง")}</dt>
                <dd className={`mt-1 font-medium ${bodyTextClass}`}>
                  {selectedRequest.issue}
                </dd>
              </div>
              <div>
                <dt className={`text-xs ${mutedTextClass}`}>{translateText("สถานะ")}</dt>
                <dd className={`mt-1 font-medium ${bodyTextClass}`}>
                  {translateText(statusLabels[selectedRequest.status])}
                </dd>
              </div>
              <div>
                <dt className={`text-xs ${mutedTextClass}`}>{translateText("หมายเหตุ")}</dt>
                <dd className={`mt-1 font-medium ${bodyTextClass}`}>
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
          onClose={() => {
            setSaveError("");
            setIsCreateOpen(false);
          }}
          onSubmit={handleCreateRequest}
          error={saveError}
        />
      )}
    </div>
  );
}

export default function RepairsPage() {
  return (
    <Suspense fallback={null}>
      <RepairsPageContent />
    </Suspense>
  );
}
