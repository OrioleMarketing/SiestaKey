import { Link } from "wouter";
import { MapPin, Mail, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-ocean-deep)] text-white">
      {/* Wave top */}
      <div className="w-full overflow-hidden leading-none" style={{ marginBottom: "-2px" }}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: "block", transform: "scaleY(-1)" }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--color-white-sand)" />
        </svg>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <img
                src="/manus-storage/Shop-Logo-Transparent_a1a04d98.png"
                alt="Shop in Siesta Key"
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Your premier guide to discovering the best businesses, dining, shopping, and activities on Florida's most beautiful island.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-serif font-semibold text-sm uppercase tracking-widest text-white/50 mb-4">Explore</h4>
            <ul className="space-y-2">
              {[
                { href: "/directory", label: "All Businesses" },
                { href: "/directory/dining", label: "Dining" },
                { href: "/directory/shopping", label: "Shopping" },
                { href: "/directory/activities", label: "Activities" },
                { href: "/directory/nightlife", label: "Nightlife" },
                { href: "/directory/wellness", label: "Wellness" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="font-serif font-semibold text-sm uppercase tracking-widest text-white/50 mb-4">For Businesses</h4>
            <ul className="space-y-2">
              {[
                { href: "/submit-listing", label: "Submit Your Listing" },
                { href: "/claim", label: "Claim Your Business" },
                { href: "/pricing", label: "View Plans & Pricing" },
                { href: "/pricing", label: "Premium Listings" },
                { href: "/submit-listing", label: "Advertise With Us" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-sm uppercase tracking-widest text-white/50 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/40" />
                Siesta Key, FL 34242
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="w-4 h-4 shrink-0 text-white/40" />
                info@shopinsiestakey.com
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/submit-listing" className="btn-coral text-sm px-4 py-2">
                Get Listed Today
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          {/* Legal links row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4">

            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/50 hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>
            <span className="text-white/20 text-xs">|</span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/50 hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              Terms &amp; Conditions
            </a>
          </div>
          {/* Copyright row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40 text-center md:text-left">
              Copyright &copy; {new Date().getFullYear()} Shop In Siesta Key &nbsp;|&nbsp; An{" "}
              <a
                href="https://oriolemarketing.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                Oriole Marketing
              </a>{" "}
              Local Directory
            </p>
            <p className="text-xs text-white/30">
              Siesta Key, Sarasota, Florida &mdash; America&rsquo;s #1 Beach
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
