import React from "react";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useLocation } from 'react-router-dom';
import { Layout, Eyebrow, PageIntro, SectionHeading } from "../../components/ui";
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale';
import { messages } from '../../i18n/messages';

export default function Admissions() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.admissions;
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  return (
    <Layout>
      <main className="admissions-page">
        {/* 1 & 2. Admissions Hero & Introduction */}
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="2026/2027 Academic Intake"
        />

        {/* 3. Available Programs and Intake Information */}
        <section className="section wrap intake-overview-section">
          <div className="intake-banner-grid">
            <div className="intake-banner-copy">
              <span className="intake-pill">Regular &amp; Vocational Intake</span>
              <h2>{copy.intakeTitle}</h2>
              <p className="editorial-lead">{copy.intakeBody}</p>

              <div className="intake-badges-row">
                <div className="intake-badge">
                  <Award size={18} aria-hidden="true" />
                  <div>
                    <strong>Level I to IV Certificates</strong>
                    <span>Accredited TVET qualification structure</span>
                  </div>
                </div>
                <div className="intake-badge">
                  <Clock size={18} aria-hidden="true" />
                  <div>
                    <strong>2-Year Programs</strong>
                    <span>Extensive workshop mastery</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="intake-dates-card">
              <div className="dates-card-header">
                <Calendar size={18} aria-hidden="true" />
                <h3>{copy.calendarTitle}</h3>
              </div>
              <div className="dates-list">
                {copy.calendarItems.map((item, idx) => (
                  <div key={idx} className="date-row-item">
                    <span className="date-tag">{item.date}</span>
                    <strong className="date-title">{item.title}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Admission Requirements (Eligibility Criteria) */}
        <section className="section wrap eligibility-section">
          <SectionHeading
            eyebrow="Candidate Eligibility"
            title={copy.eligibilityTitle}
            lead="Admission to Saint Anthony's is based on academic eligibility, technical interest, and commitment to workshop discipline."
          />

          <div className="eligibility-grid">
            <div className="eligibility-checklist-card">
              <h3>Required Entry Qualifications</h3>
              <ul className="eligibility-checklist">
                {copy.eligibilityItems.map((item, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={18} className="check-icon" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="eligibility-support-card">
              <ShieldCheck size={28} className="support-icon" aria-hidden="true" />
              <h3>Inclusive Community Access</h3>
              <p>
                Saint Anthony's College is firmly committed to equal educational opportunity.
                Supported by the Ethiopian Catholic Church and Catholic Relief Services (CRS),
                our doors are open to qualified candidates from all religious backgrounds, cultures,
                and communities.
              </p>
              <div className="scholarship-note">
                <strong>Need-Based Financial Assistance:</strong>
                <span> Scholarships are available for deserving students facing verified economic barriers.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Application Process Overview */}
        <section className="section wrap application-process-section">
          <SectionHeading
            eyebrow={copy.processEyebrow}
            title={copy.processTitle}
            lead="A transparent 5-step admissions pathway from trade exploration to workshop induction."
          />

          <div className="process-timeline-grid">
            <div className="timeline-step-card">
              <span className="step-num">01</span>
              <h4>Select Department</h4>
              <p>Review our 10 accredited vocational trades and choose the specialization aligned with your career goals.</p>
            </div>
            <div className="timeline-step-card">
              <span className="step-num">02</span>
              <h4>Gather Documents</h4>
              <p>Prepare original school certificates, transcript records, valid Kebele ID, and four passport photos.</p>
            </div>
            <div className="timeline-step-card">
              <span className="step-num">03</span>
              <h4>Campus Desk Submission</h4>
              <p>Submit your application in person at our Admissions Office on the Emdibir campus.</p>
            </div>
            <div className="timeline-step-card">
              <span className="step-num">04</span>
              <h4>Departmental Interview</h4>
              <p>Meet with trade instructors for document verification and workshop readiness assessment.</p>
            </div>
            <div className="timeline-step-card">
              <span className="step-num">05</span>
              <h4>Enrollment &amp; Induction</h4>
              <p>Receive your admission slip, obtain required workshop safety gear, and attend campus orientation.</p>
            </div>
          </div>

          <div className="process-cta-banner">
            <div>
              <h3>Ready to apply?</h3>
              <p>Read the detailed step-by-step checklist or visit our campus desk.</p>
            </div>
            <a href={getLocaleAwarePath('/how-to-apply', locale)} className="button button-navy">
              <span>View How to Apply Guide</span>
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* 7. Frequently Asked Questions */}
        <section className="section wrap faq-section">
          <SectionHeading
            eyebrow="Admissions Guidance"
            title={copy.faqTitle}
            lead="Answers to common questions from applicants, parents, and community members."
          />

          <div className="faq-accordion-list">
            {copy.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`faq-item-card ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-q-text">{faq.q}</span>
                    <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. Contact Information / Admissions Desk */}
        <section className="section wrap admissions-desk-section">
          <div className="admissions-desk-card">
            <div className="desk-info-column">
              <Eyebrow>In-Person Consultation</Eyebrow>
              <h2>{copy.contactDeskTitle}</h2>
              <p className="editorial-lead">{copy.contactDeskCopy}</p>

              <div className="desk-contacts-list">
                <div className="desk-contact-item">
                  <MapPin size={18} aria-hidden="true" />
                  <div>
                    <strong>Campus Location</strong>
                    <p>Main Administrative Building, St. Anthony's College, Emdibir, Gurage Zone, Ethiopia</p>
                  </div>
                </div>
                <div className="desk-contact-item">
                  <Phone size={18} aria-hidden="true" />
                  <div>
                    <strong>Direct Admissions Desk Phone</strong>
                    <p>+251 911 000 000 / +251 922 000 000</p>
                  </div>
                </div>
                <div className="desk-contact-item">
                  <Clock size={18} aria-hidden="true" />
                  <div>
                    <strong>Working Hours</strong>
                    <p>Monday – Friday: 8:00 AM – 12:30 PM | 1:30 PM – 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="desk-action-box">
              <h3>Have questions before applying?</h3>
              <p>Our admissions counselors can guide you on department choices and required paperwork.</p>
              <a href={getLocaleAwarePath('/contact', locale)} className="button button-navy full-width">
                <span>Contact Admissions Desk</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href={getLocaleAwarePath('/programs', locale)} className="button button-outline full-width">
                <span>Explore All Programs</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
