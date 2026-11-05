"use client";

////////////////////////////////////////////////////////////
////////////////////////// รวม Library //////////////////////////

import Image from "next/image";
import { useEffect, useState } from "react";

import { TextField } from "./tailgrids/core/text-field";
import { InputGroup, InputGroupInput } from "./tailgrids/core/input-group";

import { AvatarBadge } from "@/components/tailgrids/core/avatar";

import { Search1, Bell1, Gear1 } from "@tailgrids/icons";
import { Button } from "./tailgrids/core/button";

////////////////////////////////////////////////////////////

type Account = {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  position?: string;
};

type Credential = {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role: "user" | "admin" | "president" | "superadmin";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getProfileImage(account: Record<string, unknown>): string | undefined {
  const imageFields = [
    "avatar",
    "profile_image",
    "profileImage",
    "profile_picture",
    "profilePicture",
    "image_url",
    "imageUrl",
    "photo",
    "picture",
    "image",
  ];

  for (const field of imageFields) {
    const image = account[field];
    if (typeof image === "string" && image.trim()) {
      return image.trim();
    }
  }
}

export default function TopNavbar() {
  const [user, setUser] = useState<Account | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let requestController: AbortController | null = null;

    const fetchAccount = async () => {
      requestController?.abort();
      const controller = new AbortController();
      requestController = controller;
      setIsLoadingAccount(true);

      try {
        const credentialString = localStorage.getItem("credential");

        if (!credentialString) {
          if (active) {
            setUser(null);
            setIsLoadingAccount(false);
          }
          return;
        }

        const credential: Credential = JSON.parse(credentialString);
        if (active) {
          setUser({
            id: credential.id,
            username: credential.username,
            email: credential.email,
          });
        }

        const baseUrl = process.env.NEXT_PUBLIC_MOCKAPI_URL?.trim();

        if (!baseUrl) {
          throw new Error("ไม่พบการตั้งค่า NEXT_PUBLIC_MOCKAPI_URL");
        }

        const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/Account`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `โหลดข้อมูล Account ไม่สำเร็จ (HTTP ${response.status})`,
          );
        }

        const accountsData: unknown = await response.json();
        if (!Array.isArray(accountsData)) {
          throw new Error("รูปแบบข้อมูล Account ไม่ถูกต้อง");
        }

        const account = accountsData.find(
          (item): item is Record<string, unknown> =>
            isRecord(item) &&
            (typeof item.id === "string" || typeof item.id === "number") &&
            String(item.id) === String(credential.id),
        );

        if (!account) {
          throw new Error(`ไม่พบ Account ที่มี id ${credential.id}`);
        }

        const data: Account = {
          id: typeof account.id === "number" ? account.id : credential.id,
          username:
            typeof account.username === "string"
              ? account.username
              : credential.username,
          email:
            typeof account.email === "string"
              ? account.email
              : credential.email,
          avatar: getProfileImage(account),
          position:
            typeof account.position === "string" ? account.position : undefined,
        };

        if (active) setUser(data);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Fetch Account Error:", error);
        }
      } finally {
        if (active && requestController === controller) {
          setIsLoadingAccount(false);
        }
      }
    };

    fetchAccount();

    window.addEventListener("credentialchange", fetchAccount);
    window.addEventListener("storage", fetchAccount);

    return () => {
      active = false;
      requestController?.abort();
      window.removeEventListener("credentialchange", fetchAccount);
      window.removeEventListener("storage", fetchAccount);
    };
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max mx-auto px-6 h-16 flex items-center justify-between">
        {/* Menu */}
        <div className="flex items-center gap-6 justify-between w-full">
          <TextField className="flex flex-col gap-2">
            <InputGroup className="w-64 gap-4 border-gray-300">
              <Search1 className="size-4.5 ml-2" />
              <InputGroupInput placeholder="ค้นหาชื่อ หรือรหัสทรัพย์สิน..." />
            </InputGroup>
          </TextField>

          <div className="flex items-center gap-4">
            <Button>
              <Bell1 className="size-4.5" />
            </Button>

            <Button>
              <Gear1 className="size-4.5" />
            </Button>
          </div>
        </div>

        {/* Login */}
        <div>
          <figure className="flex justify-center items-center gap-2 w-full">
            <div className="relative size-10 shrink-0">
              {user?.avatar && failedImage !== user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username || "User"}
                  width={40}
                  height={40}
                  unoptimized
                  className="size-full rounded-full object-cover"
                  onError={() => setFailedImage(user.avatar ?? null)}
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-full bg-primary-50 text-primary-500 uppercase">
                  {user?.username?.charAt(0) || "U"}
                </div>
              )}
              <AvatarBadge status="online" />
            </div>

            <figcaption>
              <p className="text-sm font-medium">
                {user?.username ||
                  (isLoadingAccount ? "กำลังโหลด..." : "กรุณาเข้าสู่ระบบ")}
              </p>

              <p className="text-xs text-gray-500">
                {user?.position || user?.email || ""}
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </nav>
  );
}
