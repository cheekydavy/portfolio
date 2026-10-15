// Single place that configures Mermaid so every diagram shares the portfolio's look.
let initialised = false;

// Minimal structural type so we do not depend on Mermaid's own typings at the call site.
export interface MermaidLike {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
}

export function initMermaid(mermaid: MermaidLike) {
  if (initialised) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    themeVariables: {
      background: '#07090d',
      primaryColor: '#141b25',
      primaryTextColor: '#e8eef5',
      primaryBorderColor: '#2a3a4d',
      lineColor: '#6f879f',
      secondaryColor: '#0d131c',
      tertiaryColor: '#0d131c',
      clusterBkg: '#0a1017',
      clusterBorder: '#243142',
      edgeLabelBackground: '#0a0f16',
      textColor: '#c4d0dc',
      titleColor: '#9fb3c8',
      fontSize: '13px',
    },
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      useMaxWidth: false,
      padding: 14,
      nodeSpacing: 36,
      rankSpacing: 58,
    },
  });
  initialised = true;
}
