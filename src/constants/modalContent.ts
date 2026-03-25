import { normalizeSection } from "../utils/section";

export type SkillItem = {
  icon: string;
  label: string;
};

export type SkillCategory = {
  label: string;
  skills: string[];
};

export type DialogTheme =
  | "mailbox-letter"
  | "enrollment-form"
  | "factory-sheet"
  | "radio-panel";

export type DialogMetaItem = {
  label: string;
  value: string;
};

export type DialogContent = {
  title: string;
  body: string;
  theme?: DialogTheme;
  stampText?: string;
  enrollmentPrefix?: string;
  skillCategories?: SkillCategory[];
  meta?: DialogMetaItem[];
  studies?: string[];
  skills?: SkillItem[];
  contacts?: { label: string; href: string }[];
};

const DIALOG_BY_SECTION: Record<string, DialogContent> = {
  Casa: {
    title: "Casa",
    theme: "mailbox-letter",
    stampText: "PRIORIDAD UI/UX",
    body: `Soy Ana y acabo de graduarme en Ingenieria Informatica. Tengo base full stack, pero donde mas disfruto aportar es en frontend, dando forma a productos digitales desde la interfaz hasta los detalles de implementacion.

Me motiva convertir ideas en interfaces claras, responsivas, accesibles, expresivas y funcionales, con atencion al detalle y foco en la experiencia real de quien las usa.`,
    meta: [
      {
        label: "ROL OBJETIVO",
        value: "Desarrolladora Front-end / UI (con base Full Stack)",
      },
      {
        label: "UBICACION",
        value: "Disponible para trabajo remoto y modalidad hibrida",
      },
      {
        label: "FOCO",
        value: "Experiencias web interactivas, accesibles y cuidadas en usabilidad y rendimiento",
      },
    ],
  },
  Universidad: {
    title: "Universidad",
    theme: "enrollment-form",
    enrollmentPrefix: "UNI",
    body: "Formacion en tecnologia y desarrollo, fortalecida a traves del aprendizaje autodidacta y la practica constante en proyectos reales.",
    studies: [
      "Grado Internacional de Ingenieria Informatica en la UPNA",
      "C1 Ingles",
    ],
  },
  Fabrica: {
    title: "Fabrica",
    theme: "factory-sheet",
    body: "Herramientas y habilidades que uso para construir productos end-to-end.",
    skillCategories: [
      {
        label: "Front-end",
        skills: ["React", "Next.js", "HTML", "CSS", "JavaScript", "TypeScript"],
      },
      {
        label: "Back-end",
        skills: ["Node.js", "PHP", "SQL", "Python", "Java", "C"],
      },
      {
        label: "Tooling",
        skills: ["Docker", "Git"],
      },
      {
        label: "Diseno",
        skills: ["Adobe Illustrator", "Adobe After Effects"],
      },
    ],
    meta: [
      { label: "AREA", value: "Front-end / UI" },
      { label: "METODO", value: "Diseno, desarrollo y mejora continua" },
    ],
    skills: [
      { icon: "TS", label: "TypeScript" },
      { icon: "RE", label: "React" },
      { icon: "NO", label: "Next.js" },
      { icon: "ND", label: "Node.js" },
      { icon: "SQ", label: "SQL" },
      { icon: "PY", label: "Python" },
      { icon: "C", label: "C" },
      { icon: "JV", label: "Java" },
      { icon: "DO", label: "Docker" },
      { icon: "HT", label: "HTML" },
      { icon: "CS", label: "CSS" },
      { icon: "JS", label: "JavaScript" },
      { icon: "PHP", label: "PHP" },
      { icon: "GT", label: "Git" },
      { icon: "AI", label: "Adobe Illustrator" },
      { icon: "AE", label: "Adobe After Effects" },
    ],
  },
  Cabina: {
    title: "Cabina",
    theme: "radio-panel",
    body: "Panel de comunicaciones activo. Puedes escribirme o conectar conmigo en estas plataformas.",
    meta: [{ label: "ESTADO", value: "Disponible para nuevas oportunidades" }],
    contacts: [
      { label: "Email", href: "mailto:alonsogomezana03@gmail.com" },
      { label: "GitHub", href: "https://github.com/Ana-Alonso" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/ana-alonso-221474305" },
    ],
  },
};

export function getDialogContent(section: string): DialogContent {
  const normalizedSection = normalizeSection(section);

  return (
    DIALOG_BY_SECTION[normalizedSection] ?? {
      title: section,
      body: "Seccion en construccion. Pronto habra mas contenido interactivo aqui.",
    }
  );
}
