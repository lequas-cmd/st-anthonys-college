import { ArrowRight, Clock, Award } from 'lucide-react'
import { slugify } from './slugify'

export function ProgramCard({ p, index = 0 }: { p: any; index?: number }) {
  const detailHref = `/programs/${slugify(p.title)}`
  const imageSrc = p.image_url || '/images/programs/engineering.jpg'

  return (
    <article className="program-card">
      <a href={detailHref} className="program-image-wrap" tabIndex={-1} aria-hidden="true">
        <img src={imageSrc} alt={`${p.title} workshop practice`} loading="lazy" />
        <span className="program-card-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="program-category-pill">{p.category}</span>
      </a>
      <div className="program-card-content">
        <div className="program-meta-row">
          <span className="program-level"><Award size={13} aria-hidden="true" /> {p.qualification_level || 'TVET Certified'}</span>
          <span className="program-duration"><Clock size={13} aria-hidden="true" /> {p.duration || `${p.duration_years ?? 2} years`}</span>
        </div>
        <h3 className="program-card-title">
          <a href={detailHref}>{p.title}</a>
        </h3>
        <p className="program-card-desc">{p.description}</p>
        <div className="program-card-footer">
          <a href={detailHref} className="program-card-cta">
            <span>Explore Program</span>
            <ArrowRight size={14} aria-hidden="true" />
          </a>
          <span className="program-code-badge">{p.code}</span>
        </div>
      </div>
    </article>
  )
}
