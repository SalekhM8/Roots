"use client";

import { useState } from "react";
import { removeRoleAction } from "./actions";

interface RemoveRoleButtonProps {
  userId: string;
  role: "admin" | "prescriber";
}

export function RemoveRoleButton({ userId, role }: RemoveRoleButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    if (!confirm(`Remove ${role} role from this user?`)) return;
    setPending(true);
    const result = await removeRoleAction({ userId, role });
    if (!result.success) {
      alert(result.error ?? "Failed to remove role.");
    }
    setPending(false);
  }

  return (
    <button
      onClick={handleRemove}
      disabled={pending}
      className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "..." : `Remove ${role}`}
    </button>
  );
}
