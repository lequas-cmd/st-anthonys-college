import React from 'react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro } from '../../components/ui'
import { getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

export default function HowToApply() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.howToApply;

  return (
    <Layout>
      <main>
        <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <section className="section wrap article-body">
          <p>Start by exploring program areas, confirming requirements, and preparing the official documents requested by the admissions office.</p>
          <p>Once you have the information you need, contact the college to confirm the exact intake date and application steps before submitting any forms.</p>
        </section>
      </main>
    </Layout>
  )
}
