import { toneClassDefs } from '../data/tones';

export interface DiagramNode {
  id: string;
  title: string;
  file?: string;
  group?: string;
  tone?: string;
  url?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
  dashed: boolean;
}

export interface ParsedDiagram {
  nodes: Map<string, DiagramNode>;
  edges: DiagramEdge[];
  groups: string[];
  /** Source handed to Mermaid: click directives removed, light classDefs replaced by the dark palette. */
  renderSource: string;
}

const NODE_RE = /^\s*(node_\w+)\s*(?:\[\(|\(\(|\{\{|\[|\(|\{)\s*"([^"]*)"/;
const EDGE_RE = /^\s*(node_\w+)\s*(-->|-\.->)\s*\|"([^"]*)"\|\s*(node_\w+)\s*$/;
const GROUP_RE = /^\s*subgraph\s+\w+\["([^"]*)"\]/;
const CLASS_RE = /^\s*class\s+([\w,]+)\s+(\w+)\s*$/;
const CLICK_RE = /^\s*click\s+(node_\w+)\s+"([^"]+)"/;

export function parseDiagram(source: string): ParsedDiagram {
  const lines = source.replace(/\r/g, '').split('\n');
  const nodes = new Map<string, DiagramNode>();
  const edges: DiagramEdge[] = [];
  const groups: string[] = [];
  const keep: string[] = [];
  let group: string | undefined;

  for (const line of lines) {
    const g = GROUP_RE.exec(line);
    if (g) {
      group = g[1];
      groups.push(g[1]);
      keep.push(line);
      continue;
    }
    if (/^\s*end\s*$/.test(line)) {
      group = undefined;
      keep.push(line);
      continue;
    }
    const click = CLICK_RE.exec(line);
    if (click) {
      const n = nodes.get(click[1]);
      if (n) n.url = click[2];
      continue; // clicks are handled by the explorer UI, not Mermaid
    }
    if (/^\s*classDef\s/.test(line)) continue; // replaced below
    const cls = CLASS_RE.exec(line);
    if (cls) {
      for (const id of cls[1].split(',')) {
        const n = nodes.get(id);
        if (n) n.tone = cls[2];
      }
      keep.push(line);
      continue;
    }
    const edge = EDGE_RE.exec(line);
    if (edge) {
      edges.push({ from: edge[1], to: edge[4], label: edge[3], dashed: edge[2] === '-.->' });
      keep.push(line);
      continue;
    }
    const node = NODE_RE.exec(line);
    if (node) {
      const [title, fileRaw] = node[2].split('<br/>');
      nodes.set(node[1], {
        id: node[1],
        title: title.trim(),
        file: fileRaw ? fileRaw.replace(/^\[|\]$/g, '').trim() : undefined,
        group,
      });
    }
    keep.push(line);
  }

  // Click lines appear before class lines in the source, so a second pass guarantees urls are attached.
  for (const line of lines) {
    const click = CLICK_RE.exec(line);
    if (click) {
      const n = nodes.get(click[1]);
      if (n) n.url = click[2];
    }
  }

  return { nodes, edges, groups, renderSource: `${keep.join('\n')}\n${toneClassDefs()}\n` };
}

/** "https://github.com/u/r/blob/main/a/b.ts" -> "a/b.ts" */
export function pathFromUrl(url: string): string {
  const m = /\/(?:blob|tree)\/[^/]+\/(.+)$/.exec(url);
  return m ? m[1] : url;
}
