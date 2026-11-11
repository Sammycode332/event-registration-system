import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardEvent {
  id: number;
  title: string;
  starts_at: string;
  location: string;
  capacity: number | null;
  registration_count: number;
}

interface DashboardUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "organizer" | "admin";
  created_at?: string;
}

interface DashboardStats {
  total_users: number;
  total_events: number;
  total_registrations: number;
  upcoming_events: number;
  total_attendees: number;
  total_organizers: number;
  total_admins: number;
}

const AdminDashboardPage = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [roleUpdateError, setRoleUpdateError] = useState("");
  const [roleUpdateSuccess, setRoleUpdateSuccess] = useState("");

  const handleRoleChange = async (
    targetUserId: number,
    newRole: DashboardUser["role"]
  ) => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setRoleUpdateError("Your session has expired. Please log in again.");
      return;
    }

    setUpdatingUserId(targetUserId);
    setRoleUpdateError("");
    setRoleUpdateSuccess("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users/${targetUserId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update user role.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((platformUser) =>
          platformUser.id === targetUserId
            ? { ...platformUser, role: newRole }
            : platformUser
        )
      );

      const updatedUser = users.find((u) => u.id === targetUserId);
      setRoleUpdateSuccess(
        `${updatedUser?.name || "User"}'s role was updated to ${newRole}.`
      );
    } catch (err) {
      setRoleUpdateError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        setError("Your session has expired. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        const [usersResponse, statsResponse, upcomingResponse] =
          await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${import.meta.env.VITE_API_URL}/admin/upcoming-events`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (!usersResponse.ok || !statsResponse.ok || !upcomingResponse.ok) {
          throw new Error("Unable to load administration dashboard data.");
        }

        const usersData = await usersResponse.json();
        const statsData = await statsResponse.json();
        const upcomingData = await upcomingResponse.json();

        setUsers(usersData.users || []);
        setStats(statsData.stats || null);
        setUpcomingEvents(upcomingData.events || []);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load dashboard information."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Platform Administration
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-[#F5F0E6] sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-stone-400">
            Welcome back, <span className="text-white font-medium">{user?.name}</span>. Platform overview and controls.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-[#10251C] transition hover:bg-emerald-400"
          >
            Manage Events &rarr;
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-stone-400 animate-pulse">Loading administration data...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
          {error}
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Total Users",
                value: stats?.total_users ?? 0,
                desc: "Registered accounts",
                icon: "👥",
              },
              {
                label: "Total Events",
                value: stats?.total_events ?? 0,
                desc: "Published platform events",
                icon: "📅",
              },
              {
                label: "Registrations",
                value: stats?.total_registrations ?? 0,
                desc: "Total attendee enrollments",
                icon: "🎟️",
              },
              {
                label: "Upcoming Events",
                value: stats?.upcoming_events ?? 0,
                desc: "Scheduled from today onward",
                icon: "🚀",
              },
              {
                label: "Attendees",
                value: stats?.total_attendees ?? 0,
                desc: "Standard attendee roles",
                icon: "🎫",
              },
              {
                label: "Organizers",
                value: stats?.total_organizers ?? 0,
                desc: "Event creators & hosts",
                icon: "🎤",
              },
              {
                label: "Administrators",
                value: stats?.total_admins ?? 0,
                desc: "System operators",
                icon: "🛡️",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="group relative overflow-hidden rounded-2xl border border-[#39443d] bg-[#222925] p-6 transition hover:border-emerald-500/50 hover:bg-[#252f2a]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-400">{metric.label}</p>
                  <span className="text-xl">{metric.icon}</span>
                </div>
                <h3 className="mt-4 text-3xl font-extrabold text-[#F5F0E6]">
                  {metric.value.toLocaleString()}
                </h3>
                <p className="mt-2 text-xs text-emerald-400">{metric.desc}</p>
              </div>
            ))}
          </section>

          {/* Upcoming Events Preview */}
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#F5F0E6]">Next Upcoming Events</h2>
                <p className="mt-1 text-sm text-stone-400">
                  Imminent events scheduled across the platform.
                </p>
              </div>
              <Link
                to="/admin/events"
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                View all in Event Manager &rarr;
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-8 text-center text-stone-400">
                No upcoming events scheduled right now.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex flex-col justify-between rounded-xl border border-[#39443d] bg-[#222925] p-5 transition hover:border-emerald-500/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          {evt.registration_count ?? 0} {evt.capacity ? `/ ${evt.capacity}` : "registered"}
                        </span>
                        <span className="text-xs text-stone-400">ID #{evt.id}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-[#F5F0E6]">{evt.title}</h3>
                      <p className="mt-2 text-xs text-stone-400 flex items-center gap-1">
                        <span>📍</span> {evt.location}
                      </p>
                      <p className="mt-1 text-xs text-stone-400 flex items-center gap-1">
                        <span>🕒</span>{" "}
                        {new Date(evt.starts_at).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-[#39443d]/60 pt-3 flex justify-between items-center">
                      <Link
                        to={`/events/${evt.id}`}
                        className="text-xs font-semibold text-emerald-400 hover:underline"
                      >
                        Public details &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* User Management & Role Administration */}
          <section className="mt-12">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#F5F0E6]">Platform Users & Roles</h2>
                <p className="mt-1 text-sm text-stone-400">
                  Assign administrative or organizer permissions to registered users.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search user by name, email, or role..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full sm:max-w-xs rounded-xl border border-[#39443d] bg-[#171B19] px-4 py-2.5 text-sm text-[#F5F0E6] outline-none placeholder:text-stone-500 focus:border-emerald-500"
              />
            </div>

            {roleUpdateSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                {roleUpdateSuccess}
              </div>
            )}
            {roleUpdateError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {roleUpdateError}
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-[#39443d] bg-[#222925]">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#39443d] text-xs uppercase tracking-wider text-stone-400">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4">Change Role</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#39443d]/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-stone-400">
                        No users match "{searchUser}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u.id === user?.id;
                      const isUpdating = updatingUserId === u.id;

                      return (
                        <tr key={u.id} className="transition hover:bg-[#252f2a]">
                          <td className="px-6 py-4 font-semibold text-[#F5F0E6]">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p>{u.name}</p>
                                {isSelf && (
                                  <span className="text-[10px] text-emerald-400 uppercase font-bold">
                                    (You)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-stone-300">{u.email}</td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                                u.role === "admin"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : u.role === "organizer"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              {u.role === "admin"
                                ? "Administrator"
                                : u.role === "organizer"
                                ? "Organizer"
                                : "Attendee"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <select
                              value={u.role}
                              disabled={isSelf || isUpdating}
                              onChange={(e) =>
                                handleRoleChange(
                                  u.id,
                                  e.target.value as DashboardUser["role"]
                                )
                              }
                              className="rounded-lg border border-[#39443d] bg-[#171B19] px-3 py-1.5 text-xs text-[#F5F0E6] outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <option value="user">Attendee</option>
                              <option value="organizer">Organizer</option>
                              <option value="admin">Admin</option>
                            </select>
                            {isUpdating && (
                              <span className="ml-2 text-xs text-emerald-400 animate-pulse">
                                Updating...
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default AdminDashboardPage;
