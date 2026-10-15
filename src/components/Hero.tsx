import { heroCopy, person } from '../data/site';
import { GITHUB_URL } from '../data/projects';
import { IconArrowRight, IconGithub, IconMail } from './Icons';
import { Ext } from './ui';
import { SystemViz } from './SystemViz';

const facts: [string, string][] = [
  ['Studying', 'BSc Computer Science · Year 4'],
  ['University', 'Moi University'],
  ['Attachment', 'Infix Africa Limited · 3 months'],
  ['Certified', 'Cisco Networking Essentials · Network Engineering Basics'],
];

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="hero__name">
            <span className="hero__tick" aria-hidden="true" />
            DAVID MUUMBI MBUVI
          </p>
          <p className="hero__aka mono-label">David Mbuvi · Mbuvi Tech</p>
          <h1>
            I build software that <span className="grad">solves real problems.</span>
          </h1>
          <p className="hero__lead">{heroCopy}</p>
          <p className="hero__tags mono-label">FULL-STACK DEVELOPMENT · SYSTEMS THINKING · PRACTICAL ENGINEERING</p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="/#projects">
              Explore My Projects <IconArrowRight />
            </a>
            <Ext className="btn" href={GITHUB_URL}>
              <IconGithub /> View GitHub
            </Ext>
            <a className="btn" href="/#contact">
              <IconMail /> Contact Me
            </a>
          </div>
        </div>
        <div className="hero__viz" aria-hidden={false}>
          <SystemViz />
        </div>
      </div>

      <div className="wrap">
        <dl className="facts">
          {facts.map(([k, v]) => (
            <div key={k} className="facts__row">
              <dt className="mono-label">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="visually-hidden">{person.title}</p>
      </div>
    </section>
  );
}
