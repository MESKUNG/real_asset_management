"use client";

////////////////////////////////////////////////////////////
////////////////////////// รวม Library //////////////////////////

import Image from "next/image";
import { useEffect, useState } from "react";

import { TextField } from "./tailgrids/core/text-field";
import { InputGroup, InputGroupInput } from "./tailgrids/core/input-group";

import { AvatarBadge } from "@/components/tailgrids/core/avatar";

import { Search1, Gear1, User2 } from "@tailgrids/icons";
import { Menu } from "lucide-react";
import { Button } from "./tailgrids/core/button";
import NotificationDropdown from "./notifications/NotificationDropdown";

import { useRouter } from "next/navigation";
import { useTranslate } from "@/lib/language";

////////////////////////////////////////////////////////////

type Account = {   //กำหนด Type ของ Account
  id: number;
  username: string;
  email: string;
  avatar?: string;     //อาจไม่มีก็ได้
  position?: string;     //อาจไม่มีก็ได้
};

type Credential = {      //กำหนด credential ของ Account
  id: number;
  username: string;
  email: string;
  role_id: number;
  role: "user" | "admin" | "president" | "superadmin";
};

function isRecord(value: unknown): value is Record<string, unknown> {          //ตรวจสอบว่าข้อมูลที่รับเข้ามาเป็น Object หรือไม่       
  return typeof value === "object" && value !== null && !Array.isArray(value);     //ตรวจสอบว่าเป็น object และไม่ใช่ null และไม่ใช่ Array
}

function getProfileImage(account: Record<string, unknown>): string | undefined {  //ตรวจสอบว่ามี profile_image หรือไม่ ที่มี key เป็น เป็น string และไม่ใช่ค่าว่าง
  const image = account.profile_image;
  if (typeof image === "string" && image.trim()) { //ตรวจสอบว่าเป็น string และไม่ใช่ค่าว่าง
    return image.trim();
  }
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

export default function TopNavbar({
  onOpenMenu,
}: {
  onOpenMenu: () => void;
}) {
  const router = useRouter();
  const translateText = useTranslate();

  const [user, setUser] = useState<Account | null>(null);   //ใช้เก็บข้อมูล Account ของผู้ใช้ที่กำลัง Login อยู่   เก็บข้อมูลได้ทั้ง Type Accout หรือ null  เริ่มต้นเป็น null
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);                //ตรวจสอบว่าระบบกำลังโหลดข้อมูล Account อยู่หรือไม่ เริ่มต้นเป็น true


  useEffect(() => {       
    let active = true;     //เป็นตัวแปรเพื่อใช้ตรวจสอบว่า Component ยังอยู่ใน DOM หรือไม่ เพื่อป้องกันการอัปเดต State หลังจาก Component ถูก unmount แล้ว เช่น กด login แล้วออก
    let requestController: AbortController | null = null;     // AbortController เป็น Web API ที่ช่วยให้เราสามารถยกเลิกงานบางอย่างที่กำลังดำเนินการอยู่ได้ เช่น การ Fetch API null คือยังไม่มี Request ที่กำลังควบคุม

    const fetchAccount = async () => {   //ดึงข้อมูล Account จาก MockAPI async เพราะภายในมีการเรียก API และต้องใช้ await
      requestController?.abort();      //ถ้ามี requestController อยู่แล้ว ให้ยกเลิก request ก่อนหน้า เพื่อป้องกันการเรียก API ซ้ำซ้อน
      const controller = new AbortController();   //สร้าง Controller ใหม่สำหรับ Request รอบปัจจุบัน
      requestController = controller;   //กําหนด requestController เป็น Controller ใหม่ เพราะเมื่อเราเรียก .abort() ไปแล้ว Controller ตัวเดิมจะไม่สามารถนำกลับมาใช้กับ Request ใหม่ได้ตามปกติ
      setIsLoadingAccount(true);      //เมื่อเริ่มดึงข้อมูล Account ให้เปลี่ยนเป็น Loading

      try {
        const credentialString = localStorage.getItem("credential");      //ดึงข้อมูล credential จาก localStorage

        if (!credentialString) {      //ถ้าไม่มี credential
          if (active) {  //ถ้ายังอยู่ใน DOM
            setUser(null);         //กําหนด user เป็น null
            setIsLoadingAccount(false);      //หยุด Loading เพราะไม่มีข้อมูล Account ให้โหลด
          }
          return;
        }

        const credential = JSON.parse(credentialString);       //แปลงข้อมูล credential จาก JSON string เป็น Object
        if (active) {     //ถ้ายังอยู่ใน DOM
          setUser({        //กําหนด user เป็น Object
            id: credential.id,
            username: credential.username,
            email: credential.email,
          });
        }

        const baseUrl = process.env.NEXT_PUBLIC_MOCKAPI_URL?.trim();       //ดึงค่า baseUrl จาก Environment Variable NEXT_PUBLIC_MOCKAPI_URL และตัดช่องว่างด้านหน้าและด้านหลังออก

        if (!baseUrl) {     //ถ้าไม่มี url 
          throw new Error("ไม่พบการตั้งค่า NEXT_PUBLIC_MOCKAPI_URL");  //โยน Error ออกไป แล้วให้ catch ด้านล่างเป็นผู้จัดการ Error
        }

        const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/Account`, {  //ในกรณีที่มี ดึงข้อมูล Account จาก URL ที่กําหนด และตัดช่องว่างด้านหน้าและด้านหลังออก แล้วต่อกับ /Account
          signal: controller.signal,       //ไม่ค่อยเข้าใจแต่เป็นการส่ง Signal จาก AbortController เข้าไปใน Fetch ทำให้เราสามารถยกเลิก Request นี้ได้ด้วย controller.abort(): หากไม่มี signal ต่อให้เรียก .abort() ก็จะไม่สามารถยกเลิก Fetch Request นี้ได้
        });

        if (!response.ok) {  //ตรวจสอบว่า API ตอบกลับสำเร็จหรือไม่ และถ้าไม่
          throw new Error(
            `โหลดข้อมูล Account ไม่สำเร็จ (HTTP ${response.status})`,    //status คือสถานะการตอบกลับจาก API
          );
        }

        const accountsData: unknown = await response.json();   //นำข้อมูลที่ API ตอบกลับมาแปลงเป็น JSON แล้วเก็บไว้ใน accountsData และ เป็น unknown เพราะยังไม่ได้ตรวจสอบโครงสร้างข้อมูล
        if (!Array.isArray(accountsData)) {         //ตรวจสอบว่า accountsData เป็น Array หรือไม่
          throw new Error("รูปแบบข้อมูล Account ไม่ถูกต้อง");
        }

        const account = accountsData.find(      //ค้นหา Account ที่มี id ตรงกับ id ใน credential
          (item): item is Record<string, unknown> =>       //ถ้าเงื่อนไขด้านล่างเป็นจริง item จะเป็น Object ประเภท Record<string, unknown>
            isRecord(item) &&          //ตรวจสอบว่าแต่ละรายการใน Array เป็น Object จริงหรือไม่
            (typeof item.id === "string" || typeof item.id === "number") &&      //id ต้องเป้น string หรือ number
            String(item.id) === String(credential.id),   //id ต้องตรงกับ id ใน credential แม้ ID จาก API จะเป็น Number แต่ ID จาก Credential เป็น String ก็ยังค้นหาเจอ
        );

        if (!account) {   //ถ้าไม่พบ account
          throw new Error(`ไม่พบ Account ที่มี id ${credential.id}`);
        }

        const data: Account = {     //ถ้าเจอ account แล้ว จะเก็บข้อมูล account ไว้ใน data
          id: typeof account.id === "number" ? account.id : credential.id, //ถ้า id ใน account เป็น number จะใช้ id จาก account และถ้าไม่ใช่จะใช้ id จาก credential
          username:                                    //ถ้า username ใน account เป็น string จะใช้ username จาก account และถ้าไม่ใช่จะใช้ username จาก credential
            typeof account.username === "string"
              ? account.username
              : credential.username,
          email:                           //ถ้า email ใน account เป็น string จะใช้ email จาก account และถ้าไม่ใช่จะใช้ email จาก credential
            typeof account.email === "string"
              ? account.email
              : credential.email,
          avatar: getProfileImage(account),       //เรียกใช้ getProfileImage แล้วเก็บค่า url ที่ได้ไว้ใน avatar
          position:
            typeof account.position === "string" ? account.position : undefined,  //ถ้า position ใน account เป็น string จะใช้ position จาก account และถ้าไม่ใช่จะใช้ undefined
        };

        if (active) setUser(data);  //เมื่อได้ข้อมูล Account ที่จัดรูปแบบเรียบร้อยแล้ว จะตรวจสอบว่า Component ยัง Active อยู่หรือไม่ ถ้า Active จะเก็บข้อมูล Account ไว้ใน user โดยการ update state
      } catch (error) {           //ถ้าเกิดข้อผิดพลาดในการดึงข้อมูล Account
        if (!(error instanceof DOMException && error.name === "AbortError")) {  //ถ้า error เป็น DOMException และ error.name เป็น "AbortError"
          console.error("Fetch Account Error:", error); 
        }
      } finally {
        if (active && requestController === controller) { //ถ้า Component ยัง Active อยู่ และ Controller ของ Request ที่กำลังจบอยู่ ยังเป็น Controller ตัวล่าสุดหรือไม่
          setIsLoadingAccount(false);          //เปลี่ยนสถานะ isLoadingAccount เป็น false
        }
      }
    };

    fetchAccount();  //เริ่มการดึงข้อมูล Account

    window.addEventListener("credentialchange", fetchAccount);   //เมื่อมีการเปลี่ยนแปลงข้อมูลบัญชี จะทําการดึงข้อมูล Account ใหม่
    window.addEventListener("storage", fetchAccount);      //เมื่อมีการเปลี่ยนแปลงข้อมูลบัญชี จะทําการดึงข้อมูล Account ใหม่

    return () => {
      active = false;  //แจ้งให้โค้ดทราบว่า Component ไม่ได้ทำงานแล้ว ป้องกันไม่ให้ Request ที่ยังไม่เสร็จมาอัปเดต State ภายหลัง
      requestController?.abort();   //หากยังมี Fetch API ที่กำลังทำงาน จะยกเลิกทันที
      window.removeEventListener("credentialchange", fetchAccount);       //นำ EventListener ออก เพราะถ้าไม่ลบ เมื่อ Navbar ถูกถอดออกจากหน้าเว็บแล้ว Event Listener อาจยังคงอยู่ เมื่อมี Event เกิดขึ้น ก็อาจเรียกฟังก์ชันเก่าที่ไม่จำเป็นอีกต่อไปการ Cleanup จึงช่วยป้องกัน Memory Leak และการทำงานซ้ำโดยไม่จำเป็น
      window.removeEventListener("storage", fetchAccount);
    };
  }, []);       //Dependency Array Effect จะทำงานหลัง Component Mount หรือแสดงผลครั้งแรก

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto flex h-16 w-full min-w-0 items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label={translateText("เปิดเมนู")}
            aria-haspopup="dialog"
            aria-controls="mobile-sidebar-dialog"
            className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 md:hidden"
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>
          <TextField className="hidden flex-col gap-2 md:flex">
            <InputGroup className="w-64 gap-4 border-gray-300">
              <Search1 className="ml-2 size-4.5" />
              <InputGroupInput
                placeholder={translateText("ค้นหาชื่อ หรือรหัสทรัพย์สิน...")}
              />
            </InputGroup>
          </TextField>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <NotificationDropdown />

          <Button
            aria-label={translateText("ตั้งค่าระบบ")}
            onClick={() => router.push("/setting")}
          >
            <Gear1 className="size-4.5" />
          </Button>

          <figure className="flex shrink-0 items-center gap-2">
            <div className="relative size-10 shrink-0">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username || "User"}
                  width={40}
                  height={40}
                  unoptimized
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-full bg-primary-50 text-primary-500 uppercase">
                  {user?.username?.charAt(0) || <User2 />}
                </div>
              )}
              <AvatarBadge status="online" />
            </div>

            <figcaption className="hidden sm:block">
              <p className="w-30 text-sm font-medium">
                {user?.username ||
                  (isLoadingAccount
                    ? translateText("กำลังโหลด...")
                    : translateText("กรุณาเข้าสู่ระบบ"))}
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
