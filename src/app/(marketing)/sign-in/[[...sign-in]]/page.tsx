import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-roots-cream py-20">
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
