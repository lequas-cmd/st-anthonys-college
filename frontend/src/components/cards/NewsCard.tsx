import { ArrowRight, Calendar } from 'lucide-react'
import { slugify } from './slugify'

export function NewsCard({ item }: { item: any }) {
  const detailHref = item.slug ? `/news-events/${item.slug}` : `/news-events/${slugify(item.title)}`
  const imageSrc = item.image_url ?? item.image ?? '/images/library.jpg'
  const summary = item.summary ?? item.text ?? item.body ?? ''
  const dateText = item.date ?? (item.published_at ? new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently')

  return (
    <article className="news-card">
      <a href={detailHref} className="news-image-wrap" tabIndex={-1} aria-hidden="true">
        <img src={imageSrc} alt={item.title} loading="lazy" />
        <span className="news-category-badge">{item.category ?? 'Institutional Life'}</span>
      </a>
      <div className="news-body">
        <div className="news-date-row">
          <Calendar size={13} aria-hidden="true" />
          <span>{dateText}</span>
        </div>
        <h3 className="news-card-title">
          <a href={detailHref}>{item.title}</a>
        </h3>
        <p className="news-card-summary">{summary}</p>
        <a className="news-card-link" href={detailHref}>
          <span>Read Full Story</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}
