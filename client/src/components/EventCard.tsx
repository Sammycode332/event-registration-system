
import { Link } from 'react-router-dom'

interface EventCardProps {
  title: string
  location: string
  date: string
  image: string
  category: string
  eventId: string
}

const EventCard = ({
  title,
  location,
  date,
  image,
  category,
  eventId,
}: EventCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#39443D] bg-[#222925] transition duration-300 hover:-translate-y-1 hover:border-emerald-500/50">

      {/* Event image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />

        {/* Category label */}
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#171B19]/90 px-3 py-1 text-xs font-semibold text-emerald-400">
          {category}
        </span>
      </div>

      {/* Event information */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-[#F5F0E6]">
          {title}
        </h2>

        <p className="mt-3 text-sm text-stone-400">
          {location}
        </p>

        <p className="mt-2 text-sm text-emerald-400">
          {date}
        </p>

        <Link
          to={`/events/${eventId}`}
          className="mt-6 inline-block text-sm font-semibold text-[#F5F0E6] transition hover:text-emerald-400"
        >
          Explore event →
        </Link>
      </div>
    </article>
  )
}

export default EventCard
