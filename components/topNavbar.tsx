export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="text-xl font-bold">
          MyWebsite
        </div>

        {/* Menu */}
        <div className="flex items-center gap-6">
          <a href="/">หน้าหลัก</a>
          <a href="/about">เกี่ยวกับเรา</a>
          <a href="/contact">ติดต่อเรา</a>
        </div>

        {/* Login */}
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            เข้าสู่ระบบ
          </button>
        </div>

      </div>
    </nav>
  );
}