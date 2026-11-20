"use client";
import { useLanguage, useTranslate } from "@/lib/language";

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////////////////////////รวม library จ้า ///////////////////////////////
import { useEffect, useState } from "react";
import { Boxes, CircleCheck, Wrench } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { assets, type AssetStatus } from "@/data/asset";
import { assetHistories } from "@/data/assetHistories";
import { branches } from "@/data/branches";
import { borrowRequests } from "@/data/borrowRequests";
import { inventorySessions } from "@/data/inventorySessions";
import { repairRequests } from "@/data/repairRequests";

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

const statusDetails: Record<AssetStatus, { name: string; color: string }> = {       //สร้าง Object สำหรับเก็บรายละเอียดของสถานะทรัพย์สินแต่ละประเภท
  available: { name: "พร้อมใช้งาน", color: "#198765" },
  borrowed: { name: "กำลังยืม", color: "#6366F1" },
  repair: { name: "กำลังซ่อม", color: "#B77912" },
  damaged: { name: "ชำรุด", color: "#E6535D" },
  disposed: { name: "จำหน่ายแล้ว", color: "#64748B" },
};

function isRecord(value: unknown): value is Record<string, unknown> {       //ตรวจสอบว่าค่าที่รับเข้ามาเป็น Object หรือไม่ มีคีย์เป็น String และ Value เป้น อะไรก็ได้
  return typeof value === "object" && value !== null && !Array.isArray(value);     //ตรวจสอบว่าเป็น object และไม่ใช่ null และไม่ใช่ Array
}

function formatDate(value: string, language: "th" | "en") {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "th-TH", {
    day: "numeric",
    month: "short",       //เป็นตัวย่อ ม.ค.
    year: "numeric",
  }).format(new Date(value));      //แปลง String ให้เป็น Date Object
}

function formatDateTime(value: string, language: "th" | "en") {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getActivityColor(action: string, newValue: string | null) {          //กําหนดสีตามความเปลี่ยนแปลงของทรัพย์สิน
    if (action === "disposed" || newValue === "disposed") return "text-slate-600";
    if (action === "transferred") return "text-indigo-600";           //หากกิจกรรมเป็นการย้ายทรัพย์สิน จะคืนค่า Class ของ Tailwind CSS เป็นสี Indigo
    if (action === "assigned") return "text-blue-600";               //หากกิจกรรมเป็นการมอบหมายทรัพย์สิน จะคืนค่าเป็นสีน้ำเงิน

    if (action === "status_changed") {              //หากกิจกรรมเป็นการเปลี่ยนสถานะ จะตรวจสอบสถานะใหม่ต่อไป
    if (newValue === "available") return "text-emerald-600";
    if (newValue === "repair") return "text-amber-700";
    if (newValue === "damaged") return "text-red-600";
    if (newValue === "borrowed") return "text-indigo-600";
  }
  return "text-gray-600";            //หากไม่ตรงกับเงื่อนไขใดเลย จะใช้สีเทาเป็นค่าเริ่มต้น
}

/////////////////////////////////////////////////////////
//////////////////////////////////////////////////////
///////////////////////////////////////////////////////





export default function Page() {
  const language = useLanguage();
  const translateText = useTranslate();
  const [branchId, setBranchId] = useState<string | null>(null);        //ใช้เก็บรหัสสาขาของผู้ใช้งานที่เข้าสู่ระบบ ค่าเริม่ต้นเป้น null
  const [branchResolved, setBranchResolved] = useState(false);          //ใช้ตรวจสอบว่าระบบอ่านข้อมูลสาขาของผู้ใช้งานเสร็จแล้วหรือยัง

  useEffect(() => {            //สำหรับอ่านข้อมูลสาขาจาก localStorage
    const loadBranch = () => {                   //รวบรวมคำสั่งทั้งหมดที่เกี่ยวข้องกับการอ่านข้อมูลสาขาไว้ด้วยกัน
      const credentialString = localStorage.getItem("credential");       //อ่านข้อมูลจาก localStorage
      if (!credentialString) {              //ถ้าไม่มีข้อมูล
        setBranchId(null);            //branchId เป็น null
        setBranchResolved(true);         ///อ่านข้อมูลเสร็จสิ้น
        return;
      }

      try {                           //ลองแปลงข้อมูลจาก JSON เป็น JavaScript Object
        const credential: unknown = JSON.parse(credentialString);      // : unknown เพราะไม่รู้ว่าโครงสร้างที่มาจาก localstorage ถูกหรือยัง      แปลงเป็น object
        if (!isRecord(credential)) {                          //ถ้าไม่ใช่ Object ให้ return null แล้วไปทำ catch
          throw new Error("รูปแบบข้อมูลบัญชีไม่ถูกต้อง");
        }

        const value = credential.branch_id;       //กรณีที่เป็น Object ให้ดึงค่าของ branch_id
        setBranchId(
          typeof value === "string" && value.trim() ? value.trim() : null,           //เช็คว่าเป็น string และไม่ใช่ค่าว่าง ถ้าใช่ให้ trim แล้วนําไปใช้ ถ้าไม่ใช่ให้เป็น null
        );
      } catch (error) {              //ดักจับ Error ที่เกิดขึ้นภายใน try
        console.error("อ่านข้อมูลสาขาจากบัญชีไม่สำเร็จ:", error);
        setBranchId(null);
      } finally {                 //จบแล้ว อ่านข้อมูลเสร้จสิ้น
        setBranchResolved(true);
      }
    };

    loadBranch();    //เรียกฟังชั่นข้างบนนี่แหละ
    window.addEventListener("credentialchange", loadBranch);     //เพิ่ม Event Listener ให้กับ Browser เพื่อรอฟัง Event ที่ชื่อ "credentialchange"  เมื่อมีการส่ง Event ชื่อนี้ ก็จะเรียก Function loadBranch() อีกครั้ง
    window.addEventListener("storage", loadBranch);         //การตรวจจับ Event มาตรฐานของ Browser ที่ชื่อ "storage" Event นี้จะเกิดขึ้นเมื่อข้อมูลใน Web Storage ถูกเปลี่ยนแปลงจากหน้าเว็บหรือแท็บอื่นที่อยู่ใน Origin เดียวกัน
    return () => {                       //Cleanup Function ลบ Event Listener ที่เคยเพิ่มไว้เมื่อ Component ถูกถอดออกจากหน้าเว็บ หรือเมื่อ Effect ถูกทำความสะอาดก่อนทำงานใหม่ กัน memoryleak
      window.removeEventListener("credentialchange", loadBranch);
      window.removeEventListener("storage", loadBranch);
    };
  }, []);     //dependenc array ทำตอนโหลดหน้าครั้งแรก


  //หลังจากได้รับข้อมูลสาขาแล้ว จะโหลดข้อมูลทั้งหมดจาก API

  const selectedBranch = branches.find((branch) => branch.id === branchId);      //ค้นหาข้อมูลสาขาที่ตรงกับรหัสสาขาของผู้ใช้งาน โดย หาจาก branches โดยใช้ .find และเปรียบเทียบกับรหัสสาขาของผู้ใช้งาน
  const branchAssets = branchId         //กรองข้อมูลทรัพย์สินตามสาขาที่ผู้ใช้งานสังกัด
    ? assets.filter((asset) => asset.branchId === branchId)           //ถ้ามี branchId ตรงกัน จะกรองทรัพย์สินเฉพาะสาขานั้น
    : assets;                                                 //ถ้าไม่มีเอาหมด
  const hasScope = branchResolved && Boolean(branchId && selectedBranch);
  const scopedAssets = hasScope ? branchAssets : [];                      //หากรหัสสาขาไม่ถูกต้อง ไม่ควรนำข้อมูลทรัพย์สินของสาขาอื่นมาแสดงโดยไม่ตั้งใจให้ scopedAssets = []
  const totalAssets = hasScope ? scopedAssets.length : null;    //ใช้คำนวณจำนวนทรัพย์สินทั้งหมด
  const todayDate = new Date();                //จะสร้าง Date Object โดยอ้างอิงวันที่และเวลาปัจจุบันของเครื่อง
  const today = `${todayDate.getFullYear()}-${String(          //เก็บค่า today โดย getFullYear เก็บคศ  getMonth เก็บเดือน(+1 เพราะ index เริ่ม 0)
    todayDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;     //padStartใช้เติมตัวอักษรด้านหน้าจนกว่าจะมีความยาวครบ 2 ตัวอักษร โดยการเติม "0"

  const pieData = (Object.keys(statusDetails) as AssetStatus[]).map(  //ดึงชื่อ Key ทั้งหมดจาก Object ออกมาเป็น Array จาก Object statusDetails
    (status) => ({                               //นำมาสร้าง array method เป็น obj ใหม่ที่ประกอบด้วย name value color
      name: translateText(statusDetails[status].name),
      value: scopedAssets.filter((asset) => asset.status === status).length,     //กรองทรัพย์สิน ที่มีสถานะตรงกับเงื่อนไข จากนั้นนับจำนวนผ่าน .length
      color: statusDetails[status].color,    //ดึงสีประจำสถานะ จาก status detail
    }),
  );
  const availableAssets = scopedAssets.filter(   //เอา scopeAsset จากข้างบน มาfilter นับจำนวนทรัพย์สินที่มีสถานะ avaliable
    (asset) => asset.status === "available",
  ).length;
  const damagedAssets = scopedAssets.filter((asset) => asset.status === "damaged").length;
  const repairAssets = scopedAssets.filter((asset) => asset.status === "repair").length;
  const maintenanceAssets = damagedAssets + repairAssets;        //รวมจำนวนทรัพย์สินที่ชำรุด กำลังซ่อม เป็น ซ่อมหรือชำรุด เพื่อเอาไปใส่ card ด้านบน

  const activeRepairs = repairRequests.filter(      //เอา Data repairRequest มา filter
    (request) =>
      (!branchId || request.branchId === branchId) &&       //หากผู้ใช้ไม่มีม brancheID ก็แสดงทุกสาขา แต่ถ้ามี ต้อง request.branchId เหมือนกับ branch.Id
      (request.status === "pending" || request.status === "in_progress"),       //สถานะจะเป็น กำลังซ่อม หรือ รอดำเนินการก็ได้
  ).length;                                                   //แล้วนับจำนวน

  const activeBorrowRequests = borrowRequests.filter(              //นับจำนวนคำขอยืมทุกอย่างที่อยู่ในกระบวนการ
    (request) =>
      (!branchId || request.branchId === branchId) &&             //หากผู้ใช้ไม่มีม brancheID ก็แสดงทุกสาขา แต่ถ้ามี ต้อง request.branchId เหมือนกับ branch.Id
      ["pending", "revision", "approved", "overdue"].includes(request.status),             //นับคำขอที่ยังต้องดำเนินการ รวมรายการที่ส่งกลับให้แก้ไข
  ).length;

  const nextInventory = inventorySessions      //ค้นหารอบตรวจนับครั้งถัดไปจาก invertorysession
    .filter(
      (session) =>
        (!branchId || session.branchId === branchId) &&           //หากผู้ใช้ไม่มีม brancheID ก็แสดงทุกสาขา แต่ถ้ามี ต้อง request.branchId เหมือนกับ branch.Id
        session.status === "planned" &&               ////เลือกแค่ status planned
        session.startDate >= today,          //เลือกวันที่ใกล้ที่สุด
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];   //เรียงวันที่จากน้อยไปมาก และ localeCompare(เปรียบเทียบ String แล้วคืนค่าเป็นเลข) ค่าติดลบ = a มาก่อน b   ค่า 0 = ทั้งสองค่าเท่ากัน    ค่าบวก = a มาหลัง b      [0] คือเลือกรายการแรก
  const nearestWarrantyAsset = scopedAssets     //ค้นหาทรัพย์สินที่ใกล้หมดประกัน
    .filter((asset) => asset.warrantyEndDate >= today)     //กรอง Asset ที่ warrantyenddate ใกล้ today มากที่สุด
    .sort((a, b) => a.warrantyEndDate.localeCompare(b.warrantyEndDate))[0];     //เรียงลำดับวันหมดประกัน จากใกล้สุดไปไกลสุด      แต่เอาตัวแรก [0]

  const scopedAssetIds = new Set(scopedAssets.map((asset) => asset.id));                //สร้าง Set ที่เก็บ ID ของ Asset ที่จะแสดง    map เฉพาะ asset id

   //ดึงประวัติการเปลี่ยนแปลงทรัพย์สินล่าสุด
  const recentActivities = assetHistories
    .filter((history) => {              //กรองข้อมูลจากdata assethistories
      if (!branchId) return false;
      if (history.action === "transferred") {       //ถ้า action เป้นย้าย
        return history.oldValue === branchId || history.newValue === branchId;      //ไม่ว่าจะอยู่สาขาหน เช่น ย้ายจาก BROO1 ไป BR002 ทั้งสองสาขาก็ต้องเห้นด้วย
      }
      return scopedAssetIds.has(history.assetId);    //หากไม่ใช่ transfer จะตรวจสอบ ID ของ asset นั้น มีอยู่ใน scopedasset1Id ไหม  โดยใช้ .has หากเจอก็เก็บ เป้น true ไว้ใช้ต่อ
    })
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt))        //เรียงประวัติจากใหม่ไปเก่า   เลยเป้น b ก่อน a
    .slice(0, 6)       //เลือกเพียง 6 รายการจากทั้งหมด
    .map((history) => {            //หลังจากเรียงแล้ว นำประวัติแต่ละรายการมาแปลงเป้น obj
      const asset = assets.find((item) => item.id === history.assetId);    //หา asset จาก data asset และต้องตรงกับ assetId ใน history
      const activityBranchName =
        history.action === "transferred"
          ? `${branches.find((branch) => branch.id === history.oldValue)?.name ?? history.oldValue ?? "ไม่ระบุสาขา"} → ${branches.find((branch) => branch.id === history.newValue)?.name ?? history.newValue ?? "ไม่ระบุสาขา"}`
          : branches.find((branch) => branch.id === asset?.branchId)?.name ??
            "Error";

      return {
        ...history,         //แตก history ออกเป็น obj ใหม่
        assetName: asset?.name ?? "Error",     //นำชื่ิอทรัพสินจาก assetname หากไม่มี ใช้ error
        branchName: activityBranchName,
      };
    });

  const scopeUnavailableLabel = !branchResolved
    ? "กำลังโหลด..."
    : branchId
      ? "ไม่พบสาขาที่ผูกกับบัญชี"
      : "กรุณาเข้าสู่ระบบเพื่อดูข้อมูล";
  const branchLabel = selectedBranch?.name ?? scopeUnavailableLabel;
  const scopeLabel = selectedBranch?.name ?? scopeUnavailableLabel;

  return (
    <div className="flex flex-col gap-6 px-3 py-5 sm:gap-8 sm:px-6 sm:py-8">
      <section className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-bold">{translateText("สรุปสถานะทรัพย์สิน")}</h1>
          <p className="mt-1 text-sm text-gray-500">

            {translateText("สาขาที่ผูกกับบัญชี:")}{" "}
            <span className="font-medium text-red-600">{branchLabel}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-white p-4">
            <div className="flex justify-between">
              <div className="text-base text-gray-500 sm:text-lg">{translateText("ทรัพย์สินทั้งหมด")}</div>
              <Boxes className="text-indigo-600" />
            </div>
            <div className="text-3xl font-bold sm:text-5xl">{totalAssets ?? "—"}</div>
            <div className="text-sm text-gray-500">{scopeLabel}</div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-white p-4">
            <div className="flex justify-between">
              <div className="text-base text-gray-500 sm:text-lg">{translateText("พร้อมใช้งาน")}</div>
              <CircleCheck className="text-green-600" />
            </div>
            <div className="text-3xl font-bold sm:text-5xl">
              {hasScope ? availableAssets : "—"}
            </div>
            <div className="text-sm text-green-600">

              {translateText("พร้อมสำหรับการมอบหมาย")}
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-white p-4">
            <div className="flex justify-between">
              <div className="text-base text-gray-500 sm:text-lg">

                {translateText("ชำรุด/อยู่ระหว่างซ่อมบำรุง")}
              </div>
              <Wrench className="text-red-600" />
            </div>
            <div className="text-3xl font-bold sm:text-5xl">
              {hasScope ? maintenanceAssets : "—"}
            </div>
            <div className="text-sm text-red-600">

              {translateText("ชำรุด")} {hasScope ? damagedAssets : "—"}  {translateText("| กำลังซ่อม")}{" "}
              {hasScope ? repairAssets : "—"}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{translateText("งานที่ต้องดำเนินการ")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-300 bg-white p-4 sm:items-center sm:gap-4">
            <span className="font-semibold">{translateText("รอบตรวจนับครั้งถัดไป")}</span>
            <span className="text-right text-sm text-red-600">
              {hasScope
                ? nextInventory
                  ? formatDate(nextInventory.startDate, language)
                  : "ไม่มีรอบตรวจนับที่กำหนด"
                : scopeUnavailableLabel}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-300 bg-white p-4 sm:items-center sm:gap-4">
            <span className="font-semibold">{translateText("คำขอซ่อมที่ต้องติดตาม")}</span>
            <span className="text-sm text-red-600">
              {hasScope ? `${activeRepairs} รายการ` : "—"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-300 bg-white p-4 sm:items-center sm:gap-4">
            <span className="font-semibold">{translateText("คำขอยืมที่ยังไม่เสร็จ")}</span>
            <span className="text-sm text-red-600">
              {hasScope ? `${activeBorrowRequests} รายการ` : "—"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-300 bg-white p-4 sm:items-center sm:gap-4">
            <span className="font-semibold">{translateText("ทรัพย์สินใกล้หมดประกันที่สุด")}</span>
            <span className="text-right text-sm text-red-600">
              {hasScope && nearestWarrantyAsset ? (
                <>
                  {nearestWarrantyAsset.name}
                  <br />

                  {translateText("หมดประกัน")} {formatDate(nearestWarrantyAsset.warrantyEndDate, language)}
                </>
              ) : hasScope ? (
                "ไม่มีข้อมูลวันหมดประกัน"
              ) : (
                "—"
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{translateText("ภาพรวมและรายการล่าสุด")}</h2>
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">{translateText("สัดส่วนสถานะทรัพย์สิน")}</h3>
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

                      {translateText("จำนวนทรัพย์สินทั้งหมด")}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  {scopeUnavailableLabel}
                </div>
              )}
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {pieData.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-wrap items-center gap-2 text-xs text-gray-500"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{translateText(item.name)}</span>
                  <span>{hasScope ? item.value.toLocaleString("en-US") : "—"}</span>
                  <span>
                    {hasScope && totalAssets
                      ? `${((item.value / totalAssets) * 100).toFixed(1)}%`
                      : hasScope
                        ? "0.0%"
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 xl:col-span-2">
            <h3 className="font-semibold">{translateText("รายการล่าสุด")}</h3>
            <p className="mt-1 text-xs text-gray-500">

              {translateText("กิจกรรมล่าสุดของ")} {scopeLabel}
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
                      {formatDateTime(activity.performedAt, language)}
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-sm text-gray-500">
                  {hasScope ? "ไม่มีประวัติกิจกรรมล่าสุด" : scopeUnavailableLabel}
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
