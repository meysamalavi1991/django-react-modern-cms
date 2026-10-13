import { BrowserRouter } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import AppRouter from './app/router/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <AppRouter />
      </AdminLayout>
    </BrowserRouter>
  )
}
