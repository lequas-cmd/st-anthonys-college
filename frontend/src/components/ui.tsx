import { Wrench, BookOpen, Users, GraduationCap, Sun, Building2, CalendarDays, Download, Clock3 } from 'lucide-react'

// Compatibility barrel. New components live in focused files under common/ and cards/.
export { Brand } from './common/Brand'
export { Header } from './common/Header'
export { Footer } from './common/Footer'
export { Layout } from './common/Layout'
export { Eyebrow, PageIntro, SectionHeading, Testimonials } from './common/Content'
export { ProgramCard } from './cards/ProgramCard'
export { NewsCard } from './cards/NewsCard'
export { slugify } from './cards/slugify'

export function IconBadge({ label, icon: Icon }: { label: string, icon: any }) {
  return <div className="value-item"><Icon /><h3>{label}</h3><p>Practical learning, mentorship, and service shape the student experience.</p></div>
}

export const uiIcons = { Wrench, BookOpen, Users, GraduationCap, Sun, Building2, CalendarDays, Download, Clock3 }
