import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface UserRegistration {
  registration_id: number;
  registered_at: string;
  user_id: number;
  event_id: number;
  title: string;
  description: string | null;
  location: string;
  starts_at: string;
  capacity: number | null;
  image_url: string | null;
  category: string | null;
}

const AttendeeDashboardPage = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [cancelError, setCancelError] = useState("");

  const fetchRegistrations = async () => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setError("Please log in to view your registrations.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/registrations/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve your registrations.");
      }

      const data: UserRegistration[] = await response.json();
      setRegistrations(data);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load registrations"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelRegistration = async (registrationId: number, eventTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your registration for "${eventTitle}"?`
    );
    if (!confirmed) return;

    const token = sessionStorage.getItem("access_token");
    if (!token) return;

    try {
      setCancellingId(registrationId);
      setCancelError("");
      setCancelSuccess("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/registrations/${registrationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel registration.");
      }

      setRegistrations((prev) =>
        prev.filter((r) => r.registration_id !== registrationId)
      );
      setCancelSuccess(`Successfully cancelled registration for "${eventTitle}".`);
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : "Could not cancel registration"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingRegistrations = registrations.filter(
    (r) => new Date(r.starts_at).getTime() >= Date.now()
  );

  const pastRegistrations = registrations.filter(
    (r) => new Date(r.starts_at).getTime() < Date.now()
  );

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Attendee Portal
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-[#F5F0E6] sm:text-4xl">
            My Registered Events
          </h1>
          <p className="mt-1 text-stone-400">
            Welcome back, <span className="text-white font-medium">{user?.name}</span>. Manage your event tickets and reservations.
          </p>
        </div>

        <div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-[#10251C] transition hover:bg-emerald-400"
          >
            <span>Explore More Events</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {cancelSuccess && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {cancelSuccess}
        </div>
      )}

      {cancelError && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {cancelError}
        </div>
      )}

      {/* Summary Cards */}
      <section className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-6">
          <p className="text-sm font-medium text-stone-400">Total Bookings</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#F5F0E6]">
            {registrations.length}
          </h2>
          <p className="mt-1 text-xs text-stone-400">Lifetime registrations</p>
        </div>

        <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-6">
          <p className="text-sm font-medium text-stone-400">Upcoming Events</p>
          <h2 className="mt-2 text-3xl font-extrabold text-emerald-400">
            {upcomingRegistrations.length}
          </h2>
          <p className="mt-1 text-xs text-stone-400">Active tickets reserved</p>
        </div>

        <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-6">
          <p className="text-sm font-medium text-stone-400">Past Events</p>
          <h2 className="mt-2 text-3xl font-extrabold text-stone-400">
            {pastRegistrations.length}
          </h2>
          <p className="mt-1 text-xs text-stone-400">Attended experiences</p>
        </div>
      </section>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-stone-400 animate-pulse">Loading your registrations...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
          {error}
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-12 text-center">
          <span className="text-5xl">🎫</span>
          <h3 className="mt-4 text-xl font-bold text-[#F5F0E6]">
            No Event Registrations Yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-400">
            You haven't reserved spots for any upcoming experiences yet. Browse our curated events and claim your ticket!
          </p>
          <Link
            to="/events"
            className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-[#10251C] transition hover:bg-emerald-400"
          >
            Browse Events Now
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Upcoming Events Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#F5F0E6]">
                Upcoming Registered Events
              </h2>
              <p className="text-sm text-stone-400">
                Events you are currently scheduled to attend.
              </p>
            </div>

            {upcomingRegistrations.length === 0 ? (
              <p className="rounded-xl border border-[#39443d] p-6 text-stone-400">
                No upcoming events scheduled.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingRegistrations.map((item) => (
                  <div
                    key={item.registration_id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#39443d] bg-[#222925] shadow-lg transition hover:border-emerald-500/50"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-[#171B19]">
                      <img
                        src={
                          item.image_url ??
                          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80"
                        }
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#222925] via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-[#10251C]">
                        {item.category ?? "Event"}
                      </span>
                      <span className="absolute right-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-sm">
                        ✓ Confirmed
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className="text-xl font-bold text-[#F5F0E6]">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-stone-400">
                          {item.description || "No description provided."}
                        </p>

                        <div className="mt-4 space-y-2 text-xs text-stone-300">
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>
                              {new Date(item.starts_at).toLocaleString("en-GB", {
                                dateStyle: "full",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-stone-400">
                            <span>🎟️</span>
                            <span>
                              Registration ID: #{item.registration_id}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#39443d] pt-4">
                        <Link
                          to={`/events/${item.event_id}`}
                          className="text-sm font-semibold text-emerald-400 hover:underline"
                        >
                          View Details &rarr;
                        </Link>

                        <button
                          type="button"
                          disabled={cancellingId === item.registration_id}
                          onClick={() =>
                            handleCancelRegistration(
                              item.registration_id,
                              item.title
                            )
                          }
                          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {cancellingId === item.registration_id
                            ? "Cancelling..."
                            : "Cancel Ticket"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Events Section */}
          {pastRegistrations.length > 0 && (
            <section className="opacity-80">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#F5F0E6]">Past Attended Events</h2>
                <p className="text-sm text-stone-400">
                  Experiences you have previously attended.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastRegistrations.map((item) => (
                  <div
                    key={item.registration_id}
                    className="rounded-xl border border-[#39443d] bg-[#1d2320] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-400">
                        {item.category ?? "Event"}
                      </span>
                      <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] text-stone-400">
                        Completed
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-[#F5F0E6]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-stone-400">
                      {new Date(item.starts_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">{item.location}</p>
                    <div className="mt-4">
                      <Link
                        to={`/events/${item.event_id}`}
                        className="text-xs text-stone-400 hover:text-emerald-400"
                      >
                        View event page &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
};

export default AttendeeDashboardPage;
