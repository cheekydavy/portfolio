import { getProject } from '../data/projects';
import { skillGroups } from '../data/site';
import { Reveal, SectionHead } from './ui';

function usedInText(slugs?: string[]): string | undefined {
  if (!slugs || slugs.length === 0) return undefined;
  const names = slugs.map((s) => getProject(s)?.shortName).filter(Boolean);
  return names.length ? `Appears in: ${names.join(', ')}` : undefined;
}

export function Skills() {
  return (
    <section id="skills" className="section">
      <div className="wrap">
        <SectionHead
          index="03"
          label="SKILLS"
          title="Tools I work with."
          lead="Grouped by area, not ranked. A cyan dot marks technologies that appear in the documented architecture of a featured project; the rest come from coursework, attachment work and personal practice."
        />
        <div className="skills">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={i * 50}>
              <article className="skillcard">
                <header>
                  <span className="mono-label">{g.code}</span>
                  <h3>{g.title}</h3>
                </header>
                <ul className="tags">
                  {g.skills.map((s) => {
                    const hint = usedInText(s.usedIn);
                    return (
                      <li key={s.name} className={`tag ${hint ? 'tag--used' : ''}`} title={hint}>
                        {hint ? <span className="tag__dot" aria-hidden="true" /> : null}
                        {s.name}
                        {hint ? <span className="visually-hidden">. {hint}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
