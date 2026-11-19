"use client";

import AdminAccountFormModal from "./AdminAccountFormModal";
import type { AdminAccountChanges } from "./types";

type AddAdminModalProps = {
  onClose: () => void;
  onSave: (changes: AdminAccountChanges) => Promise<void>;
};

export default function AddAdminModal({
  onClose,
  onSave,
}: AddAdminModalProps) {
  return <AdminAccountFormModal onClose={onClose} onSave={onSave} />;
}
