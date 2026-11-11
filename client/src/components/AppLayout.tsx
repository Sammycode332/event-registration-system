import Navbar from "./Navbar";
import { Outlet, Link } from "react-router-dom";

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#171B19] text-[#F5F0E6]">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-[#39443D] bg-[#121514] px-6 py-12 text-sm text-stone-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-black text-[#10251C]">
              E
            </div>
            <span className="font-bold text-[#F5F0E6]">Eventify</span>
            <span className="text-xs text-stone-500">
              © {new Date().getFullYear()} CodeAlpha Internship Project
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/" className="hover:text-emerald-400">
              Home
            </Link>
            <Link to="/events" className="hover:text-emerald-400">
              Discover Events
            </Link>
            <Link to="/dashboard" className="hover:text-emerald-400">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
