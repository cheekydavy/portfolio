import { aboutDomains, aboutParagraphs } from '../data/site';
import { Reveal, SectionHead } from './ui';

export function About() {
  return (
    <section id="about" className="section">
      <div className="wrap">
        <SectionHead index="01" label="ABOUT" title="Systems, end to end." />
        <div className="about">
          <Reveal className="about__text">
            {aboutParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
          <Reveal delay={120} className="about__side">
            <h3 className="mono-label">WORK SPANS</h3>
            <ol className="domains">
              {aboutDomains.map((d, i) => (
                <li key={d}>
                  <span className="domains__n">{String(i + 1).padStart(2, '0')}</span>
                  {d}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
