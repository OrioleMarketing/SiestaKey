import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/directory/dining", label: "Dining" },
    { href: "/directory/activities", label: "Activities" },
    { href: "/directory/shopping", label: "Shopping" },
    { href: "/submit-listing", label: "Add Listing" },
  ];

  const transparent = isHome && !isScrolled && !mobileOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md shadow-sm border-b border-[var(--color-border)]"
      }`}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/manus-storage/ShopinSiestaKeyLogo_1f645988.png"
              alt="Shop in Siesta Key"
              className={`h-10 md:h-12 w-auto object-contain transition-all duration-300 ${
                transparent ? "brightness-0 invert" : ""
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  transparent
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-[var(--color-foreground)] hover:text-[var(--color-ocean)] hover:bg-[var(--color-ocean-pale)]"
                } ${
                  location === link.href
                    ? transparent
                      ? "text-white bg-white/15"
                      : "text-[var(--color-ocean)] bg-[var(--color-ocean-pale)]"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/claim"
              className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-all duration-150 ${
                transparent
                  ? "border-white/50 text-white hover:bg-white/10"
                  : "border-[var(--color-ocean)] text-[var(--color-ocean)] hover:bg-[var(--color-ocean-pale)]"
              }`}
            >
              Claim Your Business
            </Link>
            <Link
              href="/submit-listing"
              className="btn-ocean text-sm px-4 py-2"
            >
              Add Listing
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              transparent ? "text-white hover:bg-white/10" : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)] shadow-lg">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-[var(--color-ocean-pale)] text-[var(--color-ocean)]"
                    : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
              <Link
                href="/claim"
                onClick={() => setMobileOpen(false)}
                className="btn-outline-ocean text-sm text-center justify-center"
              >
                Claim Your Business
              </Link>
              <Link
                href="/submit-listing"
                onClick={() => setMobileOpen(false)}
                className="btn-ocean text-sm text-center justify-center"
              >
                Add Listing
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
