import { getMockApiBaseUrl, isRecord, sanitizeAccount } from "../accountApi";

const STAFF_ROLE_ID = 1;

type AccountUpdate =
  | {
      username: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      branch_id: string;
      password?: string;
    }
  | { status: "Inactive" };

function parseUpdate(value: unknown): AccountUpdate | null {
  if (!isRecord(value)) return null;

  if (
    value.status === "Inactive" &&
    Object.keys(value).length === 1
  ) {
    return { status: "Inactive" };
  }

  const allowedFields = new Set([
    "username",
    "first_name",
    "last_name",
    "email",
    "phone",
    "branch_id",
    "password",
  ]);
  if (Object.keys(value).some((key) => !allowedFields.has(key))) return null;

  if (
    typeof value.username !== "string" ||
    !value.username.trim() ||
    typeof value.first_name !== "string" ||
    !value.first_name.trim() ||
    typeof value.last_name !== "string" ||
    !value.last_name.trim() ||
    typeof value.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) ||
    typeof value.phone !== "string" ||
    typeof value.branch_id !== "string" ||
    (value.password !== undefined && typeof value.password !== "string")
  ) {
    return null;
  }

  return {
    username: value.username.trim(),
    first_name: value.first_name.trim(),
    last_name: value.last_name.trim(),
    email: value.email.trim(),
    phone: value.phone.trim(),
    branch_id: value.branch_id,
    ...(typeof value.password === "string" && value.password
      ? { password: value.password }
      : {}),
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return Response.json({ error: "รหัสบัญชีไม่ถูกต้อง" }, { status: 400 });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return Response.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const changes = parseUpdate(requestBody);
  if (!changes) {
    return Response.json({ error: "ข้อมูลที่ส่งมาไม่ถูกต้อง" }, { status: 400 });
  }

  const baseUrl = getMockApiBaseUrl();
  if (!baseUrl) {
    return Response.json(
      { error: "ไม่พบการตั้งค่า NEXT_PUBLIC_MOCKAPI_URL" },
      { status: 500 },
    );
  }

  try {
    const accountUrl = `${baseUrl}/Account/${id}`;
    const accountResponse = await fetch(accountUrl, { cache: "no-store" });
    if (!accountResponse.ok) {
      return Response.json(
        { error: `โหลดข้อมูลบัญชีไม่สำเร็จ (HTTP ${accountResponse.status})` },
        { status: accountResponse.status },
      );
    }

    const currentAccount: unknown = await accountResponse.json();
    if (!isRecord(currentAccount) || String(currentAccount.id) !== id) {
      return Response.json(
        { error: "รูปแบบข้อมูลบัญชีจาก MockAPI ไม่ถูกต้อง" },
        { status: 502 },
      );
    }
    if (Number(currentAccount.role_id) !== STAFF_ROLE_ID) {
      return Response.json(
        { error: "ไม่พบบัญชี Staff ที่ต้องการแก้ไข" },
        { status: 404 },
      );
    }

    if (!("status" in changes)) {
      const allAccountsResponse = await fetch(`${baseUrl}/Account`, {
        cache: "no-store",
      });
      if (!allAccountsResponse.ok) {
        return Response.json(
          {
            error: `ตรวจสอบบัญชีซ้ำไม่สำเร็จ (HTTP ${allAccountsResponse.status})`,
          },
          { status: 502 },
        );
      }

      const allAccounts: unknown = await allAccountsResponse.json();
      if (!Array.isArray(allAccounts)) {
        return Response.json(
          { error: "รูปแบบข้อมูลจาก MockAPI ไม่ถูกต้อง" },
          { status: 502 },
        );
      }

      const duplicateCandidates: Array<{
        field: "username" | "email";
        value: string;
      }> = [];
      if (
        "username" in changes &&
        changes.username !== currentAccount.username
      ) {
        duplicateCandidates.push({ field: "username", value: changes.username });
      }
      if ("email" in changes && changes.email !== currentAccount.email) {
        duplicateCandidates.push({ field: "email", value: changes.email });
      }

      for (const { field, value: candidateValue } of duplicateCandidates) {
        const value = candidateValue.toLocaleLowerCase();
        const duplicate = allAccounts.some(
          (account) =>
            isRecord(account) &&
            String(account.id) !== id &&
            typeof account[field] === "string" &&
            account[field].trim().toLocaleLowerCase() === value,
        );
        if (duplicate) {
          return Response.json(
            {
              error:
                field === "username"
                  ? "ชื่อผู้ใช้นี้ถูกใช้แล้ว"
                  : "อีเมลนี้ถูกใช้แล้ว",
            },
            { status: 409 },
          );
        }
      }
    }

    const updateResponse = await fetch(accountUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentAccount,
        ...changes,
        updated_at: Math.floor(Date.now() / 1000),
      }),
    });
    if (!updateResponse.ok) {
      return Response.json(
        { error: `MockAPI บันทึกข้อมูลไม่สำเร็จ (HTTP ${updateResponse.status})` },
        { status: 502 },
      );
    }

    const updatedAccount: unknown = await updateResponse.json();
    if (!isRecord(updatedAccount) || String(updatedAccount.id) !== id) {
      return Response.json(
        { error: "MockAPI ส่งข้อมูลบัญชีที่แก้ไขกลับมาไม่ถูกต้อง" },
        { status: 502 },
      );
    }

    const safeAccount = sanitizeAccount(updatedAccount);
    if (!safeAccount) {
      return Response.json(
        { error: "MockAPI ส่งข้อมูลบัญชีที่แก้ไขกลับมาไม่ถูกต้อง" },
        { status: 502 },
      );
    }

    return Response.json(safeAccount);
  } catch (error) {
    console.error("MockAPI Staff account update failed:", error);
    return Response.json(
      { error: "เชื่อมต่อ MockAPI ไม่สำเร็จ กรุณาลองอีกครั้ง" },
      { status: 502 },
    );
  }
}
