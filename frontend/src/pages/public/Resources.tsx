import React from 'react'
import { BookOpen, Download, FileCheck, Info, ShieldCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Layout, PageIntro } from '../../components/ui'
import { getLocaleFromPathname } from '../../i18n/locale'
import { messages } from '../../i18n/messages'

type ResourceGroup = {
  title: string
  icon: any
  description: string
  items: {
    title: string
    fileType: string
    fileSize: string
    description: string
    code: string
  }[]
}

export default function Resources() {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const copy = messages[locale].pages.resources;

  const resourceGroups: ResourceGroup[] = [
    {
      title: copy.academicDocsTitle,
      icon: BookOpen,
      description: 'Institutional publications, academic calendars, and curriculum guidelines.',
      items: [
        {
          title: 'Official Academic Calendar 2026/2027',
          fileType: 'PDF Document',
          fileSize: '340 KB',
          description: 'Key dates, registration deadlines, semester examinations, and workshop assessment weeks.',
          code: 'AC-2026'
        },
        {
          title: 'Student Handbook & Institutional Code of Conduct',
          fileType: 'PDF Document',
          fileSize: '1.2 MB',
          description: 'Academic rules, grading policies, campus conduct standards, and student rights.',
          code: 'SH-2026'
        },
        {
          title: 'Ethiopian TVET Level I–IV Qualification Framework Guide',
          fileType: 'PDF Document',
          fileSize: '850 KB',
          description: 'Overview of national occupational standards, competency units, and assessment criteria.',
          code: 'QF-2026'
        }
      ]
    },
    {
      title: copy.formsTitle,
      icon: FileCheck,
      description: 'Official application and registration forms for prospective and enrolled trainees.',
      items: [
        {
          title: 'Saint Anthony\'s College Admissions Application Form',
          fileType: 'PDF Form',
          fileSize: '280 KB',
          description: 'Standard application form for regular and short-term vocational certificate programs.',
          code: 'AF-2026'
        },
        {
          title: 'Applicant Document Verification Checklist',
          fileType: 'PDF Document',
          fileSize: '190 KB',
          description: 'Checklist of educational certificates, identification records, and photos required at submission.',
          code: 'CL-2026'
        },
        {
          title: 'Tuition Assistance & Community Scholarship Request Form',
          fileType: 'PDF Form',
          fileSize: '240 KB',
          description: 'Application for need-based tuition assistance supported by the Catholic Church and CRS.',
          code: 'SF-2026'
        }
      ]
    },
    {
      title: copy.safetyTitle,
      icon: ShieldCheck,
      description: 'Mandatory workshop health regulations, hazard prevention, and emergency protocols.',
      items: [
        {
          title: 'College Workshop Safety & Protective Gear Regulations',
          fileType: 'PDF Document',
          fileSize: '410 KB',
          description: 'Required personal protective equipment, machine guarding rules, and workshop protocols.',
          code: 'SR-2026'
        },
        {
          title: 'Electrical & Machine Shop Emergency Procedures',
          fileType: 'PDF Guide',
          fileSize: '310 KB',
          description: 'First aid, electrical shutoff stations, fire response plans, and incident reporting.',
          code: 'EP-2026'
        }
      ]
    }
  ]

  const handleDownload = (title: string) => {
    alert(`Document "${title}" is stored in the college library archive. Copies are also available at the campus registrar office.`)
  }

  return (
    <Layout>
      <main className="resources-page">
        {/* Page Intro */}
        <PageIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          badge="Official Publications"
        />

        {/* Resources Groups */}
        <section className="section wrap resources-section">
          <div className="resources-groups-stack">
            {resourceGroups.map((group, groupIndex) => {
              const IconComp = group.icon
              return (
                <div key={group.title} className="resource-category-block">
                  <div className="category-header">
                    <div className="category-title-wrap">
                      <div className="category-icon-box">
                        <IconComp size={20} />
                      </div>
                      <div>
                        <span className="category-index">Category 0{groupIndex + 1}</span>
                        <h2>{group.title}</h2>
                      </div>
                    </div>
                    <p className="category-desc">{group.description}</p>
                  </div>

                  <div className="resource-items-grid">
                    {group.items.map((item) => (
                      <div key={item.title} className="resource-card">
                        <div className="resource-card-top">
                          <span className="file-badge">{item.fileType}</span>
                          <span className="file-size">{item.fileSize}</span>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <div className="resource-card-footer">
                          <span className="doc-code">{item.code}</span>
                          <button
                            type="button"
                            className="download-btn"
                            onClick={() => handleDownload(item.title)}
                            aria-label={`Download ${item.title}`}
                          >
                            <Download size={14} aria-hidden="true" />
                            <span>{copy.downloadAction}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Notice Card */}
        <section className="section wrap resource-notice-section">
          <div className="resource-notice-card">
            <Info size={22} className="notice-info-icon" aria-hidden="true" />
            <div>
              <strong>Institutional Document Verification:</strong>
              <p>{copy.officialNotice} Printed and stamped copies of all documents can be obtained directly from the Admissions Desk in Emdibir.</p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
