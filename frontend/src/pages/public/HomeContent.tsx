import React from "react";
import { useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Hammer,
  MapPin,
  ShieldCheck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Layout,
  Eyebrow,
  SectionHeading,
  ProgramCard,
  NewsCard,
} from "../../components/ui";
import { photos, studentTestimonials, impactMetrics } from "../../data/content";
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale';
import { messages } from '../../i18n/messages';
import churchLogo from "../../assets/images/church-logo.png";
import crsLogo from "../../assets/images/crs-logo.png";

export type ProgramItem = {
  id: number;
  code: string;
  title: string;
  category: string;
  duration: string;
  duration_years?: number;
  description: string;
  qualification_level?: string;
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
  author?: string;
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
  date_formatted?: string;
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
};

export default function HomeContent({
  previewPrograms,
  featuredNews,
  eventItems,
  featuredAnnouncements,
}: HomeContentProps) {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].home;

  const leadArticle = featuredNews[0] ?? null;
  const secondaryNews = featuredNews.slice(1, 4);
  const featuredTestimonial = studentTestimonials[0];
  const supportingTestimonials = studentTestimonials.slice(1, 3);

  return (
    <Layout>
      <main className="home-main">
        {/* =========================================================
            5.1 Institutional Hero Section
            Two-column editorial hero: Main campus photo + strong typography
            ========================================================= */}
        <section className="institutional-hero">
          <div className="wrap institutional-hero-grid">
            <div className="hero-text-column">
              <div className="hero-eyebrow-wrap">
                <Eyebrow>{copy.eyebrow}</Eyebrow>
              </div>
              <h1 className="hero-headline">{copy.heroTitle}</h1>
              <p className="hero-lead">{copy.heroText}</p>

              <div className="hero-cta-group">
                <a
                  className="button button-navy"
                  href={getLocaleAwarePath('/programs', locale)}
                >
                  <span>{copy.ctaPrograms}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a
                  className="button button-outline"
                  href={getLocaleAwarePath('/how-to-apply', locale)}
                >
                  <span>{copy.ctaApply}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>

              {/* Institutional Proof Points */}
              <div className="hero-proof-bar" role="list" aria-label="Institutional highlights">
                <div className="proof-item" role="listitem">
                  <Award size={18} className="proof-icon" aria-hidden="true" />
                  <span>{copy.heroBadge1}</span>
                </div>
                <div className="proof-divider" aria-hidden="true">|</div>
                <div className="proof-item" role="listitem">
                  <Wrench size={18} className="proof-icon" aria-hidden="true" />
                  <span>{copy.heroBadge2}</span>
                </div>
                <div className="proof-divider" aria-hidden="true">|</div>
                <div className="proof-item" role="listitem">
                  <ShieldCheck size={18} className="proof-icon" aria-hidden="true" />
                  <span>{copy.heroBadge3}</span>
                </div>
              </div>
            </div>

            <div className="hero-image-column">
              <div className="hero-image-frame">
                <img
                  src={photos.hero}
                  alt="Student engaged in hands-on automotive repair training in the college workshop"
                  className="hero-primary-photo"
                />
                <div className="hero-photo-caption">
                  <span className="caption-tag">Main Campus</span>
                  <p className="caption-text">Emdibir, Gurage Zone.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.2 Who We Are Section
            Balanced editorial image-and-text composition
            ========================================================= */}
        <section className="section who-we-are-section">
          <div className="wrap who-we-are-grid">
            <div className="who-image-wrap">
              <img
                src={photos.students}
                alt="Students collaborating during practical technical instruction"
                className="who-image"
                loading="lazy"
              />
              <div className="who-image-overlay-card">
                <span className="overlay-eyebrow">Institutional Purpose</span>
                <strong>Forming Competent Technicians. Cultivating Responsible Citizens.</strong>
              </div>
            </div>

            <div className="who-content-wrap">
              <Eyebrow>{copy.about.eyebrow}</Eyebrow>
              <h2 className="section-title">{copy.about.title}</h2>
              <div className="editorial-prose">
                <p>{copy.about.paragraph1}</p>
                <p>{copy.about.paragraph2}</p>
              </div>
              <div className="who-actions">
                <a
                  className="inline-editorial-link"
                  href={getLocaleAwarePath('/about', locale)}
                >
                  <span>{copy.about.learnMore}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.3 Our Impact and Work Section
            Verified metrics + qualitative impact + documentary photo
            ========================================================= */}
        <section className="section impact-section">
          <div className="wrap">
            <div className="impact-intro-header">
              <Eyebrow>{copy.impact.eyebrow}</Eyebrow>
              <h2 className="section-title">{copy.impact.title}</h2>
              <p className="section-lead">{copy.impact.lead}</p>
            </div>

            <div className="impact-grid">
              <div className="impact-stats-cluster">
                {impactMetrics.map((m, idx) => (
                  <div key={idx} className="impact-stat-card">
                    <span className="impact-stat-number">{m.value}</span>
                    <strong className="impact-stat-label">{m.label}</strong>
                    <p className="impact-stat-detail">{m.detail}</p>
                  </div>
                ))}
              </div>

              <div className="impact-quote-card">
                <div className="quote-mark" aria-hidden="true">“</div>
                <blockquote className="impact-quote-text">{copy.impact.quote}</blockquote>
                <cite className="impact-quote-author">{copy.impact.quoteAuthor}</cite>
                <div className="impact-caption-note">
                  <MapPin size={14} aria-hidden="true" />
                  <span>Serving youth across the Gurage Zone and Central Ethiopia</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.4 Educational Programs Section
            Editorial grid of certified TVET programs
            ========================================================= */}
        <section className="section programs-section">
          <div className="wrap">
            <SectionHeading
              eyebrow={copy.programs.eyebrow}
              title={copy.programs.title}
              lead={copy.programs.lead}
              link={copy.programs.viewAll}
              href={getLocaleAwarePath('/programs', locale)}
            />

            <div className="programs-editorial-grid">
              {previewPrograms.map((program, index) => (
                <ProgramCard key={program.id || program.title} p={program} index={index} />
              ))}
            </div>

            <div className="programs-bottom-bar">
              <p>Looking for a specific department or entry requirement?</p>
              <a
                className="button button-outline"
                href={getLocaleAwarePath('/programs', locale)}
              >
                <span>{copy.programs.viewAll}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.5 Practical Learning ("Learning by Doing")
            Image-rich workshop immersion
            ========================================================= */}
        <section className="section practical-learning-section">
          <div className="wrap">
            <div className="practical-learning-grid">
              <div className="practical-copy-block">
                <Eyebrow>{copy.practical.eyebrow}</Eyebrow>
                <h2 className="section-title">{copy.practical.title}</h2>
                <p className="section-lead">{copy.practical.lead}</p>

                <div className="practical-points-stack">
                  <div className="practical-point-item">
                    <div className="point-icon-box"><Wrench size={18} /></div>
                    <div>
                      <h3>{copy.practical.point1Title}</h3>
                      <p>{copy.practical.point1Text}</p>
                    </div>
                  </div>
                  <div className="practical-point-item">
                    <div className="point-icon-box"><ShieldCheck size={18} /></div>
                    <div>
                      <h3>{copy.practical.point2Title}</h3>
                      <p>{copy.practical.point2Text}</p>
                    </div>
                  </div>
                  <div className="practical-point-item">
                    <div className="point-icon-box"><Zap size={18} /></div>
                    <div>
                      <h3>{copy.practical.point3Title}</h3>
                      <p>{copy.practical.point3Text}</p>
                    </div>
                  </div>
                </div>

                <a
                  className="inline-editorial-link practical-link"
                  href={getLocaleAwarePath('/student-life', locale)}
                >
                  <span>{copy.practical.cta}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>

              <div className="practical-visual-collage">
                <div className="collage-main-frame">
                  <img
                    src={photos.workshop}
                    alt="Welding and metal fabrication student practicing in the booth"
                    loading="lazy"
                  />
                  <div className="collage-badge">
                    <span>Manufacturing &amp; Fabrication Bay</span>
                  </div>
                </div>
                <div className="collage-secondary-row">
                  <div className="collage-thumb">
                    <img
                      src={photos.electrical}
                      alt="Electrical installation wiring boards"
                      loading="lazy"
                    />
                    <span>Electrical Lab</span>
                  </div>
                  <div className="collage-thumb">
                    <img
                      src={photos.computer}
                      alt="Computer networking and hardware station"
                      loading="lazy"
                    />
                    <span>ICT Systems Lab</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.6 Community and Student Life
            Human-centered presentation of college environment
            ========================================================= */}
        <section className="section community-life-section">
          <div className="wrap">
            <div className="community-life-header">
              <Eyebrow>{copy.community.eyebrow}</Eyebrow>
              <h2 className="section-title">{copy.community.title}</h2>
              <p className="section-lead">{copy.community.lead}</p>
            </div>

            <div className="community-cards-grid">
              <div className="community-card">
                <div className="community-card-icon"><GraduationCap size={22} /></div>
                <h3>{copy.community.item1Title}</h3>
                <p>{copy.community.item1Desc}</p>
              </div>

              <div className="community-card">
                <div className="community-card-icon"><Users size={22} /></div>
                <h3>{copy.community.item2Title}</h3>
                <p>{copy.community.item2Desc}</p>
              </div>

              <div className="community-card">
                <div className="community-card-icon"><Hammer size={22} /></div>
                <h3>{copy.community.item3Title}</h3>
                <p>{copy.community.item3Desc}</p>
              </div>
            </div>

            <div className="community-gallery-strip">
              <div className="community-photo-item">
                <img src={photos.library} alt="Campus library study room" loading="lazy" />
                <span className="community-photo-label">Technical Library &amp; Study Room</span>
              </div>
              <div className="community-photo-item">
                <img src={photos.classroom} alt="Interactive classroom discussion" loading="lazy" />
                <span className="community-photo-label">Classroom Technical Instruction</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.7 Stories from Our Students
            Featured testimonial + supporting quotes
            ========================================================= */}
        <section className="section student-stories-section">
          <div className="wrap">
            <div className="stories-header">
              <Eyebrow>{copy.stories.eyebrow}</Eyebrow>
              <h2 className="section-title">{copy.stories.title}</h2>
              <p className="section-lead">{copy.stories.lead}</p>
            </div>

            <div className="stories-editorial-layout">
              {featuredTestimonial && (
                <div className="story-featured-card">
                  <div className="story-featured-quote-mark" aria-hidden="true">“</div>
                  <p className="story-featured-quote">{featuredTestimonial.quote}</p>
                  <div className="story-featured-author">
                    <img
                      src={featuredTestimonial.avatar}
                      alt={featuredTestimonial.name}
                      loading="lazy"
                    />
                    <div>
                      <strong className="author-name">{featuredTestimonial.name}</strong>
                      <span className="author-program">{featuredTestimonial.program}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="supporting-stories-column">
                {supportingTestimonials.map((t) => (
                  <div key={t.name} className="supporting-story-card">
                    <p className="supporting-quote">“{t.quote}”</p>
                    <div className="supporting-author">
                      <img src={t.avatar} alt={t.name} loading="lazy" />
                      <div>
                        <strong>{t.name}</strong>
                        <span>{t.program}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.8 Our Partners Section
            Institutional presentation: Catholic Church and CRS
            ========================================================= */}
        <section className="section partners-showcase-section">
          <div className="wrap">
            <div className="partners-showcase-header">
              <Eyebrow>{copy.partners.eyebrow}</Eyebrow>
              <h2 className="section-title">{copy.partners.title}</h2>
              <p className="section-lead">{copy.partners.lead}</p>
            </div>

            <div className="partners-dual-grid">
              <div className="partner-profile-card">
                <div className="partner-profile-logo-wrap">
                  <img src={churchLogo} alt="Ethiopian Catholic Church" className="partner-logo-img" />
                </div>
                <div className="partner-profile-body">
                  <span className="partner-profile-badge">Founding &amp; Pastoral Partner</span>
                  <h3>{copy.partners.church}</h3>
                  <p>{copy.partners.churchDesc}</p>
                </div>
              </div>

              <div className="partner-profile-card">
                <div className="partner-profile-logo-wrap">
                  <img src={crsLogo} alt="Catholic Relief Services (CRS)" className="partner-logo-img" />
                </div>
                <div className="partner-profile-body">
                  <span className="partner-profile-badge">Development &amp; Capacity Partner</span>
                  <h3>{copy.partners.crs}</h3>
                  <p>{copy.partners.crsDesc}</p>
                </div>
              </div>
            </div>

            <div className="partners-statement-box">
              <p>{copy.partners.note}</p>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.9 News, Activities, and Events Section
            1 featured story + supporting news + upcoming calendar
            ========================================================= */}
        <section className="section news-events-editorial-section">
          <div className="wrap">
            <SectionHeading
              eyebrow={copy.news.eyebrow}
              title={copy.news.title}
              lead={copy.news.lead}
              link={copy.news.viewAll}
              href={getLocaleAwarePath('/news-events', locale)}
            />

            <div className="news-events-split-grid">
              {/* Left Column: Featured News + Secondary News */}
              <div className="news-column-main">
                {leadArticle && (
                  <article className="featured-news-card">
                    <a
                      href={getLocaleAwarePath(`/news-events/${leadArticle.slug || leadArticle.id}`, locale)}
                      className="featured-news-image-wrap"
                    >
                      <img
                        src={leadArticle.image_url || photos.automotive}
                        alt={leadArticle.title}
                        loading="lazy"
                      />
                      <span className="featured-badge">{copy.news.featuredTag}</span>
                    </a>
                    <div className="featured-news-body">
                      <div className="news-meta-strip">
                        <span className="news-cat">{leadArticle.category || 'Academic Life'}</span>
                        <span className="news-date"><Calendar size={13} aria-hidden="true" /> {leadArticle.date || 'Sep 15, 2026'}</span>
                      </div>
                      <h3>
                        <a href={getLocaleAwarePath(`/news-events/${leadArticle.slug || leadArticle.id}`, locale)}>
                          {leadArticle.title}
                        </a>
                      </h3>
                      <p>{leadArticle.summary}</p>
                      <a
                        href={getLocaleAwarePath(`/news-events/${leadArticle.slug || leadArticle.id}`, locale)}
                        className="read-story-link"
                      >
                        <span>{copy.news.viewAll}</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                )}

                <div className="secondary-news-row">
                  {secondaryNews.map((article) => (
                    <NewsCard key={article.id || article.title} item={article} />
                  ))}
                </div>
              </div>

              {/* Right Column: Upcoming Events & Announcements */}
              <aside className="events-announcements-sidebar">
                <div className="sidebar-card events-sidebar-card">
                  <div className="sidebar-header">
                    <Calendar size={18} className="sidebar-icon" aria-hidden="true" />
                    <h3>{copy.news.upcomingEvents}</h3>
                  </div>
                  <div className="events-mini-list">
                    {eventItems.map((event) => (
                      <div key={event.id || event.title} className="event-mini-item">
                        <div className="event-mini-date">
                          <span className="event-mini-day">
                            {event.starts_at ? new Date(event.starts_at).getDate() : '10'}
                          </span>
                          <span className="event-mini-month">
                            {event.starts_at ? new Date(event.starts_at).toLocaleString('en-US', { month: 'short' }) : 'Nov'}
                          </span>
                        </div>
                        <div className="event-mini-content">
                          <h4>{event.title}</h4>
                          <span className="event-mini-loc"><MapPin size={12} aria-hidden="true" /> {event.location || 'College Campus'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <a
                    href={getLocaleAwarePath('/news-events', locale)}
                    className="sidebar-bottom-link"
                  >
                    <span>View Academic Calendar</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </div>

                <div className="sidebar-card announcements-sidebar-card">
                  <div className="sidebar-header">
                    <BookOpen size={18} className="sidebar-icon" aria-hidden="true" />
                    <h3>{copy.news.announcementsTag}</h3>
                  </div>
                  <div className="announcements-mini-list">
                    {featuredAnnouncements.map((item) => (
                      <a
                        key={item.id || item.title}
                        href={getLocaleAwarePath('/announcements', locale)}
                        className="announcement-mini-item"
                      >
                        <span className="announcement-mini-audience">{item.audience || 'All Students'}</span>
                        <h4>{item.title}</h4>
                        <span className="announcement-mini-date">{item.date || 'Recently'}</span>
                      </a>
                    ))}
                  </div>
                  <a
                    href={getLocaleAwarePath('/announcements', locale)}
                    className="sidebar-bottom-link"
                  >
                    <span>Visit Noticeboard</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.10 Admissions Section
            Compact, informative guidance without aggressive funneling
            ========================================================= */}
        <section className="section admissions-teaser-section">
          <div className="wrap admissions-teaser-card">
            <div className="admissions-teaser-content">
              <Eyebrow>{copy.admissions.eyebrow}</Eyebrow>
              <h2>{copy.admissions.title}</h2>
              <p className="admissions-teaser-lead">{copy.admissions.lead}</p>

              <div className="admissions-points-row">
                <div className="admissions-point">
                  <CheckCircle2 size={18} className="point-check" aria-hidden="true" />
                  <div>
                    <strong>{copy.admissions.box1Title}</strong>
                    <p>{copy.admissions.box1Desc}</p>
                  </div>
                </div>
                <div className="admissions-point">
                  <CheckCircle2 size={18} className="point-check" aria-hidden="true" />
                  <div>
                    <strong>{copy.admissions.box2Title}</strong>
                    <p>{copy.admissions.box2Desc}</p>
                  </div>
                </div>
              </div>

              <div className="admissions-cta-group">
                <a
                  className="button button-navy"
                  href={getLocaleAwarePath('/how-to-apply', locale)}
                >
                  <span>{copy.admissions.cta}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a
                  className="button button-outline"
                  href={getLocaleAwarePath('/admissions', locale)}
                >
                  <span>{copy.admissions.secondary}</span>
                </a>
              </div>
            </div>

            <div className="admissions-aside-schedule">
              <h3>Admissions Office Emdibir</h3>
              <p className="aside-sub">Main Administration Building, Ground Floor</p>
              <div className="aside-schedule-row">
                <span>Working Days:</span>
                <strong>Monday – Friday</strong>
              </div>
              <div className="aside-schedule-row">
                <span>Office Hours:</span>
                <strong>8:00 AM – 5:00 PM</strong>
              </div>
              <div className="aside-schedule-row">
                <span>Direct Inquiries:</span>
                <strong>+251 911 000 000</strong>
              </div>
              <div className="aside-desk-note">
                <span>Walk-in consultations welcome for applicants &amp; parents.</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5.11 Final Institutional Message
            Meaningful closing message & direct navigation
            ========================================================= */}
        <section className="section final-institutional-section">
          <div className="wrap final-institutional-panel">
            <div className="final-message-copy">
              <Eyebrow>{copy.closing.eyebrow}</Eyebrow>
              <h2>{copy.closing.title}</h2>
              <p>{copy.closing.lead}</p>
            </div>
            <div className="final-message-actions">
              <a
                className="button button-navy"
                href={getLocaleAwarePath('/programs', locale)}
              >
                <span>{copy.closing.ctaPrograms}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a
                className="button button-outline"
                href={getLocaleAwarePath('/contact', locale)}
              >
                <span>{copy.closing.ctaContact}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
