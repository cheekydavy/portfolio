import { useEffect, useState } from 'react';
import { GITHUB_URL } from '../data/projects';
import { IconClose, IconGithub, IconMenu } from './Icons';
import { Ext } from './ui';

const links = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar({ onHome }: { onHome: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!onHome || typeof IntersectionObserver === 'undefined') {
      setActive('');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [onHome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="wrap nav__bar">
        <a className="nav__brand" href="/#top" onClick={() => setOpen(false)} aria-label="David Muumbi Mbuvi, back to top">
          <span className="nav__mark" aria-hidden="true">
            DM
          </span>
          <span className="nav__name">David Muumbi Mbuvi</span>
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} id="primary-nav" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              className={active === l.id ? 'is-active' : undefined}
              aria-current={active === l.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Ext href={GITHUB_URL} className="nav__gh">
            <IconGithub /> GitHub
          </Ext>
        </nav>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>
    </header>
  );
}
