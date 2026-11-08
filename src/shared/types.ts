import type { ComponentType } from 'react';

export type SectionId =
  | 'about'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'languages'
  | 'contact';

export interface SectionMeta {
  id: SectionId;
  label: string;
  tint: string;
  wash: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
    strokeWidth?: number;
  }>;
}

export type BlockTone = 'primary' | 'secondary' | 'accent';

export interface InfoBlock {
  period?: string;
  title: string;
  subtitle?: string;
  body: string;
  tone?: BlockTone;
}

export interface SkillCategory {
  label: string;
  skills: string[];
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
  links: ProjectLink[];
  featured?: boolean;
  metrics?: string[];
  image?: string;
  note?: string;
}

export interface Language {
  name: string;
  level: string;
  cefr?: string;
  proficiency: number;
}

export interface ContactLink {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  tagline: string;
  summary: string;
  focus: string[];
  avatarSrc: string;
  resumePdf?: string;
  contactEmail?: string;
  contactPhone?: string;
}
