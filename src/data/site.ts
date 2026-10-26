export const person = {
  name: 'David Muumbi Mbuvi',
  title: 'Founder, Kensync Limited | Computer Science Student | Software & Systems Developer',
  university: 'Moi University',
  level: 'Fourth Year · BSc Computer Science',
  email: 'mbuvidavid26@gmail.com',
  phone: '+254 746 440 595',
  phoneHref: 'tel:+254746440595',
  github: 'https://github.com/cheekydavy',
};

export const company = {
  name: 'Kensync Limited',
  role: 'Founder',
  url: 'https://kensync.co.ke',
  host: 'kensync.co.ke',
};

export const heroCopy =
  "I'm a Computer Science student and developer building practical software systems across business applications, AI-assisted learning, mobile development, networking, and backend engineering. I enjoy understanding how complete systems work—from user interfaces and APIs to databases and external integrations.";

export const aboutParagraphs: string[] = [
  "I'm a fourth-year Computer Science student at Moi University. What keeps pulling me toward a project is the seam between components: a checkout that has to agree with stock, a payment that has to be matched to a callback, a command that has to reach the right plugin. I like building the whole path and understanding what each piece is responsible for.",
  'I am also the founder of Kensync Limited, a Kenyan software and technology company. Its flagship product is Kensync POS, a point-of-sale and business management system, supported by custom software, web development, cybersecurity and network services.',
  'My projects reach across web applications, Java backend services, Node.js applications, Android development with Kotlin, and database-backed systems. They also include AI API integration, WhatsApp automation, offline messaging concepts, POS and business operations, and M-Pesa payment integration.',
  'During a three-month industrial attachment at Infix Africa Limited, I got hands-on exposure to website development, business software including POS and ERP workflows, networking and technical support, and API and payment integration testing. It was where coursework met client sites, hardware and everyday operational constraints.',
];

export const aboutDomains: string[] = [
  'Web applications',
  'Java backend services',
  'Node.js applications',
  'Android with Kotlin',
  'Database-backed systems',
  'AI API integration',
  'WhatsApp automation',
  'Offline messaging concepts',
  'POS & business operations',
  'M-Pesa payment integration',
];

export interface Skill {
  name: string;
  /** Project slugs whose documented architecture uses this technology. */
  usedIn?: string[];
}

export interface SkillGroup {
  title: string;
  code: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Programming',
    code: 'LANG',
    skills: [
      { name: 'Java', usedIn: ['kenya-airways'] },
      { name: 'Python' },
      { name: 'JavaScript', usedIn: ['smartstudy', 'mbuvimd', 'kenya-airways'] },
      { name: 'Kotlin', usedIn: ['campusmesh'] },
      { name: 'C' },
    ],
  },
  {
    title: 'Web and backend',
    code: 'WEB',
    skills: [
      { name: 'HTML', usedIn: ['smartstudy', 'mbuvimd'] },
      { name: 'CSS' },
      { name: 'JavaScript', usedIn: ['smartstudy', 'mbuvimd', 'kenya-airways'] },
      { name: 'React', usedIn: ['pos', 'kenya-airways'] },
      { name: 'Node.js', usedIn: ['pos', 'smartstudy', 'mbuvimd'] },
      { name: 'Express.js', usedIn: ['pos', 'smartstudy'] },
      { name: 'Flask' },
      { name: 'REST APIs', usedIn: ['pos', 'smartstudy', 'kenya-airways'] },
    ],
  },
  {
    title: 'Databases',
    code: 'DATA',
    skills: [
      { name: 'PostgreSQL', usedIn: ['pos', 'mbuvimd', 'kenya-airways'] },
      { name: 'MongoDB', usedIn: ['smartstudy'] },
      { name: 'Supabase' },
      { name: 'Room', usedIn: ['campusmesh'] },
    ],
  },
  {
    title: 'Tools and deployment',
    code: 'OPS',
    skills: [
      { name: 'Git' },
      { name: 'GitHub', usedIn: ['pos', 'smartstudy', 'campusmesh', 'mbuvimd', 'kenya-airways'] },
      { name: 'Docker' },
      { name: 'Heroku' },
      { name: 'Vercel' },
      { name: 'Render' },
      { name: 'Jupyter Notebook' },
      { name: 'Miniconda' },
    ],
  },
  {
    title: 'Systems and networking',
    code: 'SYS',
    skills: [
      { name: 'Linux' },
      { name: 'TCP/IP' },
      { name: 'Network configuration' },
      { name: 'Troubleshooting' },
      { name: 'Hardware support' },
    ],
  },
  {
    title: 'Integrations',
    code: 'INT',
    skills: [
      { name: 'M-Pesa / Safaricom Daraja', usedIn: ['pos'] },
      { name: 'WhatsApp', usedIn: ['pos', 'mbuvimd'] },
      { name: 'External APIs', usedIn: ['mbuvimd'] },
      { name: 'Groq API', usedIn: ['smartstudy'] },
    ],
  },
];

export const attachment = {
  org: 'Infix Africa Limited',
  role: 'Industrial Attachment',
  duration: '3 months',
  points: [
    'Website development and deployment',
    'POS/ERP workflows, including inventory, sales and invoicing',
    'Systems and networking support',
    'Client-site troubleshooting and hardware support',
    'API and M-Pesa integration testing',
  ],
};

export const certifications = ['Cisco Networking Essentials', 'Cisco Network Engineering Basics'];
