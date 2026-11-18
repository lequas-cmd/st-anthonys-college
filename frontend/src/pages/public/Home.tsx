import React from 'react'
import { apiRequest } from '../../services/api'
import HomeContent, { type ProgramItem, type NewsItem, type EventItem, type AnnouncementItem } from './HomeContent'

export default function Home() {

  const [featuredPrograms, setFeaturedPrograms] = React.useState<ProgramItem[]>([])
  const [featuredNews, setFeaturedNews] = React.useState<NewsItem[]>([])
  const [featuredEvents, setFeaturedEvents] = React.useState<EventItem[]>([])
  const [featuredAnnouncements, setFeaturedAnnouncements] = React.useState<AnnouncementItem[]>([])
  const [showProgramDelayNotice, setShowProgramDelayNotice] = React.useState(false)
  const [showAnnouncementDelayNotice, setShowAnnouncementDelayNotice] = React.useState(false)
  const [showNewsDelayNotice, setShowNewsDelayNotice] = React.useState(false)
  const [showEventDelayNotice, setShowEventDelayNotice] = React.useState(false)

  React.useEffect(() => {
    let active = true

    apiRequest<{ programs?: ProgramItem[] }>('/programs')
      .then((response) => {
        if (!active) return
        setFeaturedPrograms(response.programs ?? [])
      })
      .catch(() => {
        if (!active) return
        setFeaturedPrograms([])
      })

    apiRequest<{ news?: NewsItem[] }>('/news')
      .then((response) => {
        if (!active) return
        setFeaturedNews(response.news ?? [])
      })
      .catch(() => {
        if (!active) return
        setFeaturedNews([])
      })

    apiRequest<{ events?: EventItem[] }>('/events')
      .then((response) => {
        if (!active) return
        setFeaturedEvents(response.events ?? [])
      })
      .catch(() => {
        if (!active) return
        setFeaturedEvents([])
      })

    apiRequest<{ announcements?: AnnouncementItem[] }>('/announcements')
      .then((response) => {
        if (!active) return
        setFeaturedAnnouncements(response.announcements ?? [])
      })
      .catch(() => {
        if (!active) return
        setFeaturedAnnouncements([])
      })

    return () => {
      active = false
    }
  }, [])

  const previewPrograms = featuredPrograms.slice(0, 3)

  const eventItems = React.useMemo(() => {
    return [...featuredEvents]
      .filter((item) => {
        const eventDate = item.starts_at ? new Date(item.starts_at).getTime() : 0
        return !eventDate || eventDate >= Date.now() - 1000 * 60 * 60 * 24 * 30
      })
      .sort((a, b) => {
        const dateA = a.starts_at ? new Date(a.starts_at).getTime() : 0
        const dateB = b.starts_at ? new Date(b.starts_at).getTime() : 0
        return dateA - dateB
      })
      .slice(0, 4)
  }, [featuredEvents])

  React.useEffect(() => {
    if (featuredPrograms.length > 0) {
      setShowProgramDelayNotice(false)
      return
    }

    const timer = window.setTimeout(() => {
      setShowProgramDelayNotice(true)
    }, 10000)

    return () => window.clearTimeout(timer)
  }, [featuredPrograms.length])

  React.useEffect(() => {
    if (featuredAnnouncements.length > 0) {
      setShowAnnouncementDelayNotice(false)
      return
    }

    const timer = window.setTimeout(() => {
      setShowAnnouncementDelayNotice(true)
    }, 10000)

    return () => window.clearTimeout(timer)
  }, [featuredAnnouncements.length])

  React.useEffect(() => {
    if (featuredNews.length > 0) {
      setShowNewsDelayNotice(false)
      return
    }

    const timer = window.setTimeout(() => {
      setShowNewsDelayNotice(true)
    }, 10000)

    return () => window.clearTimeout(timer)
  }, [featuredNews.length])

  React.useEffect(() => {
    if (eventItems.length > 0) {
      setShowEventDelayNotice(false)
      return
    }

    const timer = window.setTimeout(() => {
      setShowEventDelayNotice(true)
    }, 10000)

    return () => window.clearTimeout(timer)
  }, [eventItems.length])

  const dataFetchNotice = 'Fetching data is taking longer than usual. Please check your connection and try again shortly.'




  return (
    <HomeContent
      previewPrograms={previewPrograms}
      featuredNews={featuredNews}
      eventItems={eventItems}
      featuredAnnouncements={featuredAnnouncements}
      showProgramDelayNotice={showProgramDelayNotice}
      showAnnouncementDelayNotice={showAnnouncementDelayNotice}
      showNewsDelayNotice={showNewsDelayNotice}
      showEventDelayNotice={showEventDelayNotice}
      dataFetchNotice={dataFetchNotice}
    />
  )
}
