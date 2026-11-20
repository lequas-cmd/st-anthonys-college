import React from 'react'
import { Calendar, Filter, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { announcements as fallbackAnnouncements } from '../../data/content'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

type AnnouncementItem = {
  id: number
  title: string
  slug?: string
  audience?: string
  summary?: string
  body?: string
  published_at?: string
  date?: string
}

export default function Announcements() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.announcements;
  const [items, setItems] = React.useState<AnnouncementItem[]>(fallbackAnnouncements)
  const [selectedAudience, setSelectedAudience] = React.useState('All')

  React.useEffect(() => {
    let active = true

    apiRequest<{ announcements?: AnnouncementItem[] }>('/announcements')
      .then((response) => {
        if (!active) return
        if (response.announcements && response.announcements.length > 0) {
          setItems(response.announcements)
        }
      })
      .catch(() => {
        // Fallback already pre-populated
      })

    return () => {
      active = false
    }
  }, [])

  const audiences = ['All', ...new Set(items.map((i) => i.audience || 'All Students'))]

  const filteredItems = items.filter((item) => {
    if (selectedAudience === 'All') return true
    return (item.audience || 'All Students') === selectedAudience
  })

  return (
    <Layout>
      <main className="announcements-page">
        {/* Page Intro */}
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="Official Noticeboard"
        />

        {/* Filter bar */}
        <section className="wrap announcements-filter-strip">
          <div className="filter-label-group">
            <Filter size={16} aria-hidden="true" />
            <span>{copy.audienceFilter}:</span>
          </div>
          <div className="audience-pills-row">
            {audiences.map((aud) => (
              <button
                key={aud}
                type="button"
                className={`audience-pill ${selectedAudience === aud ? 'active' : ''}`}
                onClick={() => setSelectedAudience(aud)}
              >
                {aud === 'All' ? copy.allAudiences : aud}
              </button>
            ))}
          </div>
        </section>

        {/* Announcements List */}
        <section className="section wrap announcements-list-section">
          <div className="announcements-timeline-stack">
            {filteredItems.map((item, idx) => (
              <article key={item.id || item.title} className="formal-notice-card">
                <div className="notice-card-header">
                  <div className="notice-header-left">
                    <span className="notice-audience-badge">{item.audience || 'All Students'}</span>
                    <span className="notice-ref-badge">{copy.officialRef}: STAC/NOT-{2026}-0{idx + 1}</span>
                  </div>
                  <div className="notice-header-right">
                    <Calendar size={13} aria-hidden="true" />
                    <span>{item.date || 'Sep 25, 2026'}</span>
                    <span className="notice-verified-tag">
                      <ShieldCheck size={13} aria-hidden="true" /> {copy.verifiedNotice}
                    </span>
                  </div>
                </div>

                <div className="notice-card-body">
                  <h3 className="notice-title">{item.title}</h3>
                  {item.summary && <p className="notice-summary">{item.summary}</p>}
                  <div className="notice-body-prose">
                    <p>{item.body || item.summary}</p>
                  </div>
                </div>

                <div className="notice-card-footer">
                  <div className="notice-issuer">
                    <span>Issued by: <strong>Academic Office &amp; Administration</strong></span>
                    <span className="issuer-loc">Emdibir Campus</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Inquiries Note */}
        <section className="section wrap notice-inquiry-section">
          <div className="notice-inquiry-card">
            <div>
              <h3>Questions Regarding Official Notices?</h3>
              <p>For clarifications on posted bulletins or registration deadlines, contact the campus registrar office.</p>
            </div>
            <a href={getLocaleAwarePath('/contact', locale)} className="button button-navy">
              <span>Contact Campus Desk</span>
            </a>
          </div>
        </section>
      </main>
    </Layout>
  )
}
