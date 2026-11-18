import React from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from 'react-router-dom';
import { Layout, Eyebrow, PageIntro, SectionHeading } from "../../components/ui";
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale';
import { messages } from '../../i18n/messages';

export default function Admissions() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.admissions;

  const steps = [
    [copy.steps.explore.title, copy.steps.explore.body],
    [copy.steps.requirements.title, copy.steps.requirements.body],
    [copy.steps.documents.title, copy.steps.documents.body],
    [copy.steps.submit.title, copy.steps.submit.body],
    [copy.steps.confirmation.title, copy.steps.confirmation.body],
  ];

  return (
    <Layout>
      <main>
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />
        <section className="section wrap admissions-layout">
          <div className="steps-column">
            <Eyebrow>{copy.stepsEyebrow}</Eyebrow>
            <h2>{copy.stepsTitle}</h2>
            {steps.map(([title, copy], index) => (
              <div className="step-row" key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </div>
            ))}
          </div>
          <aside className="admission-aside">
            <div className="aside-content">
              <h3>{copy.checklistTitle}</h3>
              <p>
                {copy.checklistIntro}
              </p>
              <ul>
                {copy.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className="button button-dark full-button" href={getLocaleAwarePath('/contact', locale)}>
                {copy.contactAdmissions} <ArrowRight size={15} />
              </a>
            </div>
          </aside>
        </section>

        <section className="section wrap admission-intake-section">
          <SectionHeading
            eyebrow={copy.intakeEyebrow}
            title={copy.intakeTitle}
          />
          <div className="intake-cards">
            <article className="intake-card">
              <span className="intake-card-number">{copy.intakeCards.announcement.label}</span>
              <h3>{copy.intakeCards.announcement.title}</h3>
              <p>{copy.intakeCards.announcement.body}</p>
            </article>
            <article className="intake-card">
              <span className="intake-card-number">{copy.intakeCards.registration.label}</span>
              <h3>{copy.intakeCards.registration.title}</h3>
              <p>{copy.intakeCards.registration.body}</p>
            </article>
            <article className="intake-card">
              <span className="intake-card-number">{copy.intakeCards.review.label}</span>
              <h3>{copy.intakeCards.review.title}</h3>
              <p>{copy.intakeCards.review.body}</p>
            </article>
            <article className="intake-card intake-card-last">
              <span className="intake-card-number">{copy.intakeCards.orientation.label}</span>
              <h3>{copy.intakeCards.orientation.title}</h3>
              <p>{copy.intakeCards.orientation.body}</p>
            </article>
          </div>
        </section>
      </main>
    </Layout>
  );
}
