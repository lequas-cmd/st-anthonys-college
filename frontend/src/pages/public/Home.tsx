import React from 'react'
import { apiRequest } from '../../services/api'
import HomeContent, { type ProgramItem, type NewsItem, type EventItem, type AnnouncementItem } from './HomeContent'
import { programs as fallbackPrograms, news as fallbackNews, events as fallbackEvents, announcements as fallbackAnnouncements } from '../../data/content'

export default function Home() {
  const [featuredPrograms, setFeaturedPrograms] = React.useState<ProgramItem[]>(fallbackPrograms)
  const [featuredNews, setFeaturedNews] = React.useState<NewsItem[]>(fallbackNews)
  const [featuredEvents, setFeaturedEvents] = React.useState<EventItem[]>(fallbackEvents)
  const [featuredAnnouncements, setFeaturedAnnouncements] = React.useState<AnnouncementItem[]>(fallbackAnnouncements)

  React.useEffect(() => {
    let active = true

    apiRequest<{ programs?: ProgramItem[] }>('/programs')
      .then((response) => {
        if (!active) return
        if (response.programs && response.programs.length > 0) {
          setFeaturedPrograms(response.programs)
        }
      })
      .catch(() => {
        // Fallback already pre-populated from verified institutional data
      })

    apiRequest<{ news?: NewsItem[] }>('/news')
      .then((response) => {
        if (!active) return
        if (response.news && response.news.length > 0) {
          setFeaturedNews(response.news)
        }
      })
      .catch(() => {
        // Fallback pre-populated
      })

    apiRequest<{ events?: EventItem[] }>('/events')
      .then((response) => {
        if (!active) return
        if (response.events && response.events.length > 0) {
          setFeaturedEvents(response.events)
        }
      })
      .catch(() => {
        // Fallback pre-populated
      })

    apiRequest<{ announcements?: AnnouncementItem[] }>('/announcements')
      .then((response) => {
        if (!active) return
        if (response.announcements && response.announcements.length > 0) {
          setFeaturedAnnouncements(response.announcements)
        }
      })
      .catch(() => {
        // Fallback pre-populated
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <HomeContent
      previewPrograms={featuredPrograms.slice(0, 6)}
      featuredNews={featuredNews}
      eventItems={featuredEvents.slice(0, 4)}
      featuredAnnouncements={featuredAnnouncements.slice(0, 3)}
    />
  )
}
