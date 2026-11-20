import React from 'react'
import { ArrowLeft, Calendar, ChevronRight, User } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Layout, Eyebrow, NewsCard } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { news as fallbackNews, type NewsData, photos } from '../../data/content'
import { slugify } from '../../components/cards/slugify'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

export default function NewsDetail() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.newsDetail;
  const { slug } = useParams()
  const [article, setArticle] = React.useState<NewsData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    if (!slug) return

    // Find locally first from verified news
    const localArticle = fallbackNews.find(
      (n) => n.slug === slug || slugify(n.title) === slug || String(n.id) === slug
    )

    if (localArticle) {
      setArticle(localArticle)
      setLoading(false)
    }

    // Try API fetch for any updated payload
    apiRequest<{ article?: any }>(`/news/${slug}`)
      .then((response) => {
        if (!active) return
        if (response.article) {
          setArticle((prev) => ({
            ...(prev || localArticle || fallbackNews[0]),
            ...response.article,
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

  if (loading && !article) {
    return (
      <Layout>
        <main className="detail-loading wrap">
          <p>Loading article…</p>
        </main>
      </Layout>
    )
  }

  if (!article) {
    return (
      <Layout>
        <main className="detail-not-found wrap">
          <h2>Article Not Found</h2>
          <p>The requested publication could not be found or has been moved.</p>
          <Link to={getLocaleAwarePath('/news-events', locale)} className="button button-navy">
            <ArrowLeft size={15} /> Back to News &amp; Events
          </Link>
        </main>
      </Layout>
    )
  }

  const relatedStories = fallbackNews
    .filter((n) => n.id !== article.id)
    .slice(0, 3)

  return (
    <Layout>
      <main className="news-detail-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-bar wrap">
          <Link to={getLocaleAwarePath('/', locale)}>Home</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link to={getLocaleAwarePath('/news-events', locale)}>News &amp; Events</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span>{article.category || 'Article'}</span>
        </div>

        {/* 7. Back Navigation Link */}
        <div className="wrap back-nav-wrap">
          <Link to={getLocaleAwarePath('/news-events', locale)} className="back-link">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>{copy.back}</span>
          </Link>
        </div>

        {/* Article Header (Category, Date, Title) */}
        <article className="wrap article-container">
          <header className="article-header">
            <div className="article-meta-top">
              <span className="article-category-badge">{article.category || 'Institutional Publication'}</span>
              <span className="article-date-badge">
                <Calendar size={13} aria-hidden="true" />
                {article.date || 'Sep 15, 2026'}
              </span>
            </div>

            <h1 className="article-title">{article.title}</h1>
            <p className="article-deck">{article.summary}</p>

            <div className="article-author-byline">
              <div className="byline-left">
                <User size={15} aria-hidden="true" />
                <span>{copy.publishedBy}: <strong>{article.author || 'Office of Communications'}</strong></span>
                <span className="byline-sep">·</span>
                <span>Emdibir, Gurage Zone, Ethiopia</span>
              </div>
            </div>
          </header>

          {/* 3. Featured Image with Photo Caption */}
          <figure className="article-featured-figure">
            <img
              src={article.image_url || photos.automotive}
              alt={article.title}
              className="article-featured-img"
            />
            <figcaption className="article-img-caption">
              <span>Photo Documentation:</span> Supervised practical learning session at Saint Anthony's Technical College.
            </figcaption>
          </figure>

          {/* 4. Article Content Body */}
          <div className="article-body-layout">
            <div className="article-prose">
              {article.body.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}

              <div className="institutional-callout-quote">
                <blockquote>
                  “Practical education is the most direct, sustainable pathway to human self-reliance.
                  Every workbench project connects our students to the future of their communities.”
                </blockquote>
                <cite>— Saint Anthony's College Academic Council</cite>
              </div>

              <p>
                As part of its ongoing partnership with the Ethiopian Catholic Church and Catholic
                Relief Services (CRS), the college continues to modernize workshop bays, expand access
                for youth from rural woredas in the Gurage Zone, and provide verified vocational credentials.
              </p>
            </div>

            {/* Sidebar Context Card */}
            <aside className="article-sidebar">
              <div className="sidebar-card college-info-snippet">
                <h4>Saint Anthony's College</h4>
                <p>A community-centered TVET institution providing Level I–IV accredited technical training in Emdibir, Ethiopia.</p>
                <div className="snippet-links">
                  <Link to={getLocaleAwarePath('/programs', locale)}>Explore 10 Programs</Link>
                  <Link to={getLocaleAwarePath('/admissions', locale)}>Admissions Guidelines</Link>
                </div>
              </div>

              <div className="sidebar-card contact-snippet">
                <h4>Inquiries Regarding this Story</h4>
                <p>Office of Academic Affairs &amp; Institutional Communications</p>
                <span>Email: info@stanthonytvet.edu.et</span>
              </div>
            </aside>
          </div>

          {/* 5. Supporting Photography & Campus Context */}
          <section className="article-supporting-media">
            <h3>Visual Documentation from Campus</h3>
            <div className="supporting-media-grid">
              <figure className="supporting-media-item">
                <img src={photos.workshop} alt="Welding workshop practice" loading="lazy" />
                <figcaption>Metal Fabrication and Welding Bay</figcaption>
              </figure>
              <figure className="supporting-media-item">
                <img src={photos.library} alt="Technical reference library" loading="lazy" />
                <figcaption>Campus Technical Reference Library</figcaption>
              </figure>
            </div>
          </section>

          {/* 6. Related Stories */}
          <section className="article-related-section">
            <div className="related-header">
              <Eyebrow>Keep Reading</Eyebrow>
              <h2>{copy.relatedTitle}</h2>
            </div>
            <div className="news-standard-grid">
              {relatedStories.map((item) => (
                <NewsCard key={item.id || item.title} item={item} />
              ))}
            </div>
          </section>
        </article>
      </main>
    </Layout>
  )
}
