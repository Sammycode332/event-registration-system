import { Routes, Route } from 'react-router-dom'
import HomePage from "./pages/HomePage"
import EventsPage from "./pages/EventsPage"
import EventDetailsPage from "./pages/EventDetailsPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import AppLayout from "./components/AppLayout"
function App() {
  return (
    <Routes>
      <Route element = {<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="events/:eventId" element={<EventDetailsPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      </Route>     
    </Routes>
  )
}

export default App
