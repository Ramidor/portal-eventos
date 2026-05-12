import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage               from "./pages/LoginPage";
import RegisterPage            from "./pages/RegisterPage";
import VerifyEmailPage         from "./pages/VerifyEmailPage";
import ResendVerificationPage  from "./pages/ResendVerificationPage";
import EventsPage              from "./pages/EventsPage";
import EventDetailPage         from "./pages/EventDetailPage";
import CreateEventPage         from "./pages/CreateEventPage";
import EditEventPage           from "./pages/EditEventPage";
import ProfilePage             from "./pages/ProfilePage";
import AdminPage               from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"                element={<LoginPage />} />
      <Route path="/register"             element={<RegisterPage />} />
      <Route path="/verify-email"         element={<VerifyEmailPage />} />
      <Route path="/resend-verification"  element={<ResendVerificationPage />} />
      <Route path="/events"               element={<EventsPage />} />
      <Route path="/events/:id"           element={<EventDetailPage />} />

      {/* Privadas */}
      <Route path="/events/new"     element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
      <Route path="/events/:id/edit" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
      <Route path="/profile"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Solo ADMIN */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  );
}