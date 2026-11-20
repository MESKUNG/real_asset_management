"use client";

import AdminAccountFormModal from "./AdminAccountFormModal";
import type { AdminAccount, AdminAccountChanges } from "./types";

type EditAdminModalProps = {
  account: AdminAccount;
  onClose: () => void;
  onSave: (changes: AdminAccountChanges) => Promise<void>;
};

export default function EditAdminModal({
  account,
  onClose,
  onSave,
}: EditAdminModalProps) {
  return (
    <AdminAccountFormModal
      account={account}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
