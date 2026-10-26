import { attachment, certifications, company, person } from '../data/site';
import { Ext, Reveal, SectionHead } from './ui';

export function Experience() {
  return (
    <section id="experience" className="section">
      <div className="wrap">
        <SectionHead index="04" label="EXPERIENCE" title="Experience." />
        <Reveal>
          <ol className="timeline">
            <li className="timeline__item">
              <span className="timeline__node" aria-hidden="true" />
              <div className="timeline__card">
                <p className="mono-label">{company.role.toUpperCase()}</p>
                <h3>{company.name}</h3>
                <p className="timeline__lead">
                  Founder of a Kenyan software and technology company building business software and delivering web, security and network services.
                </p>
                <ul className="ticks">
                  <li>Kensync POS: point-of-sale and business management system with M-Pesa STK Push payments</li>
                  <li>Custom software, web development, cybersecurity and network solutions</li>
                  <li>
                    <Ext href={company.url}>{company.host}</Ext>
                  </li>
                </ul>
              </div>
            </li>
            <li className="timeline__item">
              <span className="timeline__node" aria-hidden="true" />
              <div className="timeline__card">
                <p className="mono-label">{attachment.role.toUpperCase()} · {attachment.duration.toUpperCase()}</p>
                <h3>{attachment.org}</h3>
                <p className="timeline__lead">
                  Three months of hands-on exposure to how software, networks and hardware come together in a working business.
                </p>
                <ul className="ticks">
                  {attachment.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </li>
          </ol>
        </Reveal>

        <div className="edu" id="education">
          <Reveal>
            <article className="edu__card">
              <p className="mono-label">EDUCATION</p>
              <h3>{person.university}</h3>
              <p>Bachelor of Science in Computer Science — Fourth Year.</p>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article className="edu__card">
              <p className="mono-label">CERTIFICATIONS</p>
              <ul className="ticks">
                {certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
