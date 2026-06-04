import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageHero title="Privacy Policy" subtitle="Last updated: June 2026" />

      <main className="flex-1 bg-[var(--color-white-sand)] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8 md:p-12 space-y-8">

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">1. Introduction</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                Shop In Siesta Key ("we," "us," or "our") operates the Shop In Siesta Key local business directory at{" "}
                <span className="text-[var(--color-ocean)]">showinsiestakey.com</span> (the "Site"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Site or interact with our services. Please read this policy carefully. If you disagree with its terms, please discontinue use of the Site.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">2. Information We Collect</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                We may collect information about you in a variety of ways, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--color-muted-foreground)]">
                <li><strong>Personal Data:</strong> Name, email address, phone number, and business name voluntarily submitted through our claim or listing submission forms.</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, links clicked, and referring URLs, collected automatically via analytics tools.</li>
                <li><strong>Device Data:</strong> Browser type, operating system, IP address, and device identifiers collected automatically when you access the Site.</li>
                <li><strong>Communications:</strong> Any messages or inquiries you send to us directly.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">3. How We Use Your Information</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--color-muted-foreground)]">
                <li>Process business listing claims and new listing submissions.</li>
                <li>Contact you regarding your listing, account, or inquiry.</li>
                <li>Send you marketing communications, updates, and promotional materials (with your consent).</li>
                <li>Improve and personalize the Site experience.</li>
                <li>Comply with applicable legal obligations.</li>
                <li>Prevent fraudulent or unauthorized activity.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">4. SMS / Text Message Communications</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                By submitting your phone number through any form on this Site, you expressly consent to receive SMS text messages from Shop In Siesta Key and/or the individual businesses listed in our directory. These messages may include listing confirmations, account updates, promotional offers, and other business-related communications. Message and data rates may apply. Message frequency varies. You may opt out at any time by replying STOP to any message. For help, reply HELP or contact us at the address below. We do not sell or share your phone number with third parties for their own marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">5. Sharing Your Information</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--color-muted-foreground)]">
                <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating the Site (e.g., CRM platforms, email services, analytics providers), bound by confidentiality obligations.</li>
                <li><strong>Business Listings:</strong> When you submit a claim or inquiry for a specific business, that business may receive your contact information.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">6. Cookies and Tracking</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on the Site. You may disable cookies through your browser settings; however, some features of the Site may not function properly without them.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">7. Data Retention</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">8. Your Rights</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the processing of your personal information. To exercise any of these rights, please contact us using the information below. We will respond to your request within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">9. Children's Privacy</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                The Site is not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">10. Changes to This Policy</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Site after any changes constitutes your acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">11. Contact Us</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                If you have questions or concerns about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-[var(--color-white-sand)] rounded-xl border border-[var(--color-border)]">
                <p className="font-semibold text-[var(--color-charcoal)]">Shop In Siesta Key</p>
                <p className="text-[var(--color-muted-foreground)]">Siesta Key, Florida</p>
                <p className="text-[var(--color-ocean)]">info@showinsiestakey.com</p>
                <p className="text-[var(--color-muted-foreground)] text-sm mt-2 italic">Directory services provided by Oriole Marketing.</p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
