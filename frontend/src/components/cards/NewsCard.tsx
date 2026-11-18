import { ArrowRight } from 'lucide-react'
import { slugify } from './slugify'

export function NewsCard({ item }: { item: any }) {
  const detailHref = item.slug ? `/news-events/${item.slug}` : `/news-events/${slugify(item.title)}`
  const imageSrc = item.image_url ?? item.image ?? ''
  const summary = item.summary ?? item.text ?? item.body ?? ''
  const dateText = item.date ?? (item.published_at ? new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently')

  return (
    <article className="news-card">
      <a href={detailHref} className="news-image">
        {imageSrc ? <img src={imageSrc} alt={item.title} /> : null}
      </a>
      <div className="news-body">
        <div className="card-meta"><span>{item.category ?? 'Institutional news'}</span><span>{dateText}</span></div>
        <h3><a href={detailHref}>{item.title}</a></h3>
        <p>{summary}</p>
        <a className="read-link" href={detailHref}>Read full story <ArrowRight size={14}/></a>
      </div>
    </article>
  )
}

