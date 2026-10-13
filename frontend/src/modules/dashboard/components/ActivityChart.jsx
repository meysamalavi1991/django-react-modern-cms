import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { activityData } from '../data/dashboardData'

export default function ActivityChart() {
  return (
    <section className="panel-card chart-panel">
      <div className="panel-heading">
        <div>
          <h2>فعالیت محتوا</h2>
          <p>روند تولید محتوا در هفته جاری</p>
        </div>

        <button type="button" className="outline-button">
          <i className="bi bi-calendar3" />
          این هفته
          <i className="bi bi-chevron-down" />
        </button>
      </div>

      <div className="chart-legend">
        <span><i className="legend-dot published-dot" /> مطالب منتشرشده</span>
        <span><i className="legend-dot drafts-dot" /> پیش‌نویس‌ها</span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={activityData}
            margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#edf0f5"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8b95a7', fontSize: 11 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8b95a7', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e8ebf2',
                fontSize: 12,
                direction: 'rtl',
              }}
            />
            <Line
              type="monotone"
              dataKey="published"
              name="مطالب منتشرشده"
              stroke="#5666dc"
              strokeWidth={3}
              dot={{ r: 3, fill: '#5666dc', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="drafts"
              name="پیش‌نویس‌ها"
              stroke="#27b6a5"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#27b6a5', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
