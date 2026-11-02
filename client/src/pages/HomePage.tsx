import { Link } from 'react-router-dom'
import EventCard from '../components/EventCard'
const HomePage = () => {
  return (
    <>
    <section className="px-8 py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left column */}
        <div className="max-w-2xl">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.25em]">
            Discover Experiences
          </p>

          <h1 className="mt-6 max-w-xl text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-[#F5F0E6]">
            Find your next 
            <span className = "text-emerald-400"> unforgettable </span> 
            experience
          </h1>

          <p className="text-stone-400 mt-6">
            Discover events, connect with people and create memorable experiences.
          </p>

          <Link
            to="/events"
            className="inline-block mt-8 bg-emerald-500 text-[#10251C] px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400"
          >
            Explore Events
          </Link>
        </div>

        {/* Right column */}
        <div className="relative min-h-[480px] overflow-hidden rounded-2xl border border-[#39443D]">
  <img
    src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200"
    alt="Crowd enjoying a live music festival"
    className="absolute inset-0 h-full w-full object-cover"
  />

  <div className="absolute inset-0 bg-gradient-to-t from-[#171B19] via-black/20 to-black/10" />

  <div className="absolute bottom-0 left-0 right-0 p-8">
  <p className="text-emerald-400 uppercase tracking-widest text-sm">
    Live Music  </p>

  <h2 className="mt-3 text-3xl font-bold text-[#F5F0E6]">
    Lagos Music Week
  </h2>

  <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-300">
    <span>21 November 2026</span>
    <span>•</span>
    <span>Lagos, Nigeria</span>
  </div>

  <Link
    to="/events/1"
    className="inline-block mt-6 text-emerald-400 font-semibold hover:text-emerald-300"
  >
    Discover event →
  </Link>
  </div>
  </div>
  </div>
    </section>
    <section className='px-8 py-20'>
        <div className='max-w-7xl mx-auto'>
            <div className='flex items-end justify-between mb-10'>
                <div>
                    <p className='text-emerald-400 uppercase tracking-widest text-xs font-semibold'>
                        Dont miss out
                    </p>
                    <h2 className='text-3xl sm:text-4xl font-bold text-[#F5F0E6] mt-3'>
                        Featured events
                    </h2>
                    <p className='text-stone-400 mt-3'>
                        Experiences worth making time for
                    </p>
                </div>
                <Link to = "/events" className='hidden sm:inline-block text-emerald-400 hover:text-emerald-300 font-semibold'>
                  View all events →
                </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                
             <EventCard
               title="Creative Arts Festival"
               location="Victoria Island, Lagos"
               date="20 November 2026"
               category="Arts & Culture"
               eventId="3"
               image="https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80"
             />
             
             <EventCard
               title="Lagos Music Week"
               location="Eko Hotel, Victoria Island"
               date="21 November 2026"
               category="Live Music"
               eventId="1"
               image="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80"
             />
             
             <EventCard
               title="Lagos Tech Summit"
               location="Landmark Centre, Lagos"
               date="15 November 2026"
               category="Technology"
               eventId="2"
               image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"
             />
             
            </div>
        </div>
    </section>
    </>
  )
}

export default HomePage 