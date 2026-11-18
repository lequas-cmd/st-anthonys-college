import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Layout, Eyebrow } from '../../components/ui'
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

export default function ProgramDetail() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.programDetail;
  const { slug } = useParams()
  const [program, setProgram] = React.useState<ProgramItem | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    if (!slug) return

    apiRequest<{ program?: ProgramItem }>('/programs/' + slug)
      .then((response) => {
        if (!active) return
        if (response.program) {
          setProgram(response.program)
          setError(null)
        } else {
          setProgram(null)
          setError('Program not found in the database.')
        }
      })
      .catch((err) => {
        if (!active) return
        setProgram(null)
        setError(err instanceof Error ? err.message : 'Unable to load this program from the API.')
      })

    return () => {
      active = false
    }
  }, [slug])

  if (!program && !error) {
    return (
      <Layout>
        <main>
          <div className="wrap" style={{ padding: '40px 0' }}>
            <p>{copy.loading}</p>
          </div>
        </main>
      </Layout>
    )
  }

  if (error || !program) {
    return (
      <Layout>
        <main>
          <div className="wrap" style={{ padding: '40px 0' }}>
            <p>{error ?? copy.notFound}</p>
          </div>
        </main>
      </Layout>
    )
  }

  const currentProgram = program

  return (
    <Layout>
      <main>
        <div className="breadcrumb wrap">
          <a href={getLocaleAwarePath('/', locale)}>Home</a><ChevronRight size={13}/><a href={getLocaleAwarePath('/programs', locale)}>Programs</a><ChevronRight size={13}/><span>{currentProgram.title}</span>
        </div>
        <section className="detail-hero wrap">
          <div>
            <Eyebrow>{currentProgram.category}</Eyebrow>
            <h1>{currentProgram.title}</h1>
            <p>{currentProgram.description}</p>
            <div className="detail-facts">
              <div><span>Duration</span><strong>{currentProgram.duration}</strong></div>
              <div><span>Qualification</span><strong>{currentProgram.qualification_level || 'Not specified'}</strong></div>
              <div><span>Code</span><strong>{currentProgram.code}</strong></div>
            </div>
            <a className="button button-dark" href={getLocaleAwarePath('/admissions', locale)}>Admission information <ArrowRight size={15}/></a>
          </div>
          {currentProgram.image_url ? (
            <img src={currentProgram.image_url} alt={currentProgram.title} />
          ) : null}
        </section>
        <section className="section muted-section">
          <div className="wrap detail-columns">
            <div>
              <Eyebrow>Program overview</Eyebrow>
              <h2>{currentProgram.title}</h2>
              <p>{currentProgram.description}</p>
              <h3>Program details</h3>
              <ul className="check-list">
                <li>Department: {currentProgram.category}</li>
                <li>Duration: {currentProgram.duration}</li>
                <li>Qualification: {currentProgram.qualification_level || 'Not specified'}</li>
                <li>Program code: {currentProgram.code}</li>
              </ul>
            </div>
            <aside className="side-note">
              <h3>Program information</h3>
              <p>For the latest intake, admissions requirements, and fee details, contact the college directly.</p>
              <a className="inline-link" href={getLocaleAwarePath('/contact', locale)}>Ask about this program <ArrowRight size={14}/></a>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  )
}
