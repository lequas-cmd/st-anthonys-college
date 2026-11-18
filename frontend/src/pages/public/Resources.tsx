import React from 'react'
import { Download } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro, Eyebrow } from '../../components/ui'
import { getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

export default function Resources() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.resources;

  const groups = [
    { title: copy.groups.academic.title, items: copy.groups.academic.items },
    { title: copy.groups.forms.title, items: copy.groups.forms.items },
    { title: copy.groups.links.title, items: copy.groups.links.items },
  ]

  return (
    <Layout>
      <main>
        <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <section className="section wrap resource-groups">
          {groups.map((group, index) => (
            <div className="resource-group" key={group.title}>
              <div><Eyebrow>{String(index + 1).padStart(2, '0')} / {copy.resourcesLabel}</Eyebrow><h2>{group.title}</h2></div>
              <div className="resource-list">{group.items.map((item) => (
                <div className="resource-row" key={item.label}><div className="resource-icon"><Download size={18}/></div><div><h3>{item.label}</h3><p>{item.meta} · {copy.fileNote}</p></div><span className="resource-status">{copy.status}</span></div>
              ))}</div>
            </div>
          ))}
        </section>
      </main>
    </Layout>
  )
}
