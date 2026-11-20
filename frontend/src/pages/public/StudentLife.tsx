import React, { useState } from "react";
import { useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  GraduationCap,
  Heart,
  MapPin,
  ShieldCheck,
  Sun,
  Users,
  Wrench,
} from "lucide-react";
import {
  Layout,
  SectionHeading,
  Eyebrow,
  Testimonials,
} from "../../components/ui";
import { photos, studentTestimonials } from "../../data/content";
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale';
import { messages } from '../../i18n/messages';

type GalleryPhoto = {
  id: number;
  title: string;
  category: string;
  image: string;
  caption: string;
};

const documentaryPhotos: GalleryPhoto[] = [
  {
    id: 1,
    title: "Automotive Engine Diagnostics",
    category: "Workshops",
    image: photos.automotive,
    caption: "Trainees diagnosing engine mechanics and transmission components on vehicle test rigs.",
  },
  {
    id: 2,
    title: "Welding & Metal Fabrication Bay",
    category: "Manufacturing",
    image: photos.workshop,
    caption: "Shielded arc welding booth practice with approved protective gear and industrial safety discipline.",
  },
  {
    id: 3,
    title: "Electrical Testing Workbench",
    category: "Electrical",
    image: photos.electrical,
    caption: "Circuit breaker assembly, motor starter circuits, and power distribution boards.",
  },
  {
    id: 4,
    title: "Computer Hardware & Networking Lab",
    category: "ICT",
    image: photos.computer,
    caption: "Hardware assembly, cable termination, and network server configuration.",
  },
  {
    id: 5,
    title: "Construction Surveying & Masonry",
    category: "Building",
    image: photos.construction,
    caption: "Building layout, mortar mixing, level surveying, and architectural plan interpretation.",
  },
  {
    id: 6,
    title: "Campus Library & Study Spaces",
    category: "Academic",
    image: photos.library,
    caption: "Quiet study carrels, technical reference manuals, and academic guidance.",
  },
];

export default function StudentLife() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.studentLife;
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  return (
    <Layout>
      <main className="student-life-page">
        {/* 1. Image-Rich Hero */}
        <section className="campus-hero-banner">
          <div className="wrap campus-hero-grid">
            <div className="campus-hero-copy">
              <Eyebrow>{copy.eyebrow}</Eyebrow>
              <h1 className="campus-hero-title">{copy.title}</h1>
              <p className="campus-hero-lead">{copy.description}</p>
              <div className="campus-hero-badge">
                <span className="badge-tag">Community Spirit</span>
                <p>Emdibir, Gurage Zone · A welcoming educational home for learners from all backgrounds.</p>
              </div>
            </div>

            <div className="campus-hero-media">
              <div className="hero-composite-frame">
                <img
                  src={photos.students}
                  alt="Students engaged in collaborative technical education"
                  className="campus-main-photo"
                />
                <div className="hero-composite-caption">
                  <span>Student Collaboration</span>
                  <p>Mutual support, mentorship, and practical learning every day.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Campus Introduction */}
        <section className="section wrap campus-intro-section">
          <div className="campus-intro-card">
            <div className="campus-intro-copy">
              <Eyebrow>Our Campus in Emdibir</Eyebrow>
              <h2>A Purposeful Space for Technical Learning and Community</h2>
              <div className="editorial-prose">
                <p>
                  Saint Anthony's College is situated in Emdibir, the administrative center of the Gurage Zone.
                  Our campus is purposefully organized around collaborative technical learning, with dedicated
                  workshop pavilions, open courtyards, quiet study libraries, and community gathering spaces.
                </p>
                <p>
                  Supported by the Ethiopian Catholic Church and CRS, our campus provides an inclusive,
                  dignified, and supportive environment where students of all faiths, cultures, and backgrounds
                  work together, form lasting friendships, and prepare for productive careers.
                </p>
              </div>
            </div>
            <div className="campus-facts-cluster">
              <div className="campus-fact">
                <MapPin size={20} className="fact-icon" aria-hidden="true" />
                <strong>Emdibir Campus</strong>
                <span>Gurage Zone, Central Ethiopia</span>
              </div>
              <div className="campus-fact">
                <Wrench size={20} className="fact-icon" aria-hidden="true" />
                <strong>10 Dedicated Workshops</strong>
                <span>Fully equipped specialized trade bays</span>
              </div>
              <div className="campus-fact">
                <Users size={20} className="fact-icon" aria-hidden="true" />
                <strong>Inclusive Community</strong>
                <span>Welcoming students from across the region</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Practical Learning Experiences */}
        <section className="section wrap practical-experience-section">
          <div className="practical-exp-grid">
            <div className="practical-exp-media">
              <img
                src={photos.workshop}
                alt="Student welding metal joint in the college workshop"
                className="practical-exp-img"
              />
              <div className="practical-exp-badge">
                <span>Workshop Immersion</span>
                <p>70% of curriculum time spent directly at the workbench.</p>
              </div>
            </div>

            <div className="practical-exp-copy">
              <Eyebrow>Applied Mastery</Eyebrow>
              <h2>{copy.workshopCultureTitle}</h2>
              <div className="editorial-prose">
                <p>{copy.workshopCultureCopy}</p>
                <p>
                  Rather than observing demonstrations from a distance, trainees work with tools in hand.
                  Under the direct supervision of certified master tradesmen, students build muscle memory,
                  learn troubleshooting diagnostics, and develop respect for the craftsmanship of their trade.
                </p>
              </div>
              <div className="practical-traits">
                <div className="trait-item">
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>Daily safety inductions &amp; industrial gear compliance.</span>
                </div>
                <div className="trait-item">
                  <Wrench size={18} aria-hidden="true" />
                  <span>Individual workstation practice on authentic equipment.</span>
                </div>
                <div className="trait-item">
                  <GraduationCap size={18} aria-hidden="true" />
                  <span>Occupational competency assessments supervised by department heads.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Student Life & Character Formation */}
        <section className="section student-formation-section">
          <div className="wrap">
            <div className="formation-header">
              <Eyebrow>Holistic Education</Eyebrow>
              <h2>{copy.communityTitle}</h2>
              <p className="section-lead">{copy.communityCopy}</p>
            </div>

            <div className="formation-cards-grid">
              <div className="formation-card">
                <div className="formation-icon"><Heart size={22} /></div>
                <h3>Ethical Leadership</h3>
                <p>Cultivating personal integrity, respect for human dignity, and civic responsibility through structured seminars and peer mentoring.</p>
              </div>
              <div className="formation-card">
                <div className="formation-icon"><Compass size={22} /></div>
                <h3>Student Association</h3>
                <p>Active trainee committees coordinating student welfare, sports tournaments, study groups, and campus events.</p>
              </div>
              <div className="formation-card">
                <div className="formation-icon"><Sun size={22} /></div>
                <h3>Community Volunteerism</h3>
                <p>Annual community service clinics offering solar maintenance, minor appliance repairs, and carpentry assistance to local families.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Campus Facilities Tour */}
        <section className="section wrap facilities-section">
          <SectionHeading
            eyebrow="Campus Infrastructure"
            title={copy.facilitiesTitle}
            lead={copy.facilitiesLead}
          />

          <div className="facilities-grid">
            {copy.facilitiesList.map((fac, idx) => (
              <article key={idx} className="facility-card">
                <div className="facility-index">0{idx + 1}</div>
                <h3>{fac.title}</h3>
                <p>{fac.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 6. Community Activities & Annual Exhibition */}
        <section className="section wrap community-events-spotlight">
          <div className="spotlight-card">
            <div className="spotlight-copy">
              <Eyebrow>Annual Tradition</Eyebrow>
              <h2>Student Practical Projects Exhibition</h2>
              <p className="editorial-prose">
                Every academic year, Saint Anthony's transforms its central courtyard into an open-air
                exhibition of student ingenuity. Trainees showcase operating solar installations, fabricated
                agricultural implements, restored vehicular engines, and computerized network stations to
                community elders, families, and enterprise employers from throughout the Gurage Zone.
              </p>
              <div className="spotlight-stats">
                <div>
                  <strong>10 Departments</strong>
                  <span>Showcasing live technical demos</span>
                </div>
                <div>
                  <strong>Hundreds of Guests</strong>
                  <span>Connecting trainees with employers</span>
                </div>
              </div>
            </div>
            <div className="spotlight-media">
              <img
                src={photos.newsProjects}
                alt="Students presenting projects at the college exhibition"
                className="spotlight-img"
              />
            </div>
          </div>
        </section>

        {/* 7. Student Testimonials */}
        <Testimonials items={studentTestimonials} />

        {/* 8. Photographic Documentary Gallery */}
        <section className="section wrap documentary-gallery-section">
          <SectionHeading
            eyebrow="Visual Documentation"
            title={copy.galleryTitle}
            lead={copy.galleryLead}
          />

          <div className="documentary-photo-grid">
            {documentaryPhotos.map((photo) => (
              <figure
                key={photo.id}
                className="doc-photo-card"
                onClick={() => setSelectedPhoto(photo)}
                tabIndex={0}
                role="button"
                aria-label={`View photo: ${photo.title}`}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedPhoto(photo); }}
              >
                <div className="doc-photo-frame">
                  <img src={photo.image} alt={photo.title} loading="lazy" />
                  <span className="doc-photo-tag">{photo.category}</span>
                </div>
                <figcaption className="doc-photo-caption">
                  <strong>{photo.title}</strong>
                  <p>{photo.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Modal Photo Viewer */}
          {selectedPhoto && (
            <div className="photo-modal-backdrop" onClick={() => setSelectedPhoto(null)}>
              <div className="photo-modal-card" onClick={(e) => e.stopPropagation()}>
                <img src={selectedPhoto.image} alt={selectedPhoto.title} />
                <div className="modal-caption">
                  <span className="modal-tag">{selectedPhoto.category}</span>
                  <h3>{selectedPhoto.title}</h3>
                  <p>{selectedPhoto.caption}</p>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setSelectedPhoto(null)}
                    aria-label="Close photo preview"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Closing Visit CTA */}
        <section className="section wrap campus-visit-cta">
          <div className="visit-card">
            <div>
              <h2>Experience Our Campus Firsthand</h2>
              <p>Prospective trainees and parents are always welcome to visit our Emdibir campus, meet instructors, and tour the workshops.</p>
            </div>
            <div className="visit-actions">
              <a href={getLocaleAwarePath('/contact', locale)} className="button button-navy">
                <span>Plan a Visit</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href={getLocaleAwarePath('/admissions', locale)} className="button button-outline">
                <span>Admissions Info</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
