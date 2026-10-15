import { GITHUB_URL, projects } from '../data/projects';
import type { Project } from '../data/projects';
import { hrefs } from '../hooks/useRoute';
import { IconArrowRight, IconGithub, IconGraph } from './Icons';
import { LayerStack } from './LayerStack';
import { Ext, RepoMeta, Reveal, SectionHead, StatusBadge } from './ui';

function PosFeature({ project }: { project: Project }) {
  return (
    <article className="flagship">
      <div className="flagship__corner" aria-hidden="true">
        FLAGSHIP · {project.ref}
      </div>
      <div className="flagship__main">
        <StatusBadge kind="active" label={project.status.label} />
        <h3 className="flagship__title">{project.name}</h3>
        <p className="flagship__tag">{project.tagline}</p>
        <p className="flagship__sum">{project.summary}</p>

        <ul className="milestones" aria-label="Current milestones">
          <li className="milestones__done">
            <span className="milestones__mark" aria-hidden="true" />
            <strong>M-Pesa integration</strong>
            <span>Completed · Safaricom Daraja</span>
          </li>
          <li className="milestones__next">
            <span className="milestones__mark" aria-hidden="true" />
            <strong>Communication module</strong>
            <span>Planned · WhatsApp &amp; social platforms, not yet implemented</span>
          </li>
        </ul>

        <div className="actions">
          <a className="btn btn--primary" href={hrefs.project(project.slug)}>
            Project page <IconArrowRight />
          </a>
          <a className="btn" href={hrefs.architecture(project.slug)}>
            <IconGraph /> Explore Architecture
          </a>
          <Ext className="btn btn--ghost" href={project.repo}>
            <IconGithub /> Repository
          </Ext>
        </div>
        <RepoMeta repo={project.repoName} />
      </div>
      <div className="flagship__stack" aria-label="System layers">
        <p className="mono-label">SYSTEM LAYERS</p>
        <LayerStack layers={project.layers} compact />
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card">
      <header className="card__top">
        <span className="mono-label">{project.ref}</span>
        <StatusBadge kind={project.status.kind} label={project.status.label} />
      </header>
      <h3 className="card__title">
        <a href={hrefs.project(project.slug)}>{project.name}</a>
      </h3>
      <p className="card__tag">{project.tagline}</p>
      <p className="card__sum">{project.summary}</p>
      <dl className="spec">
        {project.stack.slice(0, 3).map((s) => (
          <div key={s.group} className="spec__row">
            <dt className="mono-label">{s.group}</dt>
            <dd>{s.items.join(' · ')}</dd>
          </div>
        ))}
      </dl>
      <footer className="card__foot">
        <div className="actions">
          <a className="btn btn--sm btn--primary" href={hrefs.architecture(project.slug)}>
            <IconGraph /> Explore Architecture
          </a>
          <a className="btn btn--sm" href={hrefs.project(project.slug)}>
            Details
          </a>
          <Ext className="btn btn--sm btn--icon" href={project.repo} aria-label={`${project.name} on GitHub`}>
            <IconGithub />
          </Ext>
        </div>
        <RepoMeta repo={project.repoName} />
      </footer>
    </article>
  );
}

export function Projects() {
  const [pos, ...rest] = projects;
  return (
    <section id="projects" className="section">
      <div className="wrap">
        <SectionHead
          index="02"
          label="PROJECTS"
          title="Five systems, one through-line."
          lead="Every project has an interactive architecture view built from its repository. Open one to inspect how the pieces connect."
        />
        <Reveal>
          <PosFeature project={pos} />
        </Reveal>
        <div className="cards">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
        <p className="more">
          More on{' '}
          <Ext href={GITHUB_URL}>github.com/cheekydavy</Ext>
        </p>
      </div>
    </section>
  );
}
