import { MapPin } from 'lucide-react';
import { profile, sectionCounts, sections } from '../content';
import { PALETTE } from '../../shared/theme';
import { PaperCard } from '../../shared/ui/PaperCard';

const ABOUT = sections.find((section) => section.id === 'about');
const TINT = ABOUT?.tint ?? PALETTE.acorn;

export function About() {
  return (
    <div className="space-y-4">
      <PaperCard as="article" tint={TINT}>
        <div className="flex flex-wrap items-center gap-3.5">
          <img
            src={profile.avatarSrc}
            alt={`Retrato de ${profile.name}`}
            width={84}
            height={84}
            className="size-[84px] shrink-0 rounded-[14px] border object-cover"
            style={{ borderColor: `${TINT}66` }}
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[17px] leading-tight text-acorn-deep">{profile.name}</h3>
            <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">{profile.role}</p>
            <p className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-ink/80">
              <MapPin size={14} aria-hidden className="mt-0.5 shrink-0" style={{ color: TINT }} />
              {profile.location}
            </p>
          </div>
        </div>
      </PaperCard>

      <p className="text-[13.5px] leading-relaxed text-ink/85">{profile.tagline}</p>
      <p className="text-[13.5px] leading-relaxed text-ink/85">{profile.summary}</p>

      <div>
        <h3 className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
          Foco · {sectionCounts.about.n}
        </h3>
        <ul className="mt-2 space-y-2">
          {profile.focus.map((item) => (
            <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-ink/85">
              <span aria-hidden className="mt-[7px] size-[5px] shrink-0" style={{ backgroundColor: TINT }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
