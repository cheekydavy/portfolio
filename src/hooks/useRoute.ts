import { useEffect, useState } from 'react';
import { getProject } from '../data/projects';

export type Route =
  | { name: 'home' }
  | { name: 'project'; slug: string }
  | { name: 'architecture'; slug: string };

function parse(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean); // ['projects', slug, 'architecture'?]
  if (parts[0] === 'projects' && parts[1] && getProject(parts[1])) {
    return parts[2] === 'architecture' ? { name: 'architecture', slug: parts[1] } : { name: 'project', slug: parts[1] };
  }
  return { name: 'home' };
}

const ROUTE_EVENT = 'app:routechange';

/** Client-side navigation with real URLs (History API). */
export function navigate(url: string) {
  window.history.pushState(null, '', url);
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.pathname));

  useEffect(() => {
    const update = () => setRoute(parse(window.location.pathname));
    window.addEventListener('popstate', update);
    window.addEventListener(ROUTE_EVENT, update);

    // Turn same-site link clicks into client-side navigation, so links stay real <a href> (crawlable)
    // but the page does not reload.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest('a');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (including in-page #anchors): let the browser handle it natively.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(ROUTE_EVENT, update);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return route;
}

export const hrefs = {
  home: '/',
  project: (slug: string) => `/projects/${slug}`,
  architecture: (slug: string) => `/projects/${slug}/architecture`,
};
