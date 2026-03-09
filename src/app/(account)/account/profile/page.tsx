import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getCustomerProfile } from "@/server/queries/account";
import { AccountNav } from "@/components/account/account-nav";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getCustomerProfile(user.id);

  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-2 text-[32px] font-medium text-roots-green md:text-[42px]">
        Profile
      </h1>
      <p className="mb-8 text-roots-navy/60">
        Manage your personal information.
      </p>

      <AccountNav />

      <div className="mt-8 max-w-xl">
        <ProfileForm profile={profile} email={user.email} />
      </div>
    </div>
  );
}
