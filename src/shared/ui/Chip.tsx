import type { ComponentType, ReactNode } from 'react';
import { INK } from '../theme';

interface IconProp {
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

export function Chip({ children, tint, className = '' }: { children: ReactNode; tint?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border bg-paper px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ borderColor: `${tint ?? INK}4d`, color: tint ?? 'inherit' }}
    >
      {children}
    </span>
  );
}

const SOLID = 'border-sage-deep bg-sage text-ink shadow-[0_4px_10px_-6px_rgba(46,42,36,0.6)] hover:bg-[#bcd4c3]';
const QUIET = 'border-acorn/45 bg-paper text-acorn-deep hover:bg-moss/60 hover:text-ink';

function classes(variant: 'solid' | 'quiet', compact: boolean) {
  return `inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-deep ${
    compact ? 'px-3.5 py-1.5 text-[11px] tracking-[0.08em] uppercase' : 'px-4 py-2 text-[13px]'
  } ${variant === 'solid' ? SOLID : QUIET}`;
}

interface PillProps extends IconProp {
  children: ReactNode;
  variant?: 'solid' | 'quiet';
  compact?: boolean;
  className?: string;
}

export function PillButton({ children, icon: Icon, variant = 'quiet', compact = false, className = '', ...rest }: PillProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${classes(variant, compact)} ${className}`} {...rest}>
      {Icon ? <Icon size={compact ? 13 : 15} strokeWidth={2} /> : null}
      {children}
    </button>
  );
}

export function PillLink({ children, icon: Icon, variant = 'quiet', compact = false, className = '', ...rest }: PillProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${classes(variant, compact)} ${className}`} {...rest}>
      {Icon ? <Icon size={compact ? 13 : 15} strokeWidth={2} /> : null}
      {children}
    </a>
  );
}
