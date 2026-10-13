import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from '../../modules/dashboard/pages/DashboardPage'
import PlaceholderPage from '../../components/common/PlaceholderPage'

export default function AppRouter() {
  return (
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
  )
}
