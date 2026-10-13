export default function StatCard({ stat }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon tone-${stat.tone}`}>
          <i className={`bi ${stat.icon}`} />
        </div>

        <button
          type="button"
          className="subtle-icon-button"
          aria-label={`گزینه‌های ${stat.title}`}
        >
          <i className="bi bi-three-dots" />
        </button>
      </div>

      <div className="stat-label">{stat.title}</div>
      <div className="stat-value">{stat.value}</div>

      <div className="stat-footer">
        {stat.tone !== 'warning' && (
          <span className="stat-change">
            <i className="bi bi-arrow-up-left" />
            {stat.change}
          </span>
        )}
        {stat.tone === 'warning' && (
          <span className="stat-note">{stat.change}</span>
        )}
        <span className="stat-period">نسبت به ماه قبل</span>
      </div>
    </article>
  )
}
