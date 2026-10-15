import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Project } from '../data/projects';
import { parseDiagram } from '../lib/diagram';
import { initMermaid } from '../lib/mermaidTheme';
import type { MermaidLike } from '../lib/mermaidTheme';
import { IconArrowUpRight, IconFit, IconGithub, IconMinus, IconPlus } from './Icons';
import { Ext } from './ui';

const MIN_SCALE = 0.2;
const MAX_SCALE = 2.5;
const STEP = 1.2;
const clamp = (n: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));

/** The repository-derived architecture diagram, shown inline on a project page (Mermaid loads on demand). */
export default function InlineDiagram({ project }: { project: Project }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [base, setBase] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(1);

  const vpRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const drag = useRef({ active: false, x: 0, y: 0, sl: 0, st: 0 });

  useEffect(() => {
    let cancelled = false;
    const uid = `inline-${project.slug}-${Date.now()}`;
    setStatus('loading');
    (async () => {
      try {
        const [{ default: source }, mod] = await Promise.all([project.loadDiagram(), import('mermaid')]);
        const model = parseDiagram(source);
        const mermaid = mod.default as unknown as MermaidLike;
        initMermaid(mermaid);
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

  const fitWidth = useCallback((b: { w: number; h: number }) => {
    const vp = vpRef.current;
    if (!vp) return 1;
    return (vp.clientWidth - 24) / b.w;
  }, []);

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
    // Fit the width, but keep labels readable on narrow screens (the viewport scrolls).
    setScale(Math.min(1, Math.max(0.45, fitWidth(b))));
  }, [status, svgMarkup, fitWidth]);

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
    setScale(clamp(fitWidth(base)));
    const vp = vpRef.current;
    if (vp) {
      vp.scrollLeft = 0;
      vp.scrollTop = 0;
    }
  }, [base, fitWidth]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const vp = vpRef.current;
    if (!vp) return;
    drag.current = { active: true, x: e.clientX, y: e.clientY, sl: vp.scrollLeft, st: vp.scrollTop };
    vp.classList.add('is-panning');
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const vp = vpRef.current;
    if (!d.active || !vp) return;
    vp.scrollLeft = d.sl - (e.clientX - d.x);
    vp.scrollTop = d.st - (e.clientY - d.y);
  };
  const endDrag = () => {
    drag.current.active = false;
    vpRef.current?.classList.remove('is-panning');
  };

  const ready = status === 'ready';

  return (
    <figure className="inline-diagram">
      <div className="toolbar" role="toolbar" aria-label="Diagram controls">
        <button type="button" className="btn btn--sm btn--icon" onClick={() => zoomTo(scale / STEP)} aria-label="Zoom out" disabled={!ready}>
          <IconMinus />
        </button>
        <output className="toolbar__pct" aria-live="polite">
          {Math.round(scale * 100)}%
        </output>
        <button type="button" className="btn btn--sm btn--icon" onClick={() => zoomTo(scale * STEP)} aria-label="Zoom in" disabled={!ready}>
          <IconPlus />
        </button>
        <button type="button" className="btn btn--sm" onClick={fit} disabled={!ready}>
          <IconFit /> Fit
        </button>
        <span className="toolbar__hint">Architecture generated from the repository · drag to pan</span>
      </div>
      <div
        className="viewport"
        ref={vpRef}
        tabIndex={0}
        role="group"
        aria-label={`${project.shortName} architecture diagram. Scroll or drag to move around.`}
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
              <strong>The diagram could not be rendered here.</strong> You can still explore the components, or open the repository.
            </p>
            <Ext className="btn btn--primary" href={project.repo}>
              <IconGithub /> Open {project.repoName} on GitHub <IconArrowUpRight />
            </Ext>
          </div>
        ) : null}
        {ready ? (
          <div
            ref={hostRef}
            className="arch-host"
            style={base ? { width: base.w * scale, height: base.h * scale } : undefined}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : null}
      </div>
    </figure>
  );
}
