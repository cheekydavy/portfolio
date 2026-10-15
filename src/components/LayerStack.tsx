import type { CSSProperties } from 'react';
import type { Layer } from '../data/projects';
import { TONES } from '../data/tones';

/** Responsive, HTML-based layered view of a system (readable on any screen width). */
export function LayerStack({ layers, compact = false }: { layers: Layer[]; compact?: boolean }) {
  return (
    <ol className={`layers ${compact ? 'layers--compact' : ''}`}>
      {layers.map((layer) => {
        const tone = TONES[layer.tone];
        return (
          <li
            key={layer.name}
            className={`layer ${layer.planned ? 'layer--planned' : ''}`}
            style={{ '--tone': tone.stroke } as CSSProperties}
          >
            <div className="layer__name">
              <span className="layer__dot" aria-hidden="true" />
              {layer.name}
              {layer.planned ? <em className="layer__tag">Planned · not implemented</em> : null}
            </div>
            <ul className="layer__items">
              {layer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
