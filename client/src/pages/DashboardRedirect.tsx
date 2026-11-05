import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DashboardRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;

    case "organizer":
      return <Navigate to="/organizer/dashboard" replace />;

    case "user":
      return <Navigate to="/attendee/dashboard" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;