import React from 'react'
import { Clock3, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, Eyebrow, PageIntro } from '../../components/ui'
import { getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

export default function Contact() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.contact;
  const [sent, setSent] = React.useState(false)
  const mapUrl = 'https://maps.app.goo.gl/Nzya6TcDML6MptfC7'
  const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1103.185325850251!2d37.935426474146624!3d8.121811753418188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17b2e10da7ac2987%3A0xe0d8d3b1c9d93124!2sSt.%20Anthony%20TVTE%20College!5e1!3m2!1sen!2sus!4v1791559060012!5m2!1sen!2sus'

  return (
    <Layout>
      <main>
        <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <div className="wrap social-links">
        <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
        <a href="#" aria-label="X"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
        <a href="#" aria-label="Telegram"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.5 2.5L2.5 10.5l7 2.5 2.5 7 2.5-4 5 3z"/></svg></a>
        <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg></a>
      </div>
        <section className="section wrap contact-layout">
          <div className="contact-details">
            <Eyebrow>{copy.infoEyebrow}</Eyebrow>
            <h2>{copy.infoTitle}</h2>
            <p>{copy.placeholder}</p>
            <div className="contact-detail"><MapPin/><div><strong>{copy.locationLabel}</strong><span>{copy.locationValue}</span></div></div>
            <div className="contact-detail"><Phone/><div><strong>{copy.telephoneLabel}</strong><span>{copy.telephoneValue}</span></div></div>
            <div className="contact-detail"><Mail/><div><strong>{copy.emailLabel}</strong><span>{copy.emailValue}</span></div></div>
            <div className="contact-detail"><Clock3/><div><strong>{copy.hoursLabel}</strong><span>{copy.hoursValue}</span></div></div>
            <div className="map-card">
              <iframe
                title="Saint Anthony's College map"
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <a href={mapUrl} target="_blank" rel="noreferrer">{copy.mapLink}</a>
            </div>
          </div>

          <form className="contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
            <h2>{copy.formTitle}</h2>
            <p>{copy.formNote}</p>
            <label>{copy.fullName}<input required placeholder="Your full name" /></label>
            <label>{copy.email}<input required type="email" placeholder="you@example.com" /></label>
            <label>{copy.subject}<select required defaultValue=""><option value="" disabled>{copy.defaultSubject}</option>{copy.subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>{copy.message}<textarea required rows={5} placeholder="How can we help?" /></label>
            <button className="button button-dark full-button" type="submit">{copy.send} <ArrowRight size={15}/></button>
            {sent && <p className="form-success">{copy.success}</p>}
          </form>
        </section>
      </main>
    </Layout>
  )
}
