import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageHero title="Terms & Conditions" subtitle="Last updated: June 2026" />

      <main className="flex-1 bg-[var(--color-white-sand)] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-8 md:p-12 space-y-8">

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">1. Acceptance of Terms</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                By accessing or using the Shop In Siesta Key website located at <span className="text-[var(--color-ocean)]">showinsiestakey.com</span> (the "Site"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must discontinue use of the Site immediately. These Terms apply to all visitors, users, and business owners who access or use the Site.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">2. Directory Services</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                Shop In Siesta Key is a local business directory serving the Siesta Key, Florida community. We provide free and premium listing options for local businesses. We reserve the right to approve, reject, edit, or remove any listing at our sole discretion, without notice. Listing information is provided by business owners and is not independently verified by Shop In Siesta Key or Oriole Marketing.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">3. Business Listings and Claims</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                By submitting a business listing or claiming an existing listing, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--color-muted-foreground)]">
                <li>You are authorized to represent the business you are listing or claiming.</li>
                <li>All information provided is accurate, current, and not misleading.</li>
                <li>Your listing does not infringe upon any third-party intellectual property rights.</li>
                <li>Your business complies with all applicable local, state, and federal laws.</li>
              </ul>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mt-3">
                We reserve the right to remove listings that violate these Terms or that we determine, in our sole discretion, to be inappropriate, inaccurate, or harmful to the community.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">4. SMS and Text Message Communications</h2>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <p className="text-amber-800 font-semibold text-sm uppercase tracking-wide mb-1">Important — Please Read Carefully</p>
                <p className="text-amber-700 text-sm leading-relaxed">
                  By providing your phone number on this Site, you are consenting to receive SMS text messages as described below.
                </p>
              </div>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                By submitting your phone number through any form on this Site — including but not limited to the Claim Your Business form and the Add New Listing form — you expressly consent to receive recurring automated and non-automated SMS text messages from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--color-muted-foreground)] mb-3">
                <li><strong>Shop In Siesta Key</strong> — for listing confirmations, account updates, directory communications, and promotional offers.</li>
                <li><strong>Individual businesses listed in the directory</strong> — for business-specific communications, promotions, appointment reminders, and follow-up messages related to your inquiry or interaction with that business.</li>
                <li><strong>Oriole Marketing</strong> — for directory-related services, marketing communications, and updates on behalf of listed businesses.</li>
              </ul>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                <strong>Message frequency varies.</strong> Message and data rates may apply depending on your mobile carrier and plan.
              </p>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                <strong>To opt out:</strong> Reply <strong>STOP</strong> to any SMS message at any time to unsubscribe from that sender's messages. You will receive a one-time confirmation message. After opting out, you will no longer receive messages from that sender unless you re-subscribe.
              </p>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                <strong>For help:</strong> Reply <strong>HELP</strong> to any message or contact us at info@showinsiestakey.com.
              </p>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                Consent to receive SMS messages is not a condition of purchasing any goods or services. Your phone number will not be sold or shared with unaffiliated third parties for their own independent marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">5. Premium and Featured Listings</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                Premium and featured listing plans are offered on a subscription or one-time fee basis as described at the time of purchase. All fees are non-refundable unless otherwise stated. We reserve the right to modify pricing, features, and availability of premium plans at any time with reasonable notice. Featured placement is subject to availability and editorial review.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">6. Intellectual Property</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                All content on this Site — including text, graphics, logos, images, and software — is the property of Shop In Siesta Key or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission. Business owners retain ownership of their own listing content but grant us a non-exclusive license to display it on the Site.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">7. Disclaimer of Warranties</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                The Site and its content are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses. We make no representations regarding the accuracy, completeness, or reliability of any business listing information.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">8. Limitation of Liability</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                To the fullest extent permitted by law, Shop In Siesta Key and Oriole Marketing shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site or reliance on any listing information, even if we have been advised of the possibility of such damages. Our total liability shall not exceed the amount paid by you, if any, for access to the Site in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">9. Governing Law</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Sarasota County, Florida.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">10. Changes to These Terms</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised effective date. Your continued use of the Site following any changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">11. Contact Us</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                Questions about these Terms should be directed to:
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
