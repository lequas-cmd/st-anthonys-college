import React from 'react'
import { CalendarDays } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro, NewsCard, Eyebrow } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { photos } from '../../data/content'
import { getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'
import { formatDisplayDate } from '../../i18n/ethiopianDate'

const fallbackNewsImages = [
  photos.workshop,
  photos.solar,
  photos.classroom,
  photos.library,
  photos.students,
]

type NewsItem = {
  id: number
  title: string
  slug?: string
  category?: string
  summary?: string
  body?: string
  image_url?: string | null
  published_at?: string
  date?: string
}

type EventItem = {
  id: number
  title: string
  slug?: string
  summary?: string
  body?: string
  location?: string
  starts_at?: string
  ends_at?: string
  image_url?: string | null
  month?: string
  day?: string
}

export default function NewsEvents() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.newsEvents;
  const [newsItems, setNewsItems] = React.useState<NewsItem[]>([])
  const [eventItems, setEventItems] = React.useState<EventItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    Promise.all([
      apiRequest<{ news?: NewsItem[] }>('/news'),
      apiRequest<{ events?: EventItem[] }>('/events'),
    ])
      .then(([newsResponse, eventResponse]) => {
        if (!active) return
        setNewsItems((newsResponse.news ?? []).map((item, index) => ({
          ...item,
          image_url: item.image_url ?? fallbackNewsImages[index % fallbackNewsImages.length],
        })))
        setEventItems(eventResponse.events ?? [])
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setNewsItems([])
        setEventItems([])
        setError(err instanceof Error ? err.message : 'Unable to load news and events from the API.')
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
        <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <section className="section wrap">
          {loading && <p className="empty-state">Loading news...</p>}
          {!loading && error && <p className="empty-state">{error}</p>}
          {!loading && !error && (
            <div className="news-grid">{newsItems.map((item) => <NewsCard key={item.slug ?? item.title} item={item} />)}</div>
          )}
        </section>
        <section className="section wrap">
          <Eyebrow>Upcoming events</Eyebrow>
          <div className="full-event-list">
            {eventItems.length > 0 ? (
              eventItems.map((event) => {
                const monthLabel = event.month ?? formatDisplayDate(event.starts_at ?? event.ends_at ?? new Date().toISOString(), locale).split(' ')[0] ?? 'TBD';

                return (
                  <div className="event-row event-row-static" key={event.slug ?? event.title}>
                    <div className="event-date">
                      <strong>{event.day ?? '—'}</strong>
                      <span>{monthLabel}</span>
                    </div>
                    <div>
                      <h3>{event.title}</h3>
                      <p>{event.summary ?? event.location ?? 'College event'}</p>
                      <p>{event.location ? `Location: ${event.location}` : 'Contact the college to confirm venue and schedule.'}</p>
                    </div>
                    <CalendarDays size={18} />
                  </div>
                )
              })
            ) : (
              !loading && !error ? <p className="empty-state">No events are currently available.</p> : null
            )}
          </div>
        </section>
      </main>
    </Layout>
  )
}
