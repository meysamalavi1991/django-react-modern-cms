import { useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  return (
      <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {mobileOpen && (
            <button
                type="button"
                className="mobile-backdrop"
                aria-label="بستن منو"
                onClick={() => setMobileOpen(false)}
            />
        )}

        <div className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}>
          <AdminSidebar
              collapsed={collapsed}
              onNavigate={() => setMobileOpen(false)}
              onExpandSidebar={() => setCollapsed(false)}
          />
        </div>

        <div className="admin-main">
          <AdminTopbar
              onToggleSidebar={() => setCollapsed((value) => !value)}
              onOpenMobileSidebar={() => setMobileOpen(true)}
          />

          <main className="admin-content">{children}</main>
        </div>
      </div>
  )
}