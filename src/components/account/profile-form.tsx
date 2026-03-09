"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/app/(account)/account/profile/actions";

interface ProfileFormProps {
  profile: {
    firstName: string;
    lastName: string;
    phone: string | null;
    dateOfBirth: Date;
  } | null;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
      : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProfileAction({
        firstName,
        lastName,
        phone: phone || undefined,
        dateOfBirth,
      });

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[var(--radius-hero)] border border-roots-green/10 bg-white p-8">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <Input
        label="Date of Birth"
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        required
      />

      <Input
        label="Phone (optional)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-roots-navy">Email</label>
        <input
          type="email"
          value={email}
          className="h-[var(--btn-height)] w-full rounded-[var(--radius-input)] border border-roots-green/20 bg-roots-cream/50 px-5 text-base text-roots-navy/50 outline-none"
          disabled
        />
        <p className="mt-1 text-xs text-roots-navy/40">
          Email is managed through your sign-in provider.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Profile updated.</p>}

      <Button
        type="submit"
        loading={isPending}
        disabled={!firstName || !lastName || !dateOfBirth}
        className="w-full"
      >
        Save Changes
      </Button>
    </form>
  );
}
