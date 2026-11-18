"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { branches, type Branch } from "@/data/branches";
import {
  getManagedBranches,
  subscribeManagedBranches,
} from "@/lib/branchStorage";
import {
  getMergedAssets,
  getServerAssets,
  subscribeAssets,
} from "@/lib/assetStorage";
import { useTranslate } from "@/lib/language";
import styles from "../branchsManagement/branchManagement.module.css";

type PageAccess = "loading" | "unauthorized" | "admin" | "user";
const pageSize = 4;

function subscribeToCredentialChanges(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("credentialchange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("credentialchange", onChange);
  };
}

function getServerAccessSnapshot(): PageAccess {
  return "loading";
}

function getAccessSnapshot(): PageAccess {
  const credentialString = localStorage.getItem("credential");
  if (!credentialString) return "unauthorized";

  try {
    const credential: unknown = JSON.parse(credentialString);
    if (typeof credential !== "object" || credential === null) {
      return "unauthorized";
    }

    const role = "role" in credential ? credential.role : null;
    return role === "admin" || role === "user" ? role : "unauthorized";
  } catch (error) {
    console.error("Invalid credential:", error);
    return "unauthorized";
  }
}

export default function BranchesReadOnlyPage() {
  const translateText = useTranslate();
  const access = useSyncExternalStore(
    subscribeToCredentialChanges,
    getAccessSnapshot,
    getServerAccessSnapshot,
  );
  const assets = useSyncExternalStore(
    subscribeAssets,
    getMergedAssets,
    getServerAssets,
  );
  const [managedBranches, setManagedBranches] = useState<Branch[]>(branches);
  const [storageError, setStorageError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (access === "loading" || access === "unauthorized") return;

    const loadBranches = () => {
      try {
        setManagedBranches(getManagedBranches());
        setStorageError("");
      } catch (error) {
        console.error("Could not load managed branches:", error);
        setStorageError(
          error instanceof Error ? error.message : "โหลดข้อมูลสาขาไม่สำเร็จ",
        );
      }
    };

    loadBranches();
    return subscribeManagedBranches(loadBranches);
  }, [access]);

  const filteredBranches = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase();
    if (!query) return managedBranches;
    return managedBranches.filter((branch) =>
      [branch.code, branch.name, branch.address, branch.province ?? ""].some(
        (value) => value.toLocaleLowerCase().includes(query),
      ),
    );
  }, [managedBranches, searchText]);

  const pageCount = Math.max(1, Math.ceil(filteredBranches.length / pageSize));
  const visiblePage = Math.min(currentPage, pageCount);
  const visibleBranches = filteredBranches.slice(
    (visiblePage - 1) * pageSize,
    visiblePage * pageSize,
  );
  const activeCount = managedBranches.filter(
    (branch) => branch.status === "active",
  ).length;

  const getAssetCount = (branchId: string) =>
    assets.filter((asset) => asset.branchId === branchId).length;

  if (access === "loading") {
    return (
      <main
        className={`${styles.page} min-h-screen bg-[#f3f4f8] p-6 text-slate-600`}
      >
        {translateText("กำลังตรวจสอบสิทธิ์...")}
      </main>
    );
  }

  if (access === "unauthorized") {
    return (
      <main
        className={`${styles.page} grid min-h-screen place-items-center bg-[#f3f4f8] p-6`}
      >
        <section
          className={`${styles.surface} max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm`}
        >
          <Building2
            className="mx-auto size-10 text-violet-600"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-xl font-bold text-slate-800">
            {translateText("ไม่มีสิทธิ์เข้าถึงหน้านี้")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {translateText("หน้านี้สำหรับ Admin และ User เท่านั้น")}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`${styles.page} min-h-screen bg-[#f3f4f8] p-4 sm:p-8`}
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-7">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            {translateText("สาขาทั้งหมด")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {translateText("ดูข้อมูลสาขาและสถานที่ตั้งขององค์กร")}
          </p>
        </header>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:max-w-xl">
            <Search
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={translateText("ค้นหารหัส หรือชื่อสาขา")}
              aria-label={translateText("ค้นหารหัส หรือชื่อสาขา")}
              className={`${styles.input} h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
            />
          </label>
          <p className="text-sm text-slate-500">
            {translateText("{count} สาขา").replace(
              "{count}",
              String(managedBranches.length),
            )}{" "}
            ·{" "}
            {translateText("{count} สาขาเปิดใช้งาน").replace(
              "{count}",
              String(activeCount),
            )}
          </p>
        </div>

        {storageError && (
          <p
            className={`${styles.errorSurface} mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700`}
            role="alert"
          >
            {translateText(storageError)}
          </p>
        )}

        <div
          className={`${styles.surface} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead
                className={`${styles.tableHead} bg-[#f5f6fa] text-xs font-medium text-slate-500`}
              >
                <tr>
                  <th scope="col" className="px-5 py-4">
                    {translateText("รหัส / ชื่อสาขา")}
                  </th>
                  <th scope="col" className="px-5 py-4">
                    {translateText("ที่อยู่")}
                  </th>
                  <th scope="col" className="px-5 py-4">
                    {translateText("Asset")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {visibleBranches.map((branch) => (
                  <tr
                    key={branch.id}
                    className={`${styles.tableRow} transition hover:bg-slate-50/70`}
                  >
                    <td className="px-5 py-5">
                      <div
                        className={`${styles.primaryText} flex flex-wrap items-center gap-2 font-semibold text-slate-800`}
                      >
                        <span>
                          {branch.code} · {branch.name}
                        </span>
                        <span
                          className={`${
                            branch.status === "active"
                              ? styles.activeBadge
                              : styles.inactiveBadge
                          } rounded-full px-2 py-0.5 text-xs font-medium ${
                            branch.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {translateText(
                            branch.status === "active"
                              ? "เปิดใช้งาน"
                              : "ปิดใช้งาน",
                          )}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`${styles.mutedText} px-5 py-5 text-slate-500`}
                    >
                      {[branch.address, branch.province]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td
                      className={`${styles.mutedText} px-5 py-5 text-slate-500`}
                    >
                      {translateText("{count} Asset").replace(
                        "{count}",
                        String(getAssetCount(branch.id)),
                      )}
                    </td>
                  </tr>
                ))}
                {visibleBranches.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      {translateText("ไม่พบสาขาที่ค้นหา")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer
          className={`${styles.mutedText} mt-6 flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between`}
        >
          <p>
            {translateText("แสดง {from}–{to} จาก {total} สาขา")
              .replace(
                "{from}",
                String(
                  filteredBranches.length === 0
                    ? 0
                    : (visiblePage - 1) * pageSize + 1,
                ),
              )
              .replace(
                "{to}",
                String(
                  Math.min(visiblePage * pageSize, filteredBranches.length),
                ),
              )
              .replace("{total}", String(filteredBranches.length))}
          </p>
          <nav
            aria-label={translateText("เปลี่ยนหน้ารายการสาขา")}
            className="flex items-center gap-1"
          >
            <button
              type="button"
              disabled={visiblePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              aria-label={translateText("หน้าก่อนหน้า")}
              className={`${styles.paginationButton} grid size-9 place-items-center rounded-lg hover:bg-white disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  aria-current={page === visiblePage ? "page" : undefined}
                  onClick={() => setCurrentPage(page)}
                  className={`grid size-9 place-items-center rounded-lg font-medium transition ${
                    page === visiblePage
                      ? "bg-violet-100 text-violet-700"
                      : "hover:bg-white"
                  } ${styles.paginationButton}`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={visiblePage >= pageCount}
              onClick={() =>
                setCurrentPage((page) => Math.min(pageCount, page + 1))
              }
              aria-label={translateText("หน้าถัดไป")}
              className={`${styles.paginationButton} grid size-9 place-items-center rounded-lg hover:bg-white disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </nav>
        </footer>
      </div>
    </main>
  );
}