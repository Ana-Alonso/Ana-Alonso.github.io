import {
  Briefcase,
  Code2,
  FolderGit2,
  GraduationCap,
  IdCard,
  Languages,
  Send,
} from 'lucide-react';
import type {
  ContactLink,
  InfoBlock,
  Language,
  Profile,
  Project,
  SectionId,
  SectionMeta,
  SkillCategory,
} from '../shared/types';

export const profile: Profile = {
  name: 'Ana Alonso Gómez',
  role: 'Software Engineer · Frontend & Full-Stack Developer',
  location: 'Miranda de Ebro / Remoto / Modalidad Híbrida',
  tagline: 'Ingeniera Informática especializada en Frontend y Full-Stack con foco en interfaces limpias, accesibles y arquitecturas sólidas.',
  summary: `Ingeniera Informática especializada en desarrollo web Frontend y Full-Stack, con experiencia práctica creando aplicaciones escalables y listas para producción con React, TypeScript y Java. Trayectoria en equipos ágiles implementando Clean Architecture, integraciones con Supabase y sistemas UI modulares.`,
  focus: [
    'Arquitectura de componentes modulares con React, TypeScript y Clean Architecture',
    'Integración Full-Stack con Supabase, bases de datos relacionales y APIs REST',
    'Diseño de interfaces web responsivas, accesibles y orientadas a la experiencia de usuario',
  ],
  avatarSrc: '/assets/avatar-ana.webp',
  resumePdf: '/assets/Ana_Alonso_resume.pdf',
  contactEmail: 'alonsogomezana03@gmail.com',
  contactPhone: '+34 617 14 50 51',
};

export const sections: SectionMeta[] = [
  { id: 'about', label: 'Sobre mí', tint: '#8b6f4e', wash: '#f1e6d9', icon: IdCard },
  { id: 'experience', label: 'Experiencia', tint: '#6e5236', wash: '#efe4d6', icon: Briefcase },
  { id: 'education', label: 'Formación', tint: '#4f6b58', wash: '#e4ede5', icon: GraduationCap },
  { id: 'skills', label: 'Stack', tint: '#3f6379', wash: '#e2eaf0', icon: Code2 },
  { id: 'projects', label: 'Proyectos', tint: '#7e5f17', wash: '#f3ead3', icon: FolderGit2 },
  { id: 'languages', label: 'Idiomas', tint: '#a04e66', wash: '#f7e3e7', icon: Languages },
  { id: 'contact', label: 'Contacto', tint: '#4a6470', wash: '#e3edea', icon: Send },
];

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const SECTION_ALIASES: Record<string, SectionId> = Object.fromEntries(
  sections.map((section) => [slugify(section.label), section.id]),
);

export function sectionIdFromHash(raw: string): SectionId | null {
  if (sections.some((section) => section.id === raw)) return raw as SectionId;
  return SECTION_ALIASES[slugify(raw)] ?? null;
}

export const experience: InfoBlock[] = [
  {
    period: '06/2025 — 11/2025',
    title: 'Full-Stack Developer Intern',
    subtitle: '540 · Pamplona, España',
    body: `• Arquitectura y desarrollo de componentes frontend modulares en React y TypeScript, garantizando alta reutilización de código, tipado estricto y diseño responsivo multiplataforma.
• Integración de servicios backend y capa de persistencia mediante Supabase, configurando flujos de autenticación y suscripciones a bases de datos en tiempo real.
• Aplicación de patrones Clean Architecture para desacoplar la lógica de negocio de la capa de vista, optimizando el mantenimiento y las entregas por sprint.
• Colaboración activa en equipo Agile/Scrum: gestión de tickets de sprint, control de versiones con Git y revisiones de código (code reviews).`,
    tone: 'primary',
  },
];

export const education: InfoBlock[] = [
  {
    period: '09/2021 — 06/2026',
    title: 'Grado en Ingeniería Informática (Especialidad en Ingeniería del Software)',
    subtitle: 'Universidad Pública de Navarra (UPNA) · Pamplona',
    body: `Cursos relevantes: Arquitectura de Software, Clean Architecture, Calidad de Software (QA/Testing), Bases de Datos Relacionales (SQL), Metodologías Ágiles (Scrum), Sistemas Operativos.`,
    tone: 'primary',
  },
  {
    period: '02/2026 — 06/2026',
    title: 'Erasmus+ en Digital Media & Web UI Design',
    subtitle: 'Transilvania University of Brașov (UNITBV) · Rumanía',
    body: `Formación académica internacional centrada en Advanced Web UI Design, comunicación visual, multimedia digital y colaboración técnica internacional.`,
    tone: 'secondary',
  },
];

export const skillCategories: SkillCategory[] = [
  {
    label: 'Frontend',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Responsive Design', 'Tailwind CSS'],
  },
  {
    label: 'Backend & Bases de Datos',
    skills: ['Java', 'Python', 'SQL', 'PostgreSQL', 'MySQL', 'Supabase', 'RESTful APIs', 'PHP', 'C'],
  },
  {
    label: 'Arquitectura & Metodologías',
    skills: ['Clean Architecture', 'Agile / Scrum', 'Object-Oriented Programming (OOP)', 'TDD / QA'],
  },
  {
    label: 'DevOps & Herramientas',
    skills: ['Git', 'GitHub', 'Docker', 'Linux', 'Postman', 'Vite'],
  },
];

export const projects: Project[] = [
  {
    title: 'Laurel en Lienzo · E-commerce y gestión de talleres',
    description:
      'Catálogo dinámico y plataforma de reservas para una marca de ilustración: catálogo con filtros por etiquetas, plazas validadas en tiempo real y sincronización con Etsy.',
    tech: ['React 19', 'React Router 7', 'TypeScript', 'Tailwind v4', 'Supabase', 'Vercel'],
    metrics: [
      'En producción en laurelenlienzo.vercel.app con 100% Core Web Vitals en auditoría Lighthouse',
      'Transacciones atómicas en PostgreSQL con RLS y cero inconsistencias de concurrencia en aforo',
      '100% Accesibilidad WCAG AA y soporte bilingüe completo (ES/EN)',
      'SEO técnico optimizado: JSON-LD estructurado, sitemap dinámico y Open Graph automatizado',
    ],
    links: [
      { label: 'Ver demo en vivo', href: 'https://laurelenlienzo.vercel.app' },
      { label: 'Ver código en GitHub', href: 'https://github.com/Ana-Alonso/Catalogo-Web' },
    ],
    featured: true,
    image: '/assets/project-laurel-en-lienzo.webp',
  },
  {
    title: 'Telerehabilitation Therapy Tracking Platform (TFG)',
    description:
      'Arquitectura front-end de una plataforma de telerehabilitación que conecta a profesionales sanitarios y pacientes, con la lógica de negocio desacoplada de la interfaz para un entorno clínico exigente en mantenibilidad.',
    tech: ['React 19', 'TypeScript', 'Clean Architecture', 'TanStack Query', 'Joy UI', 'e-Health'],
    metrics: [
      'Publicado en acceso abierto en Académica-e, repositorio institucional de la UPNA',
      'Clean Architecture: patrón Repository y Casos de Uso aislando 100% el dominio clínico de la UI',
      'Caché reactiva y sincronización en segundo plano con TanStack Query reduciendo re-fetching en 65%',
      'Grado en Ingeniería Informática · UPNA (Programa Internacional) · 2026',
    ],
    links: [
      {
        label: 'Leer el TFG en Académica-e (UPNA)',
        href: 'https://academica-e.unavarra.es/entities/publication/0c6a91db-a637-48ce-aff0-f56a04de162c',
      },
    ],
    note: 'El código no se publica por decisión de confidencialidad acordada con el cliente; sí el documento completo.',
    featured: true,
  },
  {
    title: 'User Login Module',
    description: 'Sistema completo de autenticación de usuarios, gestión segura de sesiones y persistencia relacional con protección CSRF/XSS y hashing seguro de contraseñas.',
    tech: ['PHP', 'MySQL', 'HTML/CSS'],
    links: [{ label: 'Ver código en GitHub', href: 'https://github.com/Ana-Alonso/user-login-module-php' }],
  },
  {
    title: 'Chess API',
    description: 'API REST robusta desarrollada en Java para la gestión de lógica, validación estricta de movimientos y estados en partidas de ajedrez bajo principios OOP y Clean Code.',
    tech: ['Java', 'RESTful API', 'OOP'],
    links: [{ label: 'Ver código en GitHub', href: 'https://github.com/Ana-Alonso/ChessAPI' }],
  },
  {
    title: 'Map Point Generator',
    description: 'Herramienta interactiva para generación y renderizado dinámico de marcadores y coordenadas geográficas de alta precisión.',
    tech: ['React', 'JavaScript'],
    links: [{ label: 'Ver código en GitHub', href: 'https://github.com/Ana-Alonso/GeneradorPuntoMapa' }],
  },
  {
    title: 'Collision Generator & Physics Sim',
    description: 'Motor de simulación física y algoritmo para el cálculo optimizado de detección de colisiones entre geometrías 2D complejas.',
    tech: ['C++', 'Python', 'Algoritmia'],
    links: [{ label: 'Ver código en GitHub', href: 'https://github.com/Ana-Alonso/GeneradorColisiones' }],
  },
];

export const languages: Language[] = [
  { name: 'Español', level: 'Nativo / Bilingüe', cefr: 'C2', proficiency: 100 },
  { name: 'Inglés', level: 'Competencia Profesional Plena', cefr: 'C1', proficiency: 88 },
];

export const contactLinks: ContactLink[] = [
  { label: 'alonsogomezana03@gmail.com', href: 'mailto:alonsogomezana03@gmail.com' },
  { label: '+34 617 14 50 51', href: 'tel:+34617145051' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ana-alonso-221474305' },
  { label: 'GitHub', href: 'https://github.com/Ana-Alonso' },
];

export const sectionCounts: Record<SectionId, { n: number; unit: string; one: string }> = {
  about: { n: profile.focus.length, unit: 'focos', one: 'foco' },
  experience: { n: experience.length, unit: 'etapas', one: 'etapa' },
  education: { n: education.length, unit: 'títulos', one: 'título' },
  skills: { n: skillCategories.reduce((total, c) => total + c.skills.length, 0), unit: 'tecnologías', one: 'tecnología' },
  projects: { n: projects.length, unit: 'proyectos', one: 'proyecto' },
  languages: { n: languages.length, unit: 'idiomas', one: 'idioma' },
  contact: { n: contactLinks.length, unit: 'enlaces', one: 'enlace' },
};

export function countLabel(id: SectionId): string {
  const { n, unit, one } = sectionCounts[id];
  return `${n} ${n === 1 ? one : unit}`;
}
