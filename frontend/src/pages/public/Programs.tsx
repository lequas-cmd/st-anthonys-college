import React from 'react'
import { ArrowRight, BookOpen, Layers, Search, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro, ProgramCard, Eyebrow } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { programs as fallbackPrograms } from '../../data/content'
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
  const [programsList, setProgramsList] = React.useState<ProgramItem[]>(fallbackPrograms)
  const [query, setQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('All')

  React.useEffect(() => {
    let active = true

    apiRequest<{ programs?: ProgramItem[] }>('/programs')
      .then((response) => {
        if (!active) return
        if (response.programs && response.programs.length > 0) {
          setProgramsList(response.programs)
        }
      })
      .catch(() => {
        // Fallback already pre-populated with all 10 verified TVET programs
      })

    return () => {
      active = false
    }
  }, [])

  const categories = ['All', ...new Set(programsList.map((item) => item.category))]

  const filtered = programsList.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const searchTarget = `${item.title} ${item.description} ${item.category} ${item.code}`.toLowerCase()
    const matchesQuery = searchTarget.includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })

  return (
    <Layout>
      <main className="programs-page">
        {/* 1. Page Introduction */}
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="10 Certified Departments"
        />

        {/* 2. Introduction to Vocational Education (TVET Context) */}
        <section className="section wrap tvet-intro-section">
          <div className="tvet-intro-card">
            <div className="tvet-intro-copy">
              <span className="tvet-pill">National Qualification Standards</span>
              <h2>{copy.introTitle}</h2>
              <p>{copy.introBody}</p>
            </div>
            <div className="tvet-pillars">
              <div className="pillar-item">
                <ShieldCheck size={20} className="pillar-icon" aria-hidden="true" />
                <div>
                  <strong>Level I – Level IV Certification</strong>
                  <p>Certified under Ethiopian TVET occupational qualifications.</p>
                </div>
              </div>
              <div className="pillar-item">
                <Layers size={20} className="pillar-icon" aria-hidden="true" />
                <div>
                  <strong>70% Practical / 30% Theory</strong>
                  <p>Applied mastery at workbenches, garages, and welding bays.</p>
                </div>
              </div>
              <div className="pillar-item">
                <BookOpen size={20} className="pillar-icon" aria-hidden="true" />
                <div>
                  <strong>Market-Ready Competence</strong>
                  <p>Skills aligned with regional enterprise and employment demand.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Program Categories & Search Controls */}
        <section className="wrap programs-filter-bar">
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
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

          <div className="category-pills-row" role="tablist" aria-label="Department categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? copy.allCategories : cat}
              </button>
            ))}
          </div>

          <span className="result-counter-badge">
            {filtered.length} {copy.resultLabel}
          </span>
        </section>

        {/* 4 & 5. Complete Program Listing with Photographs & Descriptions */}
        <section className="section wrap programs-catalogue-section">
          {filtered.length > 0 ? (
            <div className="programs-editorial-grid">
              {filtered.map((item, index) => (
                <ProgramCard key={item.id || item.title} p={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="empty-search-card">
              <p>{copy.noResults}</p>
              <button
                type="button"
                className="button button-navy"
                onClick={() => { setQuery(''); setSelectedCategory('All'); }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* 6. Guidance & Admissions Callout */}
        <section className="section wrap callout-guidance-section">
          <div className="guidance-card">
            <div className="guidance-copy">
              <Eyebrow>{copy.guidanceEyebrow}</Eyebrow>
              <h2>{copy.guidanceTitle}</h2>
              <p>{copy.guidanceCopy}</p>
            </div>
            <div className="guidance-action">
              <a className="button button-navy" href={getLocaleAwarePath('/contact', locale)}>
                <span>{copy.cta}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a className="button button-outline" href={getLocaleAwarePath('/admissions', locale)}>
                <span>Admission Requirements</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
