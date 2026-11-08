import { Phone } from 'lucide-react';
import { contactLinks, profile, sections } from '../content';
import { PALETTE } from '../../shared/theme';
import { PaperCard } from '../../shared/ui/PaperCard';

const CONTACT = sections.find((section) => section.id === 'contact');
const TINT = CONTACT?.tint ?? PALETTE.rainDeep;

function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.2c-3.2.7-3.88-1.35-3.88-1.35-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
    </svg>
  );
}

function MailMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

export function Contact() {
  const email = contactLinks.find((link) => link.href.startsWith('mailto:'));
  const others = contactLinks.filter((link) => !link.href.startsWith('mailto:'));

  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-relaxed text-ink/85">
        {profile.location}. Abierta a nuevas oportunidades de incorporación como Software Engineer.
      </p>

      {email && (
        <PaperCard as="article" tint={TINT}>
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-paper"
              style={{ borderColor: `${TINT}66`, color: TINT }}
            >
              <MailMark size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
                Correo electrónico
              </h3>
              <a
                href={email.href}
                className="font-display text-[15px] break-all text-acorn-deep underline decoration-[1.5px] underline-offset-4 transition-colors duration-200 hover:text-ink sm:text-[17px]"
              >
                {email.label}
              </a>
            </div>
          </div>
        </PaperCard>
      )}

      <ul className="grid gap-2.5 sm:grid-cols-3">
        {others.map((link) => {
          const isTel = link.href.startsWith('tel:');
          const isGithub = link.href.includes('github');
          const Mark = isTel ? Phone : isGithub ? GithubMark : LinkedinMark;
          return (
            <li key={link.label}>
              <a
                href={link.href}
                target={isTel ? undefined : '_blank'}
                rel={isTel ? undefined : 'noreferrer'}
                className="flex items-center gap-2.5 rounded-[12px] border border-acorn/35 bg-paper px-3 py-2.5 text-[12.5px] font-bold text-ink transition-colors duration-200 hover:bg-moss/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-deep"
              >
                <span className="shrink-0" style={{ color: TINT }} aria-hidden>
                  <Mark size={16} />
                </span>
                <span className="truncate">{link.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
