import React from 'react'
import { ArrowUpRight } from 'lucide-react'

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow"><span/> {children}</div>
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string, title: string, description?: string }) {
  return (
    <section className="page-intro wrap">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </section>
  )
}

export function SectionHeading({ eyebrow, title, link, href = '/programs' }: { eyebrow: string, title: string, link?: string, href?: string }) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
      </div>
      {link && <a className="inline-link" href={href}>{link}<ArrowUpRight size={15}/></a>}
    </div>
  )
}

export function Testimonials({ items }: { items: { name: string, program: string, quote: string, avatar: string }[] }) {
  return (
    <section className="testimonials-section">
      <div className="wrap testimonials-wrap">
        <div className="testimonial-intro">
          <Eyebrow>Student voices</Eyebrow>
          <h2>What Our Students Say</h2>
          <p>Illustrative feedback gathered during campus review conversations.</p>
        </div>

        <div className="testimonial-grid" aria-label="Student testimonials">
          {items.map((item) => (
            <article key={item.name} className="testimonial-card">
              <div className="testimonial-mark" aria-hidden="true">“</div>
              <p className="testimonial-quote">{item.quote}</p>
              <div className="testimonial-author">
                <img src={item.avatar} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.program}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

