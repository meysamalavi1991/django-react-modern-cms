import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const DashboardPage = lazy(() => import('../../modules/dashboard/pages/DashboardPage'))
const PlaceholderPage = lazy(() => import('../../components/common/PlaceholderPage'))

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
