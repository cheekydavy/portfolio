import type { ToneStyle } from './tones';

export type ToneKey = 'toneBlue' | 'toneAmber' | 'toneMint' | 'toneRose' | 'toneIndigo' | 'toneTeal' | 'toneNeutral';

export interface LegendEntry {
  tone: ToneKey;
  label: string;
  note: string;
}

export interface Layer {
  name: string;
  tone: ToneKey;
  items: string[];
  planned?: boolean;
}

export interface SourceLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  ref: string;
  name: string;
  shortName: string;
  tagline: string;
  status: { label: string; kind: 'active' | 'complete' };
  summary: string;
  overview: string[];
  engineeringValue: string[];
  stack: { group: string; items: string[] }[];
  layers: Layer[];
  /** Repository URL. Omit to show no repository link or source references for this project. */
  repo?: string;
  /** GitHub repository name for the live-metadata lookup (only used when `repo` is set). */
  repoName?: string;
  /** Short responsibilities per diagram node id, shown in the explorer's inspector. */
  nodeNotes?: Record<string, string>;
  /** Overrides the default provenance line shown with the diagram explanation. */
  diagramNote?: string;
  architectureNote: string[];
  legend: LegendEntry[];
  keySources: SourceLink[];
  disclaimer?: string;
  loadDiagram: () => Promise<{ default: string }>;
}

export const GITHUB_USER = 'cheekydavy';
export const GITHUB_URL = `https://github.com/${GITHUB_USER}`;

export type { ToneStyle };

export const projects: Project[] = [
  /* ───────────────────────── POS ───────────────────────── */
  {
    slug: 'pos',
    ref: 'PRJ-01',
    name: 'Integrated POS & Business Communication Platform',
    shortName: 'POS Platform',
    tagline: 'Sales, inventory, M-Pesa payments and customer messaging in one connected platform.',
    status: { label: 'Complete', kind: 'complete' },
    summary:
      'An integrated point-of-sale and business management platform combining sales, inventory, purchasing, customer and supplier management, reporting, branch operations, role-based access control and M-Pesa payment integration.',
    overview: [
      'Retail businesses often run sales, stock, supplier orders and customer credit in separate tools, so a balance goes untracked or a shelf count drifts from reality. This platform was built around a problem I met during my industrial attachment: customers who don’t pay in full, and balances that become impossible to track and collect.',
      'It is an integrated point-of-sale and business management platform: checkout with split payments and receipts, product and inventory management on an append-only stock ledger, purchasing and supplier records, customers and receivables, branch operations, reporting, and role-based access control across the whole system. A Next.js web app talks to a modular Express API, which persists everything to PostgreSQL through Prisma.',
      'The M-Pesa integration with Safaricom Daraja is complete: staff send an STK Push from checkout or against an outstanding balance, and a payment is applied to a sale only once Safaricom confirms it. A shared WhatsApp inbox built on Meta’s Cloud API connects customer conversations to customer records and invoices.',
    ],
    engineeringValue: [
      'Append-only inventory ledger: every stock change is an immutable movement, written in the same database transaction as the sale or purchase that caused it.',
      'Money handled as exact decimals, with price and tax copied onto each sale line so later catalogue changes never rewrite history.',
      'Exactly-once M-Pesa settlement: a payment is marked applied and recorded on the sale in one transaction, with three independent ways to confirm it.',
      'Permissions enforced on the server for every endpoint, with an audit log of mutating actions and credential-redacted request logs.',
      'A communications module kept separate from the POS core, connected only through customer links and pinned invoices.',
    ],
    stack: [
      { group: 'Web', items: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS'] },
      { group: 'API', items: ['Node.js', 'Express', 'TypeScript', 'Zod validation'] },
      { group: 'Data', items: ['PostgreSQL', 'Prisma'] },
      { group: 'Security', items: ['argon2 password hashing', 'JWT access and refresh tokens', 'Helmet'] },
      { group: 'Integrations', items: ['Safaricom Daraja (M-Pesa STK Push)', 'Meta WhatsApp Cloud API'] },
      { group: 'Storage', items: ['S3-compatible object storage'] },
      { group: 'Tooling', items: ['pnpm workspaces monorepo', 'Vitest', 'Pino logging'] },
    ],
    layers: [
      { name: 'Operator interface', tone: 'toneBlue', items: ['POS checkout', 'Message inbox', 'Reports screens', 'Back-office screens'] },
      {
        name: 'Sales and finance',
        tone: 'toneAmber',
        items: ['Sales and receivables', 'Sales API handlers', 'M-Pesa payments', 'Daraja client', 'Reporting services', 'General reports'],
      },
      {
        name: 'Catalog and operations',
        tone: 'toneMint',
        items: ['Product catalog', 'Inventory ledger', 'Purchase orders', 'Customer records', 'Branch management', 'Supplier records'],
      },
      { name: 'Customer communications', tone: 'toneTeal', items: ['WhatsApp messaging', 'Attachment storage'] },
      {
        name: 'API platform',
        tone: 'toneRose',
        items: ['Authentication', 'Roles and permissions', 'User management', 'PostgreSQL through Prisma', 'Audit logging', 'Runtime configuration', 'Pagination utilities', 'API logger'],
      },
      { name: 'External services', tone: 'toneIndigo', items: ['Safaricom Daraja', 'Meta WhatsApp'] },
    ],
    diagramNote: 'Mapped from the repository structure and checked against the source code.',
    architectureNote: [
      'Staff work through the operator interface: POS checkout, the message inbox, report screens and the back-office screens. Every screen talks to one API, organised into modules for sales and finance, catalog and operations, customer communications and shared platform services.',
      'A sale flows from checkout through the sales handlers to the sales service, which deducts stock from the inventory ledger and records payments. M-Pesa payments go through their own service and Daraja client, and a confirmed payment is applied back to its sale. The WhatsApp module exchanges messages with Meta, stores attachments, and links conversations to customers and invoices. Everything persists to PostgreSQL through Prisma, with authentication, permissions and audit logging shared across the API.',
    ],
    legend: [
      { tone: 'toneBlue', label: 'Operator interface', note: 'Staff user and screens' },
      { tone: 'toneAmber', label: 'Sales & finance', note: 'Sales, M-Pesa, reporting' },
      { tone: 'toneMint', label: 'Catalog & operations', note: 'Products, stock, purchasing, people, branches' },
      { tone: 'toneTeal', label: 'Customer communications', note: 'WhatsApp messaging and attachments' },
      { tone: 'toneRose', label: 'API platform', note: 'Auth, roles, audit, config, PostgreSQL' },
      { tone: 'toneIndigo', label: 'External services', note: 'Safaricom Daraja and Meta WhatsApp' },
    ],
    keySources: [],
    nodeNotes: {
      node_staff: 'Staff using the system, limited by their role\u2019s permissions.',
      node_pos: 'Front-counter screen: build a cart, choose a branch and optional customer, take split payments or pay with M-Pesa, and print a receipt.',
      node_inbox: 'Shared staff inbox for WhatsApp conversations: assign, reply, add internal notes, link a customer and pin invoices.',
      node_reports_ui: 'Reporting screens with date and branch filters, CSV export and print.',
      node_backoffice: 'Screens for products, inventory, purchase orders, customers, suppliers, branches, receivables, staff and roles.',
      node_sales_service: 'Creates and completes sales in one transaction: deducts stock, records payments, requires a customer for credit sales, and tracks receivables.',
      node_sales_controller: 'Validates sales requests and calls the sales service: create, checkout, void, discard a draft, collect a payment.',
      node_mpesa_service: 'Starts STK Push payments, tracks each attempt, and applies a confirmed payment to its sale exactly once, confirmed by callback, status polling and a background reconciler.',
      node_mpesa_client: 'Talks to Safaricom Daraja: access token, STK Push request and payment status query, with Kenyan phone-number normalisation.',
      node_reports_sales: 'Sales overview, itemised sales, product performance and receivables aging, using Nairobi-time day boundaries.',
      node_reports_general: 'Inventory valuation, low-stock and purchase-spend reports.',
      node_products: 'Product catalogue with SKU, prices, tax rate and reorder level.',
      node_inventory: 'Append-only stock ledger with a cached balance per branch; corrections are reversing entries, never edits.',
      node_purchasing: 'Purchase orders from draft to ordered to received, with partial receiving that posts stock movements.',
      node_customers: 'Customer records, including the phone number used to match WhatsApp conversations.',
      node_branches: 'Branches that scope stock and generate sequential invoice and purchase-order numbers.',
      node_suppliers: 'Supplier records used by purchase orders and spend reports.',
      node_whatsapp: 'Shared WhatsApp inbox on Meta\u2019s Cloud API: signed webhooks saved before processing, duplicate protection, customer matching, internal notes and assignment.',
      node_storage: 'Storage for customer attachments, served only through an authenticated endpoint.',
      node_auth: 'Login with argon2-hashed passwords, short-lived access tokens and revocable refresh tokens.',
      node_roles: 'Roles and permission sets enforced on the server for every endpoint; custom roles can be created.',
      node_users: 'Staff accounts: create, change role, deactivate and reset passwords. Deactivation revokes sessions.',
      node_database: 'The single PostgreSQL database, accessed through the Prisma client with versioned migrations.',
      node_audit: 'Append-only record of who did what and when for mutating actions.',
      node_env: 'Validated runtime configuration; the API refuses to start with missing or invalid settings.',
      node_pagination: 'Shared helpers that cap and standardise page sizes on list endpoints.',
      node_logger: 'Structured Pino logging that redacts credential-looking fields.',
      node_safaricom: 'Safaricom\u2019s Daraja API, which sends the STK Push prompt to the customer\u2019s phone and reports the result.',
      node_meta: 'Meta\u2019s WhatsApp Cloud API, which delivers customer messages by signed webhook and carries replies.',
    },
    loadDiagram: () => import('../diagrams/pos.mmd?raw'),
  },

  /* ───────────────────────── SmartStudy ───────────────────────── */
  {
    slug: 'smartstudy',
    ref: 'PRJ-02',
    name: 'SmartStudy',
    shortName: 'SmartStudy',
    tagline: 'Connecting study sessions, AI-assisted notes, quizzes, and progress tracking in one learning platform.',
    status: { label: 'Complete', kind: 'complete' },
    summary:
      'A full-stack learning platform with study sessions, AI-generated study notes, quizzes, progress tracking, shareable sessions and an admin interface.',
    overview: [
      'SmartStudy is a full-stack learning platform that joins several study workflows: a study dashboard, a quiz interface, a progress page, public shared sessions and an administrative interface. Browser-side JavaScript calls an Express API, which reads and writes MongoDB.',
      'AI-assisted features run through server-side helpers that request completions from the Groq API to produce study notes, while the same API handles quiz generation and results, progress tracking and session sharing.',
    ],
    engineeringValue: [
      'Frontend/backend communication: browser logic calls a single Express API.',
      'Persistent data: sessions, quizzes, results and progress live in MongoDB.',
      'AI service integration: generation is isolated in helper modules rather than scattered through route handlers.',
      'Multiple connected learning workflows with accounts, access management and an admin surface.',
    ],
    stack: [
      { group: 'Frontend', items: ['HTML pages', 'Browser-side JavaScript'] },
      { group: 'Backend', items: ['Node.js', 'Express API'] },
      { group: 'Data', items: ['MongoDB'] },
      { group: 'AI', items: ['Groq API'] },
    ],
    layers: [
      { name: 'Web experience', tone: 'toneBlue', items: ['Study dashboard', 'Quiz pages', 'Progress page', 'Public session', 'Admin page', 'Browser logic'] },
      { name: 'Study workflow', tone: 'toneAmber', items: ['Study sessions', 'AI study notes', 'Quiz generation & results', 'Progress tracking', 'Session sharing'] },
      { name: 'Application backend', tone: 'toneMint', items: ['Accounts & access', 'Admin management', 'Express API', 'AI helpers'] },
      { name: 'External services', tone: 'toneRose', items: ['MongoDB', 'Groq API'] },
    ],
    repo: 'https://github.com/cheekydavy/smartstudy',
    repoName: 'smartstudy',
    architectureNote: [
      'Learners use the dashboard, quiz and progress pages and the public session page; an administrator manages users through the admin page. The pages share one browser-side script that calls the Express API.',
      'The API reads and writes MongoDB and hands generation work to AI helpers, which request completions from the Groq API. Study sessions, notes, quizzes, results and progress are all served from the same backend.',
    ],
    legend: [
      { tone: 'toneBlue', label: 'Web experience', note: 'Pages and browser logic' },
      { tone: 'toneAmber', label: 'Study workflow', note: 'Sessions, notes, quizzes, progress' },
      { tone: 'toneMint', label: 'Application backend', note: 'Express API, accounts, AI helpers' },
      { tone: 'toneRose', label: 'External services', note: 'MongoDB and Groq API' },
      { tone: 'toneIndigo', label: 'Actors', note: 'Learner and administrator' },
    ],
    keySources: [
      { label: 'Express API · server.js', url: 'https://github.com/cheekydavy/smartstudy/blob/main/backend/server.js' },
      { label: 'AI helpers · utils.js', url: 'https://github.com/cheekydavy/smartstudy/blob/main/backend/utils.js' },
      { label: 'Browser logic · app.js', url: 'https://github.com/cheekydavy/smartstudy/blob/main/frontend/assets/app.js' },
      { label: 'Study dashboard', url: 'https://github.com/cheekydavy/smartstudy/blob/main/frontend/dashboard.html' },
      { label: 'Quiz page', url: 'https://github.com/cheekydavy/smartstudy/blob/main/frontend/quiz.html' },
    ],
    loadDiagram: () => import('../diagrams/smartstudy.mmd?raw'),
  },

  /* ───────────────────────── CampusMesh ───────────────────────── */
  {
    slug: 'campusmesh',
    ref: 'PRJ-03',
    name: 'CampusMesh',
    shortName: 'CampusMesh',
    tagline: 'Exploring how nearby devices could exchange messages without relying on conventional internet connectivity.',
    status: { label: 'Complete', kind: 'complete' },
    summary:
      'An Android app in Kotlin exploring offline campus communication: nearby-device discovery, chat, local storage and message encryption helpers.',
    overview: [
      'CampusMesh is a mobile application exploring offline campus communication. The Android app is built in Kotlin with onboarding, a nearby-devices screen, search, chat list and chat screens, and profile settings, coordinated by shared and mesh view models.',
      'A mesh service handles communication with nearby peers, using encryption and serialization helpers, while chat and message repositories persist data in a Room database alongside user and peer preferences.',
    ],
    engineeringValue: [
      'Clear separation between presentation, application coordination, messaging services and local persistence.',
      'View models that keep screen logic apart from the mesh service and the data layer.',
      'Local-first storage with Room, plus preferences for user and peer data.',
      'Networking concepts applied to a mobile context, with message helpers kept in their own utility layer.',
    ],
    stack: [
      { group: 'Mobile', items: ['Android', 'Kotlin'] },
      { group: 'Architecture', items: ['View models', 'Repositories', 'Mesh service'] },
      { group: 'Storage', items: ['Room database', 'User & peer preferences'] },
      { group: 'Messaging support', items: ['Encryption helpers', 'Serialization helpers'] },
    ],
    layers: [
      { name: 'User experience', tone: 'toneBlue', items: ['Main activity', 'Navigation', 'Onboarding', 'Nearby devices', 'Search', 'Chat list', 'Chat screen', 'Profile & settings'] },
      { name: 'App coordination', tone: 'toneAmber', items: ['Chat view models', 'Shared view model', 'Mesh view model'] },
      { name: 'Messaging & mesh', tone: 'toneMint', items: ['Mesh service', 'Chat & message models'] },
      { name: 'Local data', tone: 'toneRose', items: ['Chat & message repositories', 'Room database', 'User & peer preferences'] },
      { name: 'Message support', tone: 'toneIndigo', items: ['Encryption & serialization'] },
    ],
    repo: 'https://github.com/cheekydavy/campusmesh',
    repoName: 'campusmesh',
    architectureNote: [
      'The main activity hosts navigation, which routes to onboarding, nearby devices, search, chat list, chat and profile screens. Screens use the shared view model, the mesh view model or the chat view models, depending on what they need.',
      'The mesh view model coordinates the mesh service, which communicates with nearby peers and uses message helpers for encryption and serialization. Repositories persist chats and messages to the Room database; the shared view model reads user preferences.',
    ],
    legend: [
      { tone: 'toneBlue', label: 'User experience', note: 'Activity, navigation, screens, user' },
      { tone: 'toneAmber', label: 'App coordination', note: 'View models' },
      { tone: 'toneMint', label: 'Messaging & mesh', note: 'Mesh service and models' },
      { tone: 'toneRose', label: 'Local data', note: 'Repositories, Room, preferences' },
      { tone: 'toneIndigo', label: 'Support & peers', note: 'Message helpers and nearby peers' },
    ],
    keySources: [
      { label: 'Mesh service', url: 'https://github.com/cheekydavy/campusmesh/blob/master/app/src/main/java/com/example/campusmesh/service/MeshService.kt' },
      { label: 'Mesh view model', url: 'https://github.com/cheekydavy/campusmesh/blob/master/app/src/main/java/com/example/campusmesh/ui/viewmodel/MeshViewModel.kt' },
      { label: 'Shared view model', url: 'https://github.com/cheekydavy/campusmesh/blob/master/app/src/main/java/com/example/campusmesh/ui/viewmodel/SharedViewModel.kt' },
      { label: 'Room database', url: 'https://github.com/cheekydavy/campusmesh/blob/master/app/src/main/java/com/example/campusmesh/data/local/AppDatabase.kt' },
      { label: 'Main activity', url: 'https://github.com/cheekydavy/campusmesh/blob/master/app/src/main/java/com/example/campusmesh/ui/MainActivity.kt' },
    ],
    loadDiagram: () => import('../diagrams/campusmesh.mmd?raw'),
  },

  /* ───────────────────────── Mbuvi MD ───────────────────────── */
  {
    slug: 'mbuvimd',
    ref: 'PRJ-04',
    name: 'Mbuvi MD',
    shortName: 'Mbuvi MD',
    tagline: 'A modular WhatsApp automation platform built around extensible commands, messaging utilities, and backend integrations.',
    status: { label: 'Complete', kind: 'complete' },
    summary:
      'A Node.js WhatsApp automation and message-management system with a central command registry, modular plugins, PostgreSQL-backed configuration and a status dashboard.',
    overview: [
      'Mbuvi MD is a modular WhatsApp automation system. A bot runtime manages sessions and dispatches incoming events to a central command registry; feature plugins register themselves with that registry, so new commands can be added without touching the runtime.',
      'Plugins cover group administration, profile controls and messaging utilities, plus media features that use YouTube search and a download API. Owner settings and configuration are stored in PostgreSQL, and the runtime also serves a status dashboard to the browser.',
    ],
    engineeringValue: [
      'Extensibility: the command registry and plugin modules keep features independent of the bot runtime.',
      'Backend design: runtime, plugins, shared message/media sender, and services are separated.',
      'PostgreSQL-backed configuration that plugins read and write, loaded and seeded at startup.',
      'Integration with external services for WhatsApp, video search and downloads.',
    ],
    stack: [
      { group: 'Runtime', items: ['Node.js', 'Bot sessions', 'Command registry'] },
      { group: 'Data', items: ['PostgreSQL'] },
      { group: 'Integrations', items: ['WhatsApp', 'YouTube search', 'Download API'] },
      { group: 'Status', items: ['HTML dashboard'] },
    ],
    layers: [
      { name: 'Bot runtime', tone: 'toneBlue', items: ['Bot sessions', 'Command registry', 'Message & media sender'] },
      { name: 'WhatsApp features', tone: 'toneAmber', items: ['Group administration', 'Profile controls', 'Messaging utilities', 'Other commands'] },
      { name: 'Media services', tone: 'toneMint', items: ['Artist downloads', 'Media commands', 'Video commands', 'Social downloads', 'YouTube search/download'] },
      { name: 'Configuration & status', tone: 'toneRose', items: ['Owner settings', 'Config inspection', 'Alive response', 'Postgres configuration', 'Status dashboard'] },
      { name: 'External platforms', tone: 'toneIndigo', items: ['WhatsApp', 'YouTube search'] },
    ],
    repo: 'https://github.com/cheekydavy/mbuvimd-db',
    repoName: 'mbuvimd-db',
    architectureNote: [
      'WhatsApp delivers events to the bot runtime, which dispatches commands through the registry. Every plugin registers its commands with the registry, which is what makes the system extensible.',
      'Settings, config and alive commands read or write PostgreSQL through a database module that the runtime also loads and seeds. Media plugins share a YouTube service and the message/media sender; the runtime serves a status dashboard to browsers.',
    ],
    legend: [
      { tone: 'toneBlue', label: 'Runtime & actors', note: 'Bot sessions, registry, sender, user, browser' },
      { tone: 'toneAmber', label: 'Plugins & datastore', note: 'WhatsApp feature plugins and Postgres' },
      { tone: 'toneMint', label: 'Media services', note: 'Media plugins, YouTube service, download API' },
      { tone: 'toneRose', label: 'Configuration & status', note: 'Settings, config, database module, dashboard' },
      { tone: 'toneIndigo', label: 'External platforms', note: 'WhatsApp and YouTube search' },
    ],
    keySources: [
      { label: 'Bot runtime · index.js', url: 'https://github.com/cheekydavy/mbuvimd-db/blob/main/index.js' },
      { label: 'Command registry · command.js', url: 'https://github.com/cheekydavy/mbuvimd-db/blob/main/command.js' },
      { label: 'Database module', url: 'https://github.com/cheekydavy/mbuvimd-db/blob/main/lib/database.js' },
      { label: 'Message & media sender', url: 'https://github.com/cheekydavy/mbuvimd-db/blob/main/lib/msg.js' },
      { label: 'Plugins directory', url: 'https://github.com/cheekydavy/mbuvimd-db/tree/main/plugins' },
    ],
    loadDiagram: () => import('../diagrams/mbuvimd.mmd?raw'),
  },

  /* ───────────────────────── Kenya Airways ───────────────────────── */
  {
    slug: 'kenya-airways',
    ref: 'PRJ-05',
    name: 'Flight Management & Booking System',
    shortName: 'Flight Booking',
    tagline: 'A full-stack airline management application connecting flight operations, bookings, authentication, and reporting.',
    status: { label: 'Complete', kind: 'complete' },
    summary:
      'A React and Java full-stack system for flights, aircraft, passengers, crew matching, bookings, JWT-secured accounts and reports, backed by PostgreSQL.',
    overview: [
      'This full-stack project pairs a React frontend with a Java backend. The frontend routes customers and administrators through flight browsing, booking, booking management, booking inquiries, aircraft and flight management, passenger management, crew matching and reports.',
      'The backend exposes REST controllers that dispatch to services for users, bookings, flights, aircraft, employees and reports. JWT security protects access, and flights, bookings and users persist in PostgreSQL.',
    ],
    engineeringValue: [
      'Frontend/backend integration over REST, with an auth context on the client and JWT security on the server.',
      'Service-layer separation: controllers dispatch to focused services and repositories.',
      'Relational persistence for flights, bookings and users.',
      'Multi-step booking and operational workflows, including crew matching and reporting.',
    ],
    stack: [
      { group: 'Frontend', items: ['React', 'Auth context'] },
      { group: 'Backend', items: ['Java', 'REST controllers', 'JWT security'] },
      { group: 'Data', items: ['PostgreSQL', 'Repositories'] },
    ],
    layers: [
      { name: 'Web application', tone: 'toneBlue', items: ['React routes', 'Flight browsing', 'REST controllers'] },
      { name: 'Identity & access', tone: 'toneAmber', items: ['Auth context', 'Sign in & signup', 'User service', 'JWT security', 'User records', 'PostgreSQL'] },
      { name: 'Flight operations', tone: 'toneMint', items: ['Aircraft management', 'Flight creation', 'Passenger management', 'Crew matching', 'Flight / aircraft / employee services', 'Flight records'] },
      { name: 'Ticketing', tone: 'toneRose', items: ['Book flight', 'Manage booking', 'Booking inquiry', 'Booking service', 'Booking records'] },
      { name: 'Reports', tone: 'toneIndigo', items: ['Reports screen', 'Report service'] },
    ],
    repo: 'https://github.com/cheekydavy/kenya-airways',
    repoName: 'kenya-airways',
    architectureNote: [
      'Customers and administrators use the React app, whose routes cover sign-in, flight browsing, booking, booking management, inquiries, aircraft and flight management, passengers, crew matching and reports. Pages call the REST controllers, and sign-in is handled through a shared auth context.',
      'Controllers dispatch to user, booking, flight, employee and report services. The user service creates JWT tokens; the booking service reads and updates flight records; PostgreSQL stores flights, bookings and users.',
    ],
    legend: [
      { tone: 'toneBlue', label: 'Web application', note: 'React routes, browsing, REST controllers' },
      { tone: 'toneAmber', label: 'Identity & access', note: 'Auth, users, JWT, PostgreSQL' },
      { tone: 'toneMint', label: 'Flight operations', note: 'Aircraft, flights, passengers, crew' },
      { tone: 'toneRose', label: 'Ticketing', note: 'Booking screens, service, records' },
      { tone: 'toneIndigo', label: 'Reports & actors', note: 'Reporting, customer, administrator' },
    ],
    disclaimer: 'An independent portfolio project. It is not affiliated with, endorsed by or connected to Kenya Airways.',
    keySources: [
      { label: 'React routes · App.jsx', url: 'https://github.com/cheekydavy/kenya-airways/blob/main/frontend/src/App.jsx' },
      { label: 'Auth context', url: 'https://github.com/cheekydavy/kenya-airways/blob/main/frontend/src/context/AuthContext.jsx' },
      { label: 'JWT service', url: 'https://github.com/cheekydavy/kenya-airways/blob/main/backend/src/main/java/com/airways/airways/security/JwtService.java' },
      { label: 'Booking service', url: 'https://github.com/cheekydavy/kenya-airways/blob/main/backend/src/main/java/com/airways/airways/services/BookingService.java' },
      { label: 'Flight service', url: 'https://github.com/cheekydavy/kenya-airways/blob/main/backend/src/main/java/com/airways/airways/services/FlightService.java' },
    ],
    loadDiagram: () => import('../diagrams/kenya-airways.mmd?raw'),
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
