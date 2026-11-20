import React from 'react'
import { ArrowRight, Search as SearchIcon } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro } from '../../components/ui'
import { programs, news, events, announcements } from '../../data/content'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'
import { slugify } from '../../components/cards/slugify'

export default function SearchPage() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.search;
  const params = new URLSearchParams(window.location.search)
  const initialQuery = params.get('q') || ''
  const [query, setQuery] = React.useState(initialQuery)
  const [activeFilter, setActiveFilter] = React.useState('All')

  // Compile full search index
  const allEntries = React.useMemo(() => {
    return [
      ...programs.map((p) => ({
        title: p.title,
        text: `${p.description} ${p.practical_focus} Code: ${p.code} Category: ${p.category}`,
        href: getLocaleAwarePath(`/programs/${slugify(p.title)}`, locale),
        type: 'Program',
        badge: p.qualification_level,
      })),
      ...news.map((n) => ({
        title: n.title,
        text: `${n.summary} ${n.body}`,
        href: getLocaleAwarePath(`/news-events/${n.slug}`, locale),
        type: 'News',
        badge: n.date,
      })),
      ...events.map((e) => ({
        title: e.title,
        text: `${e.summary} ${e.body} Location: ${e.location}`,
        href: getLocaleAwarePath('/news-events', locale),
        type: 'Event',
        badge: e.date_formatted,
      })),
      ...announcements.map((a) => ({
        title: a.title,
        text: `${a.summary} ${a.body} Audience: ${a.audience}`,
        href: getLocaleAwarePath('/announcements', locale),
        type: 'Notice',
        badge: a.date,
      })),
      {
        title: 'Admissions Guidelines & Intake Process',
        text: 'Learn how to apply, eligibility criteria, required documents, and important dates for 2026/2027.',
        href: getLocaleAwarePath('/admissions', locale),
        type: 'Admissions',
        badge: 'Intake 2026/27',
      },
      {
        title: 'Step-by-Step How to Apply Guide',
        text: 'Five structured steps, documents checklist, submission desk at Emdibir campus, and FAQ.',
        href: getLocaleAwarePath('/how-to-apply', locale),
        type: 'Admissions',
        badge: 'Application Guide',
      },
      {
        title: 'Campus Life & Workshop Facilities',
        text: 'Explore practical workshop bays, technical reference library, and student formation.',
        href: getLocaleAwarePath('/student-life', locale),
        type: 'Campus',
        badge: 'Facilities Tour',
      },
      {
        title: 'Institutional Profile, Mission & Leadership',
        text: 'Background of Saint Anthony\'s College, partnership with Catholic Church and CRS in Emdibir.',
        href: getLocaleAwarePath('/about', locale),
        type: 'About',
        badge: 'Institutional Background',
      },
      {
        title: 'Campus Contact Details & Directions',
        text: 'Physical address in Emdibir, telephone numbers, official email, and Google Maps directions.',
        href: getLocaleAwarePath('/contact', locale),
        type: 'Contact',
        badge: 'Campus Desk',
      },
    ]
  }, [locale])

  const results = allEntries.filter((item) => {
    const matchesFilter = activeFilter === 'All' || item.type === activeFilter
    const searchString = `${item.title} ${item.text} ${item.type}`.toLowerCase()
    const matchesQuery = !query.trim() || searchString.includes(query.toLowerCase().trim())
    return matchesFilter && matchesQuery
  })

  const filterTabs = ['All', 'Program', 'News', 'Event', 'Notice', 'Admissions', 'Campus']

  return (
    <Layout>
      <main className="search-page">
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="Directory Search"
        />

        <section className="wrap search-form-section">
          <form
            className="search-bar-container"
            onSubmit={(e) => {
              e.preventDefault()
              const url = new URL(window.location.href)
              url.searchParams.set('q', query)
              window.history.pushState({}, '', url.toString())
            }}
          >
            <SearchIcon size={20} className="search-input-icon" aria-hidden="true" />
            <input
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.placeholder}
              aria-label={copy.placeholder}
              autoFocus
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery('')}
                aria-label="Clear query"
              >
                ×
              </button>
            )}
            <button className="button button-navy search-submit-btn" type="submit">
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="search-filter-tabs" role="tablist" aria-label="Search category filters">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeFilter === tab}
                className={`search-tab-pill ${activeFilter === tab ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="search-results-meta">
            {query ? (
              <p>
                <strong>{results.length}</strong> {copy.resultsFor} “<strong>{query}</strong>”
              </p>
            ) : (
              <p>{copy.popular}</p>
            )}
          </div>

          {/* Results List */}
          <div className="search-results-list" aria-live="polite">
            {(query ? results : results.slice(0, 8)).map((result, idx) => (
              <a className="search-result-row" href={result.href} key={idx}>
                <div className="result-row-left">
                  <div className="result-type-tag">
                    <span>{result.type}</span>
                    {result.badge && <span className="result-badge">{result.badge}</span>}
                  </div>
                  <h3 className="result-title">{result.title}</h3>
                  <p className="result-snippet">{result.text}</p>
                </div>
                <div className="result-arrow-wrap">
                  <ArrowRight size={16} aria-hidden="true" />
                </div>
              </a>
            ))}

            {query && results.length === 0 && (
              <div className="search-no-results">
                <h3>No Matching Results</h3>
                <p>We could not find anything matching your search term. Try searching for "Automotive", "Electrical", "Admissions", or "Scholarship".</p>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => { setQuery(''); setActiveFilter('All'); }}
                >
                  View All Directory Items
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  )
}
