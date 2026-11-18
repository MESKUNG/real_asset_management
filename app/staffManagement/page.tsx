"use client";

import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  UserRoundPlus,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { branches } from "@/data/branches";
import { useTranslate } from "@/lib/language";
import AddStaffModal, {
  type NewStaffAccount,
} from "./_components/AddStaffModal";
import StaffDetailModal from "./_components/StaffDetailModal";
import EditStaffModal, {
  type StaffAccountChanges,
} from "./_components/EditStaffModal";
import StaffProfileImage from "./_components/StaffProfileImage";
import SuspendStaffModal from "./_components/SuspendStaffModal";

type AccountStatus = "Active" | "Inactive";

type StaffAccount = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  phone: string;
  role_id: number;
  staff_id: number | null;
  branch_id?: string;
  status: AccountStatus;
  created_at: number;
  last_login: number | null;
};

const pageSizes = [4, 8, 12, 24];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAccount(value: unknown, index: number): StaffAccount {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.username !== "string" ||
    typeof value.email !== "string" ||
    typeof value.first_name !== "string" ||
    typeof value.last_name !== "string" ||
    typeof value.profile_image !== "string" ||
    typeof value.phone !== "string" ||
    value.role_id !== 1 ||
    (value.staff_id !== null && typeof value.staff_id !== "number") ||
    (value.status !== "Active" && value.status !== "Inactive") ||
    typeof value.created_at !== "number" ||
    (value.last_login !== null && typeof value.last_login !== "number") ||
    (value.branch_id !== undefined && typeof value.branch_id !== "string")
  ) {
    throw new Error(`ข้อมูล Account รายการที่ ${index + 1} มีรูปแบบไม่ถูกต้อง`);
  }

  return {
    id: value.id,
    username: value.username,
    email: value.email,
    first_name: value.first_name,
    last_name: value.last_name,
    profile_image: value.profile_image,
    phone: value.phone,
    role_id: value.role_id,
    staff_id: value.staff_id,
    ...(typeof value.branch_id === "string"
      ? { branch_id: value.branch_id }
      : {}),
    status: value.status,
    created_at: value.created_at,
    last_login: value.last_login,
  };
}

async function getApiErrorMessage(response: Response, fallback: string) {
  const payload: unknown = await response.json().catch(() => null);
  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }
  return `${fallback} (HTTP ${response.status})`;
}

function getAccountCode(account: StaffAccount) {
  return `STF-${String(account.id).padStart(3, "0")}`;
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

export default function StaffManagementPage() {
  const translateText = useTranslate();
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<StaffAccount | null>(
    null,
  );
  const [accountToEdit, setAccountToEdit] = useState<StaffAccount | null>(null);
  const [accountToSuspend, setAccountToSuspend] = useState<StaffAccount | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadAccounts() {
      try {
        const accountResponse = await fetch(
          "/api/staff-management/accounts",
          { signal: controller.signal },
        );

        if (!accountResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              accountResponse,
              "โหลดข้อมูลบัญชี Staff ไม่สำเร็จ",
            ),
          );
        }

        const accountsPayload: unknown = await accountResponse.json();
        if (!Array.isArray(accountsPayload)) {
          throw new Error("รูปแบบข้อมูลบัญชี Staff ไม่ถูกต้อง");
        }

        const parsedAccounts = accountsPayload.map(parseAccount);
        if (active) {
          setAccounts(parsedAccounts);
          setErrorMessage("");
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        console.error("Could not load staff accounts:", error);
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "โหลดข้อมูลบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
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
  }, []);

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


  const createStaffAccount = async (newAccount: NewStaffAccount) => {
    const username = newAccount.username.trim().toLocaleLowerCase();
    const email = newAccount.email.trim().toLocaleLowerCase();
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

    const createdAccount: StaffAccount = {
      id: Math.max(0, ...accounts.map((account) => account.id)) + 1,
      username: newAccount.username.trim(),
      email: newAccount.email.trim(),
      first_name: newAccount.first_name.trim(),
      last_name: newAccount.last_name.trim(),
      profile_image: "",
      phone: newAccount.phone.trim(),
      role_id: 1,
      staff_id:
        Math.max(
          0,
          ...accounts.map((account) => account.staff_id ?? 0),
        ) + 1,
      branch_id: newAccount.branch_id,
      status: "Active",
      created_at: Math.floor(Date.now() / 1000),
      last_login: null,
    };

    setAccounts((currentAccounts) => [createdAccount, ...currentAccounts]);
    setSearchText("");
    setBranchFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
    setIsAddModalOpen(false);
  };

  const updateAccount = async (
    accountId: number,
    changes: StaffAccountChanges,
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

    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
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

  const suspendAccount = async () => {
    if (!accountToSuspend) return;

    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
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

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            {translateText("จัดการบัญชี Staff")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {translateText("เพิ่ม แก้ไข และระงับบัญชี Staff")}
          </p>
        </header>

        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {translateText(
            "โหมดจำลอง: การสร้าง แก้ไข และระงับเปลี่ยนเฉพาะหน้านี้ ไม่บันทึก API และจะหายเมื่อโหลดหน้าใหม่",
          )}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          <SummaryCard
            icon={<UsersRound className="size-5" />}
            label={translateText("บัญชี Staff ทั้งหมด")}
            value={accounts.length}
            note="Staff"
            iconClassName="text-violet-600"
          />
          <SummaryCard
            icon={<CheckCircle2 className="size-5" />}
            label={translateText("บัญชี Staff ที่พร้อมใช้งาน")}
            value={activeCount}
            note="Active"
            iconClassName="text-emerald-600"
          />
          <SummaryCard
            icon={<Wrench className="size-5" />}
            label={translateText("บัญชี Staff ที่ระงับ")}
            value={inactiveCount}
            note="Inactive"
            iconClassName="text-amber-600"
          />
        </div>

        <section className="space-y-4" aria-labelledby="accounts-heading">
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <h2
              id="accounts-heading"
              className="text-lg font-semibold text-slate-900"
            >
              {translateText("รายการบัญชี Staff")}
            </h2>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700 sm:w-auto"
            >
              <UserRoundPlus className="size-4" aria-hidden="true" />
              {translateText("เพิ่มบัญชี Staff")}
            </button>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(2,minmax(150px,1fr))]">
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
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] text-left text-sm">
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
                        <td className="px-4 py-3.5 text-slate-700">Staff</td>
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

            <div className="space-y-3 border-t border-slate-100 p-3 md:hidden">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  {translateText("กำลังโหลดบัญชี...")}
                </p>
              ) : visibleAccounts.length ? (
                visibleAccounts.map((account) => (
                  <article key={account.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <StaffProfileImage
                        src={account.profile_image}
                        alt={`รูปโปรไฟล์ ${account.first_name} ${account.last_name}`}
                        initials={`${account.first_name.charAt(0)}${account.last_name.charAt(0)}`}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-slate-800">{account.first_name} {account.last_name}</p>
                          <StatusBadge status={account.status} />
                        </div>
                        <p className="mt-0.5 break-all text-xs text-slate-500">{account.username}</p>
                        <p className="mt-1 text-xs text-slate-400">{getAccountCode(account)} · Staff</p>
                      </div>
                    </div>
                    <dl className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-sm">
                      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2">
                        <dt className="text-slate-400">{translateText("อีเมล")}</dt>
                        <dd className="break-all text-slate-600">{account.email}</dd>
                      </div>
                      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2">
                        <dt className="text-slate-400">{translateText("สาขา")}</dt>
                        <dd className="text-slate-600">{getBranchName(account.branch_id)}</dd>
                      </div>
                    </dl>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setSelectedAccount(account)} className="h-10 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                        <Eye className="mr-1 inline size-3.5" aria-hidden="true" />{translateText("ดูรายละเอียด")}
                      </button>
                      <button type="button" onClick={() => setAccountToEdit(account)} className="h-10 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                        {translateText("แก้ไขข้อมูล")}
                      </button>
                      {account.status === "Active" && (
                        <button type="button" onClick={() => setAccountToSuspend(account)} className="col-span-2 h-10 rounded-lg bg-rose-500 px-3 text-xs font-semibold text-white transition hover:bg-rose-600">
                          {translateText("ระงับ")}
                        </button>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">{translateText("ไม่พบบัญชีที่ตรงกับเงื่อนไข")}</p>
              )}
            </div>

            <footer className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
              <p className="text-xs text-slate-500">
                {translateText("แสดง")} {rangeStart}-{rangeEnd}{" "}
                {translateText("จาก")} {filteredAccounts.length}{" "}
                {translateText("บัญชี")}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-1 sm:justify-start sm:gap-2">
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
                    className="h-9 max-w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs text-slate-600 outline-none focus:border-violet-400"
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

      {selectedAccount && (
        <StaffDetailModal
          account={selectedAccount}
          accountCode={getAccountCode(selectedAccount)}
          roleName="Staff"
          branchName={getBranchName(selectedAccount.branch_id)}
          onClose={() => setSelectedAccount(null)}
        />
      )}

      {accountToEdit && (
        <EditStaffModal
          account={accountToEdit}
          onClose={() => setAccountToEdit(null)}
          onSave={(changes) => updateAccount(accountToEdit.id, changes)}
        />
      )}

      {accountToSuspend && (
        <SuspendStaffModal
          account={accountToSuspend}
          accountCode={getAccountCode(accountToSuspend)}
          onClose={() => setAccountToSuspend(null)}
          onConfirm={suspendAccount}
        />
      )}

      {isAddModalOpen && (
        <AddStaffModal
          onClose={() => setIsAddModalOpen(false)}
          onCreate={createStaffAccount}
        />
      )}
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={iconClassName}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
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
        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-600 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {status}
    </span>
  );
}
