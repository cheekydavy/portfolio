import { useEffect, useRef, useState } from 'react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMotion';
import { formatMonthYear, useRepoMeta } from '../lib/github';

/** External link with safe defaults. */
export function Ext({ children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a {...rest} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** Section header with a drafting-style index marker. */
export function SectionHead({
  index,
  label,
  title,
  lead,
}: {
  index: string;
  label: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="sec-head">
      <p className="mono-label">
        <span className="sec-head__idx">{index}</span> / {label}
      </p>
      <h2>{title}</h2>
      {lead ? <p className="sec-head__lead">{lead}</p> : null}
    </header>
  );
}

/** Fades content in once. Content is always visible when motion is reduced or IntersectionObserver is missing. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const supported = typeof IntersectionObserver !== 'undefined';
  const [shown, setShown] = useState(!supported || reduced);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ kind, label }: { kind: 'active' | 'complete'; label: string }) {
  return (
    <span className={`status status--${kind}`}>
      <span className="status__led" aria-hidden="true" />
      {label}
    </span>
  );
}

/** Live GitHub metadata (language, last push). Renders nothing if GitHub cannot be reached. */
export function RepoMeta({ repo }: { repo: string }) {
  const meta = useRepoMeta(repo);
  if (!meta || (!meta.language && !meta.pushedAt)) return null;
  const when = meta.pushedAt ? formatMonthYear(meta.pushedAt) : '';
  return (
    <span className="repo-meta">
      {meta.language ? <span>{meta.language}</span> : null}
      {meta.language && when ? <span aria-hidden="true"> · </span> : null}
      {when ? <span>Updated {when}</span> : null}
    </span>
  );
}
