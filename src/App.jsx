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
import AuditReportDetailPage from './pages/AuditReportDetailPage';
import RepositoryStatusPage from './pages/RepositoryStatusPage';
import RepositoryResultPage from './pages/RepositoryResultPage';
import ExplorationPage from './pages/ExplorationPage';
import DaoPage from './pages/DaoPage';
// import AirdropCheckPage from './pages/AirdropCheckPage';
import StakePage from './pages/StakePage';
import MultisigPage from './pages/MultisigPage';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationContainer from './components/ui/Notification';

// Import i18n instance
import './i18n';

// Import Providers
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';

// Layout wrapper component
const HomeLayoutWrapper = () => {
  return (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  );
};

// 使用 React.memo 包装 AppContent 组件以避免不必要的重新渲染
const AppContent = React.memo(() => {
  // 不再需要 useAuth hook，因为我们不再使用 user 和 loading 变量
  // 移除日志输出，避免每次渲染都打印日志
  // 如果需要调试，可以使用 useEffect 在组件挂载时打印一次

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

        {/* Report Pages */}
        <Route path="/reports" element={<ReportPage />} />
        <Route path="/reports/:reportId" element={<AuditReportDetailPage />} />

        {/* Repository Status Page */}
        <Route path="/repository-status" element={<RepositoryStatusPage />} />

        {/* Repository Result Page */}
        <Route path="/repository-result/:id" element={<RepositoryResultPage />} />

        {/* White Paper Page */}
        <Route path="/whitepaper" element={<WhitePaperPage />} />

        {/* Countdown Page */}
        <Route path="/countdown" element={<CountdownPage />} />

        {/* Exploration Page */}
        <Route path="/exploration" element={<ExplorationPage />} />

        {/* DAO Page */}
        <Route path="/dao" element={<DaoPage />} />

        {/* Airdrop Check Page */}
        {/* <Route path="/airdrop-check" element={<AirdropCheckPage />} /> */}

        {/* Stake Page */}
        <Route path="/stake" element={<StakePage />} />

        {/* Multisig Page */}
        <Route path="/multisig" element={<MultisigPage />} />

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
});

export const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <WalletProvider>
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                <AppContent />
                <NotificationContainer />
              </Suspense>
          </WalletProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

// Also export as default
export default App;
