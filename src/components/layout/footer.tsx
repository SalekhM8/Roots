import Link from "next/link";
import { SHOP_LINKS, SUPPORT_LINKS, ROUTES } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { PHARMACY, SUPERINTENDENT_PHARMACIST } from "@/lib/clinical/credentials";

export default function Footer() {
  return (
    <footer className="bg-roots-green text-roots-cream">
      {/* Top band — editorial statement */}
      <div className="border-b border-roots-line-soft">
        <div className="page-container py-16 text-center md:py-20">
          <p className="text-display mx-auto max-w-2xl text-2xl font-medium leading-snug md:text-3xl lg:text-[36px]">
            Clinical weight loss and wellness, delivered with care and
            discretion.
          </p>
          <Link
            href={ROUTES.about}
            className="mt-6 inline-block border-b border-roots-cream/60 pb-0.5 text-sm font-medium transition-opacity duration-200 hover:opacity-80"
          >
            About Us
          </Link>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm leading-relaxed text-roots-cream/80">
              A GPhC-registered pharmacy offering clinician-led weight management
              programmes and premium wellness supplements. Based in the UK,
              delivering nationwide.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Customer Care
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn — internal-linking surface for Mounjaro hub + cluster.
              Footer links are a low-effort but reliable signal of topical
              hierarchy for crawlers; every public page inherits them. */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Learn
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/treatments/mounjaro"
                  className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                >
                  Mounjaro information
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/how-does-mounjaro-work"
                  className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                >
                  How Mounjaro works
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/mounjaro-side-effects-uk"
                  className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                >
                  Side effects
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/mounjaro-vs-wegovy"
                  className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                >
                  Mounjaro vs Wegovy
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/mounjaro-vs-ozempic"
                  className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                >
                  Mounjaro vs Ozempic
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.about}
                  className="text-sm text-roots-cream/80 transition-opacity duration-200 hover:opacity-100"
                >
                  About Roots
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory disclosure — GPhC pharmacy + superintendent.
            Required visible information on every page that discusses a POM. */}
        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-roots-line-soft pt-8 md:grid-cols-[auto,1fr] md:items-start md:gap-10">
          {/* Internet Pharmacy logo placeholder. Once GPhC issues the live
              registration the logo links to the register entry per
              regulatory requirement. */}
          <a
            href={PHARMACY.licensedEntity.gphcRegisterUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GPhC Internet Pharmacy register entry"
            className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-md border border-roots-cream/30 bg-roots-cream/5 p-2 text-center text-[10px] leading-tight text-roots-cream/60 transition-opacity hover:opacity-90"
          >
            GPhC Internet Pharmacy logo
          </a>
          <div className="space-y-2 text-xs leading-relaxed text-roots-cream/60">
            <p>
              Prescription services are provided in partnership with{" "}
              <span className="text-roots-cream/80">
                {PHARMACY.licensedEntity.name}
              </span>{" "}
              (Company No.{" "}
              <span className="text-roots-cream/80">
                {PHARMACY.licensedEntity.companyNumber}
              </span>
              ), a GPhC-registered pharmacy. GPhC pharmacy registration number:{" "}
              <span className="text-roots-cream/80">
                {PHARMACY.licensedEntity.gphcRegistration}
              </span>
              .
            </p>
            <p>
              Superintendent pharmacist:{" "}
              <Link
                href={`/team/${SUPERINTENDENT_PHARMACIST.slug}`}
                className="text-roots-cream/85 underline underline-offset-2 hover:opacity-90"
              >
                {SUPERINTENDENT_PHARMACIST.name},{" "}
                {SUPERINTENDENT_PHARMACIST.qualification}
              </Link>{" "}
              (GPhC{" "}
              <a
                href="https://www.pharmacyregulation.org/registers/pharmacist"
                target="_blank"
                rel="noopener noreferrer"
                className="text-roots-cream/80 underline underline-offset-2"
              >
                {SUPERINTENDENT_PHARMACIST.registerNumber}
              </a>
              ).
            </p>
            <p>
              Every prescription is reviewed and approved by a qualified UK
              prescriber. Suspected side effects can be reported to the MHRA
              via the{" "}
              <a
                href="https://yellowcard.mhra.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-roots-cream/80 underline underline-offset-2"
              >
                Yellow Card scheme
              </a>
              .
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-roots-line-soft pt-6 text-xs text-roots-cream/60 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Roots Pharmacy. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {/* Social links — placeholders until real URLs provided */}
            {["Facebook", "Instagram", "X"].map((label) => (
              <span key={label} className="cursor-pointer transition-opacity hover:opacity-80">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
