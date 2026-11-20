import React from 'react'
import { ArrowRight, BookOpen, Calendar, CalendarDays, MapPin, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro, NewsCard } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { news as fallbackNews, events as fallbackEvents, announcements as fallbackAnnouncements } from '../../data/content'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

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
  author?: string
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
  date_formatted?: string
}

export default function NewsEvents() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.newsEvents;
  const [newsList, setNewsList] = React.useState<NewsItem[]>(fallbackNews)
  const [eventsList, setEventsList] = React.useState<EventItem[]>(fallbackEvents)
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    let active = true

    Promise.all([
      apiRequest<{ news?: NewsItem[] }>('/news'),
      apiRequest<{ events?: EventItem[] }>('/events'),
    ])
      .then(([newsResponse, eventResponse]) => {
        if (!active) return
        if (newsResponse.news && newsResponse.news.length > 0) {
          setNewsList(newsResponse.news)
        }
        if (eventResponse.events && eventResponse.events.length > 0) {
          setEventsList(eventResponse.events)
        }
      })
      .catch(() => {
        // Fallback already pre-populated
      })

    return () => {
      active = false
    }
  }, [])

  const categories = ['All', ...new Set(newsList.map((item) => item.category || 'Institutional'))]

  const filteredNews = newsList.filter((item) => {
    const matchesCat = selectedCategory === 'All' || (item.category || 'Institutional') === selectedCategory
    const searchTarget = `${item.title} ${item.summary || ''} ${item.body || ''}`.toLowerCase()
    const matchesQuery = searchTarget.includes(query.toLowerCase())
    return matchesCat && matchesQuery
  })

  const leadStory = filteredNews[0] ?? null
  const regularStories = filteredNews.slice(1)

  return (
    <Layout>
      <main className="news-events-page">
        {/* 1. News Page Introduction */}
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="Institutional Publications"
        />

        {/* 4. Category Filtering & Search */}
        <section className="wrap news-filter-strip">
          <div className="news-search-input">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news, updates, announcements…"
              aria-label="Search news"
            />
            {query && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="news-categories-row" role="tablist" aria-label="News categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`news-category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? copy.categoryAll : cat}
              </button>
            ))}
          </div>
        </section>

        {/* 2 & 3. Featured Article + Regular News Listing */}
        <section className="section wrap news-main-grid-section">
          <div className="news-events-editorial-grid">
            <div className="news-primary-column">
              {leadStory ? (
                <article className="lead-editorial-card">
                  <a
                    href={getLocaleAwarePath(`/news-events/${leadStory.slug || leadStory.id}`, locale)}
                    className="lead-editorial-image"
                  >
                    <img
                      src={leadStory.image_url || '/images/library.jpg'}
                      alt={leadStory.title}
                      loading="lazy"
                    />
                    <span className="lead-tag">Featured Story</span>
                  </a>
                  <div className="lead-editorial-body">
                    <div className="lead-meta">
                      <span className="lead-category">{leadStory.category || 'Academic Life'}</span>
                      <span className="lead-date">
                        <Calendar size={13} aria-hidden="true" />
                        {leadStory.date || (leadStory.published_at ? new Date(leadStory.published_at).toLocaleDateString() : 'Sep 15, 2026')}
                      </span>
                    </div>
                    <h2>
                      <a href={getLocaleAwarePath(`/news-events/${leadStory.slug || leadStory.id}`, locale)}>
                        {leadStory.title}
                      </a>
                    </h2>
                    <p className="lead-excerpt">{leadStory.summary}</p>
                    <a
                      href={getLocaleAwarePath(`/news-events/${leadStory.slug || leadStory.id}`, locale)}
                      className="read-more-btn"
                    >
                      <span>{copy.readMore}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ) : null}

              {regularStories.length > 0 && (
                <div className="news-standard-grid">
                  {regularStories.map((item) => (
                    <NewsCard key={item.id || item.title} item={item} />
                  ))}
                </div>
              )}

              {filteredNews.length === 0 && (
                <div className="news-empty-card">
                  <p>No articles match your search criteria. Try a different search keyword.</p>
                  <button
                    type="button"
                    className="button button-navy"
                    onClick={() => { setQuery(''); setSelectedCategory('All'); }}
                  >
                    Show All Articles
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar: Upcoming Institutional Events & Notices */}
            <aside className="news-sidebar">
              <div className="sidebar-box events-calendar-box">
                <div className="sidebar-box-header">
                  <CalendarDays size={18} aria-hidden="true" />
                  <h3>{copy.eventsTitle}</h3>
                </div>
                <div className="sidebar-events-list">
                  {eventsList.map((evt) => (
                    <div key={evt.id || evt.title} className="sidebar-event-node">
                      <div className="event-date-badge">
                        <span className="day">
                          {evt.starts_at ? new Date(evt.starts_at).getDate() : '10'}
                        </span>
                        <span className="month">
                          {evt.starts_at ? new Date(evt.starts_at).toLocaleString('en-US', { month: 'short' }) : 'Nov'}
                        </span>
                      </div>
                      <div className="event-details">
                        <h4>{evt.title}</h4>
                        <p className="event-summary">{evt.summary}</p>
                        <span className="event-location">
                          <MapPin size={12} aria-hidden="true" /> {evt.location || 'College Campus'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-box notices-box">
                <div className="sidebar-box-header">
                  <BookOpen size={18} aria-hidden="true" />
                  <h3>{copy.announcementsTitle}</h3>
                </div>
                <div className="sidebar-notices-list">
                  {fallbackAnnouncements.map((item) => (
                    <a
                      key={item.id || item.title}
                      href={getLocaleAwarePath('/announcements', locale)}
                      className="sidebar-notice-link"
                    >
                      <span className="notice-audience">{item.audience}</span>
                      <h4>{item.title}</h4>
                      <span className="notice-date">{item.date}</span>
                    </a>
                  ))}
                </div>
                <a
                  href={getLocaleAwarePath('/announcements', locale)}
                  className="sidebar-action-link"
                >
                  <span>View All Official Notices</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  )
}
