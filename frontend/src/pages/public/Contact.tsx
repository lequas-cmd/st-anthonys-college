import React, { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react'
import { FaFacebook, FaLinkedinIn } from 'react-icons/fa'
import { FaTelegramPlane } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { Layout, Eyebrow, PageIntro } from '../../components/ui'
import { getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'
import churchLogo from '../../assets/images/church-logo.png'
import crsLogo from '../../assets/images/crs-logo.png'

export default function Contact() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.contact;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mapUrl = 'https://maps.app.goo.gl/Nzya6TcDML6MptfC7'
  const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1103.185325850251!2d37.935426474146624!3d8.121811753418188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17b2e10da7ac2987%3A0xe0d8d3b1c9d93124!2sSt.%20Anthony%20TVTE%20College!5e1!3m2!1sen!2sus!4v1791559060012!5m2!1sen!2sus'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' })
    }, 600)
  }

  return (
    <Layout>
      <main className="contact-page">
        {/* 1. Page Introduction */}
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="Campus Inquiries"
        />

        {/* 2 - 6. Balanced Two-Column Composition: Contact Info & Form */}
        <section className="section wrap contact-layout-section">
          <div className="contact-editorial-grid">
            {/* Left Column: 2, 3, 4, 5 Contact Info, Physical Address, Map */}
            <div className="contact-info-column">
              <div className="contact-info-header">
                <Eyebrow>Campus Desk</Eyebrow>
                <h2>{copy.infoTitle}</h2>
                <p>We welcome prospective students, families, community partners, and regional employers to visit or contact us directly.</p>
              </div>

              <div className="contact-details-cards">
                {/* Physical Address */}
                <div className="contact-card-item">
                  <div className="card-icon-box"><MapPin size={20} /></div>
                  <div className="card-text">
                    <strong>{copy.addressTitle}</strong>
                    <p>{copy.addressLine1}</p>
                    <p>{copy.addressLine2}, {copy.addressLine3}</p>
                  </div>
                </div>

                {/* Phones */}
                <div className="contact-card-item">
                  <div className="card-icon-box"><Phone size={20} /></div>
                  <div className="card-text">
                    <strong>{copy.phonesTitle}</strong>
                    <p><a href="tel:+251911000000">+251 911 000 000</a> (Admissions Desk)</p>
                    <p><a href="tel:+251922000000">+251 922 000 000</a> (Administrative Office)</p>
                  </div>
                </div>

                {/* Email */}
                <div className="contact-card-item">
                  <div className="card-icon-box"><Mail size={20} /></div>
                  <div className="card-text">
                    <strong>{copy.emailTitle}</strong>
                    <p><a href="mailto:info@stanthonytvet.edu.et">info@stanthonytvet.edu.et</a></p>
                    <p><a href="mailto:admissions@stanthonytvet.edu.et">admissions@stanthonytvet.edu.et</a></p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="contact-card-item">
                  <div className="card-social-box">
                    <strong className="social-heading">Follow Us</strong>
                    <div className="social-links">
                      <a href="https://facebook.com/saintanthonytvet" target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaFacebook size={16} aria-hidden="true" />
                      </a>
                      <a href="https://t.me/saintanthonytvet" target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaTelegramPlane size={16} aria-hidden="true" />
                      </a>
                      <a href="https://x.com/saintanthonytvet" target="_blank" rel="noopener noreferrer" className="social-link">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" d="M18.6 8L15 4.5l-3.6 3.5M18.6 16l3.6-3.5L15 20M15 4.5l3.6 3.5M15 20l-3.6-3.5"/></svg>
                      </a>
                      <a href="https://linkedin.com/company/saintanthonytvet" target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaLinkedinIn size={16} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="contact-card-item">
                  <div className="card-icon-box"><Clock size={20} /></div>
                  <div className="card-text">
                    <strong>{copy.hoursTitle}</strong>
                    <p>{copy.hoursLine1}</p>
                    <p>{copy.hoursLine2}</p>
                    <p className="closed-line">{copy.hoursLine3}</p>
                  </div>
                </div>
              </div>

              {/* 5. Map Integration */}
              <div className="campus-map-card">
                <div className="map-card-header">
                  <MapPin size={16} aria-hidden="true" />
                  <span>{copy.mapTitle}</span>
                  <a href={mapUrl} target="_blank" rel="noreferrer" className="map-ext-link">
                    Open in Google Maps <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
                <div className="map-frame-container">
                  <iframe
                    title="Saint Anthony's College map location in Emdibir"
                    src={mapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* Right Column: 6. Contact Enquiry Form */}
            <div className="contact-form-column">
              <div className="form-card-container">
                <div className="form-card-header">
                  <Eyebrow>Direct Inquiry</Eyebrow>
                  <h2>{copy.formTitle}</h2>
                  <p>{copy.formLead}</p>
                </div>

                {submitted ? (
                  <div className="form-success-banner" role="alert">
                    <CheckCircle2 size={32} className="success-icon" aria-hidden="true" />
                    <h3>Inquiry Successfully Submitted</h3>
                    <p>{copy.successMessage}</p>
                    <button
                      type="button"
                      className="button button-navy"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form className="institutional-contact-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                      <label className="form-field">
                        <span>{copy.fullName}</span>
                        <input
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Ato / W/ro Full Name"
                        />
                      </label>
                    </div>

                    <div className="form-row-two-col">
                      <label className="form-field">
                        <span>{copy.email}</span>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your.email@example.com"
                        />
                      </label>

                      <label className="form-field">
                        <span>{copy.phone}</span>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+251 9..."
                        />
                      </label>
                    </div>

                    <div className="form-row">
                      <label className="form-field">
                        <span>{copy.subject}</span>
                        <select
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        >
                          <option value="" disabled>Select category…</option>
                          {copy.subjectOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="form-row">
                      <label className="form-field">
                        <span>{copy.message}</span>
                        <textarea
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Please describe your question or inquiry in detail…"
                        />
                      </label>
                    </div>

                    <button
                      className="button button-navy full-width submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <span>{isSubmitting ? 'Sending inquiry…' : copy.sendButton}</span>
                      <Send size={15} aria-hidden="true" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 7. Partner Links & Institutional Backing */}
        <section className="section wrap contact-partners-strip">
          <div className="contact-partners-card">
            <div className="contact-partners-copy">
              <Eyebrow>Institutional Backing</Eyebrow>
              <h2>Partner Organizations Supporting Saint Anthony's</h2>
              <p>For official partnership inquiries, grants, or institutional collaborations, please contact the Academic Director's office.</p>
            </div>
            <div className="contact-partner-badges">
              <div className="partner-badge-node">
                <img src={churchLogo} alt="Ethiopian Catholic Church Logo" />
                <span>Ethiopian Catholic Church</span>
              </div>
              <div className="partner-badge-node">
                <img src={crsLogo} alt="Catholic Relief Services Logo" />
                <span>Catholic Relief Services</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}

