import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Award,
  MapPin,
  Phone,
} from 'lucide-react'
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

const highlights = [
  {
    icon: BookOpen,
    label: 'Academic Access',
    desc: 'View your courses, grades, attendance, and academic records.',
  },
  {
    icon: Users,
    label: 'Community Connection',
    desc: 'Stay updated on campus events, announcements, and college life.',
  },
  {
    icon: Award,
    label: 'Your Progress',
    desc: 'Track your learning journey and download official documents.',
  },
]

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
      setError('Please enter your username and password to continue.')
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
        setError('Cannot connect to the sign-in service. Please check your connection and try again.')
      } else if (
        normalized.includes('invalid username or password') ||
        normalized.includes('invalid credentials')
      ) {
        setError('Invalid username or password. Please try again or contact the admissions office.')
      } else {
        setError(message || 'Unable to sign in right now. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">

      {/* ── Thin top navigation bar ── */}
      <div className="portal-topbar">
       
        <div className="portal-topbar-inner">
          <Link to="/" className="portal-topbar-brand">
                <span className="portal-topbar-logo" aria-hidden="true">
                  <img src="/images/college-logo.png" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </span>
                <span className="portal-topbar-name">Saint Anthony's TVET College</span>
          </Link>

          <div className="portal-topbar-actions">
            <Link className="portal-help-link" to="/contact">Need help?</Link>
            <Link className="portal-site-link" to="/">
              ← Back to college website
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main split layout ── */}
      <main className="portal-split">

        {/* LEFT PANEL — Institutional identity */}
        <aside className="portal-left" aria-hidden="true">
          <div className="portal-left-inner">

            {/* Identity block */}
            <div className="portal-identity">
              <p className="portal-identity-eyebrow">Emdibir · Gurage Zone · Ethiopia</p>
              <h2 className="portal-identity-heading">
                Learning that transforms lives and strengthens communities.
              </h2>
              <p className="portal-identity-lead">
                Welcome back to the St. Anthony's student and staff portal — your gateway to academic resources, records, and college services.
              </p>
            </div>

            {/* Portal access highlights */}
            <ul className="portal-highlights" role="list">
              {highlights.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="portal-highlight-item">
                  <span className="portal-highlight-icon">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className="portal-highlight-copy">
                    <strong>{label}</strong>
                    <span>{desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Partner logos strip */}
            <div className="portal-partners">
              <p className="portal-partners-label">Supported by</p>
              <div className="portal-partners-logos">
                <div className="portal-partner-badge">
                  <img src="/images/church-logo.png" alt="Ethiopian Catholic Church" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
                  <span>Ethiopian Catholic Church</span>
                </div>
                <div className="portal-partner-divider" aria-hidden="true" />
                <div className="portal-partner-badge">
                  <img src="/images/crs-logo.png" alt="Catholic Relief Services" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
                  <span>Catholic Relief Services</span>
                </div>
              </div>
            </div>

            {/* Contact strip */}
            <div className="portal-contact-strip">
              <a href="tel:+251911000000" className="portal-contact-item">
                <Phone size={13} strokeWidth={2} />
                +251 911 000 000
              </a>
              <span className="portal-contact-divider" aria-hidden="true">·</span>
              <a href="mailto:info@stanthonytvet.edu.et" className="portal-contact-item">
                info@stanthonytvet.edu.et
              </a>
              <span className="portal-contact-divider" aria-hidden="true">·</span>
              <span className="portal-contact-item">
                <MapPin size={13} strokeWidth={2} />
                Emdibir, Ethiopia
              </span>
            </div>

          </div>

          {/* Background image overlay */}
          <div className="portal-left-bg" aria-hidden="true">
            <img
              src="/images/campus-hero.jpg"
              alt=""
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        </aside>

        {/* RIGHT PANEL — Login form */}
        <div className="portal-right">
          <section className="portal-form-panel" aria-labelledby="portal-title">

            <div className="portal-form-header">
              <div className="portal-form-eyebrow">
                <span className="portal-eyebrow-pip" aria-hidden="true" />
                Institutional Portal
              </div>
              <h1 id="portal-title" className="portal-form-title">
                Sign in to your account
              </h1>
              <p className="portal-form-intro">
                Use your official college username and password to access the portal.
              </p>
            </div>

            <form className="portal-auth-form" onSubmit={handleSubmit} noValidate>
              <label className="portal-field">
                <span className="portal-field-label">College Username</span>
                <input
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError('') }}
                  placeholder="e.g. student.name"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'portal-login-error' : undefined}
                />
              </label>

              <label className="portal-field">
                <span className="portal-field-label">Password</span>
                <span className="portal-password-wrap">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="Enter your password"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'portal-login-error' : undefined}
                  />
                  <button
                    className="portal-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>

              {error && (
                <div id="portal-login-error" className="portal-error" role="alert" aria-live="polite">
                  {error}
                </div>
              )}

              <button className="portal-submit" type="submit" disabled={loading}>
                <span>{loading ? 'Verifying…' : 'Sign in to portal'}</span>
                {loading
                  ? <span className="portal-spinner" aria-hidden="true" />
                  : <ArrowRight size={16} aria-hidden="true" />
                }
              </button>
            </form>

            {/* Help footer */}
            <div className="portal-form-footer">
              <div className="portal-form-help">
                <span>Forgot your credentials?</span>
                <Link to="/contact">Contact the admissions office →</Link>
              </div>
              <p className="portal-form-note">
                This portal is for enrolled students, teaching staff, and college administrators only.
                If you are looking for public information, visit the{' '}
                <Link to="/">college website</Link>.
              </p>
            </div>

          </section>
        </div>

      </main>

    </div>
  )
}
