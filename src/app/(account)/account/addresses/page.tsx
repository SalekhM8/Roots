import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getCustomerAddresses } from "@/server/queries/account";
import { AccountNav } from "@/components/account/account-nav";
import { AddressList } from "@/components/account/address-list";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPinIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "My Addresses",
};

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await getCustomerAddresses(user.id);

  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-2 text-[32px] font-medium text-roots-green md:text-[42px]">
        Addresses
      </h1>
      <p className="mb-8 text-roots-navy/60">
        Manage your delivery and billing addresses.
      </p>

      <AccountNav />

      <div className="mt-8 max-w-2xl">
        {addresses.length === 0 ? (
          <div className="space-y-4">
            <AddressList addresses={[]} />
            <EmptyState
              icon={<MapPinIcon size={48} />}
              message="No addresses saved yet"
            />
          </div>
        ) : (
          <AddressList addresses={addresses} />
        )}
      </div>
    </div>
  );
}
