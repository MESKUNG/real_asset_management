"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DetailModal,
  ReasonModal,
  STATUS,
  assetName,
  branchName,
  displayStatus,
  fmtDate,
  inputClass,
  saveRequests,
  useRequests,
  type Request,
} from "@/components/borrow/borrowShared";
import { publishUserActionNotification } from "@/lib/userActionNotifications";
import { useLanguage, useTranslate } from "@/lib/language";

export default function Page() {
  const translateText = useTranslate();
  const language = useLanguage();
  const requests = useRequests();
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const detail = requests.find((r) => r.id === detailId) ?? null;

  const transfers = useMemo(
    () => requests.filter((r) => r.type === "transfer"),
    [requests],
  );
  const countOf = (st: string) =>
    transfers.filter((r) => displayStatus(r) === st).length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transfers
      .filter((r) => displayStatus(r) === "pending")
      .filter(
        (r) =>
          !q ||
          r.id.toLowerCase().includes(q) ||
          assetName(r.assetId).toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q),
      )
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [transfers, query]);

  function update(id: string, patch: Partial<Request>): boolean {
    const decidedAt = new Date().toISOString();
    const request = requests.find((item) => item.id === id);
    if (!request) return false;
    const updatedRequest = { ...request, decidedAt, ...patch };
    const nextRequests = requests.map((item) =>
      item.id === id ? updatedRequest : item,
    );
    if (!saveRequests(nextRequests)) {
      window.alert("บันทึกการดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง");
      return false;
    }

    try {
      publishUserActionNotification({
        key: `borrow:${updatedRequest.id}`,
        recipientId: updatedRequest.borrowerId,
        category: "transfer",
        title: STATUS[displayStatus(updatedRequest)].label,
        assetName: assetName(updatedRequest.assetId),
        branchId: updatedRequest.branchId,
        issue: updatedRequest.note?.trim() ?? "",
        reference: updatedRequest.id,
        href: `/Borrow?requestId=${encodeURIComponent(updatedRequest.id)}`,
      });
    } catch (error) {
      console.error("แจ้งผู้ยื่นคำขอโอนย้ายไม่สำเร็จ:", error);
      window.alert("บันทึกคำขอแล้ว แต่ส่งการแจ้งเตือนไม่สำเร็จ");
    }
    return true;
  }

  function confirmReject(reason: string) {
    if (rejectId && update(rejectId, { status: "rejected", note: reason })) {
      setRejectId(null);
    }
  }

  const stat = (label: string, value: number) => (
    <div className="rounded-xl border border-slate-300 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{translateText(label)}</div>
      <div className="mt-1 text-3xl font-bold text-blue-950">{value}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 p-6 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">{translateText("อนุมัติโยกย้าย")}</h1>
          <p className="text-sm text-slate-700">

            {translateText("คำขอโอนย้ายทรัพย์สินระหว่างสาขาที่รอการอนุมัติ")}
          </p>
        </div>
        <Link
          href="/transfer_history"
          className="rounded-lg border border-slate-400 px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-indigo-100"
        >

          {translateText("ดูประวัติการโอนย้าย")}
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {stat("รออนุมัติ", countOf("pending"))}
        {stat("อนุมัติแล้ว", countOf("approved"))}
        {stat("ไม่อนุมัติ", countOf("rejected"))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหารหัสคำขอ ชื่อทรัพย์สิน หรือเหตุผล"
        className={`w-full sm:w-96 ${inputClass}`}
      />

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="w-full min-w-[960px] text-left text-sm text-slate-900">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 font-bold">{translateText("รหัส")}</th>
              <th className="p-3 font-bold">{translateText("ทรัพย์สิน")}</th>
              <th className="p-3 font-bold">{translateText("โอนย้ายจาก → ไปยัง")}</th>
              <th className="p-3 font-bold">{translateText("ผู้ขอ")}</th>
              <th className="p-3 font-bold">{translateText("วันที่ต้องการโอนย้าย")}</th>
              <th className="p-3 font-bold">{translateText("เหตุผล")}</th>
              <th className="p-3 font-bold">{translateText("ดำเนินการ")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-700">

                  {translateText("ไม่มีคำขอโอนย้ายที่รออนุมัติ")}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.id}
                tabIndex={0}
                onClick={() => setDetailId(r.id)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && e.key === "Enter") {
                    setDetailId(r.id);
                  }
                }}
                title="คลิกเพื่อดูรายละเอียด"
                className="cursor-pointer border-t border-slate-200 align-top hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
              >
                <td className="p-3 font-semibold text-blue-950">{r.id}</td>
                <td className="p-3">
                  <div className="font-semibold">{assetName(r.assetId)}</div>
                  <div className="text-xs text-slate-700">{r.assetId}</div>
                </td>
                <td className="p-3 font-medium">
                  {branchName(r.branchId)} → {branchName(r.toBranchId)}
                </td>
                <td className="p-3">{translateText("พนักงาน #")}{r.borrowerId}</td>
                <td className="p-3">{fmtDate(r.borrowDate, language)}</td>
                <td className="max-w-64 p-3 text-slate-800">{r.purpose}</td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => update(r.id, { status: "approved" })}
                      className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white"
                    >

                      {translateText("อนุมัติ")}
                    </button>
                    <button
                      onClick={() => setRejectId(r.id)}
                      className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-bold text-white"
                    >

                      {translateText("ไม่อนุมัติ")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && <DetailModal request={detail} onClose={() => setDetailId(null)} />}

      {rejectId && (
        <ReasonModal
          title="ไม่อนุมัติการโอนย้าย"
          description="ระบุเหตุผลที่ไม่อนุมัติ ผู้ขอจะเห็นเหตุผลนี้ในหมายเหตุของคำขอ"
          placeholder="เช่น ทรัพย์สินยังจำเป็นต้องใช้งานในสาขาเดิม"
          confirmLabel={translateText("ไม่อนุมัติ")}
          confirmClassName="bg-red-700"
          onConfirm={confirmReject}
          onClose={() => setRejectId(null)}
        />
      )}
    </div>
  );
}
