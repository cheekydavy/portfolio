import type { Project } from '../data/projects';
import { SectionHead } from './ui';

const capabilities: { name: string; text: string }[] = [
  { name: 'Checkout and sales', text: 'Split payments across methods, printable receipts, draft sales that can be resumed or discarded, and voids.' },
  { name: 'Products and inventory', text: 'A catalogue with SKU, prices, tax rates and reorder levels, on an append-only stock ledger with a balance per branch.' },
  { name: 'Purchasing and suppliers', text: 'Purchase orders from draft to received, partial receiving that posts stock movements, and supplier records.' },
  { name: 'Customers and receivables', text: 'Customer records, credit sales tied to a customer, and outstanding balances with aging.' },
  { name: 'Reporting', text: 'Sales, itemised sales, product performance, receivables, stock valuation and purchase spend, with CSV export and print.' },
  { name: 'Branch operations', text: 'Stock and sequential invoice and purchase-order numbers scoped to each branch.' },
  { name: 'Access control', text: 'Staff accounts and custom roles, with permissions enforced on the server and an audit log of mutating actions.' },
  { name: 'M-Pesa payments', text: 'STK Push from checkout or against an outstanding balance, confirmed and applied to the sale exactly once.' },
  { name: 'Customer messaging', text: 'A shared WhatsApp inbox on Meta’s Cloud API with customer matching, notes, assignment and attachments.' },
];

const mpesaSteps: { title: string; text: string }[] = [
  { title: 'Send the prompt', text: 'The cashier enters the customer’s phone at checkout or on a balance. The API validates the request and sends an STK Push through the Daraja client.' },
  { title: 'Customer approves', text: 'The attempt is stored as a pending transaction while the customer enters their M-Pesa PIN on their phone.' },
  { title: 'Confirm the result', text: 'Safaricom’s callback, status polling from the browser and a background reconciler each confirm the outcome; a callback is checked with Daraja before it is trusted.' },
  { title: 'Apply once', text: 'A confirmed payment is marked applied and recorded on the sale in a single database transaction, so it can never be counted twice.' },
];

const messaging: string[] = [
  'A shared inbox inside the POS for WhatsApp conversations, built on Meta’s Cloud API.',
  'Webhooks are signature-checked, saved first and then processed, and duplicate deliveries are ignored.',
  'Conversations are matched to customers by phone number, and staff can link one manually.',
  'Internal notes, conversation assignment, and pinned invoices with the customer’s balance in view.',
  'Attachments are stored and served only through an authenticated endpoint.',
];

const decisions: { name: string; text: string }[] = [
  { name: 'A ledger, not counters', text: 'Stock changes are immutable movements written in the same transaction as the sale or purchase behind them. Corrections are reversing entries, never edits.' },
  { name: 'Sale lines keep their own prices', text: 'Price and tax are copied onto each line and money is stored as exact decimals, so later catalogue changes never rewrite history.' },
  { name: 'Payments are applied exactly once', text: 'Three independent confirmation paths feed one atomic apply step, so a late callback and a poll can never double-count a payment.' },
  { name: 'Permissions on the server', text: 'Every endpoint checks the caller’s role permissions, and deactivating a staff account revokes its sessions.' },
  { name: 'An audit trail and quiet logs', text: 'Mutating actions record who did what and when, while request logs redact credential-looking fields.' },
  { name: 'Modules inside one API', text: 'Sales, inventory, purchasing, M-Pesa and communications are separate modules with a shared types package, in one pnpm workspace with the web app.' },
];

export function PosSections({ project }: { project: Project }) {
  return (
    <>
      <section className="section section--tight" aria-labelledby="pos-capabilities">
        <div className="wrap">
          <SectionHead index="03" label="CAPABILITIES" title="Core capabilities" lead={`${project.status.label}: every module below is built and working.`} />
          <div className="grid-2 backoffice" id="pos-capabilities">
            {capabilities.map((c) => (
              <article key={c.name} className="mini">
                <h3>{c.name}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="pos-mpesa">
        <div className="wrap">
          <SectionHead index="04" label="PAYMENTS" title="M-Pesa integration" lead="Safaricom Daraja STK Push, complete." />
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

      <section className="section section--tight" aria-labelledby="pos-messaging">
        <div className="wrap">
          <SectionHead index="05" label="COMMUNICATIONS" title="Customer messaging" lead="WhatsApp conversations, connected to customer records and invoices." />
          <ul className="ticks ticks--lg" id="pos-messaging">
            {messaging.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="pos-decisions">
        <div className="wrap">
          <SectionHead index="06" label="ENGINEERING" title="Engineering decisions" />
          <div className="grid-2 backoffice" id="pos-decisions">
            {decisions.map((d) => (
              <article key={d.name} className="mini">
                <h3>{d.name}</h3>
                <p>{d.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
