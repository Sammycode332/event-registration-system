import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';

interface Event {
  id: number;
  title: string;
  description: string | null;
  location: string;
  starts_at: string;
  capacity: number | null;
  image_url: string | null;
  category: string | null;
  registration_count?: number;
}

const HomePage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events`);
        if (!response.ok) {
          throw new Error('Unable to retrieve events.');
        }
        const data: Event[] = await response.json();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch homepage events:', err);
        setError(
          err instanceof Error ? err.message : 'Something went wrong.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Pick first event or fallback for featured spotlight
  const featuredEvent = events.length > 0 ? events[0] : null;

  return (
    <>
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
              Discover Experiences
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#F5F0E6] sm:text-6xl xl:text-7xl">
              Find your next{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                unforgettable
              </span>{" "}
              experience
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-stone-300">
              Join thousands of attendees discovering top-tier tech summits, live concerts, business masterclasses, and creative arts festivals. Reserve your spot in seconds.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/events"
                className="rounded-xl bg-emerald-500 px-7 py-3.5 font-bold text-[#10251C] transition hover:bg-emerald-400 hover:shadow-lg shadow-emerald-500/20"
              >
                Explore All Events
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl border border-[#39443D] bg-[#222925] px-6 py-3.5 font-semibold text-stone-200 transition hover:border-emerald-500/50 hover:text-white"
              >
                Go to Dashboard
              </Link>
            </div>

            {/* Quick stats counter */}
            <div className="mt-12 flex items-center gap-8 border-t border-[#39443D] pt-8">
              <div>
                <p className="text-2xl font-bold text-white">{events.length}+</p>
                <p className="text-xs text-stone-400">Live Events</p>
              </div>
              <div className="h-8 w-px bg-[#39443D]" />
              <div>
                <p className="text-2xl font-bold text-emerald-400">100%</p>
                <p className="text-xs text-stone-400">Instant Booking</p>
              </div>
              <div className="h-8 w-px bg-[#39443D]" />
              <div>
                <p className="text-2xl font-bold text-white">Free</p>
                <p className="text-xs text-stone-400">Cancellation</p>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Spotlight Card */}
          <div className="relative min-h-[460px] overflow-hidden rounded-3xl border border-[#39443D] shadow-2xl bg-[#222925]">
            {featuredEvent ? (
              <>
                <img
                  src={
                    featuredEvent.image_url ??
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80"
                  }
                  alt={featuredEvent.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#171B19] via-[#171B19]/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                  <span className="rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#10251C]">
                    {featuredEvent.category ?? "Spotlight"}
                  </span>

                  <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#F5F0E6]">
                    {featuredEvent.title}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-stone-300">
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      {new Date(featuredEvent.starts_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>📍</span>
                      {featuredEvent.location}
                    </span>
                  </div>

                  <Link
                    to={`/events/${featuredEvent.id}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 hover:text-[#10251C] hover:border-transparent"
                  >
                    <span>Claim Your Spot</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex min-h-[460px] items-center justify-center p-8 text-center text-stone-400">
                Discover exceptional experiences today.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured / Recent Events Listing */}
      <section className="px-4 py-16 sm:px-8 border-t border-[#39443D]/60 bg-[#171B19]/40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Don't Miss Out
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#F5F0E6] sm:text-4xl">
                Featured Experiences
              </h2>
              <p className="mt-2 text-stone-400">
                Handpicked events with open registrations right now.
              </p>
            </div>
            <Link
              to="/events"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              View all {events.length} events &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p className="col-span-full py-12 text-center text-stone-400 animate-pulse">
                Loading events...
              </p>
            ) : error ? (
              <p className="col-span-full py-12 text-center text-red-400">{error}</p>
            ) : events.length === 0 ? (
              <p className="col-span-full py-12 text-center text-stone-400">
                No events currently scheduled. Check back soon!
              </p>
            ) : (
              events.slice(0, 6).map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  location={event.location}
                  date={new Date(event.starts_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  category={event.category ?? "General"}
                  eventId={String(event.id)}
                  image={
                    event.image_url ??
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80"
                  }
                  capacity={event.capacity}
                  registrationCount={Number(event.registration_count) || 0}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
