import { useLocation } from 'react-router-dom'

const pageInfo = {
  '/content': {
    title: 'مدیریت مطالب',
    description: 'ایجاد، ویرایش، دسته‌بندی و انتشار محتوای وب‌سایت.',
    icon: 'bi-file-earmark-text',
  },
  '/categories': {
    title: 'دسته‌بندی‌ها',
    description: 'ساختاردهی محتوا با دسته‌بندی‌های مستقل.',
    icon: 'bi-folder2-open',
  },
  '/media': {
    title: 'کتابخانه رسانه',
    description: 'مدیریت فایل‌ها، تصاویر و رسانه‌های وب‌سایت.',
    icon: 'bi-images',
  },
  '/users': {
    title: 'مدیریت کاربران',
    description: 'مشاهده و مدیریت کاربران سیستم.',
    icon: 'bi-people',
  },
  '/roles': {
    title: 'نقش‌ها و دسترسی‌ها',
    description: 'تعریف نقش‌ها و سیاست‌های دسترسی کاربران.',
    icon: 'bi-shield-lock',
  },
  '/activity': {
    title: 'گزارش فعالیت',
    description: 'مشاهده رویدادها و تاریخچه فعالیت‌های سیستم.',
    icon: 'bi-clock-history',
  },
  '/settings': {
    title: 'تنظیمات سیستم',
    description: 'مدیریت تنظیمات عمومی سامانه.',
    icon: 'bi-gear',
  },
}

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const page = pageInfo[pathname] ?? {
    title: 'صفحه پیدا نشد',
    description: 'مسیر درخواستی معتبر نیست.',
    icon: 'bi-exclamation-circle',
  }

  return (
    <section className="placeholder-page panel-card">
      <div className="placeholder-icon">
        <i className={`bi ${page.icon}`} />
      </div>
      <h2>{page.title}</h2>
      <p>{page.description}</p>
      <span className="coming-soon-label">
        <i className="bi bi-cone-striped" />
        آماده توسعه در فازهای بعدی
      </span>
    </section>
  )
}
