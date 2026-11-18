import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Brand } from './Brand';
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale';
import { messages } from '../../i18n/messages';

export function Footer() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const text = messages[locale].footer;
  const base = getLocaleAwarePath('/programs', locale);

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-about">
          <Brand light />
          <p>{text.about}</p>
          <p className="partner-note">Supported by the Catholic Church and CRS.</p>
        </div>
        <div>
          <h4>{text.academicResources}</h4>
          <a href={base}>Programs and departments</a>
          <a href={getLocaleAwarePath('/admissions', locale)}>Admissions</a>
          <a href={getLocaleAwarePath('/resources', locale)}>Student resources</a>
          <a href={getLocaleAwarePath('/announcements', locale)}>Announcements</a>
          <a href={getLocaleAwarePath('/news-events', locale)}>News and events</a>
        </div>
        <div>
          <h4>{text.collegeInformation}</h4>
          <a href={getLocaleAwarePath('/about', locale)}>About the college</a>
          <a href={getLocaleAwarePath('/student-life', locale)}>Campus & Student life</a>
          <a href={getLocaleAwarePath('/contact', locale)}>{text.contact}</a>
        </div>
        <div>
          <h4>{text.contact}</h4>
          <p><MapPin size={14} /> Ethiopia</p>
          <p><Mail size={14} /> info@example.edu.et</p>
          <p><Phone size={14} /> +251 (placeholder)</p>
          <a href={getLocaleAwarePath('/portal', locale)}>{text.portalAccess} <ArrowUpRight size={13} /></a>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>{text.rights.replace('{year}', String(new Date().getFullYear()))}</span>
        <div>
          <a href={getLocaleAwarePath('/privacy', locale)}>{text.privacy}</a>
          <a href={getLocaleAwarePath('/accessibility', locale)}>{text.accessibility}</a>
          <a href={getLocaleAwarePath('/contact', locale)}>{text.contact}</a>
        </div>
      </div>
    </footer>
  );
}

