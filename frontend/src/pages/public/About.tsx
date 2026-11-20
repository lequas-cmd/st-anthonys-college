import React from 'react'
import { ArrowRight, Award, CheckCircle2, HeartHandshake, ShieldCheck, Users, Wrench } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, Eyebrow, PageIntro, SectionHeading } from '../../components/ui'
import { photos, leadershipMembers } from '../../data/content'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'
import churchLogo from '../../assets/images/church-logo.png'
import crsLogo from '../../assets/images/crs-logo.png'

export default function About() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.about;

  return (
    <Layout>
      <main className="about-page">
        {/* 1. Institutional Hero */}
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="TVET Emdibir · Ethiopia"
        />

        {/* 2. Our Story (Image & Text Composition) */}
        <section className="section wrap about-story-section">
          <div className="about-story-grid">
            <div className="about-story-media">
              <img
                src={photos.students}
                alt="Students collaborating in technical education in Emdibir"
                className="about-story-img"
              />
              <div className="about-story-badge">
                <span className="badge-title">Community Roots</span>
                <p>Emdibir, Gurage Zone · Empowering youth through technical skills since foundation.</p>
              </div>
            </div>

            <div className="about-story-copy">
              <Eyebrow>{copy.storyEyebrow}</Eyebrow>
              <h2>{copy.storyTitle}</h2>
              <div className="editorial-prose">
                <p>{copy.storyBody}</p>
                <p>{copy.storySupport}</p>
              </div>

              <div className="story-highlights-list">
                <div className="highlight-item">
                  <CheckCircle2 size={18} className="highlight-icon" aria-hidden="true" />
                  <span>Serving all students regardless of religion, gender, or background.</span>
                </div>
                <div className="highlight-item">
                  <CheckCircle2 size={18} className="highlight-icon" aria-hidden="true" />
                  <span>Fully aligned with Ethiopian National TVET Occupational Standards.</span>
                </div>
                <div className="highlight-item">
                  <CheckCircle2 size={18} className="highlight-icon" aria-hidden="true" />
                  <span>Supported by Catholic Church partners and Catholic Relief Services (CRS).</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Mission and Vision */}
        <section className="section about-mission-section">
          <div className="wrap">
            <div className="mission-intro-header">
              <Eyebrow>{copy.missionEyebrow}</Eyebrow>
              <h2>{copy.missionTitle}</h2>
            </div>

            <div className="mission-vision-grid">
              <div className="mission-card">
                <span className="mission-tag">Institutional Mission</span>
                <h3>Educating for Dignity &amp; Self-Reliance</h3>
                <p>{copy.missionText}</p>
              </div>

              <div className="mission-card vision-card">
                <span className="mission-tag">Institutional Vision</span>
                <h3>A Beacon of TVET Excellence in Ethiopia</h3>
                <p>{copy.visionText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Institutional Values */}
        <section className="section wrap about-values-section">
          <SectionHeading
            eyebrow="Core Principles"
            title="Institutional Values that Guide Our Community"
            lead="Our education is founded on mutual respect, personal integrity, and the shared dignity of manual and technical work."
          />

          <div className="values-cards-grid">
            <div className="value-card">
              <div className="value-icon-box"><Award size={20} /></div>
              <h3>{copy.values.dignity.title}</h3>
              <p>{copy.values.dignity.desc}</p>
            </div>
            <div className="value-card">
              <div className="value-icon-box"><Wrench size={20} /></div>
              <h3>{copy.values.competence.title}</h3>
              <p>{copy.values.competence.desc}</p>
            </div>
            <div className="value-card">
              <div className="value-icon-box"><HeartHandshake size={20} /></div>
              <h3>{copy.values.solidarity.title}</h3>
              <p>{copy.values.solidarity.desc}</p>
            </div>
            <div className="value-card">
              <div className="value-icon-box"><ShieldCheck size={20} /></div>
              <h3>{copy.values.integrity.title}</h3>
              <p>{copy.values.integrity.desc}</p>
            </div>
            <div className="value-card">
              <div className="value-icon-box"><Users size={20} /></div>
              <h3>{copy.values.inclusion.title}</h3>
              <p>{copy.values.inclusion.desc}</p>
            </div>
          </div>
        </section>

        {/* 5. Our Approach to Education */}
        <section className="section about-approach-section">
          <div className="wrap about-approach-grid">
            <div className="approach-copy">
              <Eyebrow>{copy.approachEyebrow}</Eyebrow>
              <h2>{copy.approachTitle}</h2>
              <div className="editorial-prose">
                <p>{copy.approachBody}</p>
              </div>

              <div className="approach-ratios">
                <div className="ratio-box">
                  <span className="ratio-num">70%</span>
                  <strong>Supervised Workshop Practice</strong>
                  <p>Hands-on diagnostics, machinery operation, circuit wiring, and fabrication bays.</p>
                </div>
                <div className="ratio-box">
                  <span className="ratio-num">30%</span>
                  <strong>Occupational Theory &amp; Safety</strong>
                  <p>Engineering math, blueprint reading, occupational safety regulations, and trade science.</p>
                </div>
              </div>
            </div>

            <div className="approach-media">
              <img
                src={photos.workshop}
                alt="Student practicing arc welding under instructor supervision"
                className="approach-img"
              />
              <div className="approach-caption">
                <span>Workshop Learning Culture · Emdibir Campus</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Leadership & Academic Governance */}
        <section className="section wrap about-leadership-section">
          <SectionHeading
            eyebrow={copy.leadershipEyebrow}
            title={copy.leadershipTitle}
            lead="Our academic leadership brings decades of engineering experience, educational dedication, and community leadership."
          />

          <div className="leadership-cards-grid">
            {leadershipMembers.map((member) => (
              <article key={member.name} className="leadership-card">
                <div className="leadership-photo-wrap">
                  <img src={member.image} alt={member.name} loading="lazy" />
                  <span className="leadership-dept">{member.department || 'Academic Leadership'}</span>
                </div>
                <div className="leadership-card-body">
                  <span className="leadership-role">{member.role}</span>
                  <h3 className="leadership-name">{member.name}</h3>
                  <blockquote className="leadership-quote">“{member.message}”</blockquote>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 7. Community Commitment & Development Impact */}
        <section className="section about-community-commitment">
          <div className="wrap community-commitment-grid">
            <div className="commitment-media">
              <img
                src={photos.classroom}
                alt="Community consultation and student workshop in session"
                className="commitment-img"
              />
            </div>
            <div className="commitment-copy">
              <Eyebrow>{copy.communityEyebrow}</Eyebrow>
              <h2>{copy.communityTitle}</h2>
              <div className="editorial-prose">
                <p>{copy.communityBody}</p>
              </div>
              <div className="commitment-facts">
                <div className="commitment-fact-item">
                  <strong>Local Economic Reinvestment</strong>
                  <p>Graduates establish repair workshops, metal fabrication shops, and construction services in Gurage Zone.</p>
                </div>
                <div className="commitment-fact-item">
                  <strong>Community Skills Outreach</strong>
                  <p>Annual repair clinics, technical advice, and solar energy installations supporting local families.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Institutional Partners */}
        <section className="section wrap about-partners-section">
          <div className="partners-box-container">
            <div className="partners-box-header">
              <Eyebrow>{copy.partnerEyebrow}</Eyebrow>
              <h2>{copy.partnerTitle}</h2>
              <p>{copy.partnerBody}</p>
            </div>

            <div className="partners-detail-grid">
              <div className="partner-detail-card">
                <div className="partner-detail-logo">
                  <img src={churchLogo} alt="Ethiopian Catholic Church Logo" />
                </div>
                <div>
                  <h3>Ethiopian Catholic Church</h3>
                  <p>Founding pastoral partner ensuring strong moral values, human dignity, social service outreach, and long-term community presence in Emdibir.</p>
                </div>
              </div>

              <div className="partner-detail-card">
                <div className="partner-detail-logo">
                  <img src={crsLogo} alt="Catholic Relief Services Logo" />
                </div>
                <div>
                  <h3>Catholic Relief Services (CRS)</h3>
                  <p>International development partner supporting modern training equipment, instructor professional development, facility enhancement, and student scholarships.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Closing CTA */}
        <section className="section wrap about-cta-strip">
          <div className="about-cta-card">
            <div>
              <h2>{copy.closingCta}</h2>
              <p>Explore our 10 certified technical departments or learn how to apply for the upcoming academic intake.</p>
            </div>
            <div className="cta-actions">
              <a href={getLocaleAwarePath('/programs', locale)} className="button button-navy">
                <span>View Programs</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href={getLocaleAwarePath('/contact', locale)} className="button button-outline">
                <span>Contact Admissions</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
