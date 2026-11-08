"use client";

import { useEffect, useState } from "react";
import { Boxes, CircleCheck, Wrench } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { assets, type AssetStatus } from "@/data/asset";
import { assetHistories } from "@/data/assetHistories";
import { branches } from "@/data/branches";
import { borrowRequests } from "@/data/borrowRequests";
import { inventorySessions } from "@/data/inventorySessions";
import { repairRequests } from "@/data/repairRequests";

const statusDetails: Record<AssetStatus, { name: string; color: string }> = {
  available: { name: "พร้อมใช้งาน", color: "#198765" },
  borrowed: { name: "กำลังยืม", color: "#6366F1" },
  repair: { name: "กำลังซ่อม", color: "#B77912" },
  damaged: { name: "ชำรุด", color: "#E6535D" },
  disposed: { name: "จำหน่ายแล้ว", color: "#9CA3AF" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getActivityColor(action: string, newValue: string | null) {
  if (action === "transferred") return "text-indigo-600";
  if (action === "assigned") return "text-blue-600";
  if (action === "status_changed") {
    if (newValue === "available") return "text-emerald-600";
    if (newValue === "repair") return "text-amber-700";
    if (newValue === "damaged") return "text-red-600";
    if (newValue === "borrowed") return "text-indigo-600";
  }
  return "text-gray-600";
}

export default function Page() {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [branchResolved, setBranchResolved] = useState(false);

  useEffect(() => {
    const loadBranch = () => {
      const credentialString = localStorage.getItem("credential");
      if (!credentialString) {
        setBranchId(null);
        setBranchResolved(true);
        return;
      }

      try {
        const credential: unknown = JSON.parse(credentialString);
        if (!isRecord(credential)) {
          throw new Error("รูปแบบข้อมูลบัญชีไม่ถูกต้อง");
        }

        const value = credential.branch_id;
        setBranchId(
          typeof value === "string" && value.trim() ? value.trim() : null,
        );
      } catch (error) {
        console.error("อ่านข้อมูลสาขาจากบัญชีไม่สำเร็จ:", error);
        setBranchId(null);
      } finally {
        setBranchResolved(true);
      }
    };

    loadBranch();
    window.addEventListener("credentialchange", loadBranch);
    window.addEventListener("storage", loadBranch);
    return () => {
      window.removeEventListener("credentialchange", loadBranch);
      window.removeEventListener("storage", loadBranch);
    };
  }, []);

  const selectedBranch = branches.find((branch) => branch.id === branchId);
  const branchAssets = branchId
    ? assets.filter((asset) => asset.branchId === branchId)
    : assets;
  const hasScope = !branchId || Boolean(selectedBranch);
  const scopedAssets = hasScope ? branchAssets : [];
  const totalAssets = hasScope ? scopedAssets.length : null;
  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(
    todayDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;

  const pieData = (Object.keys(statusDetails) as AssetStatus[]).map(
    (status) => ({
      name: statusDetails[status].name,
      value: scopedAssets.filter((asset) => asset.status === status).length,
      color: statusDetails[status].color,
    }),
  );
  const availableAssets = scopedAssets.filter(
    (asset) => asset.status === "available",
  ).length;
  const damagedAssets =
    pieData.find((item) => item.name === "ชำรุด")?.value ?? 0;
  const repairAssets =
    pieData.find((item) => item.name === "กำลังซ่อม")?.value ?? 0;
  const maintenanceAssets = damagedAssets + repairAssets;

  const activeRepairs = repairRequests.filter(
    (request) =>
      (!branchId || request.branchId === branchId) &&
      (request.status === "pending" || request.status === "in_progress"),
  ).length;
  const activeBorrowRequests = borrowRequests.filter(
    (request) =>
      (!branchId || request.branchId === branchId) &&
      ["pending", "approved", "borrowed", "overdue"].includes(request.status),
  ).length;
  const nextInventory = inventorySessions
    .filter(
      (session) =>
        (!branchId || session.branchId === branchId) &&
        session.status === "planned" &&
        session.startDate >= today,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const nearestWarrantyAsset = scopedAssets
    .filter((asset) => asset.warrantyEndDate >= today)
    .sort((a, b) => a.warrantyEndDate.localeCompare(b.warrantyEndDate))[0];

  const scopedAssetIds = new Set(scopedAssets.map((asset) => asset.id));
  const recentActivities = assetHistories
    .filter((history) => {
      if (!branchId) return true;
      if (history.action === "transferred") {
        return history.oldValue === branchId || history.newValue === branchId;
      }
      return scopedAssetIds.has(history.assetId);
    })
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
    .slice(0, 6)
    .map((history) => {
      const asset = assets.find((item) => item.id === history.assetId);
      const activityBranchId =
        history.action === "transferred" && history.newValue
          ? history.newValue
          : asset?.branchId;

      return {
        ...history,
        assetName: asset?.name ?? "Error",
        branchName:
          branches.find((branch) => branch.id === activityBranchId)?.name ??
          "Error",
      };
    });

  const branchLabel = !branchResolved
    ? "กำลังโหลด..."
    : selectedBranch?.name ?? "Error";
  const scopeLabel =
    !branchResolved || branchId
      ? selectedBranch?.name ?? "Error"
      : "ข้อมูลรวมทุกสาขา";

  return (
    <div className="flex flex-col gap-8 px-6 py-8">
      <section className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-bold">สรุปสถานะทรัพย์สิน</h1>
          <p className="mt-1 text-sm text-gray-500">
            สาขาที่ผูกกับบัญชี:{" "}
            <span className="font-medium text-red-600">{branchLabel}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-white p-4">
            <div className="flex justify-between">
              <div className="text-lg text-gray-500">ทรัพย์สินทั้งหมด</div>
              <Boxes className="text-indigo-600" />
            </div>
            <div className="text-5xl font-bold">{totalAssets ?? "Error"}</div>
            <div className="text-sm text-gray-500">{scopeLabel}</div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-white p-4">
            <div className="flex justify-between">
              <div className="text-lg text-gray-500">พร้อมใช้งาน</div>
              <CircleCheck className="text-green-600" />
            </div>
            <div className="text-5xl font-bold">
              {hasScope ? availableAssets : "Error"}
            </div>
            <div className="text-sm text-green-600">
              พร้อมสำหรับการมอบหมาย
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-white p-4">
            <div className="flex justify-between">
              <div className="text-lg text-gray-500">
                ชำรุด/อยู่ระหว่างซ่อมบำรุง
              </div>
              <Wrench className="text-red-600" />
            </div>
            <div className="text-5xl font-bold">
              {hasScope ? maintenanceAssets : "Error"}
            </div>
            <div className="text-sm text-red-600">
              ชำรุด {hasScope ? damagedAssets : "Error"} | กำลังซ่อม{" "}
              {hasScope ? repairAssets : "Error"}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">งานที่ต้องดำเนินการ</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-300 bg-white p-4">
            <span className="font-semibold">รอบตรวจนับครั้งถัดไป</span>
            <span className="text-right text-sm text-red-600">
              {hasScope && nextInventory
                ? formatDate(nextInventory.startDate)
                : "Error"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-300 bg-white p-4">
            <span className="font-semibold">คำขอซ่อมที่ต้องติดตาม</span>
            <span className="text-sm text-red-600">
              {hasScope ? `${activeRepairs} รายการ` : "Error"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-300 bg-white p-4">
            <span className="font-semibold">คำขอยืมที่ยังไม่เสร็จ</span>
            <span className="text-sm text-red-600">
              {hasScope ? `${activeBorrowRequests} รายการ` : "Error"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-300 bg-white p-4">
            <span className="font-semibold">ทรัพย์สินใกล้หมดประกันที่สุด</span>
            <span className="text-right text-sm text-red-600">
              {hasScope && nearestWarrantyAsset ? (
                <>
                  {nearestWarrantyAsset.name}
                  <br />
                  หมดประกัน {formatDate(nearestWarrantyAsset.warrantyEndDate)}
                </>
              ) : (
                "Error"
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">ภาพรวมและรายการล่าสุด</h2>
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">สัดส่วนสถานะทรัพย์สิน</h3>
            <div className="mt-4 h-[196px] rounded-xl bg-gray-100 p-2">
              {hasScope ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={82}
                      innerRadius={61}
                      paddingAngle={1}
                    >
                      {pieData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <text
                      x="50%"
                      y="47%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-800 text-xl font-bold"
                    >
                      {totalAssets?.toLocaleString("en-US")}
                    </text>
                    <text
                      x="50%"
                      y="58%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-500 text-xs"
                    >
                      จำนวนทรัพย์สินทั้งหมด
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-red-600">
                  Error
                </div>
              )}
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {pieData.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-2 text-xs text-gray-500"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                  <span>{hasScope ? item.value.toLocaleString("en-US") : "Error"}</span>
                  <span>
                    {hasScope && totalAssets
                      ? `${((item.value / totalAssets) * 100).toFixed(1)}%`
                      : hasScope
                        ? "0.0%"
                        : "Error"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 xl:col-span-2">
            <h3 className="font-semibold">รายการล่าสุด</h3>
            <p className="mt-1 text-xs text-gray-500">
              กิจกรรมล่าสุดของ {scopeLabel}
            </p>
            <ul className="mt-2 divide-y divide-gray-200">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <li key={activity.id} className="py-4">
                    <div className="font-semibold text-gray-800">
                      {activity.assetName}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {activity.assetId} · {activity.branchName}
                    </div>
                    <div
                      className={`mt-1 text-sm ${getActivityColor(
                        activity.action,
                        activity.newValue,
                      )}`}
                    >
                      {activity.description} ·{" "}
                      {formatDateTime(activity.performedAt)}
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-sm text-red-600">Error · ไม่พบประวัติ</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
