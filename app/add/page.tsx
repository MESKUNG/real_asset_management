'use client';

import React, { useState } from 'react';
import { ArrowLeft, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { branches as defaultBranches, Branch } from '@/data/branches';

const STORAGE_KEY = 'ram_branches_data';

export default function AddBranchPage() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = localStorage.getItem(STORAGE_KEY);
    const list: Branch[] = saved ? JSON.parse(saved) : defaultBranches;

    if (list.some((b) => b.code.toUpperCase() === code.trim().toUpperCase())) {
      alert(`รหัสสาขา "${code}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`);
      return;
    }

    const nextNum = list.length + 1;
    const newBranch: Branch = {
      id: `BR-${String(nextNum).padStart(3, '0')}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      status: isActive ? 'active' : 'inactive',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, newBranch]));
    alert(`เพิ่มสาขา "${newBranch.code} · ${newBranch.name}" เรียบร้อย!`);
    router.push('/asset');
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#1E2338] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-[#F4F5F9] hover:bg-slate-200/70 flex items-center justify-center text-[#1E2338] transition-colors"
              aria-label="ย้อนกลับ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-[#1E2338] leading-tight">
                สมชาย ใจดี
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Superadmin · ผู้ดูแลระบบ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-[#1E2338] mb-5">เพิ่มสาขา</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 space-y-4">
              <h2 className="text-base font-bold text-[#1E2338]">ข้อมูลสาขา</h2>

              {/* รหัสสาขา */}
              <div>
                <label className="block text-sm font-semibold text-[#1E2338] mb-1.5">
                  รหัสสาขา <span className="text-[#1E2338]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="KNN"
                  className="w-full px-3.5 py-3 rounded-xl bg-[#E5E7EB]/70 focus:bg-white border border-transparent focus:border-[#4B49D4] text-sm text-[#1E2338] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4B49D4]/15 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  รหัสไม่ซ้ำกัน เช่น BKK, CNX
                </p>
              </div>

              {/* ชื่อสาขา */}
              <div>
                <label className="block text-sm font-semibold text-[#1E2338] mb-1.5">
                  ชื่อสาขา <span className="text-[#1E2338]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="สาขาขอนแก่น"
                  className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 text-sm text-[#1E2338] placeholder:text-slate-400 focus:outline-none focus:border-[#4B49D4] focus:ring-2 focus:ring-[#4B49D4]/15 transition-all"
                />
              </div>

              {/* ที่อยู่ */}
              <div>
                <label className="block text-sm font-semibold text-[#1E2338] mb-1.5">
                  ที่อยู่ <span className="text-[#1E2338]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="45 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมือง ขอนแก่น 40000"
                  className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 text-sm text-[#1E2338] placeholder:text-slate-400 resize-none focus:outline-none focus:border-[#4B49D4] focus:ring-2 focus:ring-[#4B49D4]/15 transition-all"
                />
              </div>

              {/* เบอร์โทรศัพท์ */}
              <div>
                <label className="block text-sm font-semibold text-[#1E2338] mb-1.5">
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="021000006"
                  className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 text-sm text-[#1E2338] placeholder:text-slate-400 focus:outline-none focus:border-[#4B49D4] focus:ring-2 focus:ring-[#4B49D4]/15 transition-all"
                />
              </div>

              {/* Checkbox เปิดใช้งานสาขานี้ */}
              <div className="pt-1">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border border-slate-300 bg-white peer-checked:bg-[#4B49D4] peer-checked:border-[#4B49D4] flex items-center justify-center transition-colors">
                      {isActive && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[#1E2338]">
                    เปิดใช้งานสาขานี้
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#4B49D4] hover:bg-[#3f3dc2] active:scale-[0.99] text-white text-sm font-semibold shadow-sm transition-all"
              >
                บันทึกข้อมูล
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] text-[#1E2338] text-sm font-semibold border border-slate-200 transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}