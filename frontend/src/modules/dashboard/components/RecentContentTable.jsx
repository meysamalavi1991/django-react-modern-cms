import { recentContent } from '../data/dashboardData'

function StatusBadge({ status }) {
  const variants = {
    منتشرشده: 'status-published',
    'در انتظار بررسی': 'status-pending',
    پیش‌نویس: 'status-draft',
  }

  return (
    <span className={`status-badge ${variants[status] ?? ''}`}>
      <span className="status-dot" />
      {status}
    </span>
  )
}

export default function RecentContentTable() {
  return (
    <section className="panel-card content-table-panel">
      <div className="panel-heading">
        <div>
          <h2>آخرین مطالب</h2>
          <p>مروری بر آخرین محتوای ثبت‌شده</p>
        </div>

        <button
          type="button"
          className="outline-button"
          onClick={() => window.alert('مدیریت مطالب در ماژول محتوا توسعه داده می‌شود.')}
        >
          مشاهده همه مطالب
          <i className="bi bi-arrow-up-left" />
        </button>
      </div>

      <div className="table-responsive">
        <table className="table content-table align-middle mb-0">
          <thead>
            <tr>
              <th>عنوان مطلب</th>
              <th>نویسنده</th>
              <th>دسته‌بندی</th>
              <th>وضعیت</th>
              <th>تاریخ</th>
              <th aria-label="عملیات" />
            </tr>
          </thead>

          <tbody>
            {recentContent.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="content-title-cell">
                    <div className="content-file-icon">
                      <i className="bi bi-file-earmark-text" />
                    </div>
                    <strong>{item.title}</strong>
                  </div>
                </td>
                <td>{item.author}</td>
                <td>
                  <span className="category-label">{item.category}</span>
                </td>
                <td><StatusBadge status={item.status} /></td>
                <td className="date-cell">{item.date}</td>
                <td>
                  <button
                    type="button"
                    className="subtle-icon-button"
                    aria-label={`عملیات ${item.title}`}
                    title="گزینه‌ها"
                  >
                    <i className="bi bi-three-dots" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>نمایش ۴ مورد از ۱۲۸ مطلب</span>
        <div className="pagination-preview">
          <button type="button" disabled aria-label="صفحه قبل">
            <i className="bi bi-chevron-right" />
          </button>
          <span className="current-page">۱</span>
          <button type="button" aria-label="صفحه بعد">
            <i className="bi bi-chevron-left" />
          </button>
        </div>
      </div>
    </section>
  )
}
