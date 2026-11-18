// ส่งออกข้อมูลเป็นไฟล์ Excel (.xlsx) ด้วยไลบรารี exceljs ที่กลุ่มติดตั้งไว้
export type ExcelSheet = {
  name: string;
  rows: Record<string, string | number>[];
};

export async function exportExcel(fileName: string, sheets: ExcelSheet[]) {
  // โหลดไลบรารีเฉพาะตอนกดส่งออก หน้าเว็บจะได้เปิดเร็วขึ้น
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const rows = sheet.rows.length > 0 ? sheet.rows : [{ หมายเหตุ: "ไม่มีข้อมูล" }];
    const headers = Object.keys(rows[0]);

    // ชื่อชีตใน Excel ยาวได้ไม่เกิน 31 ตัวอักษร
    const worksheet = workbook.addWorksheet(sheet.name.slice(0, 31));
    // ความกว้างคอลัมน์ตามข้อความที่ยาวที่สุดในคอลัมน์นั้น
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: Math.max(header.length, ...rows.map((row) => String(row[header] ?? "").length)) + 2,
    }));
    worksheet.addRows(rows);
    worksheet.getRow(1).font = { bold: true };
  }

  // สร้างไฟล์ในหน่วยความจำ แล้วสั่งเบราว์เซอร์ดาวน์โหลด
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
