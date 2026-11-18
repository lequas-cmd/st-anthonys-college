import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, Eyebrow, PageIntro, SectionHeading } from '../../components/ui'
import { photos, leadershipMembers } from '../../data/content'
import { getLocaleAwarePath, getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

const galleryItems = [
  {
    id: 'workshop',
    label: 'Workshop',
    title: 'Hands-on learning in action',
    description: 'Students build confidence through guided practice, real tools, and direct problem-solving in active learning spaces.',
    image: photos.workshop,
  },
  {
    id: 'students',
    label: 'Student life',
    title: 'A community of learning',
    description: 'Collaboration, support, and shared purpose help students grow both academically and personally.',
    image: photos.students,
  },
  {
    id: 'computer',
    label: 'Technology',
    title: 'Skills for the modern workplace',
    description: 'Practical instruction in digital and technical skills helps learners adapt to evolving industry expectations.',
    image: photos.computer,
  },
  {
    id: 'solar',
    label: 'Innovation',
    title: 'Sustainability and future-ready training',
    description: 'New learning pathways connect technical education with emerging fields such as solar and renewable energy.',
    image: photos.solar,
  },
  {
    id: 'construction',
    label: 'Campus',
    title: 'Spaces designed for practice',
    description: 'Learning environments are shaped to support demonstrations, cooperative work, and practical training.',
    image: photos.construction,
  },
]

const localeGalleryLabels = {
  en: {
    workshop: 'Workshop',
    studentLife: 'Student life',
    technology: 'Technology',
    innovation: 'Innovation',
    campus: 'Campus',
  },
  am: {
    workshop: 'ሥራ ቤት',
    studentLife: 'የተማሪ ሕይወት',
    technology: 'ቴክኖሎጂ',
    innovation: 'ፈጠራ',
    campus: 'ካምፓስ',
  },
} as const;

export default function About() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.about;
  const galleryLabels = localeGalleryLabels[locale];
  const localizedGalleryItems = galleryItems.map((item) => ({
    ...item,
    label: galleryLabels[item.id === 'workshop' ? 'workshop' : item.id === 'students' ? 'studentLife' : item.id === 'computer' ? 'technology' : item.id === 'solar' ? 'innovation' : 'campus'],
  }));
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartX = useRef<number | null>(null)

  const activeItem = localizedGalleryItems[activeIndex]

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % localizedGalleryItems.length)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [activeIndex])

  const goToIndex = (index: number) => {
    setActiveIndex((index + localizedGalleryItems.length) % localizedGalleryItems.length)
    setDragOffset(0)
  }

  const goNext = () => goToIndex(activeIndex + 1)
  const goPrev = () => goToIndex(activeIndex - 1)

  const getCardStyle = (index: number) => {
    const relativeIndex = index - activeIndex
    const absIndex = Math.abs(relativeIndex)
    const translateX = relativeIndex * 190 + dragOffset * 0.18
    const translateY = absIndex === 0 ? 0 : absIndex === 1 ? 18 : 32
    const scale = absIndex === 0 ? 1 : absIndex === 1 ? 0.82 : 0.68
    const rotateY = absIndex === 0 ? 0 : relativeIndex * -28
    const opacity = absIndex > 2 ? 0 : absIndex === 0 ? 1 : absIndex === 1 ? 0.84 : 0.38
    const zIndex = 10 - absIndex

    return {
      opacity,
      zIndex,
      transform: `translateX(-50%) translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateY(${rotateY}deg)`,
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return
    setDragOffset(event.clientX - dragStartX.current)
  }

  const handlePointerEnd = () => {
    if (dragOffset > 80) {
      goPrev()
    } else if (dragOffset < -80) {
      goNext()
    } else {
      setDragOffset(0)
    }

    dragStartX.current = null
  }

  return (
    <Layout>
      <main>
        <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <section className="split-feature wrap">
          <img src={photos.students} alt="Students collaborating in an educational setting" />
          <div>
            <Eyebrow>{copy.storyEyebrow}</Eyebrow>
            <h2>{copy.storyTitle}</h2>
               <p>{copy.storyBody} <br /> <br />
                {copy.storySupport}
            </p>
          </div>
        </section>

        <section className="section wrap gallery-section">
          <SectionHeading eyebrow={copy.historyEyebrow} title={copy.historyTitle} />

          <div className="photo-gallery-carousel">
            <div className="photo-gallery-head">
              <span className="photo-gallery-pill">{activeItem.label}</span>
              <div className="photo-gallery-nav">
                <button type="button" className="photo-gallery-arrow" onClick={goPrev} aria-label="Previous image">
                  <span>‹</span>
                </button>
                <button type="button" className="photo-gallery-arrow" onClick={goNext} aria-label="Next image">
                  <span>›</span>
                </button>
              </div>
            </div>

            <div
              className="photo-gallery-stage"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
            >
              {localizedGalleryItems.map((item, index) => (
                <article
                  key={item.id}
                  className={`photo-gallery-card ${index === activeIndex ? 'is-active' : ''}`}
                  aria-hidden={index !== activeIndex}
                  style={getCardStyle(index)}
                >
                  <img src={item.image} alt={item.title} />
                 
                </article>
              ))}
            </div>

            <div className="photo-gallery-footer">
              <div className="photo-gallery-text">
                <span>{activeItem.label}</span>
                <h3>{activeItem.title}</h3>
              </div>
              <p>{activeItem.description}</p>
            </div>

            <div className="photo-gallery-dots" aria-label="Gallery navigation">
              {localizedGalleryItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`photo-gallery-dot ${activeIndex === index ? 'is-active' : ''}`}
                  onClick={() => goToIndex(index)}
                  aria-label={`View ${item.title}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section muted-section">
          <div className="wrap">
            <SectionHeading eyebrow={copy.valuesEyebrow} title={copy.valuesTitle} />
            <div className="three-columns">
              <article><span className="number">01</span><h3>{copy.values.mission.title}</h3><p>{copy.values.mission.body}</p></article>
              <article><span className="number">02</span><h3>{copy.values.vision.title}</h3><p>{copy.values.vision.body}</p></article>
              <article><span className="number">03</span><h3>{copy.values.values.title}</h3><p>{copy.values.values.body}</p></article>
            </div>
          </div>
        </section>

        <section className="leadership-section">
          <div className="wrap">
            <SectionHeading eyebrow={copy.leadershipEyebrow} title={copy.leadershipTitle} />
            <div className="leadership-grid">
              {leadershipMembers.map((member, index) => (
                <article key={member.name} className={`leadership-card ${index === 0 ? 'featured' : ''} ${index % 2 === 1 ? 'alternate' : ''}`}>
                  <div className="leadership-image-wrap"><img src={member.image} alt={member.name} /></div>
                  <div className="leadership-body">
                    <span className="leadership-role">{member.role}</span>
                    <h3>{member.name}</h3>
                    <p className="leadership-message">“{member.message}”</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="split-feature wrap reverse">
          <div>
            <Eyebrow>{copy.partnershipEyebrow}</Eyebrow>
            <h2>{copy.partnershipTitle}</h2>
            <p>{copy.partnershipBody}</p>
            <a className="inline-link" href={getLocaleAwarePath('/contact', locale)}>{copy.gallery.campus === 'ካምፓስ' ? 'ኮሌጁን ያግኙ' : 'Contact the college'} <ArrowRight size={15}/></a>
          </div>
          <img src={photos.classroom} alt="Classroom learning environment" />
        </section>
      </main>
    </Layout>
  )
}
