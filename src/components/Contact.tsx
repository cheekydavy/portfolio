import { useState } from 'react';
import { GITHUB_URL } from '../data/projects';
import { person } from '../data/site';
import { IconCheck, IconCopy, IconGithub, IconMail, IconPhone } from './Icons';
import { Ext, Reveal } from './ui';

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  };

  return (
    <section id="contact" className="section contact">
      <div className="wrap">
        <Reveal>
          <p className="mono-label">
            <span className="sec-head__idx">05</span> / CONTACT
          </p>
          <h2 className="contact__title">Let&apos;s build something useful.</h2>
          <p className="contact__lead">
            Have an interesting project, idea, or technical problem worth solving? I&apos;d love to hear about it.
          </p>
          <ul className="contact__list">
            <li>
              <a href={`mailto:${person.email}`} className="contact__row">
                <IconMail />
                <span className="mono-label">EMAIL</span>
                <span className="contact__val">{person.email}</span>
              </a>
              <button type="button" className="btn btn--sm btn--icon" onClick={copy} aria-label="Copy email address">
                {copied ? <IconCheck /> : <IconCopy />}
              </button>
              <span className="visually-hidden" role="status">
                {copied ? 'Email address copied' : ''}
              </span>
            </li>
            <li>
              <a href={person.phoneHref} className="contact__row">
                <IconPhone />
                <span className="mono-label">PHONE</span>
                <span className="contact__val">{person.phone}</span>
              </a>
            </li>
            <li>
              <Ext href={GITHUB_URL} className="contact__row">
                <IconGithub />
                <span className="mono-label">GITHUB</span>
                <span className="contact__val">github.com/cheekydavy</span>
              </Ext>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
