import { usePrefersReducedMotion } from '../hooks/useMotion';

interface N {
  id: string;
  x: number;
  y: number;
  w: number;
  label: string;
  sub: string;
}

const H = 46;
const nodes: N[] = [
  { id: 'client', x: 6, y: 142, w: 92, label: 'CLIENT', sub: 'interface' },
  { id: 'api', x: 134, y: 142, w: 92, label: 'API', sub: 'routes' },
  { id: 'auth', x: 134, y: 30, w: 92, label: 'AUTH', sub: 'access' },
  { id: 'ext', x: 134, y: 254, w: 92, label: 'EXTERNAL', sub: 'integrations' },
  { id: 's1', x: 262, y: 30, w: 92, label: 'SERVICE', sub: 'domain A' },
  { id: 's2', x: 262, y: 142, w: 92, label: 'SERVICE', sub: 'domain B' },
  { id: 's3', x: 262, y: 254, w: 92, label: 'SERVICE', sub: 'domain C' },
  { id: 'db', x: 390, y: 142, w: 84, label: 'DATA', sub: 'database' },
];

// Each path is [id, d, packet-delay]
const paths: [string, string, number][] = [
  ['p1', 'M98 165 L134 165', 0],
  ['p2', 'M226 165 C244 165 244 53 262 53', 0.9],
  ['p3', 'M226 165 L262 165', 1.4],
  ['p4', 'M226 165 C244 165 244 277 262 277', 1.9],
  ['p5', 'M354 53 C372 53 372 165 390 165', 2.6],
  ['p6', 'M354 165 L390 165', 3.1],
  ['p7', 'M354 277 C372 277 372 165 390 165', 3.6],
  ['p8', 'M180 254 L180 188', 0.4],
];

/** Restrained animated service diagram. Generic by design: it illustrates the kind of systems built, not a specific claim. */
export function SystemViz() {
  const reduced = usePrefersReducedMotion();
  return (
    <figure className="sysviz">
      <svg viewBox="0 0 480 330" role="img" aria-label="Abstract diagram of a client, API, services and a database exchanging data">
        <defs>
          <linearGradient id="sv-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#52d6f4" stopOpacity="0.9" />
            <stop offset="1" stopColor="#52d6f4" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* dashed link: auth <-> api */}
        <path d="M180 76 L180 142" className="sv-link sv-link--dash" />
        {paths.map(([id, d]) => (
          <path key={id} id={id} d={d} className={id === 'p8' ? 'sv-link sv-link--dash' : 'sv-link'} />
        ))}

        {nodes.map((n) => (
          <g key={n.id} className={`sv-node sv-node--${n.id}`}>
            <rect x={n.x} y={n.y} width={n.w} height={H} rx={8} />
            <text x={n.x + n.w / 2} y={n.y + 20} textAnchor="middle" className="sv-t1">
              {n.label}
            </text>
            <text x={n.x + n.w / 2} y={n.y + 35} textAnchor="middle" className="sv-t2">
              {n.sub}
            </text>
          </g>
        ))}

        {!reduced &&
          paths.map(([id, d, delay]) => (
            <circle key={`pk-${id}`} r="3" className="sv-packet">
              <animateMotion path={d} dur="3.6s" begin={`${delay}s`} repeatCount="indefinite" calcMode="linear" />
            </circle>
          ))}
      </svg>
      <figcaption className="mono-label sysviz__cap">Services · APIs · data flows</figcaption>
    </figure>
  );
}
