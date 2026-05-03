import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/admin/Dashboard";
import AmbassadorDashboard from "./pages/ambassador/Dashboard";
import InstructorDashboard from "./pages/instructor/Dashboard";
import InternDashboard from "./pages/intern/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Signup from "./pages/Signup";

function RequireAuth({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-8 text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (!profile?.onboarding_complete) {
    return <Navigate replace to="/onboarding" />;
  }

  return children;
}

function RoleRouter() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-8 text-white">Loading...</div>;
  }

  const routes = {
    admin: "/admin",
    ambassador: "/ambassador",
    instructor: "/instructor",
    intern: "/intern",
  };

  return <Navigate replace to={routes[profile?.role] ?? "/login"} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Landing />} path="/" />
        <Route element={<AuthCallback />} path="/auth/callback" />
        <Route element={<Login />} path="/login" />
        <Route element={<Signup />} path="/signup" />
        <Route element={<Onboarding />} path="/onboarding" />
        <Route
          element={
            <RequireAuth>
              <RoleRouter />
            </RequireAuth>
          }
          path="/dashboard"
        />
        <Route
          element={
            <RequireAuth>
              <InstructorDashboard />
            </RequireAuth>
          }
          path="/instructor"
        />
        <Route
          element={
            <RequireAuth>
              <AmbassadorDashboard />
            </RequireAuth>
          }
          path="/ambassador"
        />
        <Route
          element={
            <RequireAuth>
              <InternDashboard />
            </RequireAuth>
          }
          path="/intern"
        />
        <Route
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
          path="/admin"
        />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
