
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const roleLabels = {
    user: "Attendee",
    organizer: "Organizer",
    admin: "Admin",
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="flex w-full items-center justify-between border-b border-[#39443d] px-8 py-5">
      <h1 className="text-xl font-bold text-[#F5F0E6]">
        <Link to="/">Eventify</Link>
      </h1>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-stone-400 hover:text-emerald-400">
          Home
        </Link>

        <Link to="/events" className="text-stone-400 hover:text-emerald-400">
          Events
        </Link>

        <a href="#about" className="text-stone-400 hover:text-emerald-400">
          About
        </a>
      </div>

      <div className="flex items-center gap-4">
       <Link
  to="/dashboard"
  aria-label="Open your dashboard"
  className="flex items-center gap-3 rounded-lg transition hover:bg-[#222925] hover:px-2 hover:py-1"
>
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-[#10251C]">
    {initials || "U"}
  </div>

  <div>
    <p className="text-sm font-semibold text-[#F5F0E6]">
      {user?.name}
    </p>

    <p className="text-xs text-emerald-400">
      {user && roleLabels[user.role]}
    </p>
  </div>
</Link>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-[#39443d] px-4 py-2 font-semibold text-stone-300 transition hover:border-red-400 hover:text-red-400"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
