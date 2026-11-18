import React from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro, SectionHeading, ProgramCard } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

type ProgramItem = {
  id: number
  code: string
  title: string
  category: string
  duration: string
  duration_years?: number
  description: string
  qualification_level?: string
  is_active?: boolean
  image_url?: string | null
}

export default function Programs() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.programs;
  const [programs, setPrograms] = React.useState<ProgramItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState('All programs')

  React.useEffect(() => {
    let active = true

    apiRequest<{ programs?: ProgramItem[] }>('/programs')
      .then((response) => {
        if (!active) return
        if (response.programs) {
          setPrograms(response.programs)
          setError(null)
        } else {
          setPrograms([])
          setError('No program data was returned by the API.')
        }
      })
      .catch((err) => {
        if (!active) return
        setPrograms([])
        setError(err instanceof Error ? err.message : 'Unable to load programs from the API.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const categories = ['All programs', ...new Set(programs.map((item) => item.category))]
  const filtered = programs.filter((item) => (category === 'All programs' || item.category === category) && (item.title + ' ' + item.description + ' ' + item.category).toLowerCase().includes(query.toLowerCase()))

  return (
    <Layout>
      <main>
        <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <section className="wrap directory-tools">
          <label className="search-field"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.searchPlaceholder} /></label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter programs">{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <span className="result-count">{filtered.length} {copy.resultLabel}</span>
        </section>
        <section className="section wrap">
          {loading && <p className="empty-state">Loading programs...</p>}
          {!loading && error && <p className="empty-state">{error}</p>}
          {!loading && !error && <div className="program-grid">{filtered.map((item, index) => <ProgramCard key={item.title} p={item} index={index} />)}</div>}
          {!loading && !error && filtered.length === 0 && <p className="empty-state">{copy.noResults}</p>}
        </section>
        <section className="callout wrap">
          <div><SectionHeading eyebrow={copy.guidanceEyebrow} title={copy.guidanceTitle} /><p>{copy.guidanceCopy}</p></div>
          <a className="button button-dark" href={getLocaleAwarePath('/contact', locale)}>{copy.cta} <ArrowRight size={15}/></a>
        </section>
      </main>
    </Layout>
  )
}
