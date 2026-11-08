import { ExternalLink } from 'lucide-react';
import { projects, sections } from '../content';
import { PALETTE } from '../../shared/theme';
import { Chip, PillLink } from '../../shared/ui/Chip';
import { PaperCard } from '../../shared/ui/PaperCard';

const PROJECTS = sections.find((section) => section.id === 'projects');
const TINT = PROJECTS?.tint ?? PALETTE.acornDeep;
const WASH = PROJECTS?.wash ?? PALETTE.oat;

export function Projects() {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <PaperCard key={project.title} as="article" tint={project.featured ? TINT : undefined}>
          {project.image && (
            <a
              href={project.links[0]?.href.startsWith('http') ? project.links[0].href : project.image}
              target={project.links[0]?.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="group/shot mb-3.5 block overflow-hidden rounded-[12px] border border-acorn/40"
            >
              <img
                src={project.image}
                alt={`Captura de ${project.title}`}
                loading="lazy"
                className="aspect-[16/9] w-full object-cover object-top transition-transform duration-500 group-hover/shot:scale-[1.02]"
              />
            </a>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="max-w-[36ch] text-[15.5px] leading-snug font-bold text-ink">{project.title}</h3>
            {project.featured && (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase" style={{ borderColor: `${TINT}66`, color: TINT, backgroundColor: WASH }}>
                Destacado
              </span>
            )}
          </div>

          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/85">{project.description}</p>

          {project.metrics && project.metrics.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {project.metrics.map((metric) => (
                <li key={metric} className="flex gap-2 text-[13px] leading-relaxed text-muted">
                  <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full" style={{ backgroundColor: TINT }} />
                  <span>{metric}</span>
                </li>
              ))}
            </ul>
          )}

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <li key={tech}>
                <Chip tint={TINT}>{tech}</Chip>
              </li>
            ))}
          </ul>

          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            {project.links.map((link, i) =>
              i === 0 ? (
                <PillLink
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                  icon={ExternalLink}
                  compact
                  style={{ borderColor: `${TINT}80`, color: TINT }}
                >
                  {link.label}
                </PillLink>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="text-[12.5px] font-bold underline decoration-[1.5px] underline-offset-4 transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-deep"
                  style={{ color: TINT }}
                >
                  {link.label}
                </a>
              ),
            )}
          </div>

          {project.note && (
            <p className="mt-3 flex gap-2 text-[12px] leading-relaxed text-muted">
              <span aria-hidden className="dotted-column mt-0.5 w-[2px] shrink-0 self-stretch" />
              {project.note}
            </p>
          )}
        </PaperCard>
      ))}
    </div>
  );
}
