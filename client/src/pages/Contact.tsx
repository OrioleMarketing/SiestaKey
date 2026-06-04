import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    },
    onError: (e) => toast.error(`Something went wrong: ${e.message}`),
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitContact.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      message: form.message,
    });
  };

  return (
    <>
      <SEO
        title="Contact Us | Shop in Siesta Key"
        description="Get in touch with the Shop in Siesta Key team. We'd love to hear from you about your business listing, questions, or feedback."
        canonical="https://www.shopinsiestakey.com/contact"
      />
      <Navbar />

      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach out with questions, feedback, or to learn more about listing your business."
      />

      <section className="py-16 bg-sandy-light">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* ── Contact Info Sidebar ── */}
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-ocean-dark font-bold mb-2">
                  Get In Touch
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Whether you're a visitor looking for recommendations or a business owner interested in a listing, we're here to help.
                </p>
              </div>

              <div className="space-y-4">
                <ContactInfoItem
                  icon={<MapPin className="w-5 h-5 text-ocean" />}
                  label="Location"
                  value="Siesta Key, FL 34242"
                />
                <ContactInfoItem
                  icon={<Phone className="w-5 h-5 text-ocean" />}
                  label="Phone"
                  value="(941) 957-2639"
                  href="tel:+19419572639"
                />
                <ContactInfoItem
                  icon={<Mail className="w-5 h-5 text-ocean" />}
                  label="Email"
                  value="info@shopinsiestakey.com"
                  href="mailto:info@shopinsiestakey.com"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-5">
                <p className="text-sm font-semibold text-ocean-dark mb-1">Managed by</p>
                <a
                  href="https://oriolemarketing.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ocean hover:underline font-medium"
                >
                  Oriole Marketing
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  Bruce A Mayo · bruce@oriolemarketing.com
                </p>
              </div>
            </div>

            {/* ── Contact Form ── */}
            <div className="lg:col-span-2">
              <Card className="card-coastal shadow-md">
                <CardContent className="pt-6">
                  {submitted ? (
                    <SuccessState onReset={() => setSubmitted(false)} />
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="c-name">
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="c-name"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="Jane Smith"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="c-email">
                            Email Address <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="c-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="jane@example.com"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="c-phone">
                          Phone{" "}
                          <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <Input
                          id="c-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="(941) 555-0000"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="c-message">
                          Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="c-message"
                          value={form.message}
                          onChange={(e) => set("message", e.target.value)}
                          placeholder="Tell us how we can help..."
                          rows={6}
                          required
                          className="mt-1 resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {form.message.length}/2000 characters
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="btn-ocean w-full gap-2"
                        disabled={submitContact.isPending}
                      >
                        {submitContact.isPending ? (
                          <>Sending…</>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form you agree to our{" "}
                        <a href="/privacy" target="_blank" className="underline hover:text-ocean">
                          Privacy Policy
                        </a>
                        . We typically respond within 1–2 business days.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function ContactInfoItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-ocean/10 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        {href ? (
          <a href={href} className="text-sm font-medium text-foreground hover:text-ocean transition-colors">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="font-serif text-2xl font-bold text-ocean-dark mb-2">Message Sent!</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
        Thank you for reaching out. We'll get back to you within 1–2 business days.
      </p>
      <Button variant="outline" onClick={onReset} className="border-ocean text-ocean hover:bg-ocean/5">
        Send Another Message
      </Button>
    </div>
  );
}
