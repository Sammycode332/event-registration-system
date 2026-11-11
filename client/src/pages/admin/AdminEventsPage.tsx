import { useEffect, useState } from "react";

interface AdminEvent {
  id: number;
  title: string;
  description: string | null;
  location: string;
  starts_at: string;
  capacity: number | null;
  image_url: string | null;
  category: string | null;
  created_by: number;
}

const AdminEventsPage = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [formError, setFormError] = useState("");
const [editingEventId, setEditingEventId] = useState<number | null>(null);
const [formData, setFormData] = useState({
  title: "",
  description: "",
  location: "",
  starts_at: "",
  capacity: "",
  category: "",
  image_url: "",
});
const getAuthHeaders = ()=>{
      const token = sessionStorage.getItem("access_token")

      if(!token){
        throw new Error("Your session has expired. Please log in again")
      }
      return {
        "content-Type":"application/json",
        Authorization: `Bearer ${token}`
      }
    }
  useEffect(() => {
    
  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events`
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve events.");
      }

      const data: AdminEvent[] = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Event loading error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  fetchEvents();
}, []);
const handleCreateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  try {
    setIsSubmitting(true);
    setFormError("");

    const payload = {
      ...formData,
      starts_at: new Date(formData.starts_at).toISOString(),
      capacity: formData.capacity ? Number(formData.capacity) : null,
      description: formData.description.trim() || null,
      image_url: formData.image_url.trim() || null,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/events`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to create event.");
    }

    // Refresh the event list from the database.
    const eventsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/events`
    );

    if (!eventsResponse.ok) {
      throw new Error("Event created, but the event list could not refresh.");
    }

    const updatedEvents: AdminEvent[] = await eventsResponse.json();
    setEvents(updatedEvents);

    setFormData({
      title: "",
      description: "",
      location: "",
      starts_at: "",
      capacity: "",
      category: "",
      image_url: "",
    });

    setShowCreateForm(false);
  } catch (error) {
    setFormError(
      error instanceof Error ? error.message : "Something went wrong."
    );
  } finally {
    setIsSubmitting(false);
  }
};
const handleEditClick = (event: AdminEvent) => {
  setEditingEventId(event.id);

  setFormData({
    title: event.title,
    description: event.description ?? "",
    location: event.location,
    starts_at: new Date(event.starts_at).toISOString().slice(0, 16),
    capacity: event.capacity?.toString() ?? "",
    category: event.category ?? "",
    image_url: event.image_url ?? "",
  });

  setShowCreateForm(true);
  setFormError("");
};
const handleUpdateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (editingEventId === null) return;

  try {
    setIsSubmitting(true);
    setFormError("");

    const payload = {
      ...formData,
      starts_at: new Date(formData.starts_at).toISOString(),
      capacity: formData.capacity ? Number(formData.capacity) : null,
      description: formData.description.trim() || null,
      image_url: formData.image_url.trim() || null,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/events/${editingEventId}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to update event.");
    }

    const eventsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/events`
    );

    if (!eventsResponse.ok) {
      throw new Error("Event updated, but the list could not refresh.");
    }

    const updatedEvents: AdminEvent[] = await eventsResponse.json();
    setEvents(updatedEvents);

    setEditingEventId(null);
    setShowCreateForm(false);

    setFormData({
      title: "",
      description: "",
      location: "",
      starts_at: "",
      capacity: "",
      category: "",
      image_url: "",
    });
  } catch (error) {
    setFormError(
      error instanceof Error ? error.message : "Something went wrong."
    );
  } finally {
    setIsSubmitting(false);
  }
};
const handleDeleteEvent = async (eventId: number) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this event? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    setFormError("");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/events/${eventId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to delete event.");
    }

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== eventId)
    );
  } catch (error) {
    setFormError(
      error instanceof Error ? error.message : "Something went wrong."
    );
  }
};
const filteredEvents = events.filter((event) => {
  const search = searchTerm.toLowerCase();

  return (
    event.title.toLowerCase().includes(search) ||
    event.location.toLowerCase().includes(search)
  );
});
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 sm:px-8">
      <div className="mb-10">
        <p className="text-sm font-medium text-emerald-400">
          PLATFORM MANAGEMENT
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#F5F0E6]">
          Manage Events
        </h1>

        <p className="mt-2 text-stone-400">
          View and manage all events on the platform.
        </p>
      </div>
      <section className="mb-10">
  <div className="mb-4 flex items-center justify-between">
    <div>
      <h2 className="text-xl font-bold text-[#F5F0E6]">
         {editingEventId !== null ? "Edit Event" : "Event Management"}
      </h2>
      <p className="mt-1 text-sm text-stone-400">
        Create and manage platform events.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setShowCreateForm(!showCreateForm)}
      className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500"
    >
      {showCreateForm ? "Close Form" : "+ Create Event"}
    </button>
  </div>

  {showCreateForm && (
    <form
      onSubmit={editingEventId !== null ? handleUpdateEvent : handleCreateEvent}
      className="grid gap-5 rounded-2xl border border-[#39443d] bg-[#222925] p-6 md:grid-cols-2"
    >
      <div>
        <label className="mb-2 block text-sm text-stone-300">
          Event title
        </label>
        <input
          required
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full rounded-lg border border-[#39443d] bg-[#171B19] p-3 text-white"
          placeholder="Enter event title"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-stone-300">
          Location
        </label>
        <input
          required
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="w-full rounded-lg border border-[#39443d] bg-[#171B19] p-3 text-white"
          placeholder="Event location"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-stone-300">
          Category
        </label>
        <select
          required
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full rounded-lg border border-[#39443d] bg-[#171B19] p-3 text-white"
        >
          <option value="">Select category</option>
          <option value="Technology">Technology</option>
          <option value="Live Music">Live Music</option>
          <option value="Arts & Culture">Arts & Culture</option>
          <option value="Business">Business</option>
          <option value="Education">Education</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-stone-300">
          Start date and time
        </label>
        <input
          required
          type="datetime-local"
          value={formData.starts_at}
          onChange={(e) =>
            setFormData({ ...formData, starts_at: e.target.value })
          }
          className="w-full rounded-lg border border-[#39443d] bg-[#171B19] p-3 text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-stone-300">
          Capacity
        </label>
        <input
          type="number"
          min="1"
          value={formData.capacity}
          onChange={(e) =>
            setFormData({ ...formData, capacity: e.target.value })
          }
          className="w-full rounded-lg border border-[#39443d] bg-[#171B19] p-3 text-white"
          placeholder="Leave empty for unlimited"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-stone-300">
          Image URL
        </label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({ ...formData, image_url: e.target.value })
          }
          className="w-full rounded-lg border border-[#39443d] bg-[#171B19] p-3 text-white"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm text-stone-300">
          Description
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full rounded-lg border border-[#39443d] bg-[#171B19] p-3 text-white"
          placeholder="Describe the event..."
        />
      </div>

      {formError && (
        <p className="text-sm text-red-400 md:col-span-2">
          {formError}
        </p>
      )}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
        {isSubmitting
  ? editingEventId !== null
    ? "Updating event..."
    : "Creating event..."
  : editingEventId !== null
    ? "Save Changes"
    : "Create Event"}
        </button>
      </div>
    </form>
  )}
</section>
      <section>
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-xl font-bold text-[#F5F0E6]">
        All Platform Events
      </h2>
      <p className="mt-1 text-sm text-stone-400">
        {filteredEvents.length} events found
      </p>
    </div>

    <input
      type="text"
      placeholder="Search by title or location..."
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
      className="w-full rounded-lg border border-[#39443d] bg-[#222925] px-4 py-3 text-sm text-[#F5F0E6] outline-none focus:border-emerald-500 sm:max-w-sm"
    />
  </div>

  {isLoading ? (
    <p className="text-stone-400">Loading events...</p>
  ) : error ? (
    <p className="text-red-400">{error}</p>
  ) : filteredEvents.length === 0 ? (
    <p className="rounded-xl border border-[#39443d] p-8 text-center text-stone-400">
      No events found.
    </p>
  ) : (
    <div className="overflow-x-auto rounded-2xl border border-[#39443d] bg-[#222925]">
      <table className="w-full text-left">
        <thead className="border-b border-[#39443d] text-sm text-stone-400">
          <tr>
            <th className="px-6 py-4">Event</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Capacity</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredEvents.map((event) => (
            <tr
              key={event.id}
              className="border-b border-[#39443d] last:border-0"
            >
              <td className="px-6 py-4 font-medium text-[#F5F0E6]">
                {event.title}
              </td>

              <td className="px-6 py-4 text-stone-400">
                {event.location}
              </td>

              <td className="px-6 py-4 text-stone-400">
                {new Date(event.starts_at).toLocaleDateString()}
              </td>

              <td className="px-6 py-4 text-stone-400">
                {event.capacity ?? "Unlimited"}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
  <button
    type="button"
    onClick={() => handleEditClick(event)}
    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
  >
    Edit
  </button>
  <button
  type="button"
  onClick={() => handleDeleteEvent(event.id)}
  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
>
  Delete
</button>
                </div>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>
    </main>
  );
};

export default AdminEventsPage;
