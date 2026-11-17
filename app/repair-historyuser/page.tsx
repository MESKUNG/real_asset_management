"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Search1 } from "@tailgrids/icons";

type RepairHistoryItem = {
  id: string;
  completedAt: string;
  assetId: string;
  assetName: string;
  branchName: string;
  branchCode: string;
  issue: string;
  solution: string;
  status: "completed";
};

const demoRepairHistory: RepairHistoryItem[] = [
  {
    id: "REP-0001",
    completedAt: "18 ต.ค. 2568",
    assetId: "AST-0001",
    assetName: "MacBook Pro 14”",
    branchName: "สำนักงานใหญ่",
    branchCode: "BKK",
    issue: "เปิดไม่ติดและมีเสียงดังผิดปกติ",
    solution: "ทำความสะอาดลูกยางและทดสอบการพิมพ์แล้ว",
    status: "completed",
  },
  {
    id: "REP-0002",
    completedAt: "10 ต.ค. 2568",
    assetId: "AST-0002",
    assetName: "Dell Latitude 5440",
    branchName: "สำนักงานใหญ่",
    branchCode: "BKK",
    issue: "เครื่องเปิดไม่ติดและแบตเตอรี่เสื่อม",
    solution: "เปลี่ยนแบตเตอรี่และทดสอบการใช้งานแล้ว",
    status: "completed",
  },
  {
    id: "REP-0003",
    completedAt: "05 ต.ค. 2568",
    assetId: "AST-0006",
    assetName: "Lenovo ThinkPad E14",
    branchName: "สำนักงานใหญ่",
    branchCode: "BKK",
    issue: "ภาพบนหน้าจอกะพริบ",
    solution: "ตรวจสอบสายสัญญาณและทดสอบการแสดงผลแล้ว",
    status: "completed",
  },
];

const pageSize = 5;

export default function RepairHistoryPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<RepairHistoryItem | null>(null);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th");

    return demoRepairHistory.filter((request) =>
      [
        request.id,
        request.assetId,
        request.assetName,
        request.branchName,
      ].some((value) => value.toLocaleLowerCase("th").includes(query)),
    );
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f8] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            ประวัติซ่อม
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            ประวัติการซ่อมครุภัณฑ์ที่เสร็จสิ้นแล้วของสำนักงานใหญ่
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <Search1 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ค้นหารหัสหรือชื่อ Asset"
                aria-label="ค้นหาประวัติซ่อม"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <p className="text-xs text-slate-400">
              {filteredRequests.length} รายการ · แสดงประวัติซ่อมของ Asset ทั้งหมด
            </p>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {visibleRequests.map((request) => (
              <article key={request.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">
                      {request.id}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      เสร็จสิ้น {request.completedAt}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                    เสร็จสิ้น
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-slate-800">
                    {request.assetName}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {request.assetId}
                  </p>
                </div>
                <p className="break-words text-xs text-slate-500">
                  {request.branchCode} · {request.branchName}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(request)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  ดูรายละเอียด
                </button>
              </article>
            ))}
            {visibleRequests.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                ไม่พบประวัติซ่อมที่ตรงกับการค้นหา
              </p>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead className="bg-slate-50 text-[11px] font-medium text-slate-500">
                <tr>
                  <th className="px-4 py-3">วันที่เสร็จสิ้น</th>
                  <th className="px-4 py-3">ชื่อ Asset</th>
                  <th className="px-4 py-3">สาขา</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRequests.map((request) => {
                  return (
                    <tr
                      key={request.id}
                      className="text-xs text-slate-700 transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-800">
                        {request.completedAt}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">
                          {request.assetName}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {request.assetId}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {request.branchCode} · {request.branchName}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                          เสร็จสิ้น
                        </span>
                      </td>
                      <td className="px-4 py-4">
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
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      ไม่พบประวัติซ่อมที่ตรงกับการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-3 sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="repair-history-dialog-title"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:p-5"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="repair-history-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  รายละเอียดการซ่อม
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedRequest.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                aria-label="ปิดหน้าต่าง"
                className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Asset</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {selectedRequest.assetName} ({selectedRequest.assetId})
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">สาขา</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {selectedRequest.branchName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">วันที่เสร็จสิ้น</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {selectedRequest.completedAt}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">สถานะ</dt>
                <dd className="mt-1 font-medium text-emerald-700">
                  เสร็จสิ้น
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">อาการที่แจ้ง</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {selectedRequest.issue}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">วิธีแก้ไข</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {selectedRequest.solution || "-"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
