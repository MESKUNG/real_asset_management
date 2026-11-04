"use client";

////////////////////////////////////////////////////
/////////////// เรียกใช้ Library ////////////////////

import Image from "next/image";
import { Button } from "@/components/tailgrids/core/button";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useRef, useState, type FormEvent } from "react";
import { Form } from "react-aria-components";

import { Globe2, MoonHalfLeft5 } from "@tailgrids/icons";

////////////////////////////////////////////////////

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitted(true);
    formRef.current?.reset();
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
            ref={formRef}
            className="flex flex-col items-center gap-6 w-full max-w-sm p-4"
          >
            <TextField className="w-full" name="email" type="email" required>
              <FieldLabel className="font-bold">ชื่อ / Username</FieldLabel>

              <Input
                id="email"
                name="email"
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
              <Button className="bg-white-600 hover:bg-gray-100 text-black border-2 border-gray-300 rounded-2xl">
                <Globe2 />
                TH
              </Button>
              <Button className="bg-white-600 hover:bg-gray-100 text-black border-2 border-gray-300 rounded-2xl">
                <MoonHalfLeft5 />
              </Button>
            </div>
            <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
              เข้าสู่ระบบ
            </Button>
          </Form>
          <div></div>
        </div>
      </div>
    </>
  );
}
