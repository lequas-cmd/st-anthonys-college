import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Users,
  Wrench,
} from "lucide-react";
import {
  Layout,
  Eyebrow,
  SectionHeading,
  ProgramCard,
} from "../../components/ui";
import { photos } from "../../data/content";
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale';
import { messages } from '../../i18n/messages';

const crsLogo = new URL("../../assets/images/crs-logo.png", import.meta.url)
  .href;
const churchLogo = new URL(
  "../../assets/images/church-logo.png",
  import.meta.url,
).href;
const hero = new URL("../../assets/images/hero.jpg", import.meta.url).href;

export type ProgramItem = {
  id: number;
  code: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  image_url?: string | null;
};

export type NewsItem = {
  id: number;
  title: string;
  slug?: string;
  category?: string;
  summary?: string;
  body?: string;
  image_url?: string | null;
  published_at?: string;
  date?: string;
};

export type EventItem = {
  id: number;
  title: string;
  slug?: string;
  summary?: string;
  body?: string;
  location?: string;
  starts_at?: string;
  ends_at?: string;
  image_url?: string | null;
  month?: string;
  day?: string;
};

export type AnnouncementItem = {
  id: number;
  title: string;
  slug?: string;
  audience?: string;
  summary?: string;
  body?: string;
  published_at?: string;
  date?: string;
};

type HomeContentProps = {
  previewPrograms: ProgramItem[];
  featuredNews: NewsItem[];
  eventItems: EventItem[];
  featuredAnnouncements: AnnouncementItem[];
  showProgramDelayNotice: boolean;
  showAnnouncementDelayNotice: boolean;
  showNewsDelayNotice: boolean;
  showEventDelayNotice: boolean;
  dataFetchNotice: string;
};

type LifeGalleryItem = {
  id: number;
  title: string;
  tag: string;
  image: string;
  description: string;
  highlight: string;
};

const lifeGalleryItemsByLocale: Record<string, LifeGalleryItem[]> = {
  en: [
    {
      id: 1,
      title: "Practical learning",
      tag: "Workshop culture",
      image: photos.workshop,
      description:
        "Students build confidence through hands-on labs, guided exercises, and real-world technical practice in a supportive setting.",
      highlight: "Experiential learning",
    },
    {
      id: 2,
      title: "Learning resources",
      tag: "Study support",
      image: photos.library,
      description:
        "Quiet study spaces, digital resources, and mentoring help students stay focused and explore ideas with confidence.",
      highlight: "Independent learning",
    },
    {
      id: 3,
      title: "Student community",
      tag: "Campus life",
      image: photos.students,
      description:
        "Clubs, mentoring, and shared traditions bring students together around friendship, leadership, and belonging.",
      highlight: "Belonging & leadership",
    },
    {
      id: 4,
      title: "Digital skills",
      tag: "Future-ready",
      image: photos.computer,
      description:
        "From networking basics to technical troubleshooting, students gain the digital fluency needed for modern careers.",
      highlight: "Career preparedness",
    },
    {
      id: 5,
      title: "Construction training",
      tag: "Skills in action",
      image: photos.construction,
      description:
        "Practical site-style projects and supervised activity sessions help students connect theory to technical performance.",
      highlight: "Applied projects",
    },
    {
      id: 6,
      title: "Classroom engagement",
      tag: "Teaching excellence",
      image: photos.classroom,
      description:
        "Active teaching methods, peer collaboration, and mentor guidance make each lesson participatory and purposeful.",
      highlight: "Student-centered teaching",
    },
  ],
  am: [
    {
      id: 1,
      title: "ተግባራዊ ትምህርት",
      tag: "የሥራ ቤት ባህል",
      image: photos.workshop,
      description:
        "ተማሪዎች በእጅ የሚሰሩ ላብራቶሪዎች፣ በተመራማሪ ልምምዶች እና በተግባራዊ ቴክኒካል አሠራር ውስጥ እምነት ያዳብራሉ።",
      highlight: "ተግባራዊ ትምህርት",
    },
    {
      id: 2,
      title: "የመማር መርጃዎች",
      tag: "የጥናት ድጋፍ",
      image: photos.library,
      description:
        "ሰላም ያለ የጥናት ቦታዎች፣ ዲጂታል መርጃዎች እና አስተማሪ እርዳታ ተማሪዎች ትኩረት እንዲያደርጉ እና ሀሳቦችን በእምነት እንዲያዳምጡ ያግዛሉ።",
      highlight: "ገለልተኛ ትምህርት",
    },
    {
      id: 3,
      title: "የተማሪ ማህበረሰብ",
      tag: "የካምፓስ ሕይወት",
      image: photos.students,
      description:
        "ክለቦች፣ አስተማር እና ጋራ ባህሎች ተማሪዎችን በወዳጅነት፣ በአመራር እና በመያዣነት ያቀራርባሉ።",
      highlight: "የማህበረሰብ እና አመራር",
    },
    {
      id: 4,
      title: "ዲጂታል ክህሎቶች",
      tag: "ወደፊት የሚያደርግ",
      image: photos.computer,
      description:
        "ከኔትወርክ መሰረቶች እስከ ቴክኒካል ችግር መፍታት ድረስ ተማሪዎች ለዘመናዊ ሙያዎች የሚያስፈልጉ ዲጂታል ተሞክሮ ያገኛሉ።",
      highlight: "የሙያ ዝግጁነት",
    },
    {
      id: 5,
      title: "የሕንፃ ስልጠና",
      tag: "ክህሎት በስራ",
      image: photos.construction,
      description:
        "ተግባራዊ የጣቢያ አይነት ፕሮጀክቶች እና የሚተዳደሩ የእንቅስቃሴ ክፍሎች ተማሪዎች ንድፈ ሀሳብን ከቴክኒካል አፈጻጸም ጋር እንዲያገናኝ ያግዛሉ።",
      highlight: "ተግባራዊ ፕሮጀክቶች",
    },
    {
      id: 6,
      title: "የክፍል ተሳትፎ",
      tag: "የማስተማር ልዩነት",
      image: photos.classroom,
      description:
        "ንቁ የማስተማር ዘዴዎች፣ የአቻ ትብብር እና የአስተማሪ መመሪያ እያንዳንዱ ትምህርት ተሳታፊ እና አስፈላጊ እንዲሆን ያደርጋሉ።",
      highlight: "ተማሪ-ተኮር ትምህርት",
    },
  ],
};

export default function HomeContent({
  previewPrograms,
  featuredNews,
  eventItems,
  featuredAnnouncements,
  showProgramDelayNotice,
  showAnnouncementDelayNotice,
  showNewsDelayNotice,
  showEventDelayNotice,
  dataFetchNotice,
}: HomeContentProps) {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].home;
  const lifeGalleryItems = lifeGalleryItemsByLocale[locale] ?? lifeGalleryItemsByLocale.en;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = lifeGalleryItems[activeIndex];

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % lifeGalleryItems.length);
    }, 6000);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex]);

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? lifeGalleryItems.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % lifeGalleryItems.length);
  };

  return (
    <Layout>
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1>
              {locale === 'am' ? copy.heroTitle : (
                <>
                  Technical Education for <em>Practical Futures.</em>
                </>
              )}
            </h1>
            <p>
              {copy.heroText}
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href={getLocaleAwarePath('/programs', locale)}>
                {copy.ctaPrograms} <ArrowUpRight size={15} />
              </a>
              <a className="button button-light" href={getLocaleAwarePath('/admissions', locale)}>
                {copy.ctaApply} <ArrowRight size={15} />
              </a>
            </div>
            <div className="hero-stats" aria-label="Partner institutions">
              <div className="partner-item">
                <div className="partner-logo">
                  <img src={churchLogo} alt="Ethiopian Catholic Church Logo" />
                </div>
                <div className="partner-meta">
                  <strong>{copy.partners.church}</strong>
                  <span>{copy.partners.college}</span>
                </div>
              </div>
              <div className="partner-item">
                <div className="partner-logo blue">
                  <img src={crsLogo} alt={copy.partners.crs + " Logo"} />
                </div>
                <div className="partner-meta">
                  <strong>{copy.partners.crs}</strong>
                  <span>{copy.partners.ngo}</span>
                </div>
              </div>
            </div>
            <small className="disclaimer">{copy.partners.note}</small>
          </div>
          <div className="hero-visual">
            <img
              src={hero}
              alt="Students learning practical technical skills in a workshop"
            />
          </div>
        </section>

        <section className="intro-section">
          <div className="wrap intro-grid">
            <div className="intro-title">
              <Eyebrow>{copy.about.eyebrow}</Eyebrow>
              <h2>
                {copy.about.titleLine1}
                <br />
                {copy.about.titleLine2}
              </h2>
              <div className="small-note">
                {copy.about.smallNote}
                <br />
                <span>{copy.about.smallNoteExtra}</span>
              </div>
            </div>
            <div className="intro-text">
              <p>{copy.about.paragraph1}</p>
              <p>{copy.about.paragraph2}</p>
              <a className="button button-light" href={getLocaleAwarePath('/about', locale)}>
                {copy.about.learnMore} <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        <section className="section wrap">
          <div className="section-header-row">
            <SectionHeading
              eyebrow={copy.programs.eyebrow}
              title={copy.programs.title}
            />
            <p className="section-lead">{copy.programs.lead}</p>
          </div>
          {showProgramDelayNotice ? (
            <p className="data-fallback-note">{dataFetchNotice}</p>
          ) : null}
          <div className="program-grid">
            {previewPrograms.length > 0
              ? previewPrograms.map((p, i) => (
                  <ProgramCard key={p.title} p={p} index={i} />
                ))
              : Array.from({ length: 3 }, (_, index) => (
                  <article
                    key={`program-placeholder-${index}`}
                    className="program-card placeholder-card"
                    aria-hidden="true"
                  >
                    <div className="program-image placeholder-block" />
                    <div className="program-card-content">
                      <div className="card-meta">
                        <span className="placeholder-line placeholder-line-short" />
                        <span className="placeholder-line placeholder-line-short" />
                      </div>
                      <div className="placeholder-line placeholder-line-title" />
                      <div className="placeholder-line placeholder-line-medium" />
                      <div className="placeholder-line placeholder-line-medium" />
                      <div className="card-bottom">
                        <span className="placeholder-line placeholder-line-small" />
                        <span className="placeholder-line placeholder-line-small" />
                      </div>
                    </div>
                  </article>
                ))}
          </div>
          <div className="program-section-actions">
            <a className="button button-light" href={getLocaleAwarePath('/programs', locale)}>
              {copy.programs.viewAll} <ArrowRight size={15} />
            </a>
          </div>
        </section>

        <section className="values-section">
          <div className="wrap values-layout">
            <div className="values-intro">
              <Eyebrow>{copy.difference.eyebrow}</Eyebrow>
              <h2>{copy.difference.title}</h2>
              <div className="highlight-stat">
                <strong>{copy.difference.statValue}</strong>
                <span>{copy.difference.statLabel}</span>
                <p>{copy.difference.statDescription}</p>
              </div>
            </div>
            <div className="values-grid">
              <div className="value-item">
                <Wrench />
                <h3>{copy.difference.values.workshop.title}</h3>
                <p>{copy.difference.values.workshop.description}</p>
              </div>
              <div className="value-item">
                <GraduationCap />
                <h3>{copy.difference.values.instruction.title}</h3>
                <p>{copy.difference.values.instruction.description}</p>
              </div>
              <div className="value-item">
                <Users />
                <h3>{copy.difference.values.industry.title}</h3>
                <p>{copy.difference.values.industry.description}</p>
              </div>
              <div className="value-item">
                <BookOpen />
                <h3>{copy.difference.values.ethics.title}</h3>
                <p>{copy.difference.values.ethics.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section wrap">
          <div className="section-header-row">
            <SectionHeading
              eyebrow={copy.campus.eyebrow}
              title={copy.campus.title}
            />
            <p className="section-lead">{copy.campus.lead}</p>
          </div>

          <div className="life-gallery" aria-label="Student life gallery">
            <div className="life-showcase" aria-live="polite">
              <div className="life-showcase-media">
                <img
                  key={activeItem.id}
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="life-showcase-image"
                />
                <div className="life-showcase-overlay" aria-hidden="true" />
                <span className="life-showcase-badge">{activeItem.tag}</span>
                <div className="life-showcase-caption">
                  <p className="life-showcase-kicker">{activeItem.highlight}</p>
                  <h3>{activeItem.title}</h3>
                </div>
              </div>
            </div>

            <div
              className="life-grid"
              role="list"
              aria-label="Student life highlights"
            >
              {lifeGalleryItems.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={`life-card ${index === activeIndex ? "is-active" : ""}`}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={index === activeIndex}
                  aria-label={`View ${item.title}`}
                >
                  <div className="life-card-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="life-card-body">
                    <span className="life-card-index">0{index + 1}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div
              className="life-gallery-controls"
              aria-label="Gallery navigation"
            >
              <button
                type="button"
                className="life-gallery-nav"
                onClick={goToPrevious}
                aria-label="Previous gallery item"
              >
                ←
              </button>

              <div
                className="life-pagination"
                role="tablist"
                aria-label="Gallery item selector"
              >
                {lifeGalleryItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`life-dot ${index === activeIndex ? "is-active" : ""}`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show ${item.title}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  />
                ))}
              </div>

              <button
                type="button"
                className="life-gallery-nav"
                onClick={goToNext}
                aria-label="Next gallery item"
              >
                →
              </button>
            </div>
          </div>

          <div className="program-section-actions">
            <a className="button button-light" href={getLocaleAwarePath('/student-life', locale)}>
              {copy.campus.closerLook} <ArrowRight size={15} />
            </a>
          </div>
        </section>

        <section className="announcement-compact-section">
          <div className="wrap">
            <div className="section-header-row">
              <SectionHeading
                eyebrow={copy.updates.eyebrow}
                title={copy.updates.title}
              />
              <p className="section-lead">{copy.updates.lead}</p>
            </div>
            {showNewsDelayNotice || showEventDelayNotice ? (
              <p className="data-fallback-note">{dataFetchNotice}</p>
            ) : null}   
            {featuredAnnouncements.length > 0 ? (
              <div className="announcement-compact-list">
                {featuredAnnouncements.slice(0, 3).map((item) => (
                  <article
                    className="mini-update"
                    key={item.slug ?? item.title}
                  >
                    <div className="mini-update-pill">{copy.updates.notice}</div>
                    <h3>{item.title}</h3>
                    <p>
                      {item.summary ??
                        item.body ??
                        "No announcement summary available yet."}
                    </p>
                    <span>{item.date ?? copy.updates.recently}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="announcement-compact-list">
                {Array.from({ length: 3 }, (_, index) => (
                  <article
                    key={`announcement-placeholder-${index}`}
                    className="mini-update placeholder-card placeholder-card-compact"
                    aria-hidden="true"
                  >
                    <div className="mini-update-pill placeholder-line placeholder-line-pill" />
                    <div className="placeholder-line placeholder-line-title placeholder-title-compact" />
                    <div className="placeholder-line placeholder-line-body" />
                    <div className="placeholder-line placeholder-line-small placeholder-date-line" />
                  </article>
                ))}
              </div>
            )}

            
            <div className="news-events-layout">
              <div className="news-featured-grid">
                {featuredNews.length > 0
                  ? featuredNews.slice(0, 3).map((item) => (
                      <article
                        className="news-featured-card"
                        key={item.slug ?? item.title}
                      >
                        <div className="news-featured-media">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} />
                          ) : null}
                        </div>
                        <div className="news-featured-body">
                          <span>{item.category ?? copy.updates.news}</span>
                          <h3>{item.title}</h3>
                          <p>
                            {item.summary ??
                              item.body ??
                              "No summary available yet."}
                          </p>
                          <a
                            href={
                              item.slug
                                ? getLocaleAwarePath(`/news-events/${item.slug}`, locale)
                                : getLocaleAwarePath('/news-events', locale)
                            }
                            className="news-read-more"
                          >
                            {copy.updates.readMore} <ArrowRight size={14} />
                          </a>
                        </div>
                      </article>
                    ))
                  : Array.from({ length: 3 }, (_, index) => (
                      <article
                        key={`news-placeholder-${index}`}
                        className="news-featured-card placeholder-card placeholder-news-card"
                        aria-hidden="true"
                      >
                        <div className="news-featured-media placeholder-block" />
                        <div className="news-featured-body">
                          <div className="placeholder-line placeholder-line-pill" />
                          <div className="placeholder-line placeholder-line-title placeholder-title-news" />
                          <div className="placeholder-line placeholder-line-medium" />
                          <div className="placeholder-line placeholder-line-medium" />
                        </div>
                      </article>
                    ))}
              </div>

              <aside className="news-events-side">
                <div className="updates-side-header">
                  <Eyebrow>{copy.updates.upcoming}</Eyebrow>
                </div>

                {eventItems.length > 0
                  ? eventItems.map((event) => (
                      <a
                        href="/news-events"
                        key={event.slug ?? event.title}
                        className="event-update-card"
                      >
                        <div className="event-update-date">
                          <strong>{event.day ?? "—"}</strong>
                          <span>{event.month ?? "TBD"}</span>
                        </div>
                        <div className="event-update-copy">
                          <h4>{event.title}</h4>
                          <p>
                            {event.summary ?? event.location ?? "College event"}
                          </p>
                          {event.location ? (
                            <small>{event.location}</small>
                          ) : null}
                        </div>
                      </a>
                    ))
                  : Array.from({ length: 3 }, (_, index) => (
                      <div
                        key={`event-placeholder-${index}`}
                        className="event-update-card placeholder-event-card"
                        aria-hidden="true"
                      >
                        <div className="event-update-date placeholder-block placeholder-date-block" />
                        <div className="event-update-copy">
                          <div className="placeholder-line placeholder-line-title placeholder-title-event" />
                          <div className="placeholder-line placeholder-line-medium" />
                        </div>
                      </div>
                    ))}
              </aside>
            </div>
            <div className="program-section-actions">
              <a className="button button-light" href={getLocaleAwarePath('/news-events', locale)}>
                {copy.updates.explore} <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        <section className="admissions-band">
          <div className="wrap admissions-panel">
            <Eyebrow>{copy.admissions.eyebrow}</Eyebrow>
            <h2>{copy.admissions.title}</h2>
            <p>{copy.admissions.body}</p>
            <div className="admission-contact">
              <span>
                <strong>{copy.admissions.admissionsLabel}</strong>
                <br />
                {copy.admissions.requirements}
              </span>
              <span>
                <strong>{copy.admissions.officeHours}</strong>
                <br />
                {copy.admissions.officeHoursValue}
              </span>
              <span>
                <strong>{copy.admissions.location}</strong>
                <br />
                {copy.admissions.locationValue}
              </span>
            </div>
            <div className="hero-actions">
              <a className="button button-gold" href={getLocaleAwarePath('/admissions', locale)}>
                {copy.admissions.viewRequirements} <ArrowRight size={15} />
              </a>
              <a className="button button-outline-light" href={getLocaleAwarePath('/contact', locale)}>
                {copy.admissions.contactAdmissions}
              </a>
            </div>
          </div>
        </section>

        <section className="home-contact-strip">
          <div className="wrap home-contact-panel">
            <div className="home-contact-visual">
              <div className="home-contact-copy">
                <Eyebrow>{copy.contact.eyebrow}</Eyebrow>
                <h2>{copy.contact.title}</h2>
                <p>{copy.contact.body}</p>
              </div>
              <div className="home-contact-map">
                <iframe
                  title="Saint Anthony's College map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1103.185325850251!2d37.935426474146624!3d8.121811753418188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17b2e10da7ac2987%3A0xe0d8d3b1c9d93124!2sSt.%20Anthony%20TVTE%20College!5e1!3m2!1sen!2sus!4v1791559060012!5m2!1sen!2sus"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="home-contact-details">
              <div className="contact-detail-block">
                <div className="contact-detail-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <strong>{copy.contact.address}</strong>
                  <span>
                    Saint Anthony’s Technical and Vocational College
                    <br />
                    Ethiopia
                  </span>
                </div>
              </div>

              <div className="contact-detail-block">
                <div className="contact-detail-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <strong>{copy.contact.phone}</strong>
                  <a href="tel:+251000000000">+251 000 000 000</a>
                  <a href="tel:+251000000001">+251 000 000 001</a>
                </div>
              </div>

              <div className="contact-detail-block">
                <div className="contact-detail-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <strong>{copy.contact.email}</strong>
                  <a href="mailto:info@saintanthonycollege.edu.et">
                    info@saintanthonycollege.edu.et
                  </a>
                  <a href="mailto:admissions@saintanthonycollege.edu.et">
                    admissions@saintanthonycollege.edu.et
                  </a>
                </div>
              </div>

              <div className="home-contact-actions">
                <a className="button button-dark" href={getLocaleAwarePath('/contact', locale)}>
                  {copy.contact.contactCollege} <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
