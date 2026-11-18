import {
  getMockApiBaseUrl,
  isRecord,
  sanitizeAccount,
} from "./accountApi";

const STAFF_ROLE_ID = 1;

type NewStaffAccount = {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  branch_id: string;
};

function parseNewStaff(value: unknown): NewStaffAccount | null {
  if (!isRecord(value)) return null;

  const allowedFields = new Set([
    "username",
    "password",
    "first_name",
    "last_name",
    "email",
    "phone",
    "branch_id",
  ]);
  if (Object.keys(value).some((field) => !allowedFields.has(field))) return null;

  if (
    typeof value.username !== "string" ||
    !value.username.trim() ||
    typeof value.password !== "string" ||
    !value.password ||
    typeof value.first_name !== "string" ||
    !value.first_name.trim() ||
    typeof value.last_name !== "string" ||
    !value.last_name.trim() ||
    typeof value.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) ||
    (value.phone !== undefined && typeof value.phone !== "string") ||
    (value.branch_id !== undefined && typeof value.branch_id !== "string")
  ) {
    return null;
  }

  return {
    username: value.username.trim(),
    password: value.password,
    first_name: value.first_name.trim(),
    last_name: value.last_name.trim(),
    email: value.email.trim(),
    phone: typeof value.phone === "string" ? value.phone.trim() : "",
    branch_id: typeof value.branch_id === "string" ? value.branch_id : "",
  };
}

function hasDuplicateAccount(
  accounts: unknown[],
  field: "username" | "email",
  value: string,
) {
  const normalizedValue = value.trim().toLocaleLowerCase();
  return accounts.some(
    (account) =>
      isRecord(account) &&
      typeof account[field] === "string" &&
      account[field].trim().toLocaleLowerCase() === normalizedValue,
  );
}

async function getAccounts(baseUrl: string) {
  const response = await fetch(`${baseUrl}/Account`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`โหลดข้อมูลจาก /Account ไม่สำเร็จ (HTTP ${response.status})`);
  }

  const accounts: unknown = await response.json();
  if (!Array.isArray(accounts)) {
    throw new Error("รูปแบบข้อมูลจาก MockAPI ไม่ถูกต้อง");
  }
  return accounts as unknown[];
}

export async function GET() {
  const baseUrl = getMockApiBaseUrl();
  if (!baseUrl) {
    return Response.json(
      { error: "ไม่พบการตั้งค่า NEXT_PUBLIC_MOCKAPI_URL" },
      { status: 500 },
    );
  }

  try {
    const accounts = await getAccounts(baseUrl);
    const staffAccounts = accounts
      .filter(
        (account) => isRecord(account) && Number(account.role_id) === STAFF_ROLE_ID,
      )
      .map(sanitizeAccount)
      .filter((account): account is Record<string, unknown> => account !== null)
      .sort((first, second) => Number(second.id) - Number(first.id));

    return Response.json(staffAccounts);
  } catch (error) {
    console.error("Could not load Staff accounts:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "โหลดข้อมูลบัญชี Staff ไม่สำเร็จ",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const baseUrl = getMockApiBaseUrl();
  if (!baseUrl) {
    return Response.json(
      { error: "ไม่พบการตั้งค่า NEXT_PUBLIC_MOCKAPI_URL" },
      { status: 500 },
    );
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return Response.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const newStaff = parseNewStaff(requestBody);
  if (!newStaff) {
    return Response.json({ error: "ข้อมูลบัญชี Staff ไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const accounts = await getAccounts(baseUrl);
    if (hasDuplicateAccount(accounts, "username", newStaff.username)) {
      return Response.json(
        { error: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" },
        { status: 409 },
      );
    }
    if (hasDuplicateAccount(accounts, "email", newStaff.email)) {
      return Response.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
    }

    const highestStaffId = accounts.reduce<number>((highest, account) => {
      if (!isRecord(account)) return highest;
      const staffId = Number(account.staff_id);
      return Number.isInteger(staffId) && staffId > highest ? staffId : highest;
    }, 0);
    const now = Math.floor(Date.now() / 1000);
    const createResponse = await fetch(`${baseUrl}/Account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newStaff,
        role_id: STAFF_ROLE_ID,
        staff_id: highestStaffId + 1,
        profile_image: "",
        status: "Active",
        created_at: now,
        updated_at: now,
        last_login: null,
      }),
    });

    if (!createResponse.ok) {
      return Response.json(
        { error: `สร้างบัญชีไม่สำเร็จ (HTTP ${createResponse.status})` },
        { status: 502 },
      );
    }

    const createdAccount: unknown = await createResponse.json();
    if (
      !isRecord(createdAccount) ||
      Number(createdAccount.role_id) !== STAFF_ROLE_ID ||
      typeof createdAccount.id !== "number"
    ) {
      return Response.json(
        { error: "MockAPI ส่งข้อมูลบัญชีที่สร้างกลับมาไม่ถูกต้อง" },
        { status: 502 },
      );
    }

    const safeAccount = sanitizeAccount(createdAccount);
    if (!safeAccount) {
      return Response.json(
        { error: "MockAPI ส่งข้อมูลบัญชีที่สร้างกลับมาไม่ถูกต้อง" },
        { status: 502 },
      );
    }

    return Response.json(safeAccount, { status: 201 });
  } catch (error) {
    console.error("MockAPI Staff account creation failed:", error);
    return Response.json(
      { error: "เชื่อมต่อ MockAPI ไม่สำเร็จ กรุณาลองอีกครั้ง" },
      { status: 502 },
    );
  }
}
