import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { requireUser } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-roots-cream">{children}</main>
      <Footer />
    </>
  );
}
