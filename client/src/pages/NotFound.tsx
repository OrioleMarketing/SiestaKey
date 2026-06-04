import { Link } from "wouter";
import { Waves, Home, Search, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 bg-[var(--color-white-sand)]">
        <div className="text-center max-w-lg mx-auto px-4">
          {/* Animated wave icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-[var(--color-ocean-pale)] flex items-center justify-center">
              <Waves className="w-12 h-12 text-[var(--color-ocean)]" />
            </div>
          </div>

          {/* 404 */}
          <div className="font-serif text-8xl font-bold text-[var(--color-ocean-light)] mb-2 leading-none">
            404
          </div>

          <h1 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">
            Washed Out to Sea
          </h1>
          <p className="text-[var(--color-muted-foreground)] mb-8 leading-relaxed">
            The page you're looking for seems to have drifted away with the tide. Let's get you back to shore.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-ocean px-6 py-3">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <Link href="/directory" className="btn-outline-ocean px-6 py-3">
              <Search className="w-4 h-4" /> Browse Directory
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">Popular pages</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: "/directory/dining", label: "Dining" },
                { href: "/directory/activities", label: "Activities" },
                { href: "/directory/shopping", label: "Shopping" },
                { href: "/claim", label: "Claim Listing" },
                { href: "/submit-listing", label: "Add Business" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm px-3 py-1.5 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-ocean-light)] hover:text-[var(--color-ocean)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
