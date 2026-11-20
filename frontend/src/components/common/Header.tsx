import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Globe, MapPin, Menu, Phone, Search, X } from 'lucide-react';
import { Brand } from './Brand';
import { getLocaleAwarePath, getLocaleFromPathname, localeLabels, type Locale } from '../../i18n/locale';
import { messages } from '../../i18n/messages';

const NAV_ITEMS = [
  { key: 'about', path: '/about' },
  { key: 'programs', path: '/programs' },
  { key: 'admissions', path: '/admissions' },
  { key: 'howToApply', path: '/how-to-apply' },
  { key: 'campus', path: '/student-life' },
  { key: 'news', path: '/news-events' },
  { key: 'resources', path: '/resources' },
  { key: 'contact', path: '/contact' },
] as const;

const NAV_ID = 'primary-navigation';

/** Strips the locale prefix so active-state checks work for /am/* too. */
const stripLocale = (pathname: string) => (pathname.startsWith('/am') ? pathname.replace(/^\/am/, '') || '/' : pathname);

const isActivePath = (currentPath: string, path: string) =>
  path === '/programs' || path === '/news-events'
    ? currentPath === path || currentPath.startsWith(`${path}/`)
    : currentPath === path;

type HeaderActionsProps = {
  variant: 'bar' | 'menu';
  locale: Locale;
  dictionary: (typeof messages)[Locale]['header'];
  onSearch: () => void;
  onToggleLanguage: () => void;
};

/**
 * Search, language and portal controls. Rendered twice: in the header bar
 * (desktop layout) and inside the dropdown panel (compact layout). CSS shows one.
 */
function HeaderActions({ variant, locale, dictionary, onSearch, onToggleLanguage }: HeaderActionsProps) {
  const showLabels = variant === 'menu';
  const nextLocale = locale === 'en' ? 'am' : 'en';

  const controls = (
    <>
      <button type="button" className="icon-button" aria-label={dictionary.searchAction} onClick={onSearch}>
        <Search size={showLabels ? 16 : 17} aria-hidden="true" />
        {showLabels && <span>{dictionary.searchAction}</span>}
      </button>
      <button
        type="button"
        className="language-button"
        aria-label={`Switch language to ${localeLabels[nextLocale]}`}
        onClick={onToggleLanguage}
      >
        <Globe size={14} aria-hidden="true" /> {locale === 'en' ? 'አማርኛ' : 'EN'}
      </button>
    </>
  );

  return (
    <div className={`header-actions header-actions-${variant}`}>
      {showLabels ? <div className="actions-row">{controls}</div> : controls}
      <a className="portal-button" href={getLocaleAwarePath('/portal', locale)}>
        {dictionary.portal} <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </div>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const navAreaRef = React.useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const locale = getLocaleFromPathname(pathname);
  const dictionary = messages[locale].header;
  const currentPath = stripLocale(pathname);

  // Dropdown: close on Escape (returning focus to the toggle) and on any press outside it.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!navAreaRef.current?.contains(target) && !menuButtonRef.current?.contains(target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const toggleLanguage = () => navigate(getLocaleAwarePath(pathname, locale === 'en' ? 'am' : 'en'));

  const openSearch = () => {
    setSearchOpen((open) => !open);
    setMenuOpen(false);
  };

  const skipToContent = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.querySelector<HTMLElement>('main');
    if (!main) return;
    main.setAttribute('tabindex', '-1');
    main.focus();
    main.scrollIntoView();
  };

  return (
    <>
      <a href="#main" className="skip-link" onClick={skipToContent}>
        Skip to main content
      </a>

      {/* Top bar: scrolls away with the page */}
      <div className="topbar">
        <div className="topline-wrap chrome-wrap">
          <div className="topline-left">
            <span className="topline-item"><MapPin size={13} aria-hidden="true" /> {dictionary.topline}</span>
          </div>
          <div className="topline-right">
            <a href="tel:+251911000000" className="topline-item">
              <Phone size={12} aria-hidden="true" /> +251 911 000 000
            </a>
            <span className="topline-divider" aria-hidden="true">|</span>
            <a href="tel:+251922000000" className="topline-item">
              <Phone size={12} aria-hidden="true" /> +251 922 000 000
            </a>
          </div>
        </div>
      </div>

      {/* Main header: sticky navigation bar */}
      <header className="site-header">
        <div className="header-main chrome-wrap">
          <a href={getLocaleAwarePath('/', locale)} className="brand-link" aria-label="Saint Anthony's College Home">
            <Brand />
          </a>

          <div id={NAV_ID} ref={navAreaRef} className={`nav-area ${menuOpen ? 'nav-open' : ''}`}>
            <nav aria-label="Main navigation">
              {NAV_ITEMS.map(({ key, path }) => {
                const active = isActivePath(currentPath, path);
                return (
                  <a
                    key={path}
                    href={getLocaleAwarePath(path, locale)}
                    className={`nav-link ${active ? 'active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {dictionary.links[key]}
                  </a>
                );
              })}
            </nav>

            <HeaderActions variant="menu" locale={locale} dictionary={dictionary} onSearch={openSearch} onToggleLanguage={toggleLanguage} />
          </div>

          <div className="header-controls">
            <HeaderActions variant="bar" locale={locale} dictionary={dictionary} onSearch={openSearch} onToggleLanguage={toggleLanguage} />
            <button
              ref={menuButtonRef}
              type="button"
              className="mobile-menu"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls={NAV_ID}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-strip-overlay">
            <form
              className="search-strip chrome-wrap"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                const query = encodeURIComponent((new FormData(event.currentTarget).get('q') ?? '').toString());
                window.location.href = `${getLocaleAwarePath('/search', locale)}?q=${query}`;
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearchOpen(false);
              }}
            >
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input name="q" type="search" placeholder={dictionary.searchPlaceholder} autoFocus aria-label={dictionary.searchPlaceholder} />
              <button className="text-button" type="submit">
                {dictionary.searchAction} <ArrowRight size={15} aria-hidden="true" />
              </button>
              <button type="button" className="search-close-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}
