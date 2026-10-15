import { Suspense, lazy, useCallback, useEffect, useRef } from 'react';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { ProjectDetail } from './components/ProjectDetail';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { getProject } from './data/projects';
import { hrefs, navigate, useRoute } from './hooks/useRoute';
import type { Route } from './hooks/useRoute';

// Mermaid (and the explorer UI) only download when an architecture view is opened.
const ArchitectureExplorer = lazy(() => import('./components/ArchitectureExplorer'));

function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Contact />
    </main>
  );
}

export default function App() {
  const route = useRoute();

  // The page that sits behind the explorer: home if the user opened it from there, otherwise the project page.
  const baseRef = useRef<Route | null>(null);
  if (route.name !== 'architecture') baseRef.current = route;
  else if (!baseRef.current || (baseRef.current.name === 'project' && baseRef.current.slug !== route.slug)) {
    baseRef.current = { name: 'project', slug: route.slug };
  }
  const base = baseRef.current ?? { name: 'home' as const };

  const closeExplorer = useCallback(() => {
    const b = baseRef.current;
    navigate(b && b.name === 'project' ? hrefs.project(b.slug) : hrefs.home);
  }, []);

  // Scroll handling: new page -> top; in-page anchors -> the section (after the home page has rendered).
  const lastKey = useRef<string>('');
  useEffect(() => {
    if (route.name === 'architecture') return;
    const key = route.name === 'project' ? `project:${route.slug}` : 'home';
    const id = window.location.hash.slice(1);
    const isAnchor = route.name === 'home' && id !== '';
    if (isAnchor) {
      document.getElementById(id)?.scrollIntoView();
    } else if (key !== lastKey.current) {
      window.scrollTo(0, 0);
    }
    lastKey.current = key;
  }, [route]);

  // Per-page document title.
  useEffect(() => {
    const slug = route.name === 'home' ? null : route.slug;
    const p = slug ? getProject(slug) : undefined;
    const suffix = 'David Mbuvi (Mbuvi Tech)';
    if (route.name === 'architecture' && p) document.title = `${p.shortName} architecture · ${suffix}`;
    else if (p) document.title = `${p.name} · ${suffix}`;
    else document.title = `${suffix} — Software & Systems Developer`;
  }, [route]);

  const explorerProject = route.name === 'architecture' ? getProject(route.slug) : undefined;
  const baseProject = base.name === 'project' ? getProject(base.slug) : undefined;

  return (
    <>
      <a className="skip" href="#main-content" onClick={(e) => {
        e.preventDefault();
        document.querySelector('main')?.setAttribute('tabindex', '-1');
        (document.querySelector('main') as HTMLElement | null)?.focus();
      }}>
        Skip to content
      </a>
      <Navbar onHome={base.name === 'home'} />
      {base.name === 'project' && baseProject ? <ProjectDetail project={baseProject} /> : <HomePage />}
      <Footer />
      {explorerProject ? (
        <Suspense fallback={<div className="explorer explorer--loading" role="status">Loading architecture explorer…</div>}>
          <ArchitectureExplorer key={explorerProject.slug} project={explorerProject} onClose={closeExplorer} />
        </Suspense>
      ) : null}
    </>
  );
}
