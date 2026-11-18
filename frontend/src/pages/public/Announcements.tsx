import React from 'react'
import { Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'
import { formatDisplayDate } from '../../i18n/ethiopianDate'

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
  const [items, setItems] = React.useState<AnnouncementItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    apiRequest<{ announcements?: AnnouncementItem[] }>('/announcements')
      .then((response) => {
        if (!active) return
        setItems(response.announcements ?? [])
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setItems([])
        setError(err instanceof Error ? err.message : 'Unable to load announcements from the API.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <Layout>
      <main>
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <section className="section wrap">
          {loading && <p className="empty-state">Loading announcements...</p>}
          {!loading && error && <p className="empty-state">{error}</p>}
          {!loading && !error && items.length === 0 && <p className="empty-state">No announcements are currently available.</p>}

          {!loading && !error && items.length > 0 && (
            <div className="announcement-page-list">
              {items.map((item) => (
                <article className="announcement-item announcement-item-page" key={item.slug ?? item.title}>
                  <div className="announcement-pill"><Bell size={13}/> Notice</div>
                  <h3>{item.title}</h3>
                  <p>{item.summary ?? item.body ?? 'No announcement summary available yet.'}</p>
                  <div className="announcement-meta">
                    <span>{item.audience ?? 'All students'}</span>
                    <span>{formatDisplayDate(item.date ?? item.published_at, locale)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </Layout>
  )
}
