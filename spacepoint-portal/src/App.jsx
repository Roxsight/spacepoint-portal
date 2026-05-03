import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/admin/Dashboard";
import LegacyAmbassadorDashboard from "./pages/ambassador/Dashboard";
import LegacyInstructorDashboard from "./pages/instructor/Dashboard";
import LegacyInternDashboard from "./pages/intern/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import OnboardingFlow from "./pages/OnboardingFlow";
import InstructorDashboard from "./pages/InstructorDashboard";
import AmbassadorDashboard from "./pages/AmbassadorDashboard";
import InternDashboard from "./pages/InternDashboard";

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
    ambassador: "/dashboard/ambassador",
    instructor: "/dashboard/instructor",
    intern: "/dashboard/intern",
  };

  return <Navigate replace to={routes[profile?.role] ?? "/login"} />;
}

function RequireRole({ role, children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-8 text-white">Loading...</div>;
  }

  if (profile?.role !== role) {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Landing />} path="/" />
        <Route element={<AuthCallback />} path="/auth/callback" />
        <Route element={<AuthPage />} path="/login" />
        <Route element={<OnboardingFlow />} path="/onboarding" />
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
              <RequireRole role="instructor">
                <InstructorDashboard />
              </RequireRole>
            </RequireAuth>
          }
          path="/dashboard/instructor"
        />
        <Route
          element={
            <RequireAuth>
              <RequireRole role="ambassador">
                <AmbassadorDashboard />
              </RequireRole>
            </RequireAuth>
          }
          path="/dashboard/ambassador"
        />
        <Route
          element={
            <RequireAuth>
              <RequireRole role="intern">
                <InternDashboard />
              </RequireRole>
            </RequireAuth>
          }
          path="/dashboard/intern"
        />
        <Route
          element={
            <RequireAuth>
              <LegacyInstructorDashboard />
            </RequireAuth>
          }
          path="/instructor"
        />
        <Route
          element={
            <RequireAuth>
              <LegacyAmbassadorDashboard />
            </RequireAuth>
          }
          path="/ambassador"
        />
        <Route
          element={
            <RequireAuth>
              <LegacyInternDashboard />
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
