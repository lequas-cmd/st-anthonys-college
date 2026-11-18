import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react'
import { apiRequest } from '../../services/api'
import '../../styles/portal.css'

type LoginResponse = {
  token: string
  user: {
    id: number
    username: string
    role: 'student' | 'teacher' | 'admin'
  }
}

const dashboardRoutes: Record<LoginResponse['user']['role'], string> = {
  student: '/dashboard/student',
  teacher: '/dashboard/teacher',
  admin: '/dashboard/admin',
}

export default function Portal() {
  const navigate = useNavigate()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Enter your username and password to continue.')
      return
    }

    setLoading(true)
    try {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const role = response.user?.role
      if (!role || !dashboardRoutes[role]) {
        setError('Your account does not have a supported portal role. Please contact the college.')
        return
      }

      localStorage.setItem('collegeAuthToken', response.token)
      localStorage.setItem('collegeUser', JSON.stringify(response.user))
      sessionStorage.removeItem('collegeSessionToken')
      sessionStorage.removeItem('collegeUser')
      navigate(dashboardRoutes[role], { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      const normalized = message.toLowerCase()

      if (
        normalized.includes('failed to fetch') ||
        normalized.includes('networkerror') ||
        normalized.includes('fetch failed')
      ) {
        setError('Cannot connect to the sign-in service. Check that the backend and database are running, then try again.')
      } else if (
        normalized.includes('invalid username or password') ||
        normalized.includes('invalid credentials')
      ) {
        setError('Invalid username or password. Demo accounts may not have valid passwords configured yet.')
      } else {
        setError(message || 'Unable to sign in right now. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-ambient portal-ambient-green" aria-hidden="true" />
      <div className="portal-ambient portal-ambient-amber" aria-hidden="true" />

      <header className="portal-header">
        <Link className="portal-brand" to="/" aria-label="Saint Anthony's College home">
          <span className="portal-brand-mark" aria-hidden="true">
            <GraduationCap size={22} strokeWidth={1.7} />
          </span>
          <span className="portal-brand-copy">
            <span className="portal-brand-name">Saint Anthony's</span>
            <span className="portal-brand-subtitle">TVET Portal</span>
          </span>
        </Link>

        <div className="portal-header-actions">
          <Link className="portal-help-link" to="/contact">Need help? Contact the college</Link>
          <Link className="portal-site-link" to="/">
            Back to college site <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="portal-main">
        <section className="portal-form-wrap" aria-labelledby="portal-title">
          <div className="portal-heading">
            <div className="portal-heading-icon"><GraduationCap size={23} strokeWidth={1.8} /></div>
            <p className="portal-eyebrow"><span /> Institutional access</p>
            <h1 id="portal-title">Sign in to Saint Anthony's</h1>
            <p className="portal-intro">
              Use your official institutional username to access your courses, academic records, and college services.
            </p>
          </div>

          <form className="portal-auth-form" onSubmit={handleSubmit} noValidate>
            <label className="portal-field">
              <span>College Username</span>
              <input
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => { setUsername(event.target.value); setError('') }}
                placeholder="Enter your college username"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'portal-login-error' : undefined}
              />
            </label>

            <label className="portal-field">
              <span>Password</span>
              <span className="portal-password-wrap">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setError('') }}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'portal-login-error' : undefined}
                />
                <button
                  className="portal-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {error && (
              <div id="portal-login-error" className="portal-error" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <button className="portal-submit" type="submit" disabled={loading}>
              <span>{loading ? 'Verifying credentials…' : `Sign in`}</span>
              {loading ? <span className="portal-spinner" aria-hidden="true" /> : <ArrowRight size={17} />}
            </button>
          </form>

          <p className="portal-terms">
            By signing in, you agree to follow the college's <span>acceptable use</span> and
            <span> data privacy</span> policies.
          </p>

          <div className="portal-support">
            <span><ShieldCheck size={15} /> Secure institutional access</span>
            <Link to="/contact">Having trouble signing in?</Link>
          </div>
        </section>
      </main>

      <footer className="portal-footer">
        <span>© {new Date().getFullYear()} Saint Anthony's Technical and Vocational College</span>
        <span className="portal-footer-status"><i /> College portal</span>
      </footer>
    </div>
  )
}
