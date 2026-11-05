import EventCard from '../components/EventCard'
import { useState,useEffect} from 'react'
interface Event {
  id: number
  title: string
  description: string | null
  location: string
  starts_at: string
  capacity: number | null
  image_url: string | null
  category: string | null
}
const EventsPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [events, setEvents] = useState<Event[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState('')
   const filteredEvents = events.filter((event) => {
  const matchesSearch = event.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase())

  const matchesCategory =
    selectedCategory === 'All' ||
    event.category === selectedCategory

  return matchesSearch && matchesCategory
})

   useEffect(()=>{
    const fetchEvents = async () =>{
      try{
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events`)
        if(!response.ok){
          throw new Error('Unable to retrieve events.')
        }
        const data: Event[] = await response.json()
        setEvents(data)
      }catch(error){
        console.error("Failed to fetch events",error)
        setError(
          error instanceof Error ? error.message: "Something went wrong"
        )
      } finally{
        setIsLoading(false)
      }
    }
    fetchEvents()
   },[])
  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Discover experiences
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[#F5F0E6]">
          Explore Events
        </h1>

        <p className="mt-3 text-stone-400">
          Find events, meet people and discover experiences worth attending.
        </p>
        <div className="mt-10 max-w-xl">
         <input
           type="text"
           value={searchTerm}
           onChange={(event) => setSearchTerm(event.target.value)}
           placeholder="Search events..."
           className="w-full rounded-xl border border-[#39443D] bg-[#222925] px-5 py-4 text-[#F5F0E6] outline-none placeholder:text-stone-500 focus:border-emerald-500"
         />
       </div>
       <div className="mt-6 flex flex-wrap gap-3">
         {['All', 'Technology', 'Live Music', 'Arts & Culture'].map((category) => (
           <button
             key={category}
             onClick={() => setSelectedCategory(category)}
             className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
               selectedCategory === category
                 ? 'bg-emerald-500 text-[#10251C]'
                 : 'border border-[#39443D] bg-[#222925] text-stone-300 hover:border-emerald-500'
             }`}
           >
             {category}
           </button>
         ))}
       </div>
       {isLoading ? (
  <p className="mt-12 text-center text-stone-400">
    Loading events...
  </p>
) : error ? (
  <p className="mt-12 text-center text-red-400">
    {error}
  </p>
) : filteredEvents.length > 0 ? (
  <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {filteredEvents.map((event) => (
      <EventCard
        key={event.id}
        eventId={String(event.id)}
        title={event.title}
        location={event.location}
        date={new Date(event.starts_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        category={event.category ?? 'Uncategorized'}
        image={
          event.image_url ??
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80'
        }
      />
    ))}
  </div>
) : (
  <p className="mt-12 text-center text-stone-400">
    No events found. Try searching for something else.
  </p>
)}
      <p className="mt-8 text-sm text-stone-400">
         {filteredEvents.length}{' '}
         {filteredEvents.length === 1 ? 'event' : 'events'} found
       </p>
      </div>
    </section>
  )
}

export default EventsPage