import Link from "next/link";
import { SHOP_LINKS, SUPPORT_LINKS, ROUTES } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";

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

          {/* About */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              About
            </h3>
            <p className="text-sm leading-relaxed text-roots-cream/80">
              We believe everyone deserves access to safe, effective weight
              management. Every consultation is reviewed by a qualified
              prescriber. Every order handled with care.
            </p>
            <Link
              href={ROUTES.about}
              className="mt-3 inline-block border-b border-roots-cream/40 pb-0.5 text-sm font-medium transition-opacity duration-200 hover:opacity-80"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Lumina Pharma disclosure */}
        <div className="mt-12 border-t border-roots-line-soft pt-8">
          <p className="text-center text-xs leading-relaxed text-roots-cream/50">
            Prescription services provided in partnership with Lumina Pharma Ltd
            (Company No. 16803872), a GPhC-registered pharmacy. All prescriptions
            are reviewed and approved by qualified prescribers.
          </p>
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
