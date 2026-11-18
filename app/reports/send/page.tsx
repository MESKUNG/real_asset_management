import { RoleGate } from "../../inventories/_components/ui";
import SendToPresident from "../_components/SendToPresident";

// หน้าจัดทำรายงานเสนอ President เปิดได้เฉพาะ Admin
export default function SendReportPage() {
  return (
    <RoleGate allow={["admin"]}>
      <SendToPresident />
    </RoleGate>
  );
}
