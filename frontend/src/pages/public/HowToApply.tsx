import React from 'react'
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  HelpCircle,
  MapPin,
  Phone,
  UserCheck,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro, Eyebrow, SectionHeading } from '../../components/ui'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

export default function HowToApply() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.howToApply;
  const admissionsCopy = messages[locale].pages.admissions;

  return (
    <Layout>
      <main className="how-to-apply-page">
        {/* 1. Clear Introduction */}
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="Admissions Guide"
        />

        {/* 2. Numbered Application Steps (Vertical Timeline Layout) */}
        <section className="section wrap timeline-steps-section">
          <SectionHeading
            eyebrow="Admissions Pathway"
            title="Step-by-Step Enrollment Guide"
            lead="Follow these five structured milestones to secure your enrollment at Saint Anthony's."
          />

          <div className="vertical-timeline">
            {copy.steps.map((step, idx) => (
              <div key={step.number} className="timeline-node">
                <div className="timeline-marker">
                  <span className="marker-number">{step.number}</span>
                  {idx < copy.steps.length - 1 && <div className="marker-line" aria-hidden="true" />}
                </div>
                <div className="timeline-content-card">
                  <span className="step-tag">Step {step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Required Documents Checklist */}
        <section className="section wrap documents-section">
          <div className="documents-card">
            <div className="documents-header">
              <FileCheck size={24} className="docs-header-icon" aria-hidden="true" />
              <div>
                <Eyebrow>Checklist</Eyebrow>
                <h2>{copy.documentsTitle}</h2>
                <p>Ensure you have all required items before visiting the Admissions Office.</p>
              </div>
            </div>

            <div className="documents-grid">
              {copy.documents.map((doc, idx) => (
                <div key={idx} className="document-item">
                  <CheckCircle2 size={18} className="doc-check-icon" aria-hidden="true" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>

            <div className="documents-footer-note">
              <span>Note: Original credentials will be inspected and returned immediately after verification.</span>
            </div>
          </div>
        </section>

        {/* 4. Where to Submit Applications */}
        <section className="section wrap submission-desk-section">
          <div className="submission-desk-grid">
            <div className="submission-info-box">
              <Eyebrow>Campus Desk</Eyebrow>
              <h2>{copy.submissionTitle}</h2>
              <div className="editorial-prose">
                <p><strong>Physical Address:</strong> {copy.submissionAddress}</p>
                <p><strong>Desk Operating Hours:</strong> {copy.submissionHours}</p>
              </div>
              <div className="desk-features">
                <div className="desk-feature">
                  <MapPin size={16} aria-hidden="true" />
                  <span>Located on the ground floor of the main administrative hall.</span>
                </div>
                <div className="desk-feature">
                  <UserCheck size={16} aria-hidden="true" />
                  <span>Dedicated counselors available for in-person consultation.</span>
                </div>
              </div>
            </div>

            {/* 5. What Happens After Submission */}
            <div className="post-submission-box">
              <Eyebrow>Application Review</Eyebrow>
              <h2>{copy.postSubmissionTitle}</h2>
              <div className="editorial-prose">
                <p>{copy.postSubmissionCopy}</p>
              </div>
              <div className="post-review-timeline">
                <div className="review-step">
                  <strong>Days 1 – 3:</strong>
                  <span>Credentials verification &amp; department assignment.</span>
                </div>
                <div className="review-step">
                  <strong>Days 4 – 5:</strong>
                  <span>Direct phone contact &amp; campus notice board publication.</span>
                </div>
                <div className="review-step">
                  <strong>Enrollment:</strong>
                  <span>Orientation, workshop safety briefing &amp; class schedules.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Frequently Asked Questions */}
        <section className="section wrap how-faq-section">
          <SectionHeading
            eyebrow="Clarifications"
            title="Common Questions About Applying"
            lead="Review helpful guidance regarding admissions requirements, tuition assistance, and workshop preparations."
          />

          <div className="faq-grid-two-col">
            {admissionsCopy.faqs.map((faq, idx) => (
              <div key={idx} className="faq-card-static">
                <div className="faq-q-row">
                  <HelpCircle size={18} className="faq-icon" aria-hidden="true" />
                  <h4>{faq.q}</h4>
                </div>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Contact Information & Assistance CTA */}
        <section className="section wrap how-contact-section">
          <div className="how-contact-card">
            <div className="how-contact-copy">
              <h2>Need Assistance with Your Application?</h2>
              <p>Our admissions desk is available by telephone or in person at the Emdibir campus to answer your questions.</p>
              <div className="how-contact-details">
                <span><Phone size={14} aria-hidden="true" /> +251 911 000 000 / +251 922 000 000</span>
                <span><MapPin size={14} aria-hidden="true" /> Emdibir, Gurage Zone, Ethiopia</span>
              </div>
            </div>
            <div className="how-contact-actions">
              <a href={getLocaleAwarePath('/contact', locale)} className="button button-navy">
                <span>Contact Admissions Office</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href={getLocaleAwarePath('/programs', locale)} className="button button-outline">
                <span>Browse Programs</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
