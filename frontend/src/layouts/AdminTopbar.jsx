import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../core/auth/useAuth'

const pageTitles = {
  '/': 'پیشخوان',
  '/content': 'مدیریت مطالب',
  '/categories': 'دسته‌بندی‌ها',
  '/media': 'کتابخانه رسانه',
  '/users': 'مدیریت کاربران',
  '/users/details': 'جزئیات کاربر',
  '/roles': 'نقش‌ها و دسترسی‌ها',
  '/positions': 'سمت‌ها',
  '/activity': 'گزارش فعالیت',
  '/settings': 'تنظیمات سیستم',
}

export default function AdminTopbar({ onToggleSidebar, onOpenMobileSidebar }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const title = pageTitles[pathname] ?? 'بخش مدیریت'
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.username ||
    'کاربر'

  const avatarLetter = displayName.trim().charAt(0) || 'ک'

  async function handleLogout() {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      await logout()
    } catch {
      // نشست محلی در AuthProvider پاک می‌شود؛ خطای شبکه مانع خروج نمی‌شود.
    } finally {
      navigate('/login', { replace: true })
      setLoggingOut(false)
    }
  }

  return (
    <header className="admin-topbar">
      <div className="topbar-heading">
        <button
          type="button"
          className="icon-button desktop-toggle"
          onClick={onToggleSidebar}
          aria-label="جمع یا باز کردن سایدبار"
          title="جمع یا باز کردن سایدبار"
        >
          <i className="bi bi-layout-sidebar-inset" />
        </button>

        <button
          type="button"
          className="icon-button mobile-toggle"
          onClick={onOpenMobileSidebar}
          aria-label="باز کردن منو"
        >
          <i className="bi bi-list" />
        </button>

        <div>
          <div className="breadcrumb-text">مدیریت سیستم / {title}</div>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="topbar-search">
          <i className="bi bi-search" />
          <input aria-label="جستجو" placeholder="جستجو در پنل..." />
          <kbd>⌘ K</kbd>
        </label>

        <button
          type="button"
          className="icon-button notification-button"
          aria-label="اعلان‌ها"
          title="اعلان‌ها"
        >
          <i className="bi bi-bell" />
          <span />
        </button>

        <div className="topbar-divider" />

        <div className="profile-button">
          <div className="profile-avatar">{avatarLetter}</div>
          <div className="profile-copy">
            <strong>{displayName}</strong>
            <span>{user?.is_superuser ? 'مدیر کل' : user?.is_staff ? 'مدیر سیستم' : 'کاربر'}</span>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="خروج از حساب"
            title="خروج از حساب"
          >
            <i className={`bi ${loggingOut ? 'bi-hourglass-split' : 'bi-box-arrow-left'}`} />
          </button>
        </div>
      </div>
    </header>
  )
}
