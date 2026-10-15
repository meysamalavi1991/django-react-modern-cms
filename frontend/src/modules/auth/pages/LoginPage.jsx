import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/auth/useAuth'
import './LoginPage.css'

function getErrorMessage(error) {
  const data = error.response?.data

  if (data?.detail) return data.detail
  if (data?.error && typeof data.error === 'string') return data.error

  if (data?.username?.length) return data.username[0]
  if (data?.password?.length) return data.password[0]

  if (!error.response) {
    return 'ارتباط با سرور برقرار نشد. اتصال شبکه و وضعیت بک‌اند را بررسی کنید.'
  }

  if (error.response.status === 401) {
    return 'نام کاربری یا رمز عبور صحیح نیست.'
  }

  return 'ورود انجام نشد. لطفاً دوباره تلاش کنید.'
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login({ username: username.trim(), password })

      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch (loginError) {
      setError(getErrorMessage(loginError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page" dir="rtl">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <i className="bi bi-grid-1x2-fill" />
          </div>
          <span>پنل مدیریت</span>
        </div>

        <div className="login-heading">
          <h1>خوش آمدید</h1>
          <p>برای ورود به پنل مدیریت، اطلاعات حساب خود را وارد کنید.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-username">نام کاربری</label>
            <div className="login-input-wrap">
              <i className="bi bi-person" />
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="نام کاربری خود را وارد کنید"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoFocus
                disabled={submitting}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">رمز عبور</label>
            <div className="login-input-wrap">
              <i className="bi bi-lock" />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="رمز عبور خود را وارد کنید"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                در حال ورود...
              </>
            ) : (
              <>
                ورود به پنل
                <i className="bi bi-arrow-left" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <i className="bi bi-shield-check" />
          <span>ورود امن به سامانه مدیریت</span>
        </div>
      </section>

      <p className="login-copyright">
        سامانه مدیریت محتوا
      </p>
    </main>
  )
}
