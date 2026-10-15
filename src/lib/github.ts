import { useEffect, useState } from 'react';
import { GITHUB_USER } from '../data/projects';

export interface RepoMeta {
  language: string | null;
  pushedAt: string | null;
}

const TTL_MS = 60 * 60 * 1000;
const inflight = new Map<string, Promise<RepoMeta | null>>();

function readCache(repo: string): RepoMeta | null {
  try {
    const raw = sessionStorage.getItem(`gh:${repo}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; meta: RepoMeta };
    return Date.now() - parsed.at < TTL_MS ? parsed.meta : null;
  } catch {
    return null;
  }
}

function writeCache(repo: string, meta: RepoMeta) {
  try {
    sessionStorage.setItem(`gh:${repo}`, JSON.stringify({ at: Date.now(), meta }));
  } catch {
    /* storage unavailable: ignore */
  }
}

/** Fetches public repo metadata. Never throws; resolves to null if GitHub is unreachable or rate-limited. */
export function fetchRepoMeta(repo: string): Promise<RepoMeta | null> {
  const cached = readCache(repo);
  if (cached) return Promise.resolve(cached);
  const existing = inflight.get(repo);
  if (existing) return existing;

  const request = fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const json = (await res.json()) as { language?: string | null; pushed_at?: string | null };
      const meta: RepoMeta = { language: json.language ?? null, pushedAt: json.pushed_at ?? null };
      writeCache(repo, meta);
      return meta;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(repo);
    });

  inflight.set(repo, request);
  return request;
}

export function useRepoMeta(repo: string): RepoMeta | null {
  const [meta, setMeta] = useState<RepoMeta | null>(() => readCache(repo));
  useEffect(() => {
    let alive = true;
    fetchRepoMeta(repo).then((m) => {
      if (alive) setMeta(m);
    });
    return () => {
      alive = false;
    };
  }, [repo]);
  return meta;
}

export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}
