import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Layout, PageIntro } from '../../components/ui'
import { apiRequest } from '../../services/api'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'
import { formatDisplayDate } from '../../i18n/ethiopianDate'

type NewsItem = {
  id: number
  title: string
  slug?: string
  category?: string
  summary?: string
  body?: string
  image_url?: string | null
  published_at?: string
  date?: string
}

export default function NewsDetail() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.newsDetail;
  const { slug } = useParams()
  const [article, setArticle] = React.useState<NewsItem | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    if (!slug) return

    apiRequest<{ article?: NewsItem }>('/news/' + slug)
      .then((response) => {
        if (!active) return
        if (response.article) {
          setArticle(response.article)
          setError(null)
        } else {
          setArticle(null)
          setError('News article not found in the database.')
        }
      })
      .catch((err) => {
        if (!active) return
        setArticle(null)
        setError(err instanceof Error ? err.message : 'Unable to load this news article from the API.')
      })

    return () => {
      active = false
    }
  }, [slug])

  if (!article && !error) {
    return (
      <Layout>
        <main>
          <PageIntro eyebrow="News & events" title="Loading article..." description="Fetching the latest update from the college database." />
          <section className="section wrap article-body">
            <Link className="inline-link" to={getLocaleAwarePath('/news-events', locale)}><ArrowLeft size={15}/> {copy.back}</Link>
          </section>
        </main>
      </Layout>
    )
  }

  if (error || !article) {
    return (
      <Layout>
        <main>
          <PageIntro eyebrow="News & events" title="Story not found" description="The article you are looking for is not available or has been moved." />
          <section className="section wrap article-body">
            <p>{error ?? 'The requested article could not be found.'}</p>
            <Link className="inline-link" to={getLocaleAwarePath('/news-events', locale)}><ArrowLeft size={15}/> {copy.back}</Link>
          </section>
        </main>
      </Layout>
    )
  }

  const currentArticle = article
  const articleBody = currentArticle.body ?? currentArticle.summary ?? 'No article content is available yet.'
  const articleDate = currentArticle.date ?? (currentArticle.published_at ? formatDisplayDate(currentArticle.published_at, locale) : 'Recently')

  return (
    <Layout>
      <main>
        <PageIntro eyebrow={currentArticle.category ?? 'Institutional news'} title={currentArticle.title} description={`${articleDate} · College announcement`} />
        <section className="section wrap article-body">
          {currentArticle.image_url ? (
            <img src={currentArticle.image_url} alt={currentArticle.title} className="article-cover" />
          ) : null}
          <p>{currentArticle.summary ?? articleBody}</p>
          <p>{articleBody}</p>
          <p>Saint Anthony&apos;s Technical and Vocational College is committed to practical learning, student growth, and strong community engagement. This latest update reflects our continued focus on technical excellence, professional preparation, and meaningful participation in the wider college community.</p>
          <p>For the most current institutional details, deadlines, or event arrangements, please contact the college directly or follow the official announcements section for updates.</p>
          <Link className="inline-link" to={getLocaleAwarePath('/news-events', locale)}><ArrowLeft size={15}/> {copy.back}</Link>
        </section>
      </main>
    </Layout>
  )
}
