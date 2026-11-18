import { Suspense } from "react";
import AuditBoard from "../_components/auditBoard";
import { Loading, RoleGate } from "../_components/ui";

// useSearchParams ใน AuditBoard ต้องอยู่ใน Suspense ตามกฎของ Next.js
export default function AuditPage() {
  return (
    <RoleGate allow={["user", "admin"]}>
      <Suspense fallback={<Loading />}>
        <AuditBoard />
      </Suspense>
    </RoleGate>
  );
}
