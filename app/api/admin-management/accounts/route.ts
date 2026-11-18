import {
  getMockApiBaseUrl,
  isRecord,
  sanitizeAccount,
} from "../../staff-management/accounts/accountApi";

const ADMIN_ROLE_ID = 2;

export async function GET() {
  const baseUrl = getMockApiBaseUrl();
  if (!baseUrl) {
    return Response.json(
      { error: "ไม่พบการตั้งค่า NEXT_PUBLIC_MOCKAPI_URL" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${baseUrl}/Account`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(
        `โหลดข้อมูลจาก /Account ไม่สำเร็จ (HTTP ${response.status})`,
      );
    }

    const accounts: unknown = await response.json();
    if (!Array.isArray(accounts)) {
      throw new Error("รูปแบบข้อมูลจาก MockAPI ไม่ถูกต้อง");
    }

    const adminAccounts = accounts
      .filter(
        (account) =>
          isRecord(account) && Number(account.role_id) === ADMIN_ROLE_ID,
      )
      .map(sanitizeAccount)
      .filter((account): account is Record<string, unknown> => account !== null)
      .sort((first, second) => Number(second.id) - Number(first.id));

    return Response.json(adminAccounts);
  } catch (error) {
    console.error("Could not load Admin accounts:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "โหลดข้อมูลบัญชี Admin ไม่สำเร็จ",
      },
      { status: 502 },
    );
  }
}
