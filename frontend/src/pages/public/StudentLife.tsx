import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import {
  Layout,
  PageIntro,
  SectionHeading,
  Eyebrow,
  Testimonials,
} from "../../components/ui";
import { photos } from "../../data/content";
import { getLocaleFromPathname } from '../../i18n/locale';
import { messages } from '../../i18n/messages';

type GalleryItem = {
  id: number;
  title: string;
  tag: string;
  image: string;
  description: string;
  highlight: string;
  stats: string;
};

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Practical learning",
    tag: "Workshop culture",
    image: photos.workshop,
    description:
      "Students build confidence through hands-on labs, guided exercises, and real-world technical practice in a supportive setting.",
    highlight: "Experiential learning",
    stats: "4 active workshops",
  },
  {
    id: 2,
    title: "Learning resources",
    tag: "Study support",
    image: photos.library,
    description:
      "Quiet study spaces, digital resources, and mentoring help students stay focused and explore ideas with confidence.",
    highlight: "Independent learning",
    stats: "24/7 access points",
  },
  {
    id: 3,
    title: "Student community",
    tag: "Campus life",
    image: photos.students,
    description:
      "Clubs, mentoring, and shared traditions bring students together around friendship, leadership, and belonging.",
    highlight: "Belonging & leadership",
    stats: "9 student groups",
  },
  {
    id: 4,
    title: "Digital skills",
    tag: "Future-ready",
    image: photos.computer,
    description:
      "From networking basics to technical troubleshooting, students gain the digital fluency needed for modern careers.",
    highlight: "Career preparedness",
    stats: "Modern lab access",
  },
  {
    id: 5,
    title: "Construction training",
    tag: "Skills in action",
    image: photos.construction,
    description:
      "Practical site-style projects and supervised activity sessions help students connect theory to technical performance.",
    highlight: "Applied projects",
    stats: "Hands-on practice",
  },
  {
    id: 6,
    title: "Classroom engagement",
    tag: "Teaching excellence",
    image: photos.classroom,
    description:
      "Active teaching methods, peer collaboration, and mentor guidance make each lesson participatory and purposeful.",
    highlight: "Student-centered teaching",
    stats: "Small group classes",
  },
];

const facilities = [
  ["Technical workshops", photos.workshop],
  ["Electrical and solar training", photos.electrical],
  ["Computer learning spaces", photos.computer],
  ["Library and study areas", photos.library],
  ["Classrooms", photos.classroom],
  ["Renewable energy", photos.solar],
];

const testimonials = [
  {
    name: "Selam Bekele",
    program: "Electrical Installation",
    quote:
      "The training here does not stop at theory. We learn by wiring, testing, and solving problems on real systems, which makes us more confident when we enter the job market.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Amanuel Tadesse",
    program: "Automotive Technology",
    quote:
      "What I value most is the practical guidance. The workshop sessions help us troubleshoot issues step by step and build the discipline needed in technical work.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
];

export default function StudentLife() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.studentLife;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = galleryItems[activeIndex];

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % galleryItems.length);
    }, 6000);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex]);

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? galleryItems.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % galleryItems.length);
  };

  return (
    <Layout>
      <main>
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <section className="split-feature wrap">
          <img
            src={photos.campus}
            alt="A wide-angle photograph showing the college grounds"
          />
          <div>
            <Eyebrow>Our campus</Eyebrow>
            <h2>
              A shared space for learning and community.
            </h2>
            <p>
              The campus is more than a place for classes and practical training. It is a shared space where students, teachers, and staff meet, learn from one another, and take part in everyday college life. It brings together people from different backgrounds and gives them a place to build relationships, share experiences, and grow as a community.
            </p>
          </div>
        </section>

        <section className="section muted-section">
          <div className="wrap">
            <SectionHeading
              eyebrow="Life around campus"
              title="Life beyond classroom."
            />
            <div>
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
                    <span className="life-showcase-badge">
                      {activeItem.tag}
                    </span>
                    <div className="life-showcase-caption">
                      <p className="life-showcase-kicker">
                        {activeItem.highlight}
                      </p>
                      <h3>{activeItem.title}</h3>
                    </div>
                  </div>
                </div>

                <div
                  className="life-grid"
                  role="list"
                  aria-label="Student life highlights"
                >
                  {galleryItems.map((item, index) => (
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
                    {galleryItems.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`life-dot ${index === activeIndex ? "is-active" : ""}`}
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Show ${item.title}`}
                        aria-current={
                          index === activeIndex ? "true" : undefined
                        }
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
            </div>
          </div>
        </section>

        <PageIntro
          eyebrow="Campus & facilities"
          title="Spaces designed for practical learning."
          description="Each space has a role in the daily life of the college, supporting teaching, hands-on learning, and the activities that bring the college community together."
        />

        <section className="section wrap">
          <div className="facility-grid facility-grid-large">
            {facilities.map(([name, image], index) => (
              <a className="facility-card" href="/contact" key={name}>
                <img src={image} alt={name} />
                <div>
                  <small>FACILITY / 0{index + 1}</small>
                  <h3>{name}</h3>
                  <p>
                    Learn more about campus facilities and practical learning
                    spaces.
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <Testimonials items={testimonials} />
      </main>
    </Layout>
  );
}
