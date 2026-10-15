import { useEffect, useState } from 'react';
import { getProject } from '../data/projects';

export type Route =
  | { name: 'home' }
  | { name: 'project'; slug: string }
  | { name: 'architecture'; slug: string };

function parse(hash: string): Route {
  const h = hash.replace(/^#/, '');
  if (h.startsWith('/projects/')) {
    const parts = h.split('/').filter(Boolean); // ['projects', slug, 'architecture'?]
    const slug = parts[1];
    if (slug && getProject(slug)) {
      return parts[2] === 'architecture' ? { name: 'architecture', slug } : { name: 'project', slug };
    }
  }
  return { name: 'home' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const hrefs = {
  home: '#/',
  project: (slug: string) => `#/projects/${slug}`,
  architecture: (slug: string) => `#/projects/${slug}/architecture`,
};
