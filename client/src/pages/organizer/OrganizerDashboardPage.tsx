import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface OrganizerEvent {
  id: number;
  title: string;
  description: string | null;
  location: string;
  starts_at: string;
  capacity: number | null;
  image_url: string | null;
  category: string | null;
  created_by: number;
  registration_count: number;
}

interface EventAttendee {
  registration_id: number;
  registered_at: string;
  user_id: number;
  name: string;
  email: string;
}

const OrganizerDashboardPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Create / Edit modal state
  const [showForm, setShowForm] = useState(false);
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

  // Attendee Roster modal state
  const [rosterEvent, setRosterEvent] = useState<{ id: number; title: string } | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState("");

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOrganizerEvents = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/organizer/my-events`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve your organized events.");
      }

      const data: OrganizerEvent[] = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load organizer events:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
    // Load the organizer's events once when the dashboard is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreate = () => {
    setEditingEventId(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      starts_at: "",
      capacity: "",
      category: "",
      image_url: "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleOpenEdit = (evt: OrganizerEvent) => {
    setEditingEventId(evt.id);
    setFormData({
      title: evt.title,
      description: evt.description ?? "",
      location: evt.location,
      starts_at: new Date(evt.starts_at).toISOString().slice(0, 16),
      capacity: evt.capacity?.toString() ?? "",
      category: evt.category ?? "",
      image_url: evt.image_url ?? "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError("");

      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        starts_at: new Date(formData.starts_at).toISOString(),
        capacity: formData.capacity ? Number(formData.capacity) : null,
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        category: formData.category.trim() || null,
      };

      const url =
        editingEventId !== null
          ? `${import.meta.env.VITE_API_URL}/events/${editingEventId}`
          : `${import.meta.env.VITE_API_URL}/events`;

      const method = editingEventId !== null ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save event.");
      }

      setShowForm(false);
      await fetchOrganizerEvents();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: number, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${eventId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to delete event.");
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete event");
    }
  };

  const handleViewAttendees = async (evt: OrganizerEvent) => {
    setRosterEvent({ id: evt.id, title: evt.title });
    setAttendees([]);
    setRosterError("");
    setIsLoadingRoster(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/registrations/event/${evt.id}`,
        { headers: getAuthHeaders() }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load attendee roster.");
      }

      setAttendees(data.attendees || []);
    } catch (err) {
      setRosterError(err instanceof Error ? err.message : "Failed to load roster.");
    } finally {
      setIsLoadingRoster(false);
    }
  };

  const totalAttendees = events.reduce(
    (sum, e) => sum + (Number(e.registration_count) || 0),
    0
  );

  const upcomingCount = events.filter(
    (e) => new Date(e.starts_at).getTime() >= Date.now()
  ).length;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
            Event Management Portal
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-[#F5F0E6] sm:text-4xl">
            Organizer Dashboard
          </h1>
          <p className="mt-1 text-stone-400">
            Welcome back, <span className="text-white font-medium">{user?.name}</span>. Manage your published events and attendee rosters.
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-[#10251C] transition hover:bg-emerald-400 shadow-md"
          >
            <span>+ Create New Event</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <section className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-6">
          <p className="text-sm font-medium text-stone-400">My Hosted Events</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#F5F0E6]">
            {events.length}
          </h2>
          <p className="mt-1 text-xs text-stone-400">Total platform events created</p>
        </div>

        <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-6">
          <p className="text-sm font-medium text-stone-400">Total Attendees Registered</p>
          <h2 className="mt-2 text-3xl font-extrabold text-emerald-400">
            {totalAttendees}
          </h2>
          <p className="mt-1 text-xs text-stone-400">Confirmed attendee bookings</p>
        </div>

        <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-6">
          <p className="text-sm font-medium text-stone-400">Active Upcoming Events</p>
          <h2 className="mt-2 text-3xl font-extrabold text-blue-400">
            {upcomingCount}
          </h2>
          <p className="mt-1 text-xs text-stone-400">Scheduled for future dates</p>
        </div>
      </section>

      {/* Main List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-stone-400 animate-pulse">Loading your events...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-12 text-center">
          <span className="text-5xl">🎪</span>
          <h3 className="mt-4 text-xl font-bold text-[#F5F0E6]">
            No Events Created Yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-400">
            You haven't published any events yet. Create your first event now and start welcoming attendees!
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-[#10251C] transition hover:bg-emerald-400"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#F5F0E6]">Your Events</h2>
            <p className="text-sm text-stone-400">
              {events.length} {events.length === 1 ? "event" : "events"} managed
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#39443d] bg-[#222925]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#39443d] text-xs uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Registrations / Capacity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#39443d]/60">
                {events.map((evt) => {
                  const regCount = Number(evt.registration_count) || 0;
                  const capacity = evt.capacity;
                  const isFull = capacity !== null && regCount >= capacity;

                  return (
                    <tr key={evt.id} className="transition hover:bg-[#252f2a]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              evt.image_url ||
                              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80"
                            }
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div>
                            <Link
                              to={`/events/${evt.id}`}
                              className="font-bold text-[#F5F0E6] hover:text-emerald-400"
                            >
                              {evt.title}
                            </Link>
                            <p className="text-xs text-stone-400">ID #{evt.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-stone-300">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                          {evt.category || "General"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-stone-300">
                        {new Date(evt.starts_at).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                      <td className="px-6 py-4 text-stone-400">{evt.location}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isFull ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            {regCount}
                          </span>
                          <span className="text-stone-400">
                            / {capacity ? capacity : "Unlimited"}
                          </span>
                          {isFull && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                              Full
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleViewAttendees(evt)}
                          className="rounded-lg bg-[#171B19] border border-[#39443d] px-3 py-1.5 text-xs font-semibold text-stone-200 transition hover:border-emerald-500 hover:text-emerald-400"
                        >
                          👥 Attendees ({regCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(evt)}
                          className="rounded-lg bg-blue-600/80 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(evt.id, evt.title)}
                          className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modal: Create or Edit Event */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#39443d] bg-[#222925] p-6 sm:p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#F5F0E6]">
                {editingEventId !== null ? "Edit Event" : "Create New Event"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-stone-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-300">
                  Event Title *
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Lagos Tech Summit 2026"
                  className="w-full rounded-xl border border-[#39443d] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-300">
                    Location / Venue *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Landmark Centre or Virtual"
                    className="w-full rounded-xl border border-[#39443d] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-300">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#39443d] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
                  >
                    <option value="">Select category</option>
                    <option value="Technology">Technology</option>
                    <option value="Live Music">Live Music</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-300">
                    Date & Time *
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) =>
                      setFormData({ ...formData, starts_at: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#39443d] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-300">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave blank for unlimited"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#39443d] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-300">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#39443d] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-300">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide an overview of the event, speakers, agenda..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#39443d] bg-[#171B19] px-4 py-3 text-[#F5F0E6] outline-none focus:border-emerald-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#39443d]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-[#39443d] px-5 py-2.5 text-sm font-semibold text-stone-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-[#10251C] transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingEventId !== null
                    ? "Update Event"
                    : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Attendee Roster */}
      {rosterEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#39443d] bg-[#222925] p-6 sm:p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#F5F0E6]">
                  Attendee Roster
                </h3>
                <p className="text-xs text-emerald-400 mt-1">
                  {rosterEvent.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRosterEvent(null)}
                className="text-stone-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {isLoadingRoster ? (
              <p className="text-center text-stone-400 py-10 animate-pulse">
                Loading attendees...
              </p>
            ) : rosterError ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400">
                {rosterError}
              </div>
            ) : attendees.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <span className="text-3xl">👥</span>
                <p className="mt-3">No attendees have registered for this event yet.</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-stone-400 mb-3">
                  Total Confirmed Attendees: <span className="text-white font-bold">{attendees.length}</span>
                </p>
                <div className="overflow-x-auto rounded-xl border border-[#39443d]">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-[#39443d] bg-[#171B19] text-stone-400">
                      <tr>
                        <th className="px-4 py-3">Attendee</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Registered At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#39443d]/60">
                      {attendees.map((att) => (
                        <tr key={att.registration_id}>
                          <td className="px-4 py-3 font-medium text-[#F5F0E6]">
                            {att.name}
                          </td>
                          <td className="px-4 py-3 text-stone-300">{att.email}</td>
                          <td className="px-4 py-3 text-stone-400">
                            {new Date(att.registered_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setRosterEvent(null)}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-[#10251C] hover:bg-emerald-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default OrganizerDashboardPage;
