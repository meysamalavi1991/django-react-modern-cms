import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'پیشخوان',
  '/content': 'مدیریت مطالب',
  '/categories': 'دسته‌بندی‌ها',
  '/media': 'کتابخانه رسانه',
  '/users': 'مدیریت کاربران',
  '/roles': 'نقش‌ها و دسترسی‌ها',
  '/activity': 'گزارش فعالیت',
  '/settings': 'تنظیمات سیستم',
}

export default function AdminTopbar({ onToggleSidebar, onOpenMobileSidebar }) {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'بخش مدیریت'

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

        <button type="button" className="profile-button">
          <div className="profile-avatar">م</div>
          <div className="profile-copy">
            <strong>مدیر سیستم</strong>
            <span>مدیر کل</span>
          </div>
          <i className="bi bi-chevron-down profile-chevron" />
        </button>
      </div>
    </header>
  )
}
