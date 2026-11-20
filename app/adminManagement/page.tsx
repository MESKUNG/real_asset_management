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
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { branches } from "@/data/branches";
import { useTranslate } from "@/lib/language";
import StaffProfileImage from "../staffManagement/_components/StaffProfileImage";
import AddAdminModal from "./_components/AddAdminModal";
import AdminDetailModal from "./_components/AdminDetailModal";
import AdminStatusBadge from "./_components/AdminStatusBadge";
import EditAdminModal from "./_components/EditAdminModal";
import SuspendAdminModal from "./_components/SuspendAdminModal";
import type {
  AdminAccount,
  AdminAccountChanges,
  ManagedRole,
} from "./_components/types";

type PageAccess = "loading" | "unauthorized" | "president" | "superadmin";

const pageSizes = [4, 8, 12, 24];

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
    (value.account_role !== "Admin" && value.account_role !== "President") ||
    (value.profile_image !== undefined &&
      typeof value.profile_image !== "string") ||
    (value.phone !== undefined && typeof value.phone !== "string") ||
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
    role: value.account_role,
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
  const prefix = account.role === "Admin" ? "ADM" : "PRE";
  return `${prefix}-${String(account.id).padStart(3, "0")}`;
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
  const [roleFilter, setRoleFilter] = useState<"all" | ManagedRole>("all");
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
              "โหลดข้อมูลบัญชี Admin / President ไม่สำเร็จ",
            ),
          );
        }

        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error("รูปแบบข้อมูลบัญชี Admin / President ไม่ถูกต้อง");
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
        console.error("Could not load Admin / President accounts:", error);
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "โหลดข้อมูลบัญชี Admin / President ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
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
        (statusFilter === "all" || account.status === statusFilter) &&
        (roleFilter === "all" || account.role === roleFilter)
      );
    });
  }, [accounts, branchFilter, roleFilter, searchText, statusFilter]);

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
      role: changes.role,
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
    setRoleFilter("all");
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
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            {translateText("จัดการบัญชี Admin / President")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {translateText("เพิ่ม แก้ไข และระงับบัญชี Admin / President")}
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
            label={translateText("บัญชี Admin / President ทั้งหมด")}
            value={accounts.length}
            note="Admin / President"
            iconClassName="text-violet-600"
          />
          <SummaryCard
            icon={<Ban className="size-5" />}
            label={translateText("บัญชี Admin / President ที่พร้อมใช้งาน")}
            value={activeCount}
            note="Active"
            iconClassName="text-emerald-600"
          />
          <SummaryCard
            icon={<CheckCircle2 className="size-5" />}
            label={translateText("บัญชี Admin / President ที่ระงับ")}
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
              {translateText("รายการบัญชี Admin / President")}
            </h2>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700 sm:w-auto"
            >
              <UserRoundPlus className="size-4" aria-hidden="true" />
              {translateText("เพิ่มบัญชี")}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(3,minmax(150px,1fr))]">
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

            <FilterSelect
              label={translateText("ทุกบทบาท")}
              icon={<UsersRound className="size-4" aria-hidden="true" />}
              value={roleFilter}
              onChange={(value) => {
                if (value === "Admin" || value === "President") {
                  setRoleFilter(value);
                } else {
                  setRoleFilter("all");
                }
                setCurrentPage(1);
              }}
            >
              <option value="all">{translateText("ทุกบทบาท")}</option>
              <option value="Admin">Admin</option>
              <option value="President">President</option>
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
                        <td className="px-4 py-3.5 text-slate-700">
                          {translateText(account.role)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {getBranchName(account.branch_id)}
                        </td>
                        <td className="px-4 py-3.5">
                          <AdminStatusBadge status={account.status} />
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
                          <AdminStatusBadge status={account.status} />
                        </div>
                        <p className="mt-0.5 break-all text-xs text-slate-500">{account.username}</p>
                        <p className="mt-1 text-xs text-slate-400">{getAccountCode(account)} · {translateText(account.role)}</p>
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

      {isAddModalOpen && (
        <AddAdminModal
          key="new-admin"
          onClose={() => setIsAddModalOpen(false)}
          onSave={createAdminAccount}
        />
      )}
      {accountToEdit && (
        <EditAdminModal
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
          accountCode={getAccountCode(selectedAccount)}
          branchName={getBranchName(selectedAccount.branch_id)}
          onClose={() => setSelectedAccount(null)}
        />
      )}
      {accountToSuspend && (
        <SuspendAdminModal
          account={accountToSuspend}
          accountCode={getAccountCode(accountToSuspend)}
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
