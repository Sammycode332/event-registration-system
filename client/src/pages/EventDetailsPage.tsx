import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Registration state
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [isCheckingReg, setIsCheckingReg] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${eventId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Event not found.");
        }
        throw new Error("Unable to retrieve event details.");
      }

      const data: Event = await response.json();
      setEvent(data);
    } catch (err) {
      console.error("Failed to fetch event:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    const token = sessionStorage.getItem("access_token");
    if (!token || !eventId) return;

    try {
      setIsCheckingReg(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/registrations/check/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setIsRegistered(Boolean(data.isRegistered));
        if (data.registration?.id) {
          setRegistrationId(data.registration.id);
        }
      }
    } catch (err) {
      console.error("Registration check failed:", err);
    } finally {
      setIsCheckingReg(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    if (isAuthenticated) {
      checkRegistrationStatus();
    }
    // Fetch again only when the route or authenticated state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, isAuthenticated]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const token = sessionStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsRegistering(true);
      setRegError("");
      setRegSuccess("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            event_id: Number(eventId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register for event.");
      }

      setIsRegistered(true);
      setRegistrationId(data.registration?.id || null);
      setRegSuccess("🎉 You're in! Your spot is confirmed.");

      // Refresh event to update registration counts
      await fetchEvent();
    } catch (err) {
      setRegError(
        err instanceof Error ? err.message : "Registration failed. Try again."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your registration for this event?"
    );
    if (!confirmed) return;

    const token = sessionStorage.getItem("access_token");
    if (!token || !registrationId) return;

    try {
      setIsRegistering(true);
      setRegError("");
      setRegSuccess("");

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

      setIsRegistered(false);
      setRegistrationId(null);
      setRegSuccess("Registration cancelled successfully.");

      // Refresh event count
      await fetchEvent();
    } catch (err) {
      setRegError(
        err instanceof Error ? err.message : "Cancellation failed."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-stone-400 animate-pulse">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#F5F0E6]">
          {error || "Event not found"}
        </h1>
        <p className="mt-3 text-stone-400">
          Sorry, we couldn't find the event you're looking for.
        </p>
        <Link
          to="/events"
          className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-[#10251C]"
        >
          &larr; Back to Events
        </Link>
      </div>
    );
  }

  const regCount = Number(event.registration_count) || 0;
  const capacity = event.capacity;
  const isSoldOut = capacity !== null && regCount >= capacity;
  const isPast = new Date(event.starts_at).getTime() < Date.now();
  const spotsLeft = capacity !== null ? Math.max(0, capacity - regCount) : null;

  return (
    <section className="px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 transition hover:text-emerald-400"
          >
            <span>&larr;</span>
            <span>All Events</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="relative min-h-[360px] md:min-h-[460px] overflow-hidden rounded-3xl border border-[#39443D] shadow-2xl">
          <img
            src={
              event.image_url ??
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80"
            }
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#171B19] via-[#171B19]/50 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#10251C]">
                {event.category ?? "General"}
              </span>

              {isPast ? (
                <span className="rounded-full bg-stone-800/80 px-3 py-1 text-xs font-semibold text-stone-300 backdrop-blur-sm">
                  Event Passed
                </span>
              ) : isSoldOut ? (
                <span className="rounded-full bg-red-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  Sold Out
                </span>
              ) : (
                <span className="rounded-full bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                  {spotsLeft !== null ? `${spotsLeft} spots available` : "Spots Open"}
                </span>
              )}

              {isRegistered && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
                  ✓ Registered
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold text-[#F5F0E6] md:text-5xl lg:text-6xl">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Content & Booking Info */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-[#39443D] bg-[#222925] p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#F5F0E6]">
                About This Experience
              </h2>
              <div className="mt-4 whitespace-pre-line leading-relaxed text-stone-300">
                {event.description ||
                  "No detailed description has been provided for this event yet. Check back soon for speaker bios, schedules, and additional info."}
              </div>
            </div>

            {/* Event Highlights Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#39443D] bg-[#222925] p-6">
                <span className="text-2xl">📍</span>
                <h3 className="mt-3 text-lg font-bold text-[#F5F0E6]">Venue & Location</h3>
                <p className="mt-1 text-sm text-stone-400">{event.location}</p>
              </div>

              <div className="rounded-2xl border border-[#39443D] bg-[#222925] p-6">
                <span className="text-2xl">🕒</span>
                <h3 className="mt-3 text-lg font-bold text-[#F5F0E6]">Schedule</h3>
                <p className="mt-1 text-sm text-stone-400">
                  {new Date(event.starts_at).toLocaleString("en-GB", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Reservation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-3xl border border-[#39443D] bg-[#222925] p-7 shadow-xl">
              <h2 className="text-xl font-bold text-[#F5F0E6]">
                Registration Details
              </h2>

              {/* Capacity Progress Bar */}
              {capacity !== null && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-stone-300 mb-2">
                    <span>Capacity Status</span>
                    <span className="font-semibold text-emerald-400">
                      {regCount} / {capacity}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#171B19]">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isSoldOut ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (regCount / capacity) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-stone-400">
                    {isSoldOut
                      ? "Capacity reached. Registration is closed."
                      : `${spotsLeft} seats remaining.`}
                  </p>
                </div>
              )}

              {/* Status alerts */}
              {regSuccess && (
                <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-400">
                  {regSuccess}
                </div>
              )}

              {regError && (
                <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-medium text-red-400">
                  {regError}
                </div>
              )}

              {/* Registration Call to Action */}
              <div className="mt-8 space-y-4">
                {isPast ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-stone-700 px-5 py-3.5 font-semibold text-stone-400 cursor-not-allowed"
                  >
                    Event Has Ended
                  </button>
                ) : isRegistered ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-4 text-center">
                      <span className="text-2xl">🎟️</span>
                      <p className="mt-1 font-bold text-emerald-300">
                        You have a confirmed reservation!
                      </p>
                      <p className="text-xs text-stone-300 mt-1">
                        View ticket in your attendee portal.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isRegistering}
                      onClick={handleCancelRegistration}
                      className="w-full rounded-xl border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {isRegistering ? "Processing..." : "Cancel Reservation"}
                    </button>
                  </div>
                ) : isSoldOut ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-stone-700 px-5 py-3.5 font-semibold text-stone-400 cursor-not-allowed"
                  >
                    Event Sold Out
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isRegistering || isCheckingReg}
                    onClick={handleRegister}
                    className="w-full rounded-xl bg-emerald-500 px-5 py-4 font-bold text-[#10251C] transition hover:bg-emerald-400 hover:shadow-lg disabled:opacity-50"
                  >
                    {isRegistering
                      ? "Reserving spot..."
                      : !isAuthenticated
                      ? "Sign In to Register"
                      : "Register for Event"}
                  </button>
                )}

                {!isAuthenticated && !isPast && !isSoldOut && (
                  <p className="text-center text-xs text-stone-400">
                    Already registered?{" "}
                    <Link to="/login" className="text-emerald-400 underline">
                      Sign in here
                    </Link>
                  </p>
                )}
              </div>

              {/* Extra Info */}
              <div className="mt-8 border-t border-[#39443D] pt-6 space-y-3 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <span>✓</span> Instant ticket confirmation
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span> Free ticket cancellation anytime
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span> Verified platform organizers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
