import type { ReactNode } from 'react';

interface PaperCardProps {
  children: ReactNode;
  tint?: string;
  className?: string;
  as?: 'div' | 'li' | 'article';
}

export function PaperCard({ children, tint, className = '', as = 'div' }: PaperCardProps) {
  const Tag = as;
  return (
    <Tag
      className={`relative rounded-[14px] border border-acorn/35 bg-paper p-4 shadow-[0_6px_16px_-8px_rgba(46,42,36,0.45)] ${className}`}
      style={tint ? { borderColor: `${tint}66` } : undefined}
    >
      {children}
    </Tag>
  );
}
