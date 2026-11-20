// ข้อมูลจากโฟลเดอร์ data/ ที่ห่อด้วย localized() ให้ข้อความไทย (ชื่อสาขา หมายเหตุ ฯลฯ)
// แปลเป็นภาษาอังกฤษตอนอ่านค่าเมื่อผู้ใช้เลือก English (ไม่ได้แก้ไฟล์ใน data/ ของเพื่อน)
// ใช้เฉพาะหน้าตรวจนับ / รายงาน / สแกน ของเรา
import { localized } from "@/lib/i18n";
import { approvals as rawApprovals } from "@/data/approvals";
import { assets as rawAssets } from "@/data/asset";
import { assetHistories as rawAssetHistories } from "@/data/assetHistories";
import { borrowRequests as rawBorrowRequests } from "@/data/borrowRequests";
import { branches as rawBranches } from "@/data/branches";
import { categories as rawCategories } from "@/data/catagories";
import { repairRequests as rawRepairRequests } from "@/data/repairRequests";
import { vendors as rawVendors } from "@/data/vendor";

export const approvals = localized(rawApprovals);
export const assets = localized(rawAssets);
export const assetHistories = localized(rawAssetHistories);
export const borrowRequests = localized(rawBorrowRequests);
export const branches = localized(rawBranches);
export const categories = localized(rawCategories);
export const repairRequests = localized(rawRepairRequests);
export const vendors = localized(rawVendors);
