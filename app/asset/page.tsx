'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Settings,
  Bell,
  User,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { branches as defaultBranches, Branch } from '@/data/branches';
import { roles } from '@/data/role';

const STORAGE_KEY = 'ram_branches_data';

export default function ManageBranchesPage() {
  const router = useRouter();

  // role_id: 2 = Admin, 3 = President, 4 = Superadmin (ค่าเริ่มต้น 4)
  const [roleId, setRoleId] = useState<number>(4);
  const [userName, setUserName] = useState<string>('สมชาย ใจดี');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchList, setBranchList] = useState<Branch[]>(defaultBranches);
  const [currentPage, setCurrentPage] = useState(1);

  // โหลดข้อมูลสาขาและข้อมูล User จาก localStorage (ถ้ามี)
  useEffect(() => {
    const savedBranches = localStorage.getItem(STORAGE_KEY);
    if (savedBranches) {
      try {
        setBranchList(JSON.parse(savedBranches));
      } catch {
        setBranchList(defaultBranches);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBranches));
    }

    // พยายามอ่านข้อมูล User ที่เพื่อนเก็บไว้ตอน Login (รองรับคีย์ทั่วไป)
    const savedUser =
      localStorage.getItem('user') ||
      localStorage.getItem('currentUser') ||
      localStorage.getItem('account');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.first_name) {
          setUserName(`${parsed.first_name} ${parsed.last_name || ''}`.trim());
        }
        if (parsed.role_id && [2, 3, 4].includes(Number(parsed.role_id))) {
          setRoleId(Number(parsed.role_id));
        }
      } catch {
        // ใช้ค่าเริ่มต้นหากอ่านไม่ได้
      }
    }
  }, []);

  const currentRoleName =
    roles.find((r) => r.id === roleId)?.name || 'Superadmin';

  // Superadmin (4) และ President (3) เพิ่มและลบสาขาได้
  const canManageStructure = roleId === 4 || roleId === 3;

  const filteredBranches = branchList.filter(
    (b) =>
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = filteredBranches.filter(
    (b) => b.status === 'active'
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#1E2338] flex flex-col">
      {/* แถบสลับสิทธิ์ทดสอบ (อิงตาม role_id ใน data/role.ts) */}
      <div className="bg-slate-800 text-white text-xs px-4 py-2 flex items-center justify-center gap-2">
        <span className="text-slate-300">ทดสอบสิทธิ์ (role_id):</span>
        {[4, 3, 2].map((id) => {
          const r = roles.find((item) => item.id === id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => setRoleId(id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                roleId === id
                  ? 'bg-[#4B49D4] text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {r?.name} ({id})
            </button>
          );
        })}
      </div>

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-xl bg-[#F4F5F9] hover:bg-slate-200/70 flex items-center justify-center text-[#1E2338] transition-colors"
              aria-label="เมนู"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-[#1E2338] leading-tight">
                {userName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentRoleName} · ผู้ดูแลระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="p-2 text-slate-600 hover:text-[#1E2338] transition-colors"
              aria-label="ตั้งค่า"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-600 hover:text-[#1E2338] transition-colors"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-[#ECEBFA] border border-[#4B49D4]/30 flex items-center justify-center text-[#4B49D4] ml-1"
              aria-label="โปรไฟล์"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#1E2338]">จัดการสาขา</h1>
            <p className="text-xs text-slate-400 mt-1">
              ข้อมูลสาขาและสถานที่ตั้งขององค์กร
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัส หรือชื่อสาขา"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-sm text-[#1E2338] placeholder:text-slate-400 focus:outline-none focus:border-[#4B49D4] focus:ring-2 focus:ring-[#4B49D4]/15 transition-all"
            />
          </div>

          {/* Summary Count */}
          <p className="text-xs text-slate-500 mb-3">
            {filteredBranches.length} รายการ · เปิดใช้งาน {activeCount} รายการ
          </p>

          {/* Add Branch Button (Superadmin=4, President=3) */}
          {canManageStructure && (
            <button
              type="button"
              onClick={() => router.push('/add')}
              className="w-full py-3.5 px-4 mb-4 rounded-xl bg-[#4B49D4] hover:bg-[#3f3dc2] active:scale-[0.99] text-white text-sm font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>เพิ่มสาขา</span>
            </button>
          )}

          {/* Branch Cards List */}
          <div className="space-y-3.5">
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#1E2338]">
                    {branch.code} · {branch.name}
                  </h3>
                  {branch.status === 'inactive' && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      ปิดใช้งาน
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {branch.address}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  รหัสระบบ: {branch.id} · โทร: {branch.phone || '-'}
                </p>

                {/* Action Buttons */}
                <div
                  className={`mt-4 grid gap-2.5 ${
                    canManageStructure ? 'grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/edit?id=${encodeURIComponent(branch.id)}`)
                    }
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] text-[#1E2338] text-xs font-semibold border border-slate-200 transition-all"
                  >
                    ดู / แก้ไข
                  </button>

                  {canManageStructure && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/delete?id=${encodeURIComponent(branch.id)}`
                        )
                      }
                      className="py-2.5 px-4 rounded-xl bg-[#FDF2F2] hover:bg-[#FBE4E4] active:scale-[0.99] text-[#D9534F] text-xs font-semibold transition-all"
                    >
                      ลบรายการ
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredBranches.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-sm text-slate-400">
                ไม่พบข้อมูลสาขาที่ค้นหา
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="mt-6">
            <p className="text-xs text-slate-500 mb-3">
              แสดง 1–{filteredBranches.length} จาก {branchList.length} รายการ
            </p>

            <div className="flex items-center justify-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white transition-colors"
                aria-label="หน้าก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#ECEBFA] text-[#4B49D4]'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <span className="px-1.5 text-slate-400">...</span>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-lg text-slate-600 hover:bg-white font-medium transition-colors"
              >
                1
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white transition-colors"
                aria-label="หน้าถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}