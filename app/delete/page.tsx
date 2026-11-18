'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, X, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { branches as defaultBranches, Branch } from '@/data/branches';

const STORAGE_KEY = 'ram_branches_data';

function DeleteBranchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('id') || 'BR-001';

  const [targetBranch, setTargetBranch] = useState<Branch>(defaultBranches[0]);
  const [confirmCode, setConfirmCode] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const list: Branch[] = saved ? JSON.parse(saved) : defaultBranches;
    const found = list.find((b) => b.id === branchId) || list[0];
    if (found) setTargetBranch(found);
  }, [branchId]);

  const isMatched = confirmCode.trim() === targetBranch.id;

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const list: Branch[] = saved ? JSON.parse(saved) : defaultBranches;
    const filtered = list.filter((b) => b.id !== targetBranch.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    alert(`ลบสาขา "${targetBranch.id} · ${targetBranch.name}" เรียบร้อยแล้ว`);
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
          <h1 className="text-2xl font-bold text-[#1E2338]">ลบสาขา</h1>
          <p className="text-xs text-slate-400 mt-1.5 mb-5">
            สาขาทั้งหมด / {targetBranch.id} / ยืนยันการลบ
          </p>

          <form
            onSubmit={handleConfirmDelete}
            className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2F2] flex items-center justify-center text-[#D9534F] mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-[#1E2338]">
              ยืนยันการลบสาขา?
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>

            {/* Target Branch Info Box */}
            <div className="bg-[#F8F9FB] rounded-xl p-4 mb-5 space-y-1">
              <p className="text-xs text-slate-400">
                {targetBranch.id} ({targetBranch.code})
              </p>
              <h3 className="text-base font-bold text-[#1E2338]">
                {targetBranch.name}
              </h3>
              <p className="text-xs text-slate-400 pt-0.5">สาขาที่ต้องการลบ</p>
              <p
                className={`text-xs font-medium pt-0.5 ${
                  targetBranch.status === 'active'
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              >
                {targetBranch.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </p>
            </div>

            {/* Confirmation Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#1E2338] mb-1.5">
                พิมพ์รหัสสาขาเพื่อยืนยัน <span className="text-[#1E2338]">*</span>
              </label>
              <input
                type="text"
                required
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                placeholder={targetBranch.id}
                className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 text-sm text-[#1E2338] placeholder:text-slate-400 focus:outline-none focus:border-[#D9534F] focus:ring-2 focus:ring-[#D9534F]/15 transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={!isMatched}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isMatched
                    ? 'bg-[#D9534F] hover:bg-[#c9302c] text-white shadow-sm cursor-pointer active:scale-[0.99]'
                    : 'bg-[#FDF2F2] text-[#D9534F]/80 cursor-not-allowed'
                }`}
              >
                ยืนยันการลบ
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

export default function DeleteBranchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">กำลังโหลด...</div>}>
      <DeleteBranchContent />
    </Suspense>
  );
}