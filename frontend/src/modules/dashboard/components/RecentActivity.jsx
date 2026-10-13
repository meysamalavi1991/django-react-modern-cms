import { useNavigate } from 'react-router-dom'
import { recentActivities } from '../data/dashboardData'

export default function RecentActivity() {
  const navigate = useNavigate()

  return (
    <section className="panel-card recent-activity-panel">
      <div className="panel-heading">
        <div>
          <h2>فعالیت‌های اخیر</h2>
          <p>آخرین رویدادهای سیستم</p>
        </div>

        <button
          type="button"
          className="text-action"
          onClick={() => navigate('/activity')}
        >
          مشاهده همه
        </button>
      </div>

      <div className="activity-list">
        {recentActivities.map((activity) => (
          <div className="activity-item" key={activity.id}>
            <div className={`activity-icon tone-${activity.tone}`}>
              <i className={`bi ${activity.icon}`} />
            </div>

            <div className="activity-copy">
              <strong>{activity.title}</strong>
              <span>{activity.description}</span>
              <small>{activity.time}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
