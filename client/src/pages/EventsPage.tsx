import EventCard from '../components/EventCard';
import { useState, useEffect } from 'react';

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

const CATEGORIES = [
  'All',
  'Technology',
  'Live Music',
  'Arts & Culture',
  'Business',
  'Education',
  'Health & Fitness',
];

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

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
        console.error('Failed to fetch events', err);
        setError(
          err instanceof Error ? err.message : 'Something went wrong'
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section className="px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div>
          <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Discover Experiences
          </span>

          <h1 className="mt-3 text-4xl font-extrabold text-[#F5F0E6] sm:text-5xl">
            Explore Events
          </h1>

          <p className="mt-2 text-stone-400 max-w-2xl">
            Find conferences, workshops, concerts, and meetups happening in your area or online.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-lg">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, topic, or location..."
              className="w-full rounded-2xl border border-[#39443D] bg-[#222925] py-4 pl-12 pr-5 text-[#F5F0E6] outline-none placeholder:text-stone-500 focus:border-emerald-500 shadow-md transition"
            />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                selectedCategory === category
                  ? 'bg-emerald-500 text-[#10251C] shadow-md'
                  : 'border border-[#39443D] bg-[#222925] text-stone-300 hover:border-emerald-500 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="mt-16 flex min-h-[300px] items-center justify-center">
            <p className="text-stone-400 animate-pulse">Loading events catalog...</p>
          </div>
        ) : error ? (
          <div className="mt-16 rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-400">
            {error}
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <p className="mt-8 text-xs font-medium text-stone-400">
              Showing {filteredEvents.length}{' '}
              {filteredEvents.length === 1 ? 'event' : 'events'}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  eventId={String(event.id)}
                  title={event.title}
                  location={event.location}
                  date={new Date(event.starts_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  category={event.category ?? 'Uncategorized'}
                  image={
                    event.image_url ??
                    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80'
                  }
                  capacity={event.capacity}
                  registrationCount={Number(event.registration_count) || 0}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-16 rounded-3xl border border-[#39443D] bg-[#222925] p-12 text-center">
            <span className="text-4xl">🔎</span>
            <h3 className="mt-3 text-lg font-bold text-[#F5F0E6]">No events found</h3>
            <p className="mt-1 text-sm text-stone-400">
              Try adjusting your search criteria or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-xs font-semibold text-emerald-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsPage;
