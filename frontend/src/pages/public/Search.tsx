import React from 'react'
import { ArrowUpRight, Search as SearchIcon } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro } from '../../components/ui'
import { programs, news } from '../../data/content'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

export default function SearchPage() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.search;
  const params = new URLSearchParams(window.location.search)
  const query = (params.get('q') || '').toLowerCase()
  const all = [
    ...programs.map((program) => ({ title: program.title, text: program.description, href: getLocaleAwarePath('/programs', locale), type: 'Program' })),
    ...news.map((item) => ({ title: item.title, text: item.summary ?? item.body ?? 'College announcement', href: getLocaleAwarePath('/news-events', locale), type: 'News' })),
    { title: 'Admissions and how to apply', text: 'Application steps and entry requirements.', href: getLocaleAwarePath('/admissions', locale), type: 'Admissions' },
    { title: 'Campus and facilities', text: 'Explore practical learning spaces.', href: getLocaleAwarePath('/student-life', locale), type: 'Campus' },
  ]

  const results = all.filter((item) => (item.title + ' ' + item.text + ' ' + item.type).toLowerCase().includes(query))

  return (
    <Layout>
      <main>
        <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <section className="wrap search-results">
          <form className="search-field search-large" onSubmit={(e) => { e.preventDefault(); window.location.href = `${getLocaleAwarePath('/search', locale)}?q=${encodeURIComponent((new FormData(e.currentTarget).get('q') ?? '').toString())}` }}>
            <SearchIcon />
            <input name="q" defaultValue={params.get('q') || ''} placeholder={copy.placeholder} />
            <button className="button button-dark">{messages[locale].header.searchAction}</button>
          </form>
          <p className="result-count">{query ? `${results.length} results for “${query}”` : copy.popular}</p>
          <div className="result-list">{(query ? results : all.slice(0, 5)).map((result) => (
            <a className="search-result" href={result.href} key={result.title}><span>{result.type}</span><h3>{result.title}</h3><p>{result.text}</p><ArrowUpRight size={17}/></a>
          ))}</div>
          {query && results.length === 0 && <p className="empty-state">No results found. Try a different search term or browse the main navigation.</p>}
        </section>
      </main>
    </Layout>
  )
}
