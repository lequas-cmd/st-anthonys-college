import { ArrowRight } from 'lucide-react'
import { slugify } from './slugify'

export function ProgramCard({ p, index = 0 }: { p: any, index?: number }) {
  const detailHref = `/programs/${slugify(p.title)}`
  const imageSrc = p.image_url ?? ''

  return (
    <article className="program-card">
      <a href={detailHref} className="program-image">
        {imageSrc ? <img src={imageSrc} alt={p.title} /> : null}
        <span className="card-index">0{index + 1}</span>
      </a>
      <div className="program-card-content">
        <div className="card-meta"><span>{p.category}</span><span>{p.duration}</span></div>
        <h3><a href={detailHref}>{p.title}</a></h3>
        <p>{p.description}</p>
        <div className="card-bottom"><a href={detailHref}>Program details <ArrowRight size={14}/></a><span>Curriculum ↗</span></div>
      </div>
    </article>
  )
}

