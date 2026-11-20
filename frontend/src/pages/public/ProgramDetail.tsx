import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { Layout, Eyebrow, ProgramCard } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { programs as fallbackPrograms, type ProgramData } from '../../data/content'
import { slugify } from '../../components/cards/slugify'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

export default function ProgramDetail() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.programDetail;
  const { slug } = useParams()
  const [program, setProgram] = React.useState<ProgramData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    if (!slug) return

    // Find locally first from verified programs
    const localMatch = fallbackPrograms.find(
      (p) => slugify(p.title) === slug || p.code.toLowerCase() === slug.toLowerCase()
    )

    if (localMatch) {
      setProgram(localMatch)
      setLoading(false)
    }

    // Attempt API fetch to overlay any live backend modifications
    apiRequest<{ program?: any }>(`/programs/${slug}`)
      .then((response) => {
        if (!active) return
        if (response.program) {
          setProgram((prev) => ({
            ...(prev || localMatch || fallbackPrograms[0]),
            ...response.program,
            curriculum: prev?.curriculum || localMatch?.curriculum || [
              'Technical Trade Theory & Standards',
              'Workshop Health & Machine Safety',
              'Applied Circuit / Mechanical Diagnostics',
              'Blueprint & Technical Drawing Interpretation',
              'Industry Internship & Practical Project'
            ],
            career_paths: prev?.career_paths || localMatch?.career_paths || [
              'Certified Trade Technician',
              'Field Service Specialist',
              'Workshop Supervisor',
              'Independent Technical Contractor'
            ],
            practical_focus: prev?.practical_focus || localMatch?.practical_focus || 'Supervised hands-on training in dedicated campus workshop bays.'
          }))
        }
      })
      .catch(() => {
        // Fallback already assigned
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  if (loading && !program) {
    return (
      <Layout>
        <main className="detail-loading wrap">
          <p>{copy.loading}</p>
        </main>
      </Layout>
    )
  }

  if (!program) {
    return (
      <Layout>
        <main className="detail-not-found wrap">
          <h2>{copy.notFound}</h2>
          <p>The vocational program you requested could not be located in our catalogue.</p>
          <a href={getLocaleAwarePath('/programs', locale)} className="button button-navy">
            <ArrowLeft size={15} /> Return to All Programs
          </a>
        </main>
      </Layout>
    )
  }

  const relatedPrograms = fallbackPrograms
    .filter((p) => p.id !== program.id && (p.category === program.category || Math.abs(p.id - program.id) <= 2))
    .slice(0, 3)

  return (
    <Layout>
      <main className="program-detail-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-bar wrap">
          <a href={getLocaleAwarePath('/', locale)}>Home</a>
          <ChevronRight size={13} aria-hidden="true" />
          <a href={getLocaleAwarePath('/programs', locale)}>Programs</a>
          <ChevronRight size={13} aria-hidden="true" />
          <span>{program.title}</span>
        </div>

        {/* 1. Program-Specific Hero */}
        <section className="program-hero-section">
          <div className="wrap program-hero-grid">
            <div className="program-hero-copy">
              <div className="program-hero-eyebrow">
                <Eyebrow>{program.category}</Eyebrow>
                <span className="program-hero-code">{program.code}</span>
              </div>
              <h1 className="program-hero-title">{program.title}</h1>
              <p className="program-hero-lead">{program.description}</p>

              {/* Key Program Facts Strip */}
              <div className="program-facts-ribbon">
                <div className="fact-ribbon-item">
                  <span className="fact-label">{copy.qualificationLabel}</span>
                  <strong className="fact-value">{program.qualification_level}</strong>
                </div>
                <div className="fact-ribbon-divider" aria-hidden="true" />
                <div className="fact-ribbon-item">
                  <span className="fact-label">{copy.durationLabel}</span>
                  <strong className="fact-value">{program.duration}</strong>
                </div>
                <div className="fact-ribbon-divider" aria-hidden="true" />
                <div className="fact-ribbon-item">
                  <span className="fact-label">Training Ratio</span>
                  <strong className="fact-value">70% Workshop / 30% Theory</strong>
                </div>
              </div>

              <div className="program-hero-actions">
                <a
                  className="button button-navy"
                  href={getLocaleAwarePath('/how-to-apply', locale)}
                >
                  <span>{copy.applyCta}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a
                  className="button button-outline"
                  href={getLocaleAwarePath('/admissions', locale)}
                >
                  <span>{copy.contactCta}</span>
                </a>
              </div>
            </div>

            <div className="program-hero-media">
              <div className="program-hero-frame">
                <img
                  src={program.image_url || '/images/programs/engineering.jpg'}
                  alt={`${program.title} practical training`}
                  className="program-hero-img"
                />
                <div className="program-hero-caption">
                  <span className="tag">Workshop Bay</span>
                  <p>Supervised occupational practice at Emdibir campus.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Editorial Content Breakdown */}
        <section className="section wrap program-detail-body">
          <div className="detail-layout-grid">
            <div className="detail-main-flow">
              {/* 2. Trade Overview */}
              <article className="detail-block">
                <Eyebrow>Occupational Focus</Eyebrow>
                <h2>{copy.overviewTitle}</h2>
                <div className="editorial-prose">
                  <p>{program.description}</p>
                  <p>
                    Graduates of the {program.title} department are prepared to meet high industrial
                    and community demand. The program instills rigorous technical competence, troubleshooting
                    diagnostics, and professional work ethic compliant with the Ethiopian TVET qualification framework.
                  </p>
                </div>
              </article>

              {/* 3. What Students Learn */}
              <article className="detail-block">
                <Eyebrow>Curriculum &amp; Competencies</Eyebrow>
                <h2>{copy.learnTitle}</h2>
                <p className="detail-lead">
                  Instruction combines classroom foundations in technical science with intensive hands-on workshop practice:
                </p>
                <div className="curriculum-stack">
                  {(program.curriculum || [
                    'Applied Technical Theory & Trade Mathematics',
                    'Occupational Health & Industrial Safety Regulations',
                    'Tool Handling, Equipment Operation & Maintenance',
                    'Technical Diagnostics, Blueprint Reading & Layout',
                    'Practical Capstone Fabrication / Installation Project'
                  ]).map((mod, idx) => (
                    <div key={idx} className="curriculum-item">
                      <span className="module-num">{String(idx + 1).padStart(2, '0')}</span>
                      <div>
                        <strong>{mod}</strong>
                        <p>Supervised instruction, safety assessments, and occupational competence verification.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* 4 & 5. Practical Training, Facilities & Equipment */}
              <article className="detail-block">
                <Eyebrow>Hands-on Instruction</Eyebrow>
                <h2>{copy.workshopTitle}</h2>
                <div className="editorial-prose">
                  <p>{program.practical_focus}</p>
                </div>

                <div className="workshop-specs-grid">
                  <div className="spec-card">
                    <Wrench size={20} className="spec-icon" aria-hidden="true" />
                    <strong>Dedicated Workshop Bays</strong>
                    <p>Fully equipped training stations where students work directly with industry-standard machinery.</p>
                  </div>
                  <div className="spec-card">
                    <ShieldCheck size={20} className="spec-icon" aria-hidden="true" />
                    <strong>Mandatory Safety Induction</strong>
                    <p>Personal protective gear, fire hazard protocols, and equipment safety certifications.</p>
                  </div>
                  <div className="spec-card">
                    <Briefcase size={20} className="spec-icon" aria-hidden="true" />
                    <strong>Industry Apprenticeship Links</strong>
                    <p>Field exposure and cooperative partnerships with local enterprises in the Gurage Zone.</p>
                  </div>
                </div>
              </article>

              {/* Career Pathways */}
              <article className="detail-block">
                <Eyebrow>Employment &amp; Livelihood</Eyebrow>
                <h2>{copy.careersTitle}</h2>
                <div className="careers-pills-wrap">
                  {(program.career_paths || [
                    'Certified Trade Technician',
                    'Field Maintenance Specialist',
                    'Workshop Supervisor',
                    'Independent Service Contractor'
                  ]).map((career, idx) => (
                    <div key={idx} className="career-pill-item">
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{career}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            {/* Sidebar: 6. Admission Requirements & Fast Apply */}
            <aside className="detail-sidebar">
              <div className="sidebar-card admission-req-card">
                <div className="sidebar-card-header">
                  <Award size={18} aria-hidden="true" />
                  <h3>{copy.requirementsTitle}</h3>
                </div>
                <ul className="req-checklist">
                  <li>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>Completion of Grade 10 or 12 national curriculum</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>Official school transcript or completion certificate</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>Valid Kebele identification card or passport</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>Four (4) recent passport-sized color photos</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>Medical fitness for physical workshop participation</span>
                  </li>
                </ul>

                <div className="sidebar-cta-wrap">
                  <a
                    className="button button-navy full-width"
                    href={getLocaleAwarePath('/how-to-apply', locale)}
                  >
                    <span>How to Apply</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                  <a
                    className="button button-outline full-width"
                    href={getLocaleAwarePath('/contact', locale)}
                  >
                    <span>Contact Admissions Desk</span>
                  </a>
                </div>
              </div>

              <div className="sidebar-card campus-location-card">
                <h4>Campus Desk Inquiries</h4>
                <p>Emdibir, Gurage Zone, Central Ethiopia</p>
                <p className="sidebar-phone">Telephone: +251 911 000 000</p>
                <span className="sidebar-hours">Mon – Fri: 8:00 AM – 5:00 PM</span>
              </div>
            </aside>
          </div>
        </section>

        {/* 7. Related Programs */}
        <section className="section wrap related-programs-section">
          <div className="related-header">
            <Eyebrow>Explore Other Trades</Eyebrow>
            <h2>{copy.relatedTitle}</h2>
          </div>
          <div className="programs-editorial-grid">
            {relatedPrograms.map((p, idx) => (
              <ProgramCard key={p.id || p.title} p={p} index={idx} />
            ))}
          </div>
        </section>
      </main>
    </Layout>
  )
}
