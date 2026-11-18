"use client";

import {
  Ban,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { branches } from "@/data/branches";
import { useLanguage, useTranslate } from "@/lib/language";
import StaffProfileImage from "../staffManagement/_components/StaffProfileImage";

type AccountStatus = "Active" | "Inactive";
type PageAccess = "loading" | "unauthorized" | "president" | "superadmin";

type AdminAccount = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  phone: string;
  role_id: 2;
  staff_id: number | null;
  branch_id?: string;
  status: AccountStatus;
  created_at: number;
};

type AdminAccountChanges = {
  username: string;
  password?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  branch_id: string;
};

const pageSizes = [4, 8, 12, 24];
const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

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
    return role === "president" || role === "superadmin"
      ? role
      : "unauthorized";
  } catch (error) {
    console.error("Invalid credential:", error);
    return "unauthorized";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAccount(value: unknown, index: number): AdminAccount {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.username !== "string" ||
    typeof value.email !== "string" ||
    typeof value.first_name !== "string" ||
    typeof value.last_name !== "string" ||
    (value.profile_image !== undefined &&
      typeof value.profile_image !== "string") ||
    (value.phone !== undefined && typeof value.phone !== "string") ||
    Number(value.role_id) !== 2 ||
    (value.staff_id !== undefined &&
      value.staff_id !== null &&
      typeof value.staff_id !== "number") ||
    (value.branch_id !== undefined && typeof value.branch_id !== "string") ||
    (value.status !== "Active" && value.status !== "Inactive") ||
    typeof value.created_at !== "number"
  ) {
    throw new Error(`ข้อมูลบัญชี Admin รายการที่ ${index + 1} มีรูปแบบไม่ถูกต้อง`);
  }

  return {
    id: value.id,
    username: value.username,
    email: value.email,
    first_name: value.first_name,
    last_name: value.last_name,
    profile_image:
      typeof value.profile_image === "string" ? value.profile_image : "",
    phone: typeof value.phone === "string" ? value.phone : "",
    role_id: 2,
    staff_id: typeof value.staff_id === "number" ? value.staff_id : null,
    ...(typeof value.branch_id === "string"
      ? { branch_id: value.branch_id }
      : {}),
    status: value.status,
    created_at: value.created_at,
  };
}

async function getApiErrorMessage(response: Response, fallback: string) {
  const payload: unknown = await response.json().catch(() => null);
  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }
  return `${fallback} (HTTP ${response.status})`;
}

function getAccountCode(account: AdminAccount) {
  return `ADM-${String(account.id).padStart(3, "0")}`;
}

function getVisiblePages(currentPage: number, pageCount: number) {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", pageCount] as const;
  if (currentPage >= pageCount - 2) {
    return [
      1,
      "ellipsis",
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ] as const;
  }
  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    pageCount,
  ] as const;
}

export default function AdminManagementPage() {
  const translateText = useTranslate();
  const access = useSyncExternalStore(
    subscribeToCredentialChanges,
    getAccessSnapshot,
    getServerAccessSnapshot,
  );
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(
    null,
  );
  const [accountToEdit, setAccountToEdit] = useState<AdminAccount | null>(null);
  const [accountToSuspend, setAccountToSuspend] =
    useState<AdminAccount | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (access !== "president" && access !== "superadmin") return;

    const controller = new AbortController();
    let active = true;

    async function loadAccounts() {
      try {
        const response = await fetch("/api/admin-management/accounts", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(
              response,
              "โหลดข้อมูลบัญชี Admin ไม่สำเร็จ",
            ),
          );
        }

        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error("รูปแบบข้อมูลบัญชี Admin ไม่ถูกต้อง");
        }

        const parsedAccounts = payload.map(parseAccount);
        if (active) {
          setAccounts(parsedAccounts);
          setErrorMessage("");
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Could not load Admin accounts:", error);
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "โหลดข้อมูลบัญชี Admin ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadAccounts();
    return () => {
      active = false;
      controller.abort();
    };
  }, [access]);

  const activeCount = accounts.filter(
    (account) => account.status === "Active",
  ).length;
  const inactiveCount = accounts.filter(
    (account) => account.status === "Inactive",
  ).length;

  const filteredAccounts = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase();
    return accounts.filter((account) => {
      const branchName =
        branches.find((branch) => branch.id === account.branch_id)?.name ?? "";
      const matchesSearch =
        !query ||
        [
          getAccountCode(account),
          account.username,
          account.first_name,
          account.last_name,
          account.email,
          account.branch_id ?? "",
          branchName,
        ].some((value) => value.toLocaleLowerCase().includes(query));

      return (
        matchesSearch &&
        (branchFilter === "all" || account.branch_id === branchFilter) &&
        (statusFilter === "all" || account.status === statusFilter)
      );
    });
  }, [accounts, branchFilter, searchText, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const currentPageWithinRange = Math.min(currentPage, pageCount);
  const visibleAccounts = filteredAccounts.slice(
    (currentPageWithinRange - 1) * pageSize,
    currentPageWithinRange * pageSize,
  );

  const getBranchName = (branchId?: string) => {
    if (!branchId) return translateText("ไม่ระบุสาขา");
    const branch = branches.find((item) => item.id === branchId);
    return branch ? translateText(branch.name) : branchId;
  };

  const createAdminAccount = async (changes: AdminAccountChanges) => {
    const username = changes.username.trim().toLocaleLowerCase();
    const email = changes.email.trim().toLocaleLowerCase();
    if (
      accounts.some(
        (account) => account.username.toLocaleLowerCase() === username,
      )
    ) {
      throw new Error("ชื่อผู้ใช้นี้ถูกใช้แล้ว");
    }
    if (
      accounts.some((account) => account.email.toLocaleLowerCase() === email)
    ) {
      throw new Error("อีเมลนี้ถูกใช้แล้ว");
    }

    const createdAccount: AdminAccount = {
      id: Math.max(0, ...accounts.map((account) => account.id)) + 1,
      username: changes.username.trim(),
      email: changes.email.trim(),
      first_name: changes.first_name.trim(),
      last_name: changes.last_name.trim(),
      profile_image: "",
      phone: changes.phone.trim(),
      role_id: 2,
      staff_id:
        Math.max(0, ...accounts.map((account) => account.staff_id ?? 0)) + 1,
      branch_id: changes.branch_id,
      status: "Active",
      created_at: Math.floor(Date.now() / 1000),
    };

    setAccounts((current) => [createdAccount, ...current]);
    setSearchText("");
    setBranchFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
    setIsAddModalOpen(false);
  };

  const updateAdminAccount = async (
    accountId: number,
    changes: AdminAccountChanges,
  ) => {
    const username = changes.username.trim().toLocaleLowerCase();
    const email = changes.email.trim().toLocaleLowerCase();
    if (
      accounts.some(
        (account) =>
          account.id !== accountId &&
          account.username.toLocaleLowerCase() === username,
      )
    ) {
      throw new Error("ชื่อผู้ใช้นี้ถูกใช้แล้ว");
    }
    if (
      accounts.some(
        (account) =>
          account.id !== accountId &&
          account.email.toLocaleLowerCase() === email,
      )
    ) {
      throw new Error("อีเมลนี้ถูกใช้แล้ว");
    }

    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? {
              ...account,
              username: changes.username.trim(),
              first_name: changes.first_name.trim(),
              last_name: changes.last_name.trim(),
              email: changes.email.trim(),
              phone: changes.phone.trim(),
              branch_id: changes.branch_id,
            }
          : account,
      ),
    );
    setAccountToEdit(null);
  };

  const suspendAdminAccount = () => {
    if (!accountToSuspend) return;
    setAccounts((current) =>
      current.map((account) =>
        account.id === accountToSuspend.id
          ? { ...account, status: "Inactive" }
          : account,
      ),
    );
    setAccountToSuspend(null);
  };

  const rangeStart = filteredAccounts.length
    ? (currentPageWithinRange - 1) * pageSize + 1
    : 0;
  const rangeEnd = Math.min(
    currentPageWithinRange * pageSize,
    filteredAccounts.length,
  );

  if (access === "loading") {
    return (
      <PageMessage message={translateText("กำลังตรวจสอบสิทธิ์...")} />
    );
  }

  if (access === "unauthorized") {
    return (
      <PageMessage
        message={translateText("หน้านี้สำหรับ President และ Superadmin เท่านั้น")}
        isError
      />
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            {translateText("จัดการบัญชี Admin")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {translateText("เพิ่ม แก้ไข และระงับบัญชี Admin")}
          </p>
        </header>

        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {translateText(
            "โหมดจำลอง: การเพิ่ม แก้ไข และระงับเปลี่ยนเฉพาะหน้านี้ ไม่บันทึก API และจะหายเมื่อโหลดหน้าใหม่",
          )}
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<UsersRound className="size-5" />}
            label={translateText("บัญชี Admin ทั้งหมด")}
            value={accounts.length}
            note="Admin"
            iconClassName="text-violet-600"
          />
          <SummaryCard
            icon={<Ban className="size-5" />}
            label={translateText("บัญชี Admin ที่พร้อมใช้งาน")}
            value={activeCount}
            note="Active"
            iconClassName="text-emerald-600"
          />
          <SummaryCard
            icon={<CheckCircle2 className="size-5" />}
            label={translateText("บัญชี Admin ที่ระงับ")}
            value={inactiveCount}
            note="Inactive"
            iconClassName="text-amber-600"
          />
        </div>

        <section className="space-y-4" aria-labelledby="accounts-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="accounts-heading"
              className="text-lg font-semibold text-slate-900"
            >
              {translateText("รายการบัญชี Admin")}
            </h2>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              <UserRoundPlus className="size-4" aria-hidden="true" />
              {translateText("เพิ่มบัญชี Admin")}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(2,minmax(150px,1fr))]">
            <label className="relative block">
              <span className="sr-only">{translateText("ค้นหาบัญชี")}</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder={translateText("ค้นหาชื่อ อีเมล หรือรหัส")}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </label>

            <FilterSelect
              label={translateText("ทุกสาขา")}
              icon={<Building2 className="size-4" aria-hidden="true" />}
              value={branchFilter}
              onChange={(value) => {
                setBranchFilter(value);
                setCurrentPage(1);
              }}
            >
              <option value="all">{translateText("ทุกสาขา")}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {translateText(branch.name)}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label={translateText("ทุกสถานะ")}
              icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <option value="all">{translateText("ทุกสถานะ")}</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </FilterSelect>
          </div>

          {errorMessage && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {translateText(errorMessage)}
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-100 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">{translateText("รหัสบัญชี")}</th>
                    <th className="px-4 py-3">{translateText("ชื่อผู้ใช้")}</th>
                    <th className="px-4 py-3">{translateText("อีเมล")}</th>
                    <th className="px-4 py-3">{translateText("บทบาท")}</th>
                    <th className="px-4 py-3">{translateText("สาขา")}</th>
                    <th className="px-4 py-3">{translateText("สถานะ")}</th>
                    <th className="px-4 py-3">{translateText("ดำเนินการ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        {translateText("กำลังโหลดบัญชี...")}
                      </td>
                    </tr>
                  ) : visibleAccounts.length ? (
                    visibleAccounts.map((account) => (
                      <tr
                        key={account.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          {getAccountCode(account)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <StaffProfileImage
                              src={account.profile_image}
                              alt={`รูปโปรไฟล์ ${account.first_name} ${account.last_name}`}
                              initials={`${account.first_name.charAt(0)}${account.last_name.charAt(0)}`}
                              size={40}
                            />
                            <div>
                              <div className="font-semibold text-slate-800">
                                {account.first_name} {account.last_name}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-400">
                                {account.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          {account.email}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">Admin</td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {getBranchName(account.branch_id)}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={account.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedAccount(account)}
                              className="h-9 whitespace-nowrap rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye
                                className="mr-1.5 inline size-3.5"
                                aria-hidden="true"
                              />
                              {translateText("ดูรายละเอียด")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setAccountToEdit(account)}
                              className="h-9 whitespace-nowrap rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              {translateText("แก้ไขข้อมูล")}
                            </button>
                            {account.status === "Active" && (
                              <button
                                type="button"
                                onClick={() => setAccountToSuspend(account)}
                                className="h-9 whitespace-nowrap rounded-lg bg-rose-500 px-3 text-xs font-semibold text-white transition hover:bg-rose-600"
                              >
                                {translateText("ระงับ")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        {translateText("ไม่พบบัญชีที่ตรงกับเงื่อนไข")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                {translateText("แสดง")} {rangeStart}-{rangeEnd}{" "}
                {translateText("จาก")} {filteredAccounts.length}{" "}
                {translateText("บัญชี")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative">
                  <span className="sr-only">
                    {translateText("รายการต่อหน้า")}
                  </span>
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs text-slate-600 outline-none focus:border-violet-400"
                  >
                    {pageSizes.map((size) => (
                      <option key={size} value={size}>
                        {size} {translateText("รายการต่อหน้า")}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </label>
                <button
                  type="button"
                  aria-label={translateText("หน้าก่อนหน้า")}
                  disabled={currentPageWithinRange === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                {getVisiblePages(currentPageWithinRange, pageCount).map(
                  (page, index) =>
                    page === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-xs text-slate-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        aria-current={
                          currentPageWithinRange === page ? "page" : undefined
                        }
                        onClick={() => setCurrentPage(page)}
                        className={`grid size-9 place-items-center rounded-lg text-xs transition ${
                          currentPageWithinRange === page
                            ? "bg-violet-100 font-semibold text-violet-700"
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
                  disabled={currentPageWithinRange === pageCount}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(pageCount, page + 1))
                  }
                  className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </footer>
          </div>
        </section>
      </div>

      {isAddModalOpen && (
        <AdminAccountFormModal
          key="new-admin"
          onClose={() => setIsAddModalOpen(false)}
          onSave={createAdminAccount}
        />
      )}
      {accountToEdit && (
        <AdminAccountFormModal
          key={accountToEdit.id}
          account={accountToEdit}
          onClose={() => setAccountToEdit(null)}
          onSave={(changes) =>
            updateAdminAccount(accountToEdit.id, changes)
          }
        />
      )}
      {selectedAccount && (
        <AdminDetailModal
          account={selectedAccount}
          branchName={getBranchName(selectedAccount.branch_id)}
          onClose={() => setSelectedAccount(null)}
        />
      )}
      {accountToSuspend && (
        <SuspendAdminModal
          account={accountToSuspend}
          onClose={() => setAccountToSuspend(null)}
          onConfirm={suspendAdminAccount}
        />
      )}
    </section>
  );
}

function PageMessage({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) {
  return (
    <section
      className={`m-6 rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-600"
      }`}
      role={isError ? "alert" : "status"}
    >
      {message}
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  note,
  iconClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
  iconClassName: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <span className={`rounded-lg bg-slate-50 p-2 ${iconClassName}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-400">{note}</p>
    </article>
  );
}

function FilterSelect({
  label,
  icon,
  value,
  onChange,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      >
        {children}
      </select>
    </label>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        status === "Active"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`size-2 rounded-full ${
          status === "Active" ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {status}
    </span>
  );
}

function AdminAccountFormModal({
  account,
  onClose,
  onSave,
}: {
  account?: AdminAccount;
  onClose: () => void;
  onSave: (changes: AdminAccountChanges) => Promise<void>;
}) {
  const translateText = useTranslate();
  const [username, setUsername] = useState(account?.username ?? "");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(account?.first_name ?? "");
  const [lastName, setLastName] = useState(account?.last_name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [phone, setPhone] = useState(account?.phone ?? "");
  const [branchId, setBranchId] = useState(account?.branch_id ?? "BR-001");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isEditing = Boolean(account);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    try {
      await onSave({
        username: username.trim(),
        ...(password ? { password } : {}),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        branch_id: branchId,
      });
    } catch (error) {
      console.error("Could not save Admin account:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "บันทึกข้อมูลบัญชี Admin ไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-account-form-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          <header className="flex items-start justify-between gap-4 px-6 py-5">
            <div>
              <h2
                id="admin-account-form-title"
                className="text-xl font-bold text-slate-800"
              >
                {translateText(
                  isEditing ? "แก้ไขบัญชี Admin" : "เพิ่มบัญชี Admin",
                )}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {translateText("กรอกข้อมูลเพื่อจัดการบัญชี Admin")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label={translateText("ปิดหน้าต่าง")}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 pb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={translateText("ชื่อผู้ใช้")}>
                <input
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField
                label={translateText(
                  isEditing ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน",
                )}
              >
                <input
                  required={!isEditing}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label={translateText("ชื่อ")}>
                <input
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label={translateText("นามสกุล")}>
                <input
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label={translateText("อีเมล")}>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
              <FormField label={translateText("เบอร์โทรศัพท์")}>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClassName}
                />
              </FormField>
            </div>
            <FormField label={translateText("สาขา")}>
              <select
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                className={inputClassName}
              >
                <option value="">{translateText("ไม่ระบุสาขา")}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {translateText(branch.name)}
                  </option>
                ))}
              </select>
            </FormField>
            <p className="text-sm text-slate-500">
              {translateText("บทบาทบัญชี")}: <strong>Admin</strong>
            </p>
            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {translateText(errorMessage)}
              </p>
            )}
          </div>
          <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {translateText("ยกเลิก")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserRoundPlus className="size-4" aria-hidden="true" />
              {isSaving
                ? translateText("กำลังบันทึก...")
                : translateText(
                    isEditing ? "บันทึกการเปลี่ยนแปลง" : "สร้างบัญชี Admin",
                  )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function AdminDetailModal({
  account,
  branchName,
  onClose,
}: {
  account: AdminAccount;
  branchName: string;
  onClose: () => void;
}) {
  const translateText = useTranslate();
  const language = useLanguage();
  const createdAt = new Intl.DateTimeFormat(
    language === "en" ? "en-US" : "th-TH",
    { dateStyle: "long" },
  ).format(new Date(account.created_at * 1000));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-detail-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="admin-detail-title"
              className="text-xl font-bold text-slate-800"
            >
              {translateText("รายละเอียดบัญชี Admin")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={translateText("ปิดหน้าต่าง")}
            className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div className="space-y-5 px-6 py-6">
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-5">
            <StaffProfileImage
              src={account.profile_image}
              alt={`รูปโปรไฟล์ ${account.first_name} ${account.last_name}`}
              initials={`${account.first_name.charAt(0)}${account.last_name.charAt(0)}`}
              size={56}
            />
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-800">
                {getAccountCode(account)} · {account.first_name}{" "}
                {account.last_name}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {account.username}
              </p>
            </div>
            <StatusBadge status={account.status} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              label={translateText("ชื่อผู้ใช้")}
              value={account.username}
            />
            <DetailItem
              label={translateText("อีเมล")}
              value={account.email}
            />
            <DetailItem
              label={translateText("เบอร์โทรศัพท์")}
              value={account.phone || translateText("ไม่ระบุ")}
            />
            <DetailItem label={translateText("สาขา")} value={branchName} />
            <DetailItem
              label={translateText("วันที่สร้างบัญชี")}
              value={createdAt}
            />
          </div>
        </div>
        <footer className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {translateText("ปิด")}
          </button>
        </footer>
      </section>
    </div>
  );
}

function SuspendAdminModal({
  account,
  onClose,
  onConfirm,
}: {
  account: AdminAccount;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const translateText = useTranslate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-admin-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="px-6 py-5">
          <h2
            id="suspend-admin-title"
            className="text-xl font-bold text-slate-800"
          >
            {translateText("ระงับบัญชี Admin")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {translateText("ยืนยันการเปลี่ยนสถานะบัญชีเป็น Inactive")}
          </p>
        </header>
        <div className="px-6 pb-6">
          <div className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-slate-700">
            {getAccountCode(account)} · {account.first_name} {account.last_name}
          </div>
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {translateText("ยกเลิก")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-lg bg-rose-500 px-4 text-sm font-semibold text-white hover:bg-rose-600"
          >
            {translateText("ยืนยันการระงับ")}
          </button>
        </footer>
      </section>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}