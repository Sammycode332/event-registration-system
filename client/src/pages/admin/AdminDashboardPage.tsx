import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardEvent {
  id: number;
  title: string;
  starts_at: string;
  location: string;
}

interface DashboardUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "organizer" | "admin";
}

const AdminDashboardPage = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
const [roleUpdateError, setRoleUpdateError] = useState("");
const [roleUpdateSuccess, setRoleUpdateSuccess] = useState("");
const handleRoleChange = async (
  targetUserId: number,
  newRole: DashboardUser["role"]
) => {
  const token = sessionStorage.getItem("access_token");

  if (!token) {
    setRoleUpdateError("Your session has expired.");
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

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Unable to update user role.");
    }

    setUsers((currentUsers) =>
      currentUsers.map((platformUser) =>
        platformUser.id === targetUserId
          ? { ...platformUser, role: newRole }
          : platformUser
      )
    );
    setRoleUpdateSuccess(
  `${targetUserId}'s role was successfully updated to ${newRole}.`
);
const updatedUser = users.find(
  (platformUser) => platformUser.id === targetUserId
);

setRoleUpdateSuccess(
  `${updatedUser?.name}'s role was successfully changed to ${newRole}.`
);
  } catch (error) {
    setRoleUpdateError(
      error instanceof Error ? error.message : "Something went wrong."
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
      const [usersResponse, eventsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/events`),
      ]);

      if (!usersResponse.ok || !eventsResponse.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const usersData = await usersResponse.json();
      const eventsData = await eventsResponse.json();

      setUsers(usersData.users);
      setEvents(eventsData);
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setError("Could not load dashboard information.");
    } finally {
      setIsLoading(false);
    }
  };

  fetchDashboardData();
}, []);
  return (
    <main className="min-h-screen px-8 py-10">
      <div className="mb-10">
        <p className="text-sm font-medium text-emerald-400">
          ADMINISTRATION
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#F5F0E6]">
          Welcome back, {user?.name}
        </h1>

        <p className="mt-2 text-stone-400">
          Here's an overview of your event platform.
        </p>
      </div>
      {isLoading ? (
  <p className="text-stone-400">Loading dashboard data...</p>
) : error ? (
  <p className="text-red-400">{error}</p>
) : (
  <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-6">
      <p className="text-sm text-stone-400">Total Users</p>
      <h2 className="mt-3 text-3xl font-bold text-[#F5F0E6]">
        {users.length}
      </h2>
      <p className="mt-2 text-sm text-emerald-400">
        Registered platform users
      </p>
    </div>

    <div className="rounded-2xl border border-[#39443d] bg-[#222925] p-6">
      <p className="text-sm text-stone-400">Total Events</p>
      <h2 className="mt-3 text-3xl font-bold text-[#F5F0E6]">
        {events.length}
      </h2>
      <p className="mt-2 text-sm text-emerald-400">
        Events on the platform
      </p>
    </div>
  </section>
  
)}
<section className="mt-12">
  <div className="mb-6">
    <h2 className="text-xl font-bold text-[#F5F0E6]">
      User Management
    </h2>
    <p className="mt-1 text-sm text-stone-400">
      View and manage registered platform users.
    </p>
  </div>

  <div className="overflow-x-auto rounded-2xl border border-[#39443d] bg-[#222925]">
    <table className="w-full text-left">
      <thead className="border-b border-[#39443d] text-sm text-stone-400">
        <tr>
          <th className="px-6 py-4">Name</th>
          <th className="px-6 py-4">Email</th>
          <th className="px-6 py-4">Role</th>
        </tr>
      </thead>

      <tbody>
        {users.map((platformUser) => (
          <tr
            key={platformUser.id}
            className="border-b border-[#39443d] last:border-0"
          >
            <td className="px-6 py-4 font-medium text-[#F5F0E6]">
              {platformUser.name}
            </td>

            <td className="px-6 py-4 text-stone-400">
              {platformUser.email}
            </td>

            <td className="px-6 py-4">
  <select
    value={platformUser.role}
    disabled={
      platformUser.id === user?.id ||
      updatingUserId === platformUser.id
    }
    onChange={(event) =>
      handleRoleChange(
        platformUser.id,
        event.target.value as DashboardUser["role"]
      )
    }
    className="rounded-lg border border-[#39443d] bg-[#171B19] px-3 py-2 text-sm text-[#F5F0E6] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <option value="user">Attendee</option>
    <option value="organizer">Organizer</option>
    <option value="admin">Admin</option>
  </select>

  {updatingUserId === platformUser.id && (
    <span className="ml-2 text-xs text-emerald-400">
      Updating...
    </span>
  )}
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  {roleUpdateSuccess && (
  <p className="mt-4 text-sm text-emerald-400">
    {roleUpdateSuccess}
  </p>
)}
</section>
    </main>
  );
};

export default AdminDashboardPage;