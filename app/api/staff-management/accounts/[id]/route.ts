type AccountUpdate =
  | {
      first_name: string;
      last_name: string;
      email: string;
      branch_id: string;
      password?: string;
    }
  | { status: "Inactive" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUpdate(value: unknown): AccountUpdate | null {
  if (!isRecord(value)) return null;

  if (
    value.status === "Inactive" &&
    Object.keys(value).length === 1
  ) {
    return { status: "Inactive" };
  }

  const allowedFields = new Set([
    "first_name",
    "last_name",
    "email",
    "branch_id",
    "password",
  ]);
  if (Object.keys(value).some((key) => !allowedFields.has(key))) return null;

  if (
    typeof value.first_name !== "string" ||
    !value.first_name.trim() ||
    typeof value.last_name !== "string" ||
    !value.last_name.trim() ||
    typeof value.email !== "string" ||
    !value.email.trim() ||
    typeof value.branch_id !== "string" ||
    (value.password !== undefined && typeof value.password !== "string")
  ) {
    return null;
  }

  return {
    first_name: value.first_name.trim(),
    last_name: value.last_name.trim(),
    email: value.email.trim(),
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

  const baseUrl = process.env.NEXT_PUBLIC_MOCKAPI_URL?.trim().replace(/\/+$/, "");
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

    const safeAccount: Record<string, unknown> = {};
    for (const key of [
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "profile_image",
      "phone",
      "role_id",
      "staff_id",
      "branch_id",
      "status",
      "created_at",
      "last_login",
    ]) {
      if (key in updatedAccount) safeAccount[key] = updatedAccount[key];
    }

    return Response.json(safeAccount);
  } catch (error) {
    console.error("MockAPI account update failed:", error);
    return Response.json(
      { error: "เชื่อมต่อ MockAPI ไม่สำเร็จ กรุณาลองอีกครั้ง" },
      { status: 502 },
    );
  }
}
