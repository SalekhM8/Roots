"use client";

import { useState } from "react";
import { assignRoleAction } from "./actions";

export function AssignRoleForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "prescriber">("prescriber");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);

    const result = await assignRoleAction({ email, role });
    if (result.success) {
      setMessage({ type: "success", text: `${role} role assigned to ${email}.` });
      setEmail("");
    } else {
      setMessage({ type: "error", text: result.error ?? "Something went wrong." });
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-roots-navy/70">
          User Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="w-full rounded-lg border border-roots-green/15 px-3 py-2 text-sm focus:border-roots-green focus:outline-none focus:ring-1 focus:ring-roots-green"
        />
      </div>
      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-roots-navy/70">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "prescriber")}
          className="rounded-lg border border-roots-green/15 px-3 py-2 text-sm focus:border-roots-green focus:outline-none focus:ring-1 focus:ring-roots-green"
        >
          <option value="admin">Admin</option>
          <option value="prescriber">Prescriber</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-roots-green px-4 py-2 text-sm font-medium text-roots-cream hover:bg-roots-green/90 disabled:opacity-50"
      >
        {pending ? "Assigning..." : "Assign Role"}
      </button>
      {message && (
        <p
          className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
