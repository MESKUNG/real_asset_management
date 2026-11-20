import {
  getMockApiBaseUrl,
  isRecord,
  sanitizeAccount,
} from "../../staff-management/accounts/accountApi";

type ManagedRole = "Admin" | "President";

export async function GET() {
  const baseUrl = getMockApiBaseUrl();
  if (!baseUrl) {
    return Response.json(
      { error: "ไม่พบการตั้งค่า NEXT_PUBLIC_MOCKAPI_URL" },
      { status: 500 },
    );
  }

  try {
    const [accountsResponse, rolesResponse] = await Promise.all([
      fetch(`${baseUrl}/Account`, { cache: "no-store" }),
      fetch(`${baseUrl}/Role`, { cache: "no-store" }),
    ]);
    if (!accountsResponse.ok) {
      throw new Error(
        `โหลดข้อมูลจาก /Account ไม่สำเร็จ (HTTP ${accountsResponse.status})`,
      );
    }
    if (!rolesResponse.ok) {
      throw new Error(
        `โหลดข้อมูลจาก /Role ไม่สำเร็จ (HTTP ${rolesResponse.status})`,
      );
    }

    const [accountsPayload, rolesPayload]: [unknown, unknown] =
      await Promise.all([accountsResponse.json(), rolesResponse.json()]);
    if (!Array.isArray(accountsPayload)) {
      throw new Error("รูปแบบข้อมูลจาก MockAPI ไม่ถูกต้อง");
    }
    if (!Array.isArray(rolesPayload)) {
      throw new Error("รูปแบบข้อมูล Role จาก MockAPI ไม่ถูกต้อง");
    }

    const roleById = new Map<number, ManagedRole>();
    for (const role of rolesPayload) {
      if (!isRecord(role) || typeof role.role_name !== "string") continue;
      const roleId = Number(role.id);
      if (!Number.isInteger(roleId)) continue;

      const roleName = role.role_name.toLowerCase();
      if (roleName === "admin") roleById.set(roleId, "Admin");
      if (roleName === "president") roleById.set(roleId, "President");
    }
    if (
      !Array.from(roleById.values()).includes("Admin") ||
      !Array.from(roleById.values()).includes("President")
    ) {
      throw new Error("ไม่พบ Role Admin หรือ President ในข้อมูล Role");
    }

    const managedAccounts: Record<string, unknown>[] = [];
    for (const account of accountsPayload) {
      if (!isRecord(account)) continue;
      const role = roleById.get(Number(account.role_id));
      const sanitizedAccount = sanitizeAccount(account);
      if (role && sanitizedAccount) {
        managedAccounts.push({ ...sanitizedAccount, account_role: role });
      }
    }
    managedAccounts.sort(
      (first, second) => Number(second.id) - Number(first.id),
    );

    return Response.json(managedAccounts);
  } catch (error) {
    console.error("Could not load Admin / President accounts:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "โหลดข้อมูลบัญชี Admin / President ไม่สำเร็จ",
      },
      { status: 502 },
    );
  }
}
