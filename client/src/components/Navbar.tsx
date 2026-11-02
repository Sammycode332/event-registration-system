import { Link } from "react-router-dom"

function Navbar() {
    return (
        <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-[#39443d]">
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

            <Link
                to="/login"
                className="bg-emerald-500 text-[#10251C] px-4 py-2 rounded-lg font-semibold hover:bg-emerald-400"
            >
                Sign in
            </Link>
        </nav>
    )
}

export default Navbar