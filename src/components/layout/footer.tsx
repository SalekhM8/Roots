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

        {/* Regulatory disclosure — slim single-line strip, competitor-style.
            Required visible info on every page that discusses a POM (Human
            Medicines Regs 2012, GPhC standards), but the placeholder values
            are suppressed until real registration numbers are populated so
            we never ship a "TODO_GPHC_NUMBER" string to public. Same pattern
            for the Internet Pharmacy logo — hidden until the SVG exists. */}
        {(() => {
          const pharmacyRegOk =
            !PHARMACY.licensedEntity.gphcRegistration.startsWith("TODO");
          const superintendentOk =
            !SUPERINTENDENT_PHARMACIST.name.startsWith("TODO") &&
            !SUPERINTENDENT_PHARMACIST.registerNumber.startsWith("TODO");
          return (
            <div className="mt-10 border-t border-roots-line-soft pt-6 text-[11px] leading-relaxed text-roots-cream/55">
              <p>
                Prescription services are provided in partnership with{" "}
                <span className="text-roots-cream/75">
                  {PHARMACY.licensedEntity.name}
                </span>{" "}
                (Company No.{" "}
                <span className="text-roots-cream/75">
                  {PHARMACY.licensedEntity.companyNumber}
                </span>
                ), a GPhC-registered pharmacy
                {pharmacyRegOk && (
                  <>
                    {" "}— GPhC reg{" "}
                    <a
                      href={PHARMACY.licensedEntity.gphcRegisterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-roots-cream/75 underline underline-offset-2"
                    >
                      {PHARMACY.licensedEntity.gphcRegistration}
                    </a>
                  </>
                )}
                {superintendentOk && (
                  <>
                    . Superintendent pharmacist:{" "}
                    <Link
                      href={`/team/${SUPERINTENDENT_PHARMACIST.slug}`}
                      className="text-roots-cream/75 underline underline-offset-2"
                    >
                      {SUPERINTENDENT_PHARMACIST.name},{" "}
                      {SUPERINTENDENT_PHARMACIST.qualification}
                    </Link>{" "}
                    (GPhC {SUPERINTENDENT_PHARMACIST.registerNumber})
                  </>
                )}
                . Suspected side effects can be reported via the{" "}
                <a
                  href="https://yellowcard.mhra.gov.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-roots-cream/75 underline underline-offset-2"
                >
                  MHRA Yellow Card scheme
                </a>
                .
              </p>
            </div>
          );
        })()}

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
