import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import ProtectedRoute from '../../core/auth/ProtectedRoute'

const DashboardPage = lazy(() => import('../../modules/dashboard/pages/DashboardPage'))
const PlaceholderPage = lazy(() => import('../../components/common/PlaceholderPage'))
const LoginPage = lazy(() => import('../../modules/auth/pages/LoginPage'))

function ProtectedAdminLayout() {
  const location = useLocation()

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div data-current-path={location.pathname}>
          <Outlet />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="page-loading" role="status" aria-live="polite">
          در حال بارگذاری صفحه...
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedAdminLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route path="/content" element={<PlaceholderPage />} />
          <Route path="/categories" element={<PlaceholderPage />} />
          <Route path="/media" element={<PlaceholderPage />} />

          <Route path="/users" element={<PlaceholderPage />} />
          <Route path="/users/details" element={<PlaceholderPage />} />
          <Route path="/roles" element={<PlaceholderPage />} />
          <Route path="/positions" element={<PlaceholderPage />} />

          <Route path="/activity" element={<PlaceholderPage />} />
          <Route path="/settings" element={<PlaceholderPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
