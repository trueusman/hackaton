import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { LandingPage } from '../features/public/LandingPage';
import { PublicAssetPage } from '../features/public/PublicAssetPage';
import { ReportIssuePage } from '../features/public/ReportIssuePage';
import { TrackIssuePage } from '../features/public/TrackIssuePage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { AssetsListPage } from '../features/assets/AssetsListPage';
import { AssetDetailPage } from '../features/assets/AssetDetailPage';
import { IssuesListPage } from '../features/issues/IssuesListPage';
import { IssueDetailPage } from '../features/issues/IssueDetailPage';
import { UsersPage } from '../features/users/UsersPage';
import { ROLES } from '../lib/constants';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public, no-auth */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/track" element={<TrackIssuePage />} />
      <Route path="/assets/public/:assetCode" element={<PublicAssetPage />} />
      <Route path="/assets/public/:assetCode/report" element={<ReportIssuePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Internal, protected */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assets" element={<AssetsListPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="issues" element={<IssuesListPage />} />
        <Route path="issues/:id" element={<IssueDetailPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
