// ส่งออกข้อมูลเป็นไฟล์ Excel (.xlsx) ด้วยไลบรารี SheetJS
export type ExcelSheet = {
  name: string;
  rows: Record<string, string | number>[];
};

export async function exportExcel(fileName: string, sheets: ExcelSheet[]) {
  // โหลดไลบรารีเฉพาะตอนกดส่งออก หน้าเว็บจะได้เปิดเร็วขึ้น
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const rows = sheet.rows.length > 0 ? sheet.rows : [{ หมายเหตุ: "ไม่มีข้อมูล" }];
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // ตั้งความกว้างคอลัมน์ตามข้อความที่ยาวที่สุด
    const headers = Object.keys(rows[0]);
    worksheet["!cols"] = headers.map((header) => ({
      wch: Math.max(header.length, ...rows.map((row) => String(row[header] ?? "").length)) + 2,
    }));

    // ชื่อชีตใน Excel ยาวได้ไม่เกิน 31 ตัวอักษร
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  }

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
