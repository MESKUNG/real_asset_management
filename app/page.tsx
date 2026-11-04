"use client";

////////////////////////////////////////////////////
/////////////// เรียกใช้ Library ////////////////////

import Image from "next/image";
import { Button } from "@/components/tailgrids/core/button";
import { FieldLabel } from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useState, type FormEvent } from "react";
import { Form } from "react-aria-components";
import { useRouter } from "next/navigation";

import { Globe2, MoonHalfLeft5 } from "@tailgrids/icons";

////////////////////////////////////////////////////

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type RoleName = "user" | "admin" | "president" | "superadmin";

type Credential = {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role: RoleName;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const apiBaseUrl = process.env.NEXT_PUBLIC_MOCKAPI_URL?.trim();

    setErrorMessage("");

    if (!apiBaseUrl) {
      setErrorMessage("ไม่พบการตั้งค่า Mock API ใน .env.local");
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = apiBaseUrl.replace(/\/+$/, "");
      const usersResponse = await fetch(
        `${baseUrl}/Account`,
      );

      if (!usersResponse.ok) {
        setErrorMessage(
          `โหลดข้อมูลผู้ใช้จาก /Account ไม่สำเร็จ (HTTP ${usersResponse.status})`,
        );
        return;
      }

      const usersPayload: unknown = await usersResponse.json();
      if (!Array.isArray(usersPayload)) {
        setErrorMessage("รูปแบบข้อมูลจาก resource users ไม่ถูกต้อง");
        return;
      }

      const user = usersPayload.find(
        (item) =>
          isRecord(item) &&
          item.username === username &&
          item.password === password,
      );

      if (!isRecord(user)) {
        setErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (typeof user.id !== "number" || typeof user.role_id !== "number") {
        setErrorMessage("ข้อมูลผู้ใช้ไม่มี id หรือ role_id ที่ถูกต้อง");
        return;
      }

      // ดึง Role ที่ตรงกับ role_id ของผู้ใช้
      const rolesResponse = await fetch(`${baseUrl}/Role`);

      if (!rolesResponse.ok) {
        setErrorMessage(
          `โหลดข้อมูล Roles จาก /Role ไม่สำเร็จ (HTTP ${rolesResponse.status})`,
        );
        return;
      }

      const rolesPayload: unknown = await rolesResponse.json();

      if (!Array.isArray(rolesPayload)) {
        setErrorMessage("รูปแบบข้อมูลจาก resource roles ไม่ถูกต้อง");
        return;
      }

      const matchedRole = rolesPayload.find(
        (item) => isRecord(item) && item.id === user.role_id,
      );

      if (!isRecord(matchedRole) || typeof matchedRole.role_name !== "string") {
        setErrorMessage(`ไม่พบ Role ที่มี id ${user.role_id}`);
        return;
      }

      const roleName = matchedRole.role_name.toLowerCase();

      if (
        roleName !== "user" &&
        roleName !== "admin" &&
        roleName !== "president" &&
        roleName !== "superadmin"
      ) {
        setErrorMessage("ไม่พบประเภท Role ที่รองรับ");
        return;
      }

      const credential: Credential = {
        id: user.id,
        username: typeof user.username === "string" ? user.username : username,
        email: typeof user.email === "string" ? user.email : "",
        role_id: user.role_id,
        role: roleName,
      };

      localStorage.setItem("credential", JSON.stringify(credential));
      window.dispatchEvent(new Event("credentialchange"));
      router.push("/Dashboard");
    } catch (error) {
      console.error("Mock API request failed:", error);
      setErrorMessage(
        "เชื่อมต่อ Mock API ไม่ได้ กรุณาตรวจสอบ URL และการตั้งค่า CORS",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="bg-white  border-gray-300 border-2 p-4 rounded-2xl w-100">
          <div className="flex text-3xl font-bold underline justify-center">
            <Image
              src="/All images/avengers_doomsday_logo_by_airielashf23_dlc8ekd-fullview.png"
              alt="my photo"
              width={100}
              height={100}
            />
          </div>
          <Form
            onSubmit={handleLogin}
            validationBehavior="native"
            className="flex flex-col items-center gap-6 w-full max-w-sm p-4"
          >
            <TextField className="w-full" name="username" type="text" required>
              <FieldLabel className="font-bold">ชื่อ / Username</FieldLabel>

              <Input
                id="username"
                name="username"
                placeholder="กรอกชื่อ / Username..."
              />
            </TextField>

            <TextField
              className="w-full"
              name="password"
              type="password"
              required
            >
              <FieldLabel className="font-bold">รหัสผ่าน</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="กรอกรหัสผ่าน..."
              />
            </TextField>

            <div className="w-full flex justify-between">
              <Button
                type="button"
                className="bg-white-600 hover:bg-gray-100 text-black border-2 border-gray-300 rounded-2xl"
              >
                <Globe2 />
                TH
              </Button>
              <Button
                type="button"
                className="bg-white-600 hover:bg-gray-100 text-black border-2 border-gray-300 rounded-2xl"
              >
                <MoonHalfLeft5 />
              </Button>
            </div>
            {errorMessage && (
              <p className="w-full text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white"
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </Form>
          <div></div>
        </div>
      </div>
    </>
  );
}
