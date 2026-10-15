import type { Project } from '../data/projects';
import { SectionHead } from './ui';

type State = 'completed' | 'documented' | 'planned';

const stateLabel: Record<State, string> = {
  completed: 'Completed',
  documented: 'In repository architecture',
  planned: 'Planned',
};

const implementation: { area: string; detail: string; state: State }[] = [
  { area: 'Web application', detail: 'POS checkout, customer records, reports, inventory, purchasing and an M-Pesa payment interface.', state: 'documented' },
  { area: 'API workflows', detail: 'API application, sales routes, sales controller and M-Pesa controller.', state: 'documented' },
  { area: 'Business operations', detail: 'Services for sales, product catalog, inventory, customers, purchasing, suppliers, reports and M-Pesa transactions.', state: 'documented' },
  { area: 'Platform services', detail: 'Authentication, staff accounts, roles and permissions, and the Prisma client.', state: 'documented' },
  { area: 'Persistence', detail: 'PostgreSQL, with the services persisting their own domain data.', state: 'documented' },
  { area: 'M-Pesa integration', detail: 'Safaricom Daraja payment workflows: controller, service, transaction persistence and callback flow.', state: 'completed' },
  { area: 'Integrated communication module', detail: 'WhatsApp and other social platforms connected to the POS. Not yet implemented.', state: 'planned' },
];

const mpesaSteps: { title: string; text: string }[] = [
  { title: 'Start a payment', text: 'Staff open the M-Pesa page in the web app and start a payment, which is sent to the API application.' },
  { title: 'Route to the controller', text: 'The API application mounts the M-Pesa controller, which receives the request.' },
  { title: 'Run the payment logic', text: 'The controller calls the M-Pesa service, which stores transactions in PostgreSQL.' },
  { title: 'Safaricom calls back', text: 'Safaricom Daraja sends a callback into the M-Pesa controller, completing the flow.' },
];

const saleChain = ['Staff user', 'POS checkout', 'API application', 'Sales routes', 'Sales controller', 'Sales service', 'PostgreSQL'];

const backOffice: { name: string; how: string }[] = [
  { name: 'Inventory', how: 'Stock is managed from the web inventory page and stored by the inventory service.' },
  { name: 'Purchasing & suppliers', how: 'Purchase orders and suppliers are managed through the API and stored in PostgreSQL.' },
  { name: 'Customers', how: 'Customer records are managed from the web app and stored by the customers service.' },
  { name: 'Reports', how: 'The reports page requests data that the reports service reads from stored records.' },
  { name: 'Access', how: 'Authentication, staff accounts and roles are separate platform services.' },
];

export function PosSections({ project }: { project: Project }) {
  return (
    <>
      <section className="section section--tight" aria-labelledby="pos-status">
        <div className="wrap">
          <SectionHead index="03" label="STATUS" title="Current implementation status" />
          <p className="callout" id="pos-status">
            <strong>{project.status.label}.</strong> The M-Pesa integration is complete according to the current project status. The
            communication module is the remaining major module and is not built yet. This page makes no claims about transaction
            volumes, production deployment or financial performance.
          </p>
          <ul className="status-list">
            {implementation.map((row) => (
              <li key={row.area} className={`status-list__row is-${row.state}`}>
                <span className="status-list__pill">{stateLabel[row.state]}</span>
                <div>
                  <h3>{row.area}</h3>
                  <p>{row.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="pos-mpesa">
        <div className="wrap">
          <SectionHead index="04" label="PAYMENTS" title="M-Pesa integration" lead="Completed integration with Safaricom Daraja, as documented in the repository architecture." />
          <ol className="steps" id="pos-mpesa">
            {mpesaSteps.map((s, i) => (
              <li key={s.title} className="steps__item">
                <span className="steps__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="pos-workflow">
        <div className="wrap">
          <SectionHead index="05" label="WORKFLOW" title="Business workflow overview" />
          <h3 className="mono-label" id="pos-workflow">
            A SALE, END TO END
          </h3>
          <ol className="chain" aria-label="Path of a sale through the system">
            {saleChain.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
          <div className="grid-2 backoffice">
            {backOffice.map((b) => (
              <article key={b.name} className="mini">
                <h3>{b.name}</h3>
                <p>{b.how}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="pos-roadmap">
        <div className="wrap">
          <SectionHead index="06" label="ROADMAP" title="Communication-module roadmap" />
          <div className="roadmap" id="pos-roadmap">
            <ol className="roadmap__track">
              <li className="is-done">
                <span className="roadmap__mark" aria-hidden="true" />
                <div>
                  <h3>Core POS and business operations</h3>
                  <p>Checkout, inventory, purchasing, customers, reports, staff accounts and roles.</p>
                </div>
              </li>
              <li className="is-done">
                <span className="roadmap__mark" aria-hidden="true" />
                <div>
                  <h3>M-Pesa payments</h3>
                  <p>Safaricom Daraja integration. Completed.</p>
                </div>
              </li>
              <li className="is-next">
                <span className="roadmap__mark" aria-hidden="true" />
                <div>
                  <h3>Integrated communication module</h3>
                  <p>Planned: bring WhatsApp and other social communication platforms into the POS experience.</p>
                </div>
              </li>
            </ol>
            <div className="roadmap__vision">
              <p className="mono-label">PRODUCT VISION</p>
              <p>
                A business should be able to manage sales, inventory, payments and customer communication within one connected
                operational platform.
              </p>
              <p className="roadmap__note">
                WhatsApp messaging, social-platform integrations, automated responses and a unified inbox are not implemented inside
                the POS yet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
