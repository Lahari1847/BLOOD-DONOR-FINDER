import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useAuth } from './context/AuthContext';

// Pages
import { HomePage } from './pages/HomePage';
import { FindDonorsPage } from './pages/FindDonorsPage';
import { DonorRegisterPage } from './pages/DonorRegisterPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { DonorDashboardPage } from './pages/DonorDashboardPage';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { EmergencyRequestsPage } from './pages/EmergencyRequestsPage';
import { BloodBanksPage } from './pages/BloodBanksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { EligibilityGuidePage } from './pages/EligibilityGuidePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  requiredRole?: 'ADMIN' | 'DONOR' | 'PATIENT' | 'HOSPITAL';
}> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crimson-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true }}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-crimson-100 selection:text-crimson-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* 1. Landing Page */}
            <Route path="/" element={<HomePage />} />

            {/* 2. Find Donors */}
            <Route path="/find-donors" element={<FindDonorsPage />} />

            {/* 3. Donor Registration & Setup */}
            <Route path="/donor/register" element={<DonorRegisterPage />} />

            {/* 4. Patient / Requester Dashboard */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute>
                  <PatientDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 5. Donor Dashboard */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute requiredRole="DONOR">
                  <DonorDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 6. Create Blood Request */}
            <Route
              path="/create-request"
              element={
                <ProtectedRoute>
                  <CreateRequestPage />
                </ProtectedRoute>
              }
            />

            {/* 7. Emergency Requests */}
            <Route path="/emergency" element={<EmergencyRequestsPage />} />

            {/* 8. Blood Banks & Hospitals Directory */}
            <Route path="/directory" element={<BloodBanksPage />} />

            {/* 9. Notifications and Request Tracking */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* 10. Eligibility Information & Preparation Guide */}
            <Route path="/eligibility" element={<EligibilityGuidePage />} />

            {/* 11. Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 12. Login, Registration, Forgot Password */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* 13. Profile Settings, Privacy & Donation History */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ProfileSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
