import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Globe, MapPin, Menu, Phone, Search, X } from 'lucide-react';
import { Brand } from './Brand';
import { getLocaleAwarePath, getLocaleFromPathname, localeLabels } from '../../i18n/locale';
import { messages } from '../../i18n/messages';

export function Header() {
  const [open, setOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const locale = getLocaleFromPathname(pathname);
  const dictionary = messages[locale].header;

  const links = [
    { label: dictionary.links.about, path: '/about' },
    { label: dictionary.links.programs, path: '/programs' },
    { label: dictionary.links.admissions, path: '/admissions' },
    { label: dictionary.links.campus, path: '/student-life' },
    { label: dictionary.links.news, path: '/news-events' },
    { label: dictionary.links.resources, path: '/resources' },
    { label: dictionary.links.contact, path: '/contact' },
  ];

  const isActiveLink = (path: string) => {
    const currentPath = pathname.startsWith('/am') ? pathname.replace(/^\/am/, '') || '/' : pathname;
    if (path === '/') return currentPath === '/';
    if (path === '/programs') return currentPath === '/programs' || currentPath.startsWith('/programs/');
    if (path === '/news-events') return currentPath === '/news-events' || currentPath.startsWith('/news-events/');
    return currentPath === path;
  };

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'am' : 'en';
    navigate(getLocaleAwarePath(pathname, nextLocale));
  };

  return (
    <header className="site-header">
      <div className="topline">
        <span><MapPin size={12} /> {dictionary.topline}</span>
        <div>
          <span><Phone size={12} /> +251 911 000 000</span>
          <span className="top-divider">|</span>
          <span><Phone size={12} /> +251 922 000 000</span>
        </div>
      </div>
      <div className="header-main wrap">
        <a href={getLocaleAwarePath('/', locale)} className="brand-link"><Brand /></a>
        <div className={`nav-area ${open ? 'nav-open' : ''}`}>
          <nav>
            {links.map(({ label, path }) => {
              const href = getLocaleAwarePath(path, locale);
              const active = isActiveLink(path);
              return (
                <a key={path} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>{label}</a>
              );
            })}
          </nav>
          <div className="mobile-actions">
            <div className="mobile-actions-row">
              <button className="icon-button" aria-label={dictionary.searchAction} onClick={() => setSearchOpen(!searchOpen)}><Search size={17} /></button>
              <button className="language-button" aria-label={`Switch language to ${locale === 'en' ? localeLabels.am : localeLabels.en}`} onClick={toggleLanguage}>
                <Globe size={14} /> {locale === 'en' ? 'አማርኛ' : 'EN'}
              </button>
            </div>
            <a className="portal-button" href={getLocaleAwarePath('/portal', locale)}>{dictionary.portal} <ArrowUpRight size={14} /></a>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-button" aria-label={dictionary.searchAction} onClick={() => setSearchOpen(!searchOpen)}><Search size={17} /></button>
          <button className="language-button" aria-label={`Switch language to ${locale === 'en' ? localeLabels.am : localeLabels.en}`} onClick={toggleLanguage}>
            <Globe size={14} /> {locale === 'en' ? 'አማርኛ' : 'EN'}
          </button>
          <a className="portal-button" href={getLocaleAwarePath('/portal', locale)}>{dictionary.portal} <ArrowUpRight size={14} /></a>
        </div>
        <button className="mobile-menu" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {searchOpen && (
        <form
          className="search-strip wrap"
          onSubmit={(e) => {
            e.preventDefault();
            const query = encodeURIComponent((new FormData(e.currentTarget).get('q') ?? '').toString());
            window.location.href = `${getLocaleAwarePath('/search', locale)}?q=${query}`;
          }}
        >
          <Search size={18} />
          <input name="q" placeholder={dictionary.searchPlaceholder} autoFocus />
          <button className="text-button" type="submit">{dictionary.searchAction} <ArrowRight size={15} /></button>
        </form>
      )}
    </header>
  );
}

