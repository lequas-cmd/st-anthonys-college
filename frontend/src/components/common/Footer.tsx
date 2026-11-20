import { ArrowUpRight, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Brand } from './Brand';
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale';
import { messages } from '../../i18n/messages';
import churchLogo from '../../assets/images/church-logo.png';
import crsLogo from '../../assets/images/crs-logo.png';
import { FaFacebook, FaLinkedinIn } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';

export function Footer() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const text = messages[locale].footer;

  return (
    <footer className="footer" role="contentinfo">
      {/* Main Footer Grid */}
      <div className="wrap footer-grid">
        <div className="footer-about">
          <Brand light />
          <p className="footer-desc">{text.about}</p>
          <div className="footer-accreditation">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{text.tvetAccreditation}</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>{text.academicResources}</h4>
          <ul className="footer-links">
            <li><a href={getLocaleAwarePath('/programs', locale)}>All 10 Vocational Programs</a></li>
            <li><a href={getLocaleAwarePath('/admissions', locale)}>Admissions &amp; Intake Info</a></li>
            <li><a href={getLocaleAwarePath('/how-to-apply', locale)}>How to Apply Step-by-Step</a></li>
            <li><a href={getLocaleAwarePath('/resources', locale)}>Academic Handbooks &amp; Forms</a></li>
            <li><a href={getLocaleAwarePath('/announcements', locale)}>Official Noticeboard</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{text.collegeInformation}</h4>
          <ul className="footer-links">
            <li><a href={getLocaleAwarePath('/about', locale)}>About the College &amp; History</a></li>
            <li><a href={getLocaleAwarePath('/student-life', locale)}>Campus &amp; Workshop Facilities</a></li>
            <li><a href={getLocaleAwarePath('/news-events', locale)}>News, Activities &amp; Events</a></li>
            <li><a href={getLocaleAwarePath('/contact', locale)}>Contact Campus Desk</a></li>
            <li><a href={getLocaleAwarePath('/portal', locale)}>{text.portalAccess} <ArrowUpRight size={13} aria-hidden="true" /></a></li>
          </ul>
        </div>

        <div className="footer-col footer-contact-col">
          <h4>{text.contact}</h4>
          <div className="footer-contact-items">
            <p><MapPin size={15} aria-hidden="true" /> <span>{text.location}</span></p>
            <p><Phone size={15} aria-hidden="true" /> <a href="tel:+251911000000">{text.phone}</a></p>
            <p><Mail size={15} aria-hidden="true" /> <a href={`mailto:${text.email}`}>{text.email}</a></p>
          </div>
          <div className="footer-social">
            <a href="https://facebook.com/saintanthonytvet" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
              <FaFacebook size={16} aria-hidden="true" />
            </a>
            <a href="https://t.me/saintanthonytvet" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Telegram">
              <FaTelegramPlane size={16} aria-hidden="true" />
            </a>
            <a href="https://x.com/saintanthonytvet" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" d="M18.6 8L15 4.5l-3.6 3.5M18.6 16l3.6-3.5L15 20M15 4.5l3.6 3.5M15 20l-3.6-3.5"/></svg>
            </a>
            <a href="https://linkedin.com/company/saintanthonytvet" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
              <FaLinkedinIn size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="footer-portal-card">
            <span>Student &amp; Faculty Portal</span>
            <a href={getLocaleAwarePath('/portal', locale)} className="footer-portal-link">
              {text.portalAccess} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="wrap footer-bottom">
        <span className="copyright-text">{text.rights.replace('{year}', String(new Date().getFullYear()))}</span>
        <div className="footer-legal-links">
          <a href={getLocaleAwarePath('/privacy', locale)}>{text.privacy}</a>
          <span className="dot-sep" aria-hidden="true">·</span>
          <a href={getLocaleAwarePath('/accessibility', locale)}>{text.accessibility}</a>
          <span className="dot-sep" aria-hidden="true">·</span>
          <a href={getLocaleAwarePath('/contact', locale)}>{text.contact}</a>
        </div>
      </div>
    </footer>
  );
}
