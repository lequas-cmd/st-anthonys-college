export const photos = {
  hero: '/images/campus/hero.jpg',
  workshop: '/images/workshop.jpg',
  students: '/images/students.jpg',
  electrical: '/images/programs/Einstalltion.jpg',
  computer: '/images/programs/computer-science.jpg',
  construction: '/images/programs/engineering.jpg',
  library: '/images/library.jpg',
  classroom: '/images/classroom.png',
  solar: '/images/programs/Einstalltion.jpg',
  automotive: '/images/programs/automotive.jpg',
  plumbing: '/images/programs/plumbing.jpg',
  mechanic: '/images/programs/mechanic.jpg',
  hospitality: '/images/programs/hospitality.jpg',
  newsAssessment: '/images/news/assessment.jpg',
  newsAttendance: '/images/news/attendance.jpg',
  newsProjects: '/images/news/projects.jpg',
};

export type LeadershipMember = {
  name: string;
  role: string;
  department?: string;
  image: string;
  message: string;
};

export const leadershipMembers: LeadershipMember[] = [
  {
    name: 'Dr. Tesfaye Beyene',
    role: 'Academic Director',
    department: 'Institutional Governance',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ07okeZZMulvZP6J0X8TFocCgLrwAQaB4LOicdHuW5-Q&s=10',
    message: 'We believe technical education is a powerful instrument for human dignity, self-reliance, and national progress. At Saint Anthony\'s, we cultivate not only technical competence but also the discipline and moral responsibility that make skilled graduates trusted professionals.'
  },
  {
    name: 'Eng. Yohannes Tadesse',
    role: 'Head of Automotive & Mechanical Studies',
    department: 'Mechanical Department',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0Q8fwroYos1EmZi2RtkYTaavvSzA4aB4-AKMkT0ffmZzmZ4L5eFPG9kU&s=10',
    message: 'Our learners gain confidence through real workshop practice, guided instruction, and industry-focused problem solving. We want every student to leave with practical knowledge that can be applied immediately in work and community service.'
  },
  {
    name: 'Sr. Marta Woldemichael',
    role: 'Student Affairs & Community Formation',
    department: 'Student Affairs',
    image: 'https://www.aciafrica.org/images/aci-africa_nick_if20-south-africa-2026-11-10t183910_1794332809.jpg',
    message: 'A strong technical education must also form character. We support students as whole people—helping them grow in leadership, mutual respect, resilience, and commitment to the common good of our communities.'
  }
];

export type ProgramData = {
  id: number;
  code: string;
  title: string;
  category: string;
  qualification_level: string;
  duration: string;
  duration_years: number;
  description: string;
  practical_focus: string;
  curriculum: string[];
  career_paths: string[];
  image_url: string;
};

export const programs: ProgramData[] = [
  {
    id: 1,
    code: 'ELI-101',
    title: 'Electrical Installation',
    category: 'Electrical Technology',
    qualification_level: 'Level I-IV (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Comprehensive practical training in residential, commercial, and industrial electrical wiring, power distribution, circuit troubleshooting, electrical safety regulations, and renewable energy integration.',
    practical_focus: 'Supervised workbench wiring, conduit bending, breaker panel assembly, motor starter circuits, and solar photovoltaic systems.',
    curriculum: [
      'Electrical Principles & Circuit Analysis',
      'Domestic & Commercial Building Wiring',
      'Industrial Motor Controls & Distribution Panels',
      'Renewable Energy & Solar Photovoltaic Systems',
      'Occupational Health & Electrical Safety Standards'
    ],
    career_paths: [
      'Certified Building Electrician',
      'Industrial Maintenance Technician',
      'Solar Energy System Installer',
      'Electrical Contractor & Service Entrepreneur'
    ],
    image_url: '/images/programs/Einstalltion.jpg'
  },
  {
    id: 2,
    code: 'ICT-102',
    title: 'Information Technology',
    category: 'ICT & Computing',
    qualification_level: 'Level I-IV (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Hands-on computer systems diagnostics, network cabling and configuration, operating systems installation, database management, office automation tools, and essential hardware support.',
    practical_focus: 'Computer assembly, hardware troubleshooting, structured LAN cabling, router and switch setup, client-server administration, and peripheral servicing.',
    curriculum: [
      'Computer Hardware & System Diagnostics',
      'Network Installation & Cable Termination (LAN/WAN)',
      'Operating Systems & Server Administration',
      'Database Fundamentals & Office Applications',
      'IT Help Desk & Customer Support Services'
    ],
    career_paths: [
      'IT Support Specialist & Hardware Technician',
      'Network Infrastructure Installer',
      'Database & Office Systems Administrator',
      'Computer Maintenance Entrepreneur'
    ],
    image_url: '/images/programs/computer-science.jpg'
  },
  {
    id: 3,
    code: 'AUT-103',
    title: 'Automotive Technology',
    category: 'Automotive Studies',
    qualification_level: 'Level I-IV (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Practical training in automotive engine mechanics, transmission systems, electronic diagnostics, steering, suspension, hydraulic brake systems, and routine vehicle servicing.',
    practical_focus: 'Direct garage bay repair, computerized engine diagnosis, component overhaul, wheel alignment, brake disc machining, and diesel injection servicing.',
    curriculum: [
      'Automotive Engine Overhaul & Servicing',
      'Automotive Electrical & Electronic Systems',
      'Brake, Steering & Suspension Systems',
      'Manual & Automatic Transmission Units',
      'Workshop Safety & Automotive Diagnostics'
    ],
    career_paths: [
      'Automotive Diagnostic Technician',
      'Fleet Maintenance Mechanic',
      'Workshop Floor Supervisor',
      'Automotive Service Garage Owner'
    ],
    image_url: '/images/programs/automotive.jpg'
  },
  {
    id: 4,
    code: 'CON-104',
    title: 'Construction Technology',
    category: 'Construction & Building',
    qualification_level: 'Level I-IV (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Practical instruction in building layout, brick and block masonry, concrete technology, structural reinforcement, architectural blueprint interpretation, and site safety management.',
    practical_focus: 'On-site bricklaying, mortar proportioning, concrete formwork assembly, steel reinforcement tying, level surveying, and finishing work.',
    curriculum: [
      'Architectural Blueprint & Plan Reading',
      'Bricklaying & Block Masonry Construction',
      'Concrete Technology & Formwork Carpentry',
      'Surveying & Site Layout Foundations',
      'Construction Safety & Quantity Estimation'
    ],
    career_paths: [
      'Building Construction Supervisor',
      'Site Masonry & Concrete Specialist',
      'Quantity & Materials Assistant',
      'Building Contractor & Builder'
    ],
    image_url: '/images/programs/engineering.jpg'
  },
  {
    id: 5,
    code: 'WLD-105',
    title: 'Welding & Metal Fabrication',
    category: 'Manufacturing',
    qualification_level: 'Level I-IV (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Intensive workshop training in Shielded Metal Arc Welding (SMAW), Gas Metal Arc Welding (GMAW/MIG), oxy-acetylene cutting, sheet metal fabrication, and metal structural assembly.',
    practical_focus: 'Welding booth practice, structural steel joint fabrication, seam grinding, weld inspection, bending, rolling, and metal workshop safety compliance.',
    curriculum: [
      'Shielded Metal Arc Welding (SMAW / Stick)',
      'Gas Metal Arc Welding (GMAW / MIG)',
      'Oxy-Fuel Cutting & Flame Preparation',
      'Sheet Metal Layout & Structural Assembly',
      'Weld Inspection, Testing & Workshop Safety'
    ],
    career_paths: [
      'Certified Industrial Welder',
      'Structural Steel Fabricator',
      'Manufacturing Maintenance Welder',
      'Metal Works & Gates Workshop Owner'
    ],
    image_url: '/images/programs/welding.jpg'
  },
  {
    id: 6,
    code: 'PLB-106',
    title: 'Plumbing & Pipefitting',
    category: 'Building Services',
    qualification_level: 'Level I-III (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Applied technical skills in potable water distribution, sanitary drainage systems, pipe cutting, threading, soldering and joining, fixture installation, pump servicing, and wastewater management.',
    practical_focus: 'Piping layout, hydrostatic pressure testing, PVC & PPR heat fusion, copper soldering, drain grade alignment, and commercial bathroom fixture installations.',
    curriculum: [
      'Sanitary Drainage & Venting Systems',
      'Water Supply Piping & Distribution Networks',
      'Pipe Joining, Threading & Solvent Welding',
      'Pumps, Valves & Water Storage Installations',
      'Plumbing Codes & Blueprint Interpretation'
    ],
    career_paths: [
      'Residential & Commercial Plumber',
      'Piping Systems Maintenance Specialist',
      'Water Utility Installation Technician',
      'Plumbing Service Contractor'
    ],
    image_url: '/images/programs/plumbing.jpg'
  },
  {
    id: 7,
    code: 'REF-107',
    title: 'Refrigeration and Air Conditioning',
    category: 'Building Services',
    qualification_level: 'Level I-IV (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Instruction in thermodynamic refrigeration cycles, refrigerant management, compressor overhaul, cold storage units, domestic refrigerators, and commercial HVAC maintenance.',
    practical_focus: 'Manifold gauge troubleshooting, vacuum dehydration, refrigerant recovery, tube brazing, thermostat wiring, and air flow balance measurement.',
    curriculum: [
      'Principles of Thermodynamics & Refrigeration',
      'Domestic & Commercial Cooling Systems',
      'Refrigerant Recovery, Charging & Leak Detection',
      'HVAC Electrical Controls & Thermostats',
      'Preventive Maintenance & Safety Standards'
    ],
    career_paths: [
      'Refrigeration & Cooling Technician',
      'HVAC Maintenance Specialist',
      'Cold Storage Facility Technician',
      'Appliance Repair Contractor'
    ],
    image_url: '/images/programs/engineering.jpg'
  },
  {
    id: 8,
    code: 'ACC-108',
    title: 'Accounting & Financial Services',
    category: 'Business & Commerce',
    qualification_level: 'Level I-IV (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Systematic instruction in double-entry bookkeeping, payroll systems, financial statement preparation, cash management, tax compliance, and computerized accounting software applications.',
    practical_focus: 'Computerized ledger recording, spreadsheet financial modeling, inventory accounting, invoice preparation, bank reconciliations, and tax filing simulations.',
    curriculum: [
      'Financial Accounting Principles & Double Entry',
      'Computerized Accounting Software & Spreadsheets',
      'Payroll Accounting & Business Tax Regulations',
      'Cost & Management Accounting Basics',
      'Business Communication & Professional Ethics'
    ],
    career_paths: [
      'Accounts Clerk & Assistant Bookkeeper',
      'Payroll Administrator',
      'Microfinance & Savings Loan Officer',
      'Small Business Accounting Consultant'
    ],
    image_url: '/images/programs/business.jpg'
  },
  {
    id: 9,
    code: 'MEC-109',
    title: 'General Mechanics & Machining',
    category: 'Manufacturing',
    qualification_level: 'Level I-IV (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Technical training in precision lathe machine turning, milling, shaping, bench fitting, blueprint reading, vernier and micrometer measurement, and mechanical equipment servicing.',
    practical_focus: 'Center lathe operations, tool grinding, thread cutting, milling operations, precision component fabrication, and industrial mechanical repairs.',
    curriculum: [
      'Bench Fitting & Precision Hand Tools',
      'Center Lathe Operations & Turning Skills',
      'Milling & Shaping Machine Operations',
      'Precision Measurement & Metrology',
      'Industrial Machine Maintenance & Safety'
    ],
    career_paths: [
      'Machinist & Machine Tool Operator',
      'Mechanical Maintenance Technician',
      'Industrial Workshop Toolmaker',
      'Machining Workshop Entrepreneur'
    ],
    image_url: '/images/programs/mechanic.jpg'
  },
  {
    id: 10,
    code: 'HOT-110',
    title: 'Hospitality Operations',
    category: 'Hospitality',
    qualification_level: 'Level I-III (National TVET Certificate)',
    duration: '2 years',
    duration_years: 2,
    description: 'Practical training in commercial culinary arts, food and beverage service, food hygiene, front office administration, housekeeping procedures, and customer hospitality service.',
    practical_focus: 'Kitchen food prep, professional recipe execution, table service etiquette, front desk reservation systems, room inspection, and banquet event handling.',
    curriculum: [
      'Food Safety, Sanitation & Personal Hygiene',
      'Commercial Culinary Techniques & Baking',
      'Food & Beverage Service Procedures',
      'Front Office Operations & Guest Relations',
      'Housekeeping Management & Facility Care'
    ],
    career_paths: [
      'Commercial Cook & Kitchen Assistant',
      'Food & Beverage Service Attendant',
      'Hotel Front Desk & Reservations Officer',
      'Catering & Hospitality Entrepreneur'
    ],
    image_url: '/images/programs/hospitality.jpg'
  }
];

export type NewsData = {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  body: string;
  image_url: string;
  date: string;
  published_at: string;
  author: string;
};

export const news: NewsData[] = [
  {
    id: 1,
    title: 'College Opens the 2026/2027 Academic Year with Expanded Workshop Facilities',
    slug: 'college-opens-2026-2027',
    category: 'Academic Life',
    summary: 'Saint Anthony\'s Technical and Vocational College welcomes new and returning students to Emdibir with upgraded practical workshops and renewed community commitment.',
    body: 'Saint Anthony\'s Technical and Vocational College officially commenced the 2026/2027 academic year today in Emdibir, welcoming hundreds of enthusiastic young men and women across ten certified vocational departments.\n\nThe academic director, Dr. Tesfaye Bekele, opened the assembly by reaffirming the college\'s core institutional philosophy: technical education as a pathway to human dignity, self-reliance, and sustainable community development.\n\nWith generous support from the Ethiopian Catholic Church and Catholic Relief Services (CRS), several workshops have been outfitted with modern diagnostic gear, new welding bays, and expanded electrical testing benches to ensure students receive market-ready practical training.',
    image_url: '/images/programs/automotive.jpg',
    date: 'Sep 15, 2026',
    published_at: '2026-09-15T08:00:00Z',
    author: 'Office of Academic Affairs'
  },
  {
    id: 2,
    title: 'Workshop Safety Training and Technical Induction Underway for New Trainees',
    slug: 'workshop-safety-training-begins',
    category: 'Workshops',
    summary: 'Mandatory workshop health, hazard prevention, and equipment safety protocols are delivered across all technical departments before hands-on machinery access.',
    body: 'Ensuring that every trainee develops rigorous professional habits, Saint Anthony\'s Technical and Vocational College has initiated comprehensive safety inductions across all workshop facilities.\n\nStudents in Automotive Technology, Welding, Electrical Installation, and General Mechanics received protective equipment, fire response briefings, machine guarding instruction, and hazardous material guidelines.\n\n"Safety is not merely a rule; it is the cornerstone of professional craftsmanship," noted Eng. Yohannes Tadesse. Trainees must demonstrate practical adherence to safety standards before operating high-voltage or heavy machinery.',
    image_url: '/images/programs/welding.jpg',
    date: 'Sep 21, 2026',
    published_at: '2026-09-21T08:00:00Z',
    author: 'Department of Practical Training'
  },
  {
    id: 3,
    title: 'ICT Laboratory Upgraded to Support Practical Computer Systems and Networking',
    slug: 'ict-lab-practical-learning',
    category: 'Technology',
    summary: 'A newly upgraded computing lab provides high-speed local networking, hardware diagnostic stations, and software training for ICT students in the Gurage Zone.',
    body: 'The ICT department at Saint Anthony\'s College has completed the installation of new workstations and dedicated hardware diagnostic benches. Trainees now engage directly in computer assembly, network cable termination, switch configuration, and server administration.\n\nThis modernization initiative strengthens the college\'s mission to bridge the digital skills gap in regional communities, preparing graduates to support schools, clinics, and businesses throughout the zone.',
    image_url: '/images/programs/computer-science.jpg',
    date: 'Oct 01, 2026',
    published_at: '2026-10-01T08:00:00Z',
    author: 'ICT Department'
  },
  {
    id: 4,
    title: 'Admissions Office Shares Application Guidance for 2026/2027 Vocational Intakes',
    slug: 'admissions-application-guidance',
    category: 'Admissions',
    summary: 'Prospective students and families are invited to explore technical courses, review eligibility criteria, and submit applications directly at the Emdibir campus desk.',
    body: 'The Admissions Office has released official guidance for applicants seeking entry into certified Level I to Level IV vocational programs. Prospective students can consult with department instructors, view training facilities, and verify their academic credentials.\n\nScholarships and community assistance options supported by institutional partners ensure that capable applicants facing economic constraints have equal opportunity to acquire lifelong vocational skills.',
    image_url: '/images/library.jpg',
    date: 'Oct 03, 2026',
    published_at: '2026-10-03T08:00:00Z',
    author: 'Admissions Office'
  },
  {
    id: 5,
    title: 'Students Prepare Applied Practical Projects for Annual Community Skills Exhibition',
    slug: 'students-prepare-practical-projects',
    category: 'Campus Life',
    summary: 'Trainees across construction, fabrication, automotive, and electrical departments are developing practical prototypes to demonstrate occupational competencies.',
    body: 'Preparations are in full swing for the upcoming Student Project Exhibition at Saint Anthony\'s College. Students work collaboratively in the workshops designing solar lighting units, agricultural hand tools, steel furniture, and vehicular diagnostic setups.\n\nThe annual exhibition brings together community leaders, local employers, and regional development partners to witness firsthand how practical technical education directly serves community needs.',
    image_url: '/images/news/projects.jpg',
    date: 'Oct 07, 2026',
    published_at: '2026-10-07T08:00:00Z',
    author: 'Student Affairs'
  }
];

export type EventData = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  location: string;
  starts_at: string;
  ends_at: string;
  date_formatted: string;
};

export const events: EventData[] = [
  {
    id: 1,
    title: 'Student Project Exhibition 2026',
    slug: 'student-project-exhibition-2026',
    summary: 'Showcase of practical student innovations and workshop projects across all 10 TVET departments.',
    body: 'Students present practical machines, electrical installations, metal structures, and IT solutions developed during their training. Open to community members, families, and regional enterprise partners.',
    location: 'College Courtyard & Main Workshop Block',
    starts_at: '2026-11-10T09:00:00Z',
    ends_at: '2026-11-10T15:00:00Z',
    date_formatted: 'Nov 10, 2026'
  },
  {
    id: 2,
    title: 'Mid-Semester Practical Assessment Week',
    slug: 'mid-semester-assessment-week-2026',
    summary: 'Comprehensive hands-on occupational competency assessments supervised by department instructors.',
    body: 'Trainees across all levels undergo practical performance tests at their workstations, demonstrating equipment troubleshooting, fabrication precision, and safety compliance.',
    location: 'All Department Workshops & Labs',
    starts_at: '2026-11-16T08:00:00Z',
    ends_at: '2026-11-20T17:00:00Z',
    date_formatted: 'Nov 16 - 20, 2026'
  },
  {
    id: 3,
    title: 'Community Skills Day & Technical Demonstrations',
    slug: 'community-skills-day-2026',
    summary: 'College departments offer free public technical advice, minor repair clinics, and skills demonstrations.',
    body: 'Automotive and electrical departments provide vehicle checks, solar maintenance advice, and demonstrations for Emdibir town residents, reinforcing our community service mission.',
    location: 'Emdibir Campus Plaza',
    starts_at: '2026-12-05T09:00:00Z',
    ends_at: '2026-12-05T14:00:00Z',
    date_formatted: 'Dec 05, 2026'
  },
  {
    id: 4,
    title: 'End of Semester Institutional Assembly',
    slug: 'end-semester-assembly-2026',
    summary: 'Academic review, recognition of outstanding student achievements, and semester closing remarks.',
    body: 'Students, faculty, and administrative leadership gather in the Main Hall to reflect on educational progress and celebrate student achievement.',
    location: 'College Main Hall',
    starts_at: '2026-12-18T09:00:00Z',
    ends_at: '2026-12-18T12:00:00Z',
    date_formatted: 'Dec 18, 2026'
  }
];

export type AnnouncementData = {
  id: number;
  title: string;
  slug: string;
  audience: string;
  summary: string;
  body: string;
  date: string;
  published_at: string;
};

export const announcements: AnnouncementData[] = [
  {
    id: 1,
    title: 'Official Registration Window for Academic Year 2026/2027',
    slug: 'registration-window-2026-2027',
    audience: 'All Students & Applicants',
    summary: 'Accepted trainees and returning students must complete document verification and formal registration at the Admissions Office.',
    body: 'The Admissions Office reminds all prospective trainees and continuing students that registration closes promptly at 4:30 PM. Please bring original academic documents, two passport photos, and your identification card.',
    date: 'Oct 02, 2026',
    published_at: '2026-10-02T08:00:00Z'
  },
  {
    id: 2,
    title: 'Mandatory Workshop Safety Gear Requirements',
    slug: 'mandatory-workshop-safety-gear',
    audience: 'Technical Trainees',
    summary: 'Steel-toed boots, protective overalls, and eye goggles are strictly required for entry into all mechanical, electrical, and construction workshops.',
    body: 'In accordance with institutional safety standards and national TVET regulations, no student will be permitted into workshop zones without approved safety gear. Safety inspections will be conducted at workshop entrances.',
    date: 'Sep 25, 2026',
    published_at: '2026-09-25T08:00:00Z'
  },
  {
    id: 3,
    title: 'Library Extended Study Hours for Assessment Preparation',
    slug: 'library-extended-hours',
    audience: 'All Students',
    summary: 'The campus library and technical reference room will remain open through evening hours during assessment preparation weeks.',
    body: 'To assist trainees in preparing for technical theory and occupational competency exams, the library facility will operate from 7:30 AM to 8:30 PM Monday through Friday with instructors on duty for academic support.',
    date: 'Sep 28, 2026',
    published_at: '2026-09-28T08:00:00Z'
  }
];

export const studentTestimonials = [
  {
    name: 'Selamawit Girma',
    program: 'Electrical Installation, Level III',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    quote: 'Before joining Saint Anthony\'s, I had never touched a circuit breaker. Through daily supervised workshop practice, I can now wire an entire residential panel and troubleshoot faults independently. The instructors hold us to high standards of craftsmanship and safety.'
  },
  {
    name: 'Dawit Haile',
    program: 'Automotive Technology, Level IV',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    quote: 'The difference at St. Anthony\'s is that 70% of our training is spent directly on engines and machinery. When local workshops and transport enterprises in the Gurage Zone need skilled technicians, they know our graduates have real hands-on capability and reliable work ethic.'
  },
  {
    name: 'Mekdes Tadesse',
    program: 'Information Technology, Level III',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    quote: 'The college gave me access to structured computer labs, networking equipment, and supportive mentors. St. Anthony\'s is not just teaching software; they are equipping young women with practical technical confidence to support regional schools, clinics, and businesses.'
  }
  
];

export const impactMetrics = [
  {
    value: '10',
    label: 'Accredited Programs',
    detail: 'National TVET Level I-IV qualification standards'
  },
  {
    value: '70%',
    label: 'Practical Workshop Training',
    detail: 'Supervised hands-on technical time in dedicated bays'
  },
  {
    value: '100%',
    label: 'Community-Centered Access',
    detail: 'Inclusive education welcoming all faiths and backgrounds'
  },
  {
    value: '2',
    label: 'Decades of Church & CRS Partnership',
    detail: 'Deep institutional foundations serving Emdibir and beyond'
  }
];
