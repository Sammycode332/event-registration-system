import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("")
    : "U";

  const roleLabels: Record<string, string> = {
    user: "Attendee",
    organizer: "Organizer",
    admin: "Admin",
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { to: "/", label: "Home", end: true },
    { to: "/events", label: "Explore Events" },
    ...(isAuthenticated && user?.role === "user"
      ? [{ to: "/attendee/dashboard", label: "My Tickets" }]
      : []),
    ...(isAuthenticated && user?.role === "organizer"
      ? [{ to: "/organizer/dashboard", label: "Organizer Portal" }]
      : []),
    ...(isAuthenticated && user?.role === "admin"
      ? [
          { to: "/admin/dashboard", label: "Admin Overview" },
          { to: "/admin/events", label: "Manage Events" },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-[#39443d] bg-[#171B19]/90 backdrop-blur-md px-4 py-3.5 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-extrabold text-[#10251C] shadow-md group-hover:scale-105 transition-transform">
            E
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#F5F0E6] group-hover:text-emerald-400 transition-colors">
            Eventify
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `rounded-lg px-3 py-2 transition ${isActive ? "bg-emerald-500/10 text-emerald-400" : "text-stone-300 hover:text-emerald-400"}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right Nav / Auth Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                aria-label="Open your dashboard"
                className="flex items-center gap-3 rounded-xl border border-[#39443d] bg-[#222925] px-3 py-1.5 transition hover:border-emerald-500/50 hover:bg-[#252f2a]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-[#10251C]">
                  {initials}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#F5F0E6] line-clamp-1 max-w-[120px]">
                    {user?.name}
                  </p>
                  <p className="text-[10px] uppercase font-semibold text-emerald-400">
                    {user && (roleLabels[user.role] ?? user.role)}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-[#39443d] px-3.5 py-2 text-xs font-semibold text-stone-300 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-stone-300 transition hover:text-white px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-[#10251C] transition hover:bg-emerald-400 shadow-md"
              >
                Get Started
              </Link>
            </div>
          )}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#39443d] text-lg text-stone-200 transition hover:border-emerald-500 hover:text-emerald-400 md:hidden"
          >
            {isMenuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="mx-auto mt-3 max-w-7xl border-t border-[#39443d] pt-3 md:hidden">
          <div className="grid gap-1 rounded-xl bg-[#222925] p-2 shadow-xl">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => `rounded-lg px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-emerald-500 text-[#10251C]" : "text-stone-200 hover:bg-[#2b352f]"}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
