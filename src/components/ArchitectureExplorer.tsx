import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '../data/projects';
import { TONES } from '../data/tones';
import { parseDiagram, pathFromUrl } from '../lib/diagram';
import type { DiagramNode, ParsedDiagram } from '../lib/diagram';
import { initMermaid } from '../lib/mermaidTheme';
import type { MermaidLike } from '../lib/mermaidTheme';
import { IconClose, IconFit, IconGithub, IconMinus, IconPlus, IconArrowUpRight } from './Icons';
import { LayerStack } from './LayerStack';
import { Ext } from './ui';

const MIN_SCALE = 0.15;
const MAX_SCALE = 2.5;
const STEP = 1.2;
const clamp = (n: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));

function nodeIdOf(el: Element): string | null {
  const data = el.getAttribute('data-id');
  if (data && data.startsWith('node_')) return data;
  const m = /^(?:.*?)flowchart-(.+)-\d+$/.exec(el.id);
  return m ? m[1] : null;
}

interface Props {
  project: Project;
  onClose: () => void;
}

export default function ArchitectureExplorer({ project, onClose }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [parsed, setParsed] = useState<ParsedDiagram | null>(null);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [base, setBase] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const scaleRef = useRef(scale);
  const drag = useRef({ active: false, moved: false, x: 0, y: 0, sl: 0, st: 0 });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  scaleRef.current = scale;

  /* ── modal behaviour: focus trap, scroll lock, inert background, Esc ── */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const d = dialogRef.current;
      if (!d) return;
      const focusables = d.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      root?.removeAttribute('inert');
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  /* ── load Mermaid on demand and render the repository-derived diagram ── */
  useEffect(() => {
    let cancelled = false;
    const uid = `arch-${project.slug}-${Date.now()}`;
    setStatus('loading');
    setSelected(null);

    (async () => {
      let model: ParsedDiagram | null = null;
      try {
        const [{ default: source }, mod] = await Promise.all([project.loadDiagram(), import('mermaid')]);
        model = parseDiagram(source);
        if (!cancelled) setParsed(model);
        const mermaid = mod.default as unknown as MermaidLike;
        initMermaid(mermaid);
        // Mermaid measures label text at render time: make sure the diagram font is ready first.
        try {
          await document.fonts?.load('13px "JetBrains Mono"');
        } catch {
          /* fall back to the system monospace stack */
        }
        const { svg } = await mermaid.render(uid, model.renderSource);
        if (cancelled) return;
        setSvgMarkup(svg);
        setStatus('ready');
      } catch {
        document.getElementById(`d${uid}`)?.remove();
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [project]);

  const fitScale = useCallback((b: { w: number; h: number }) => {
    const vp = vpRef.current;
    if (!vp) return 1;
    const pad = 32;
    return Math.min((vp.clientWidth - pad) / b.w, (vp.clientHeight - pad) / b.h);
  }, []);

  /* ── measure the rendered SVG once ── */
  useLayoutEffect(() => {
    if (status !== 'ready') return;
    const svg = hostRef.current?.querySelector('svg');
    if (!svg) return;
    let w = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal.width : 0;
    let h = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal.height : 0;
    if (!w || !h) {
      const r = svg.getBoundingClientRect();
      w = r.width;
      h = r.height;
    }
    svg.removeAttribute('style');
    svg.classList.add('arch-svg');
    const b = { w, h };
    setBase(b);
    centerRef.current = null;
    // Readable by default: fit to the viewport, but never smaller than 45% so labels stay legible.
    setScale(Math.min(1, Math.max(0.45, fitScale(b))));
  }, [status, svgMarkup, fitScale]);

  /* ── apply size, then restore the zoom anchor ── */
  useLayoutEffect(() => {
    const svg = hostRef.current?.querySelector('svg');
    if (svg && base) {
      svg.setAttribute('width', String(base.w * scale));
      svg.setAttribute('height', String(base.h * scale));
    }
  }, [base, scale]);

  useLayoutEffect(() => {
    const c = centerRef.current;
    const vp = vpRef.current;
    if (c && vp) {
      vp.scrollLeft = c.x * scale - vp.clientWidth / 2;
      vp.scrollTop = c.y * scale - vp.clientHeight / 2;
      centerRef.current = null;
    }
  }, [scale]);

  const zoomTo = useCallback((next: number) => {
    const vp = vpRef.current;
    const s = scaleRef.current;
    if (vp) {
      centerRef.current = { x: (vp.scrollLeft + vp.clientWidth / 2) / s, y: (vp.scrollTop + vp.clientHeight / 2) / s };
    }
    setScale(clamp(next));
  }, []);

  const fit = useCallback(() => {
    if (!base) return;
    centerRef.current = null;
    setScale(clamp(fitScale(base)));
    const vp = vpRef.current;
    if (vp) {
      vp.scrollLeft = 0;
      vp.scrollTop = 0;
    }
  }, [base, fitScale]);

  /* ── Ctrl/⌘ + wheel zoom (non-passive so the page does not zoom) ── */
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      zoomTo(scaleRef.current * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, [zoomTo]);

  /* ── highlight the selected component and its direct connections ── */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !parsed || status !== 'ready') return;
    const neighbours = new Set<string>();
    const prefixes: string[] = [];
    if (selected) {
      neighbours.add(selected);
      for (const e of parsed.edges) {
        if (e.from === selected || e.to === selected) {
          neighbours.add(e.from);
          neighbours.add(e.to);
          prefixes.push(`L_${e.from}_${e.to}_`, `L-${e.from}-${e.to}-`);
        }
      }
    }
    host.querySelectorAll<SVGGElement>('g.node').forEach((el) => {
      const id = nodeIdOf(el);
      el.classList.toggle('is-selected', !!selected && id === selected);
      el.classList.toggle('is-dim', !!selected && !!id && !neighbours.has(id));
    });
    host.querySelectorAll<SVGPathElement>('path').forEach((p) => {
      if (!/^L[_-]/.test(p.id)) return;
      const hot = prefixes.some((pre) => p.id.startsWith(pre));
      p.classList.toggle('is-hot', hot);
      p.classList.toggle('is-dim', !!selected && !hot);
    });
  }, [selected, parsed, status, svgMarkup]);

  const revealNode = useCallback((id: string) => {
    const vp = vpRef.current;
    const host = hostRef.current;
    if (!vp || !host) return;
    const el = Array.from(host.querySelectorAll<SVGGElement>('g.node')).find((n) => nodeIdOf(n) === id);
    if (!el) return;
    const nr = el.getBoundingClientRect();
    const vr = vp.getBoundingClientRect();
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    vp.scrollBy({
      left: nr.left + nr.width / 2 - (vr.left + vr.width / 2),
      top: nr.top + nr.height / 2 - (vr.top + vr.height / 2),
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  const selectFromList = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
    revealNode(id);
  };

  /* ── pointer interaction on the diagram ── */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const vp = vpRef.current;
    if (!vp) return;
    drag.current = { active: true, moved: false, x: e.clientX, y: e.clientY, sl: vp.scrollLeft, st: vp.scrollTop };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const vp = vpRef.current;
    if (!d.active || !vp) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 4) {
      d.moved = true;
      vp.classList.add('is-panning');
    }
    if (d.moved) {
      vp.scrollLeft = d.sl - dx;
      vp.scrollTop = d.st - dy;
    }
  };
  const endDrag = () => {
    drag.current.active = false;
    vpRef.current?.classList.remove('is-panning');
  };
  const onHostClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) return;
    const g = (e.target as Element).closest('g.node');
    const id = g ? nodeIdOf(g) : null;
    setSelected(id ? (prev) => (prev === id ? null : id) : null);
  };
  const onViewportKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomTo(scaleRef.current * STEP);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      zoomTo(scaleRef.current / STEP);
    } else if (e.key === '0') {
      e.preventDefault();
      fit();
    }
  };

  /* ── derived data for the side panel ── */
  const grouped = useMemo(() => {
    if (!parsed) return [];
    const map = new Map<string, DiagramNode[]>();
    parsed.groups.forEach((g) => map.set(g, []));
    const other: DiagramNode[] = [];
    parsed.nodes.forEach((n) => {
      const bucket = n.group ? map.get(n.group) : undefined;
      if (bucket) bucket.push(n);
      else other.push(n);
    });
    const out = Array.from(map, ([name, nodes]) => ({ name, nodes }));
    if (other.length) out.push({ name: 'Actors, data stores & external', nodes: other });
    return out;
  }, [parsed]);

  const sources = useMemo(() => {
    if (!parsed) return project.keySources.map((s) => ({ url: s.url, path: pathFromUrl(s.url), names: [s.label] }));
    const byUrl = new Map<string, { url: string; path: string; names: string[] }>();
    parsed.nodes.forEach((n) => {
      if (!n.url) return;
      const hit = byUrl.get(n.url);
      if (hit) hit.names.push(n.title);
      else byUrl.set(n.url, { url: n.url, path: pathFromUrl(n.url), names: [n.title] });
    });
    return Array.from(byUrl.values()).sort((a, b) => a.path.localeCompare(b.path));
  }, [parsed, project]);

  const selectedNode = selected && parsed ? parsed.nodes.get(selected) : undefined;
  const legendFor = (tone?: string) => project.legend.find((l) => l.tone === tone);

  const connections = useMemo(() => {
    if (!parsed || !selected) return { out: [], inc: [] };
    return {
      out: parsed.edges.filter((e) => e.from === selected),
      inc: parsed.edges.filter((e) => e.to === selected),
    };
  }, [parsed, selected]);

  const titleOf = (id: string) => parsed?.nodes.get(id)?.title ?? id;

  return createPortal(
    <div className="explorer" role="dialog" aria-modal="true" aria-labelledby="explorer-title" ref={dialogRef}>
      <header className="explorer__head">
        <div className="explorer__title">
          <p className="mono-label">ARCHITECTURE EXPLORER · {project.ref}</p>
          <h2 id="explorer-title">{project.name}</h2>
        </div>
        <div className="explorer__head-actions">
          <Ext className="btn btn--sm" href={project.repo}>
            <IconGithub /> <span className="hide-sm">Repository</span>
          </Ext>
          <button ref={closeRef} type="button" className="btn btn--sm btn--primary" onClick={() => onCloseRef.current()}>
            <IconClose /> Close
          </button>
        </div>
      </header>

      <div className="explorer__body">
        <section className="stage" aria-label="Architecture diagram">
          <div className="toolbar" role="toolbar" aria-label="Diagram controls">
            <button type="button" className="btn btn--sm btn--icon" onClick={() => zoomTo(scale / STEP)} aria-label="Zoom out" disabled={status !== 'ready'}>
              <IconMinus />
            </button>
            <output className="toolbar__pct" aria-live="polite">
              {Math.round(scale * 100)}%
            </output>
            <button type="button" className="btn btn--sm btn--icon" onClick={() => zoomTo(scale * STEP)} aria-label="Zoom in" disabled={status !== 'ready'}>
              <IconPlus />
            </button>
            <button type="button" className="btn btn--sm" onClick={fit} disabled={status !== 'ready'}>
              <IconFit /> Fit
            </button>
            <button type="button" className="btn btn--sm" onClick={() => zoomTo(1)} disabled={status !== 'ready'}>
              100%
            </button>
            <span className="toolbar__hint">Click a component · drag to pan · Ctrl/⌘ + scroll to zoom</span>
          </div>

          <div
            className="viewport"
            ref={vpRef}
            tabIndex={0}
            role="group"
            aria-label="Diagram viewport. Use plus and minus to zoom, 0 to fit, and arrow keys to scroll."
            onKeyDown={onViewportKey}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
          >
            {status === 'loading' ? <p className="stage__msg">Rendering architecture…</p> : null}
            {status === 'error' ? (
              <div className="stage__msg stage__msg--error" role="alert">
                <p>
                  <strong>The diagram could not be rendered here.</strong> The component list and source files are still available, and
                  the full repository is one click away.
                </p>
                <Ext className="btn btn--primary" href={project.repo}>
                  <IconGithub /> Open {project.repoName} on GitHub <IconArrowUpRight />
                </Ext>
                <div className="stage__fallback">
                  <LayerStack layers={project.layers} compact />
                </div>
              </div>
            ) : null}
            {status === 'ready' ? (
              <div
                ref={hostRef}
                className="arch-host"
                style={base ? { width: base.w * scale, height: base.h * scale } : undefined}
                onClick={onHostClick}
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            ) : null}
          </div>

          <div className="legend" aria-label="Legend">
            <p className="mono-label">LEGEND</p>
            <ul className="legend__tones">
              {project.legend.map((l) => (
                <li key={l.tone}>
                  <span className="swatch" style={{ background: TONES[l.tone].fill, borderColor: TONES[l.tone].stroke }} aria-hidden="true" />
                  <span>
                    <strong>{l.label}</strong>
                    <small>{l.note}</small>
                  </span>
                </li>
              ))}
            </ul>
            <p className="legend__lines">
              <span className="legend__line" aria-hidden="true" /> primary flow
              <span className="legend__line legend__line--dash" aria-hidden="true" /> supporting / indirect relationship ·{' '}
              circle = actor · cylinder = data store · hexagon = external platform
            </p>
          </div>
        </section>

        <aside className="side" aria-label="Architecture details">
          <section className="side__block">
            <p className="mono-label">ABOUT THIS DIAGRAM</p>
            {project.architectureNote.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="side__small">
              Generated from the repository with GitDiagram. It shows structure, not a guarantee that every path is deployed or complete.
            </p>
          </section>

          <section className="side__block" aria-live="polite">
            <p className="mono-label">INSPECTOR</p>
            {selectedNode ? (
              <div className="inspector">
                <h3>{selectedNode.title}</h3>
                {selectedNode.file ? <code className="inspector__file">{selectedNode.file}</code> : null}
                {legendFor(selectedNode.tone) ? <p className="inspector__layer">{legendFor(selectedNode.tone)?.label}</p> : null}
                {connections.out.length ? (
                  <>
                    <h4 className="mono-label">OUTGOING</h4>
                    <ul className="inspector__links">
                      {connections.out.map((e) => (
                        <li key={`o-${e.to}-${e.label}`}>
                          <span>{e.label}</span> →{' '}
                          <button type="button" onClick={() => selectFromList(e.to)}>
                            {titleOf(e.to)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {connections.inc.length ? (
                  <>
                    <h4 className="mono-label">INCOMING</h4>
                    <ul className="inspector__links">
                      {connections.inc.map((e) => (
                        <li key={`i-${e.from}-${e.label}`}>
                          <button type="button" onClick={() => selectFromList(e.from)}>
                            {titleOf(e.from)}
                          </button>{' '}
                          → <span>{e.label}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {selectedNode.url ? (
                  <Ext className="btn btn--sm" href={selectedNode.url}>
                    View source <IconArrowUpRight />
                  </Ext>
                ) : null}
              </div>
            ) : (
              <p className="side__small">Select a component in the diagram or the list below to see what it connects to.</p>
            )}
          </section>

          {grouped.length ? (
            <section className="side__block">
              <p className="mono-label">COMPONENTS</p>
              {grouped.map((g) => (
                <div key={g.name} className="comp-group">
                  <h3>{g.name}</h3>
                  <ul>
                    {g.nodes.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className="comp"
                          aria-pressed={selected === n.id}
                          style={n.tone && TONES[n.tone] ? { borderColor: TONES[n.tone].stroke } : undefined}
                          onClick={() => selectFromList(n.id)}
                          disabled={status !== 'ready'}
                        >
                          {n.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ) : null}

          <section className="side__block">
            <p className="mono-label">SOURCE FILES</p>
            <ul className="srclist">
              {sources.map((s) => (
                <li key={s.url}>
                  <Ext href={s.url}>
                    <span>{s.names.join(' · ')}</span>
                    <code>{s.path}</code>
                  </Ext>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
