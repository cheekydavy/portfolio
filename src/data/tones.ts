// Dark-theme replacements for the light classDef palette that GitDiagram emits.
// The class *assignments* in each diagram are preserved untouched; only the colours change,
// so every diagram shares one visual language that matches the portfolio.
export interface ToneStyle {
  fill: string;
  stroke: string;
  text: string;
}

export const TONES: Record<string, ToneStyle> = {
  toneBlue: { fill: '#0e1c33', stroke: '#5b9dff', text: '#d3e3ff' },
  toneAmber: { fill: '#271f10', stroke: '#d9a441', text: '#f6deaa' },
  toneMint: { fill: '#0d2a1f', stroke: '#4fc08a', text: '#c4f1dc' },
  toneRose: { fill: '#2c1420', stroke: '#e0627f', text: '#fbd0da' },
  toneIndigo: { fill: '#1b1936', stroke: '#8b84f0', text: '#dcd9ff' },
  toneTeal: { fill: '#0c2a2a', stroke: '#2fb8a8', text: '#c3f1eb' },
  toneNeutral: { fill: '#141b25', stroke: '#6b7f95', text: '#e8eef5' },
};

export function toneClassDefs(): string {
  return Object.entries(TONES)
    .map(([name, t]) => `classDef ${name} fill:${t.fill},stroke:${t.stroke},stroke-width:1.5px,color:${t.text}`)
    .join('\n');
}
