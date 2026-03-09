import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ConsultationForm from "@/components/consultation/consultation-form";

export const metadata: Metadata = {
  title: "Mounjaro Consultation",
  description:
    "Complete a medical consultation for the Mounjaro weight loss programme. Reviewed by a qualified prescriber.",
};

export default function MounjaroConsultationPage() {
  return (
    <>
      <Header />
      <main className="bg-roots-cream">
        <div className="page-container py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <ConsultationForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
