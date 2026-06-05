import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

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

  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/directory/dining", label: "Dining" },
    { href: "/directory/shopping", label: "Shopping" },
    { href: "/directory/activities", label: "Activities" },
    { href: "/directory/nightlife", label: "Nightlife" },
    { href: "/directory/accommodations", label: "Accommodations" },
    { href: "/guides", label: "Guides" },
  ];

  // Transparent state: only on homepage before scroll, and not when mobile menu is open
  const transparent = isHome && !isScrolled && !mobileOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-gradient-to-b from-black/65 via-black/40 to-transparent"
          : "bg-white/97 backdrop-blur-md shadow-sm border-b border-[var(--color-border)]"
      }`}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* Logo — white-text variant on transparent hero, original when scrolled */}
          <Link href="/" className="flex items-center group shrink-0">
            <img
              src={
                transparent
                  ? "/manus-storage/Shop-Logo-White-Transparent_c745ca81.png"
                  : "/manus-storage/Shop-Logo-Transparent_a1a04d98.png"
              }
              alt="Shop in Siesta Key"
              className="h-14 md:h-20 w-auto object-contain transition-all duration-300"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5 mx-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                  transparent
                    ? "text-white hover:text-white hover:bg-white/15"
                    : "text-[var(--color-foreground)] hover:text-[var(--color-ocean)] hover:bg-[var(--color-ocean-pale)]"
                } ${
                  (link.href === "/directory" ? location === "/directory" : location === link.href)
                    ? transparent
                      ? "text-white bg-white/20"
                      : "text-[var(--color-ocean)] bg-[var(--color-ocean-pale)]"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            ))}

          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              href="/claim"
              className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-all duration-150 whitespace-nowrap ${
                transparent
                  ? "border-white/60 text-white hover:bg-white/15"
                  : "border-[var(--color-ocean)] text-[var(--color-ocean)] hover:bg-[var(--color-ocean-pale)]"
              }`}
            >
              Claim Your Business
            </Link>
            <Link
              href="/submit-listing"
              className="btn-coral text-sm px-4 py-2 whitespace-nowrap"
            >
              Add Listing
            </Link>
            {/* Login / User */}
            {user ? (
              <div className="relative group">
                <button
                  className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-150 ${
                    transparent
                      ? "text-white hover:bg-white/15"
                      : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-[var(--color-border)] py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2.5 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <div className="my-1 border-t border-[var(--color-border)]" />
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <a
                href={getLoginUrl()}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border transition-all duration-150 whitespace-nowrap ${
                  transparent
                    ? "border-white/40 text-white hover:bg-white/15"
                    : "border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Login
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              transparent
                ? "text-white hover:bg-white/15"
                : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
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
        <div className="lg:hidden bg-white border-t border-[var(--color-border)] shadow-lg">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  (link.href === "/directory" ? location === "/directory" : location === link.href)
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
                className="border border-[var(--color-ocean)] text-[var(--color-ocean)] text-sm text-center py-2.5 rounded-lg font-semibold hover:bg-[var(--color-ocean-pale)] transition-colors"
              >
                Claim Your Business
              </Link>
              <Link
                href="/submit-listing"
                onClick={() => setMobileOpen(false)}
                className="btn-coral text-sm text-center justify-center"
              >
                Add Listing
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="border border-[var(--color-ocean)] text-[var(--color-ocean)] text-sm text-center py-2.5 rounded-lg font-semibold hover:bg-[var(--color-ocean-pale)] transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="border border-[var(--color-border)] text-[var(--color-foreground)] text-sm text-center py-2.5 rounded-lg font-semibold hover:bg-[var(--color-muted)] transition-colors"
                  >
                    Sign Out ({user.name?.split(" ")[0]})
                  </button>
                </>
              ) : (
                <a
                  href={getLoginUrl()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 border border-[var(--color-border)] text-[var(--color-foreground)] text-sm py-2.5 rounded-lg font-semibold hover:bg-[var(--color-muted)] transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
