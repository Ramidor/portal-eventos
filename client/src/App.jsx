import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage               from "./pages/LoginPage";
import RegisterPage            from "./pages/RegisterPage";
import VerifyEmailPage         from "./pages/VerifyEmailPage";
import ResendVerificationPage  from "./pages/ResendVerificationPage";
import ForgotPasswordPage      from "./pages/ForgotPasswordPage";
import ResetPasswordPage       from "./pages/ResetPasswordPage";
import EventsPage              from "./pages/EventsPage";
import ProfilePage             from "./pages/ProfilePage";
import AdminPage               from "./pages/AdminPage";
import UserProfilePage         from "./pages/UserProfilePage";

// Lazy: cargan en chunk separado para aislar Leaflet del bundle principal
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage   = lazy(() => import("./pages/EditEventPage"));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
    <Routes>
      {/* Públicas */}
      <Route path="/login"                element={<LoginPage />} />
      <Route path="/register"             element={<RegisterPage />} />
      <Route path="/verify-email"         element={<VerifyEmailPage />} />
      <Route path="/resend-verification"  element={<ResendVerificationPage />} />
      <Route path="/forgot-password"      element={<ForgotPasswordPage />} />
      <Route path="/reset-password"       element={<ResetPasswordPage />} />
      <Route path="/events"               element={<EventsPage />} />
      <Route path="/events/:id"           element={<EventDetailPage />} />
      <Route path="/users/:id"            element={<UserProfilePage />} />

      {/* Privadas */}
      <Route path="/events/new"     element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
      <Route path="/events/:id/edit" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
      <Route path="/profile"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Solo ADMIN */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
    </Suspense>
  );
}