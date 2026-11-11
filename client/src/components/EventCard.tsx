import { Link } from 'react-router-dom';

interface EventCardProps {
  title: string;
  location: string;
  date: string;
  image: string;
  category: string;
  eventId: string;
  capacity?: number | null;
  registrationCount?: number;
}

const EventCard = ({
  title,
  location,
  date,
  image,
  category,
  eventId,
  capacity,
  registrationCount,
}: EventCardProps) => {
  const isFull =
    capacity !== undefined &&
    capacity !== null &&
    registrationCount !== undefined &&
    registrationCount >= capacity;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#39443D] bg-[#222925] transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:shadow-xl">
      <div>
        {/* Cover image container */}
        <div className="relative h-52 w-full overflow-hidden bg-[#171B19]">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#222925] via-transparent to-transparent opacity-80" />

          {/* Badges */}
          <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#171B19]/90 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-sm">
            {category}
          </span>

          {isFull ? (
            <span className="absolute right-4 top-4 rounded-full bg-red-500/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              Sold Out
            </span>
          ) : (
            capacity && (
              <span className="absolute right-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-stone-300 backdrop-blur-sm">
                {registrationCount ?? 0}/{capacity} spots
              </span>
            )
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <span>📅</span> {date}
          </p>

          <h3 className="mt-2 text-xl font-bold text-[#F5F0E6] line-clamp-1 group-hover:text-emerald-300 transition-colors">
            {title}
          </h3>

          <p className="mt-2 text-sm text-stone-400 flex items-center gap-1.5 line-clamp-1">
            <span>📍</span> {location}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0">
        <Link
          to={`/events/${eventId}`}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[#39443D] bg-[#171B19] py-2.5 text-sm font-semibold text-[#F5F0E6] transition-colors hover:border-emerald-500 hover:bg-emerald-500 hover:text-[#10251C]"
        >
          View Details &rarr;
        </Link>
      </div>
    </article>
  );
};

export default EventCard;
