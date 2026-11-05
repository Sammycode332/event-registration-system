import { useParams } from 'react-router-dom'
import { events } from '../data/event'
const EventDetailsPage = () => {
  const { eventId } = useParams()
  const event = events.find((event) => event.eventId === eventId)
  if (!event) {
  return (
    <div className="px-8 py-20 text-center">
      <h1 className="text-3xl font-bold text-[#F5F0E6]">
        Event not found
      </h1>
      <p className="mt-3 text-stone-400">
        Sorry, we couldn't find the event you're looking for.
      </p>
    </div>
  )
}
  return (
  <section className="px-8 py-16">
    <div className="mx-auto max-w-7xl">

      {/* Event cover image */}
      <div className="relative h-[350px] overflow-hidden rounded-2xl md:h-[480px]">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#171B19] via-transparent to-transparent" />

        <div className="absolute bottom-8 left-8">
          <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#10251C]">
            {event.category}
          </span>

          <h1 className="mt-5 text-4xl font-bold text-[#F5F0E6] md:text-6xl">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Event information */}
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-[#F5F0E6]">
            About this event
          </h2>

          <p className="mt-4 leading-8 text-stone-400">
            Join us for an unforgettable experience. Discover new
            connections, explore exciting activities and enjoy everything
            this event has to offer.
          </p>
        </div>

        <div className="rounded-2xl border border-[#39443D] bg-[#222925] p-6">
          <h2 className="text-xl font-bold text-[#F5F0E6]">
            Event Information
          </h2>

          <p className="mt-6 text-sm text-stone-400">Date</p>
          <p className="mt-2 text-[#F5F0E6]">{event.date}</p>

          <p className="mt-5 text-sm text-stone-400">Location</p>
          <p className="mt-2 text-[#F5F0E6]">{event.location}</p>

          <button className="mt-8 w-full rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-[#10251C] transition hover:bg-emerald-400">
            Register for Event
          </button>
        </div>
      </div>
    </div>
  </section>
)

}

export default EventDetailsPage