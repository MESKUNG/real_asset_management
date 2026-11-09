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

function isRecord(value: unknown): value is Record<string, unknown> {   //ฟังก์ชันช่วยตรวจสอบว่าข้อมูลที่ได้รับเป็น Object หรือไม่ ตรวจสอบรูปแบบข้อมูลก่อนนำข้อมูลจาก API มาใช้งาน ช่วยลดปัญหาการเข้าถึง Property ที่ไม่มีอยู่จริง
  return typeof value === "object" && value !== null && !Array.isArray(value);    
}

type RoleName = "user" | "admin" | "president" | "superadmin";      //ตัวแปรที่ใช้ Type นี้สามารถมีค่าได้เพียง 4 แบบเท่านั้น

type Credential = {   //กำหนด Type ของ Credential ที่ใช้เก็บข้อมูลผู้ใช้หลังจากเข้าสู่ระบบสำเร็จ
  id: number;
  username: string;
  email: string;
  role_id: number;
  role: RoleName;
  branch_id?: string;    //ไม่มีสาขาก็ได้
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);      //ตรวจสอบว่าขณะนี้กำลังเข้าสู่ระบบอยู่หรือไม่ false เป็นค่าเริ่มต้น
  const [errorMessage, setErrorMessage] = useState("");      //ใช้เก็บข้อความ Error ที่เกิดขึ้นระหว่าง Login
  const router = useRouter();     //เป็น Hook ของ Next.js ที่ใช้สำหรับจัดการ Navigation หรือการเปลี่ยนหน้า

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {   //ฟังก์ชัน handleLogin จะถูกเรียกเมื่อผู้ใช้กดปุ่มเข้าสู่ระบบ  และ async หมายถึงฟังก์ชันนี้สามารถใช้ await ได้ เพราะต้องรอ API ตอบกลับ
    e.preventDefault();         //ป้องกันการรีเฟรชหน้าเว็บเมื่อฟอร์มถูกส่ง

    const formData = new FormData(e.currentTarget);           //FormData เป็น Web API ที่ช่วยรวบรวมข้อมูลจาก Form   //ส่วน e.currentTarget หมายถึง Form Element ที่กำลังทำงานอยู่
    const username = String(formData.get("username") ?? "").trim();      //ใช้ String และ trim() เพื่อเอาช่องว่างออก
    const password = String(formData.get("password") ?? "");
    const apiBaseUrl = process.env.NEXT_PUBLIC_MOCKAPI_URL?.trim();        //ดึง URL ของ MockAPI จากไฟล์ .env.local

    setErrorMessage("");     //ล้าง Error เดิม

    if (!apiBaseUrl) {           //ตรวจสอบว่ามี API URL หรือไม่
      setErrorMessage("ไม่พบการตั้งค่า Mock API ใน .env.local");
      return;
    }

    setIsLoading(true);   //เริ่มการโหลด

    try {                     //ใช้ try-catch เพื่อรับ Error ที่เกิดขึ้นในการเข้าสู่ระบบ
      const baseUrl = apiBaseUrl.replace(/\/+$/, "");   //ลบช่องว่างท้ายกับ / ท้าย ของ URL
      const usersResponse = await fetch(            //เรียกใช้ fetch() เพื่อดึงข้อมูลผู้ใช้จาก API  
        `${baseUrl}/Account`,                       //เรียกข้อมูลจาก Resource /Account
      );

      if (!usersResponse.ok) {     //ดักตรวจสอบว่าการดึงข้อมูลผู้ใช้สําเร็จหรือไม่ และถ่าไม่สำเร็จให้แสดงข้อความ Error
        setErrorMessage(
          `โหลดข้อมูลผู้ใช้จาก /Account ไม่สำเร็จ (HTTP ${usersResponse.status})`,  
        );
        return;
      }

      const usersPayload: unknown = await usersResponse.json();         //แปลงข้อมูลที่ได้จาก API เป็น JSON
      if (!Array.isArray(usersPayload)) {          //ตรวจสอบว่า API ส่งข้อมูลเป็น Array หรือไม่  
        setErrorMessage("รูปแบบข้อมูลจาก resource users ไม่ถูกต้อง");
        return;
      }

      const user = usersPayload.find(          //ค้นหาผู้ใช้ที่ตรงกับ Username และ Password
        (item) =>
          isRecord(item) &&        //ตรวจสอบว่าข้อมูลเป็น Object จากฟังชัน IsRecord()
          item.username === username &&     //หา username ที่ตรงกับที่ผู้ใช้กรอก
          item.password === password,        ////หา password ที่ตรงกับที่ผู้ใช้กรอก
      );

      if (!isRecord(user)) {         //หากไม่พบ
        setErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (typeof user.id !== "number" || typeof user.role_id !== "number") {       //ถ้า id หรือ role_id ของผู้ใช้ไม่ใช่ตัวเลข ให้แสดงข้อความ Error
        setErrorMessage("ข้อมูลผู้ใช้ไม่มี id หรือ role_id ที่ถูกต้อง");
        return;
      }

      const rolesResponse = await fetch(`${baseUrl}/Role`);   //เรียกข้อมูลจาก Resource /Role

      if (!rolesResponse.ok) {      //ตรวจสอบว่าการดึงข้อมูล Role สำเร็จหรือไม่     .ok จะมีค่าเป็น true ก็ต่อเมื่อ HTTP Status Code ที่เซิร์ฟเวอร์ตอบกลับมาอยู่ในช่วง 200-299
        setErrorMessage(
          `โหลดข้อมูล Roles จาก /Role ไม่สำเร็จ (HTTP ${rolesResponse.status})`,
        );
        return;
      }

      const rolesPayload: unknown = await rolesResponse.json();   //แปลงข้อมูลที่ได้จาก API เป็น JSON และเก็บไว้ใน rolesPayload

      if (!Array.isArray(rolesPayload)) {          //ตรวจสอบว่าเป็น Array
        setErrorMessage("รูปแบบข้อมูลจาก resource roles ไม่ถูกต้อง");
        return;
      }

      const matchedRole = rolesPayload.find(        //ค้นหา Role ที่ตรงกับ role_id
        (item) => isRecord(item) && item.id === user.role_id,
      );

      if (!isRecord(matchedRole) || typeof matchedRole.role_name !== "string") {         //ถ้าไม่พบ Role หรือ role_name ไม่ใช่ String
        setErrorMessage(`ไม่พบ Role ที่มี id ${user.role_id}`);
        return;
      }

      const roleName = matchedRole.role_name.toLowerCase();  //แปลงชื่อ Role ให้เป็นตัวพิมพ์เล็ก

      if (                     //เป็น Role ที่ระบบมีไหม
        roleName !== "user" &&
        roleName !== "admin" &&
        roleName !== "president" &&
        roleName !== "superadmin"
      ) {
        setErrorMessage("ไม่พบประเภท Role ที่รองรับ");
        return;
      }

      const credential: Credential = {       //เก็บข้อมูลผู้ใช้ใน credential
        id: user.id,                                                                   //นำ ID ของผู้ใช้จาก API มาเก็บใน Credential
        username: typeof user.username === "string" ? user.username : username,       //ถ้า username ไม่ใช่ String ให้ใช้ username ที่ผู้ใช้กรอก
        email: typeof user.email === "string" ? user.email : "",              //ถ้า email ไม่ใช่ String ให้ใช้ ""
        role_id: user.role_id,                                                  //เก็บ ID ของ Role
        role: roleName,                                                    //เก็บชื่อ Role ที่แปลงเป็นตัวพิมพ์เล็กแล้ว
        ...(typeof user.branch_id === "string" && user.branch_id.trim()       //branch_id เป็น String และไม่ใช่ช่องว่าง 
          ? { branch_id: user.branch_id.trim() }                     //ถ้ามี branch_id ให้เก็บใน Credential
          : {}),          //ถ้าไม่มี branch_id ให้เก็บเป็น Object ว่าง
      };

      localStorage.setItem("credential", JSON.stringify(credential));      //เก็บข้อมูล Credential ลงใน Local Storage ของ Browser ในรูปแบบ JSON String
      window.dispatchEvent(new Event("credentialchange"));        //แจ้งให้ Component อื่น ๆ ทราบว่ามีการเปลี่ยนแปลง Credential เกิดขึ้น โดยตั้งชื่อ Event นี้ว่า "credentialchange"
      router.push("/Dashboard");               //เปลี่ยนหน้าไป Dashboard
    } catch (error) {             //ถัดจาก try จะทำงานเมื่อเกิด Exception ภายใน try         คือดักจับ Error ที่เกิดขึ้นระหว่างการเข้าสู่ระบบ 
      console.error("Mock API request failed:", error);
      setErrorMessage(
        "เชื่อมต่อ Mock API ไม่ได้ กรุณาตรวจสอบ URL และการตั้งค่า CORS",
      );
    } finally {      //สุดท้าย หยุดโหลด จบ
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
            {errorMessage && (         //ถ้า errorMessage มีข้อความ จะนำข้อความนั้นมาแสดง
              <p className="w-full text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
            <Button
              type="submit"   //ปุ่มเข้าสู่ระบบ
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
