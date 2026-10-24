import { Suspense, lazy } from 'react';
import type { Project } from '../data/projects';
import { hrefs } from '../hooks/useRoute';
import { IconArrowLeft, IconArrowUpRight, IconGithub, IconGraph } from './Icons';
import { LayerStack } from './LayerStack';
import { PosSections } from './PosSections';
import { Ext, RepoMeta, SectionHead, StatusBadge } from './ui';

// Mermaid is only downloaded once a project page is opened.
const InlineDiagram = lazy(() => import('./InlineDiagram'));

export function ProjectDetail({ project }: { project: Project }) {
  const isPos = project.slug === 'pos';
  return (
    <main className="detail">
      <section className="detail__hero">
        <div className="wrap">
          <a className="back" href="/#projects">
            <IconArrowLeft /> All projects
          </a>
          <p className="mono-label detail__ref">
            {project.ref} {isPos ? '· FLAGSHIP' : ''}
          </p>
          <h1 className="detail__title">{project.name}</h1>
          <p className="detail__tag">{project.tagline}</p>
          <div className="detail__status">
            <StatusBadge kind={project.status.kind} label={project.status.label} />
            {project.repoName ? <RepoMeta repo={project.repoName} /> : null}
          </div>

          <div className="detail__diagram">
            <Suspense fallback={<p className="stage__msg">Loading architecture…</p>}>
              <InlineDiagram project={project} />
            </Suspense>
          </div>

          <div className="actions">
            <a className="btn btn--primary" href={hrefs.architecture(project.slug)}>
              <IconGraph /> Explore Architecture
            </a>
            {project.repo ? (
              <Ext className="btn" href={project.repo}>
                <IconGithub /> View repository <IconArrowUpRight />
              </Ext>
            ) : null}
          </div>
          {project.disclaimer ? <p className="disclaimer">{project.disclaimer}</p> : null}
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap detail__cols">
          <div className="detail__main">
            <SectionHead index="01" label="OVERVIEW" title={isPos ? 'Product overview' : 'Overview'} />
            {project.overview.map((p) => (
              <p key={p} className="prose">
                {p}
              </p>
            ))}
            <h3 className="mono-label sub">ENGINEERING VALUE</h3>
            <ul className="ticks ticks--lg">
              {project.engineeringValue.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>

          <aside className="sheet" aria-label="Project specification">
            <p className="mono-label">SPEC SHEET · TECHNOLOGY STACK</p>
            <dl>
              <div>
                <dt className="mono-label">Status</dt>
                <dd>{project.status.label}</dd>
              </div>
              {project.stack.map((s) => (
                <div key={s.group}>
                  <dt className="mono-label">{s.group}</dt>
                  <dd>{s.items.join(' · ')}</dd>
                </div>
              ))}
              {project.repo ? (
                <div>
                  <dt className="mono-label">Repository</dt>
                  <dd>
                    <Ext href={project.repo}>{project.repo.replace('https://', '')}</Ext>
                  </dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap">
          <SectionHead index="02" label="ARCHITECTURE" title="How it fits together" />
          <div className="detail__arch">
            <div>
              {project.architectureNote.map((p) => (
                <p key={p} className="prose">
                  {p}
                </p>
              ))}
              <a className="btn btn--primary" href={hrefs.architecture(project.slug)}>
                <IconGraph /> Open the interactive diagram
              </a>
            </div>
            <LayerStack layers={project.layers} />
          </div>
        </div>
      </section>

      {isPos ? <PosSections project={project} /> : null}
    </main>
  );
}
