import { useState } from "react";
import { Calendar, MapPin, Clock, Megaphone, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Events() {
  const [typeFilter, setTypeFilter] = useState<"all" | "event" | "announcement">("all");

  const { data: events = [], isLoading } = trpc.events.upcoming.useQuery({ limit: 50 });

  const filtered = typeFilter === "all" ? events : events.filter((e: any) => e.type === typeFilter);

  return (
    <>
      <SEO
        title="Events & Announcements | Shop in Siesta Key"
        description="Upcoming events and announcements from Island Premier businesses on Siesta Key, Florida."
        canonical="https://shopinsiestakey.com/events"
      />
      <Navbar />

      {/* Hero banner */}
      <div
        className="relative h-48 md:h-60 bg-cover bg-center flex items-end"
        style={{ backgroundImage: "url('/manus-storage/SiestaKey_panorama_734eb779.webp')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/80 to-transparent" />
        <div className="container relative z-10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5" /> Island Premier
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Events &amp; Announcements
          </h1>
        </div>
      </div>

      <main className="py-12 bg-[var(--color-white-sand)] min-h-screen">
        <div className="container">
          {/* Filter pills */}
          <div className="flex items-center gap-3 mb-10">
            {(["all", "event", "announcement"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-[var(--color-ocean)] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-ocean)] hover:text-[var(--color-ocean)]"
                }`}
              >
                {t === "all" ? "All" : t === "event" ? "Events" : "Announcements"}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No upcoming events right now.</p>
              <p className="text-sm mt-1">Check back soon — Island Premier businesses post events here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((ev: any, i: number) => (
                <a
                  key={ev.id}
                  href={`/business/${ev.businessSlug}`}
                  className="group block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="p-5">
                    {/* Type badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ev.type === "announcement"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-[var(--color-ocean-pale)] text-[var(--color-ocean)]"
                        }`}
                      >
                        {ev.type === "announcement" ? (
                          <Megaphone className="w-3 h-3" />
                        ) : (
                          <Calendar className="w-3 h-3" />
                        )}
                        {ev.type === "announcement" ? "Announcement" : "Event"}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">
                        {ev.businessName}
                      </span>
                    </div>

                    <h3 className="font-semibold text-[var(--color-charcoal)] group-hover:text-[var(--color-ocean)] transition-colors line-clamp-2 mb-2">
                      {ev.title}
                    </h3>

                    {ev.startDate && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        {new Date(ev.startDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {" · "}
                        {new Date(ev.startDate).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                    {ev.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {ev.location}
                      </p>
                    )}

                    {ev.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{ev.description}</p>
                    )}

                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[var(--color-ocean)] opacity-0 group-hover:opacity-100 transition-opacity">
                      View business <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
