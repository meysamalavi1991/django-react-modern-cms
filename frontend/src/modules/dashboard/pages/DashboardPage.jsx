import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { stats } from '../data/dashboardData'
import StatCard from '../components/StatCard'
const ActivityChart = lazy(() => import('../components/ActivityChart'))
import RecentActivity from '../components/RecentActivity'
import RecentContentTable from '../components/RecentContentTable'

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="dashboard-page">
      <div className="page-intro">
        <div>
          <h2>خوش آمدید! 👋</h2>
          <p>در اینجا می‌توانید وضعیت کلی وب‌سایت خود را بررسی کنید.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate('/content')}
        >
          <i className="bi bi-plus-lg" />
          ایجاد مطلب جدید
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      <div className="dashboard-main-grid">
        <Suspense
          fallback={
            <section className="panel-card chart-loading" role="status" aria-live="polite">
              در حال بارگذاری نمودار...
            </section>
          }
        >
          <ActivityChart />
        </Suspense>
        <RecentActivity />
      </div>

      <RecentContentTable />

      <footer className="dashboard-footer">
        <span>Modern CMS</span>
        <span>پنل مدیریت محتوا · نسخه توسعه</span>
      </footer>
    </div>
  )
}
