import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutFailure from './pages/CheckoutFailure';
import CustomerPortal from './pages/CustomerPortal';
import NewLogPage from './pages/NewLogPage';
import LogHistory from './pages/LogHistory';
import WeeklyBriefs from './pages/WeeklyBriefs';
import Settings from './pages/Settings';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Subscription routes */}
          <Route path="/subscription/success" element={<CheckoutSuccess />} />
          <Route path="/subscription/failure" element={<CheckoutFailure />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/log/new"
            element={
              <ProtectedRoute>
                <NewLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <LogHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/briefs"
            element={
              <ProtectedRoute>
                <WeeklyBriefs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription/portal"
            element={
              <ProtectedRoute>
                <CustomerPortal />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;