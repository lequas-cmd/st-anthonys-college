import React from 'react'
import { ArrowUpRight } from 'lucide-react'

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span className="eyebrow-pip" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export function PageIntro({
  eyebrow,
  title,
  description,
  badge
}: {
  eyebrow: string
  title: string
  description?: string
  badge?: string
}) {
  return (
    <section className="page-intro wrap">
      <div className="page-intro-header">
        <Eyebrow>{eyebrow}</Eyebrow>
        {badge && <span className="page-intro-badge">{badge}</span>}
      </div>
      <h1>{title}</h1>
      {description && <p className="page-intro-deck">{description}</p>}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  link,
  href = '/programs'
}: {
  eyebrow: string
  title: string
  lead?: string
  link?: string
  href?: string
}) {
  return (
    <div className="section-heading">
      <div className="section-heading-text">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
        {lead && <p className="section-heading-lead">{lead}</p>}
      </div>
      {link && (
        <a className="inline-link section-heading-link" href={href}>
          <span>{link}</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      )}
    </div>
  )
}

export function Testimonials({
  items
}: {
  items: { name: string; program: string; quote: string; avatar: string }[]
}) {
  return (
    <section className="testimonials-section">
      <div className="wrap testimonials-wrap">
        <div className="testimonial-intro">
          <Eyebrow>Student Voices &amp; Experiences</Eyebrow>
          <h2>Stories from Our Trainees</h2>
          <p>Verified experiences from students undergoing supervised technical training in Emdibir.</p>
        </div>

        <div className="testimonial-grid" aria-label="Student testimonials">
          {items.map((item) => (
            <article key={item.name} className="testimonial-card">
              <div className="testimonial-mark" aria-hidden="true">“</div>
              <p className="testimonial-quote">{item.quote}</p>
              <div className="testimonial-author">
                <img src={item.avatar} alt={item.name} loading="lazy" />
                <div className="testimonial-author-info">
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
