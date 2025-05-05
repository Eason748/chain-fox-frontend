import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import HomeLayout from './components/HomePage/HomeLayout';
import { HomePage } from './pages/HomePage';
import DetectionPage from './pages/DetectionPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import WhitePaperPage from './pages/WhitePaperPage';
import CountdownPage from './pages/CountdownPage';
import ProfilePage from './pages/ProfilePage';
import ReportPage from './pages/ReportPage';
import RepositoryStatusPage from './pages/RepositoryStatusPage';
import RepositoryResultPage from './pages/RepositoryResultPage';
import ErrorBoundary from './components/ErrorBoundary';

// Import i18n instance
import './i18n';

// Import Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';

// Layout wrapper component
const HomeLayoutWrapper = () => {
  return (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  );
};

const AppContent = () => {
  // Use useAuth hook to get user information and loading state
  const { user, loading } = useAuth();

  console.log("AppContent: User status", { user, loading });

  return (
    <Routes>
      {/* Auth routes without layout */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Routes with HomeLayout */}
      <Route element={<HomeLayoutWrapper />}>
        {/* Home page */}
        <Route path="/" element={<HomePage />} />

        {/* Report Page */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Detection Page */}
        <Route path="/detect" element={<DetectionPage />} />

        {/* Report Page */}
        <Route path="/reports" element={<ReportPage />} />

        {/* Repository Status Page */}
        <Route path="/repository-status" element={<RepositoryStatusPage />} />

        {/* Repository Result Page */}
        <Route path="/repository-result/:id" element={<RepositoryResultPage />} />

        {/* White Paper Page */}
        <Route path="/whitepaper" element={<WhitePaperPage />} />

        {/* Countdown Page */}
        <Route path="/countdown" element={<CountdownPage />} />

        {/* 404 page */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen">
              <h1 className="text-2xl">Page not found</h1>
            </div>
          }
        />
      </Route>
    </Routes>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <LayoutProvider>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
              <AppContent />
            </Suspense>
          </LayoutProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

// Also export as default
export default App;
