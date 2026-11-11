import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardRedirect from "./pages/DashboardRedirect";
import AttendeeDashboardPage from "./pages/attendee/AttendeeDashboardPage";
import OrganizerDashboardPage from "./pages/organizer/OrganizerDashboardPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes - open for discovery */}
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<LoginPage />} />

        {/* Protected routes - require authenticated session */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route path="attendee/dashboard" element={<AttendeeDashboardPage />} />
          <Route path="organizer/dashboard" element={<OrganizerDashboardPage />} />
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="admin/events" element={<AdminEventsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
