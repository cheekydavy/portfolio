import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Post-build step: pre-renders one real HTML file per URL so search engines (and link previews)
 * get unique titles, descriptions, canonical URLs, structured data and readable content without
 * running JavaScript. The React app then takes over in the browser.
 *
 *   /                                -> dist/index.html
 *   /projects/<slug>                 -> dist/projects/<slug>/index.html
 *   /projects/<slug>/architecture    -> dist/projects/<slug>/architecture/index.html (canonical -> project page)
 *   /sitemap.xml, /404.html
 *
 * Project data is read straight from src/data/*.ts, so there is a single source of truth.
 * Set SITE_URL to deploy under a different domain.
 */

const SITE = (process.env.SITE_URL || 'https://portfolio.kensync.co.ke').replace(/\/+$/, '');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

async function loadData() {
  const outfile = path.join(tmpdir(), `portfolio-data-${process.pid}-${Date.now()}.mjs`);
  await build({
    stdin: {
      contents: "export * from './src/data/projects.ts'; export * from './src/data/site.ts';",
      resolveDir: root,
      loader: 'ts',
      sourcefile: 'seo-entry.ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
    plugins: [
      {
        name: 'raw-external',
        // Diagram files are loaded lazily in the browser; they are irrelevant here.
        setup(b) {
          b.onResolve({ filter: /\?raw$/ }, (a) => ({ path: a.path, external: true }));
        },
      },
    ],
  });
  return import(pathToFileURL(outfile).href);
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const clip = (s, n = 158) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…';
};

function swap(html, re, replacement, required = false) {
  if (!re.test(html)) {
    const msg = `prerender: pattern not found: ${re}`;
    if (required) throw new Error(msg);
    console.warn(msg);
    return html;
  }
  return html.replace(re, () => replacement);
}

const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function withBodyAndSchema(html, body, schemas) {
  let h = swap(html, /<div id="root"><\/div>/, `<div id="root">${body}</div>`, true);
  if (schemas.length) h = swap(h, /<\/head>/, `${schemas.map(ld).join('\n')}\n</head>`, true);
  return h;
}

function withHead(html, page) {
  let h = html;
  h = swap(h, /<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`, true);
  h = swap(h, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(page.description)}" />`);
  h = swap(h, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${page.canonical}" />`);
  h = swap(h, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.canonical}" />`);
  h = swap(h, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(page.title)}" />`);
  h = swap(h, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(page.description)}" />`);
  h = swap(h, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(page.title)}" />`);
  h = swap(h, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(page.description)}" />`);
  return h;
}

async function writePage(relDir, html) {
  const dir = path.join(dist, relDir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html);
}

const data = await loadData();
const { projects, person, heroCopy, aboutParagraphs, GITHUB_URL } = data;
const base = await readFile(path.join(dist, 'index.html'), 'utf8');

const ALSO = 'David Mbuvi (Mbuvi Tech)';
const personRef = { '@id': `${SITE}/#person` };

/* ── home: head tags are already correct in index.html; add readable content + project list schema ── */
const homeBody = `<main>
<h1>${esc(ALSO)} — Software &amp; Systems Developer</h1>
<p>Full name: ${esc(person.name)}. ${esc(heroCopy)}</p>
<h2>Projects</h2>
<ul>
${projects.map((p) => `<li><a href="/projects/${p.slug}">${esc(p.name)}</a> — ${esc(p.summary)}</li>`).join('\n')}
</ul>
<h2>About</h2>
${aboutParagraphs.map((t) => `<p>${esc(t)}</p>`).join('\n')}
<h2>Contact</h2>
<p>Email: <a href="mailto:${esc(person.email)}">${esc(person.email)}</a> · GitHub: <a href="${GITHUB_URL}">${GITHUB_URL.replace('https://', '')}</a></p>
</main>`;

await writeFile(
  path.join(dist, 'index.html'),
  withBodyAndSchema(base, homeBody, [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Software projects by David Mbuvi (Mbuvi Tech)',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/projects/${p.slug}`,
        name: p.name,
      })),
    },
  ]),
);

/* ── projects (+ architecture views) ── */
for (const p of projects) {
  const url = `${SITE}/projects/${p.slug}`;
  const body = `<main>
<p><a href="/">${esc(ALSO)}</a> / <a href="/#projects">Projects</a></p>
<h1>${esc(p.name)}</h1>
<p>${esc(p.tagline)}</p>
<p>Status: ${esc(p.status.label)}</p>
<p>${esc(p.summary)}</p>
${p.overview.map((t) => `<p>${esc(t)}</p>`).join('\n')}
<h2>Engineering value</h2>
<ul>
${p.engineeringValue.map((t) => `<li>${esc(t)}</li>`).join('\n')}
</ul>
<h2>Technology</h2>
<ul>
${p.stack.map((s) => `<li>${esc(s.group)}: ${esc(s.items.join(', '))}</li>`).join('\n')}
</ul>
<p>Source code: <a href="${p.repo}">${p.repo.replace('https://', '')}</a></p>
<p><a href="/projects/${p.slug}/architecture">Explore the ${esc(p.shortName)} architecture diagram</a></p>
${p.disclaimer ? `<p>${esc(p.disclaimer)}</p>` : ''}
</main>`;

  const projectHtml = withBodyAndSchema(
    withHead(base, {
      title: `${p.name} | David Mbuvi`,
      description: clip(`${p.summary} Built by David Mbuvi (Mbuvi Tech).`),
      canonical: url,
    }),
    body,
    [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: p.name,
        description: p.summary,
        url,
        codeRepository: p.repo,
        author: personRef,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: ALSO, item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: p.name, item: url },
        ],
      },
    ],
  );
  await writePage(path.join('projects', p.slug), projectHtml);

  // The architecture view is the same document; its canonical is the project page.
  const archHtml = withBodyAndSchema(
    withHead(base, {
      title: `${p.shortName} architecture diagram | David Mbuvi`,
      description: clip(`Interactive architecture diagram of ${p.name}, generated from its GitHub repository. By David Mbuvi (Mbuvi Tech).`),
      canonical: url,
    }),
    body,
    [],
  );
  await writePage(path.join('projects', p.slug, 'architecture'), archHtml);
}

/* ── sitemap ── */
const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, ...projects.map((p) => `${SITE}/projects/${p.slug}`)];
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
);

/* ── 404 (static, no app bundle, not indexed) ── */
await writeFile(
  path.join(dist, '404.html'),
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Page not found | David Mbuvi</title><meta name="robots" content="noindex" />
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07090d;color:#e8eef5;font-family:system-ui,sans-serif}main{padding:2rem;max-width:30rem}a{color:#52d6f4}code{color:#94a3b4}</style></head>
<body><main><p><code>404</code></p><h1>That page doesn't exist.</h1><p>Head back to the <a href="/">portfolio home</a> or see the <a href="/#projects">projects</a>.</p></main></body></html>
`,
);

console.log(`prerender: ${1 + projects.length * 2} pages + sitemap.xml + 404.html for ${SITE}`);
