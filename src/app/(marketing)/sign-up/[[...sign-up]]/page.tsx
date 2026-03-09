import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-roots-cream py-20">
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
