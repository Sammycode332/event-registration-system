import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"

function AppLayout() {
  return (
    <main>
      <Navbar />
      <Outlet />
    </main>
  )
}

export default AppLayout