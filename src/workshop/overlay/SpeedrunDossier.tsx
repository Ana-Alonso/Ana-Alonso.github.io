import {
  Download,
  ExternalLink,
  X,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Languages as LanguagesIcon,
  Sparkles,
  Check,
  Copy,
  Filter,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { contactLinks, education, experience, languages, profile, projects, skillCategories } from '../../record/content';

interface SpeedrunDossierProps {
  onClose: () => void;
}

export function SpeedrunDossier({ onClose }: SpeedrunDossierProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Extraer lista única de tecnologías principales para filtrar
  const availableTechs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tech.forEach((t) => set.add(t)));
    return Array.from(set);
  }, []);

  // Filtrar proyectos según tecnología seleccionada
  const filteredProjects = useMemo(() => {
    if (!selectedTech) return projects;
    return projects.filter((p) => p.tech.includes(selectedTech));
  }, [selectedTech]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl h-[94vh] sm:h-[88vh] max-h-[94vh] bg-paper text-ink rounded-xl sm:rounded-2xl shadow-2xl border border-acorn/40 overflow-hidden">
        {/* Cabecera del Dossier */}
        <header className="flex items-center justify-between gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-acorn/25 bg-oat/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-sageDeep text-paper font-bold text-xs shadow-sm shrink-0">
              ⚡
            </span>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm sm:text-base text-acorn-deep leading-tight truncate">
                Resumen Rápido · Dossier Ejecutivo
              </h2>
              <p className="text-[10.5px] sm:text-[11.5px] text-muted truncate">Perfil profesional, experiencia, formación y proyectos clave</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {profile.resumePdf ? (
              <a
                href={profile.resumePdf}
                download="Ana_Alonso_resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-acorn/40 bg-paper text-acorn-deep hover:bg-moss/60 hover:text-ink text-[11px] sm:text-xs font-bold transition-all shadow-sm"
              >
                <Download size={13} className="text-acorn-deep shrink-0" />
                <span className="hidden xs:inline">Descargar CV</span>
                <span className="xs:hidden">CV</span>
              </a>
            ) : null}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full text-muted hover:text-ink hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Cerrar dossier"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* Contenido scrolleable estructurado en tarjetas de resumen */}
        <div className="scroll-area flex-1 min-h-0 overflow-y-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-6 text-sm divide-y divide-acorn/15">
          {/* 1. PERFIL & ELEVATOR PITCH */}
          <section className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold font-display text-ink tracking-tight">{profile.name}</h1>
                <p className="font-medium text-xs sm:text-base text-acorn-deep mt-0.5">{profile.role}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-oat/70 text-muted border border-acorn/20">
                  <MapPin size={12} className="text-acorn-deep shrink-0" /> {profile.location}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage/50 text-ink border border-sageDeep/30 font-medium">
                  <Sparkles size={12} className="text-sageDeep shrink-0" /> Disponible para incorporación
                </span>
              </div>
            </div>

            {/* Barra de Contacto Directo Visible en la cabecera de la ficha */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <a
                href={`mailto:${profile.contactEmail}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white text-ink border border-acorn/20 hover:border-acorn/40 transition-all font-medium shadow-xs"
              >
                <Mail size={13} className="text-acorn-deep shrink-0" />
                <span className="font-mono text-[11.5px]">{profile.contactEmail}</span>
              </a>
              <a
                href="tel:+34617145051"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white text-ink border border-acorn/20 hover:border-acorn/40 transition-all font-medium shadow-xs"
              >
                <Phone size={13} className="text-acorn-deep shrink-0" />
                <span className="font-mono text-[11.5px]">+34 617 14 50 51</span>
              </a>
              {contactLinks
                .filter((c) => c.label === 'LinkedIn' || c.label === 'GitHub')
                .map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-oat/50 hover:bg-moss/60 text-acorn-deep hover:text-ink border border-acorn/20 transition-all font-bold text-[11.5px]"
                  >
                    <span>{c.label}</span>
                    <ExternalLink size={11} className="opacity-70" />
                  </a>
                ))}
            </div>

            <p className="text-muted leading-relaxed text-xs sm:text-sm bg-white/60 p-3 sm:p-3.5 rounded-xl border border-acorn/20">
              {profile.summary}
            </p>

            {/* Focos clave */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
              {profile.focus.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted p-2.5 rounded-lg bg-oat/40 border border-acorn/10">
                  <span className="text-sageDeep font-bold">•</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. COMPETENCIAS TÉCNICAS & IDIOMAS (Prioridad técnica en primera vista) */}
          <section className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-acorn-deep font-bold text-xs uppercase tracking-wider">
              <Code2 size={15} /> Competencias Técnicas & Stack
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {skillCategories.map((cat) => (
                <div key={cat.label} className="p-3.5 rounded-xl bg-white/70 border border-acorn/20 space-y-2 shadow-xs flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-acorn-deep flex items-center justify-between border-b border-acorn/15 pb-1.5">
                      <span>{cat.label}</span>
                      <span className="text-[10px] text-muted font-normal font-mono">{cat.skills.length} skills</span>
                    </h5>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {cat.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-oat/70 text-[11px] font-mono text-ink/85 border border-acorn/15">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fila de Idiomas */}
            <div className="pt-2">
              <div className="p-3 rounded-xl bg-white/60 border border-acorn/20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 text-acorn-deep font-bold text-xs uppercase tracking-wider">
                  <LanguagesIcon size={14} /> Idiomas:
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {languages.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-ink">{lang.name}</span>
                      <span className="text-[11px] text-muted">({lang.level})</span>
                      <span className="font-mono text-xs font-bold text-acorn-deep px-2 py-0.5 rounded bg-paper border border-acorn/20">
                        {lang.cefr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. EXPERIENCIA & FORMACIÓN (En paralelo) */}
          <section className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Experiencia */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-acorn-deep font-bold text-xs uppercase tracking-wider">
                <Briefcase size={15} /> Experiencia Profesional
              </div>
              {experience.map((exp) => (
                <div key={exp.title} className="p-3.5 rounded-xl border border-acorn/25 bg-white/60 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-bold text-ink text-sm">{exp.title}</h4>
                    <span className="font-mono text-[11px] text-sageDeep px-2 py-0.5 rounded-full bg-sage/30">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-acorn-deep">{exp.subtitle}</p>
                  <p className="text-xs text-muted whitespace-pre-line leading-relaxed">{exp.body}</p>
                </div>
              ))}
            </div>

            {/* Formación */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-acorn-deep font-bold text-xs uppercase tracking-wider">
                <GraduationCap size={15} /> Formación Académica
              </div>
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.title} className="p-3.5 rounded-xl border border-acorn/25 bg-white/60 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-bold text-ink text-sm leading-snug">{edu.title}</h4>
                      <span className="font-mono text-[11px] text-muted px-2 py-0.5 rounded-full bg-oat/60 shrink-0">
                        {edu.period}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-acorn-deep">{edu.subtitle}</p>
                    <p className="text-xs text-muted leading-relaxed">{edu.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. PROYECTOS DESTACADOS & MÉTRICAS DE IMPACTO */}
          <section className="pt-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-acorn-deep font-bold text-xs uppercase tracking-wider">
                <FolderGit2 size={15} /> Proyectos Principales (con métricas)
              </div>
              <span className="text-xs text-muted">
                {selectedTech ? `${filteredProjects.length} de ${projects.length} proyectos` : `${projects.length} proyectos`}
              </span>
            </div>

            {/* Filtro interactivo de tecnologías */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-oat/40 border border-acorn/15 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-acorn-deep px-1.5 py-0.5">
                <Filter size={11} /> Filtrar stack:
              </span>
              <button
                type="button"
                onClick={() => setSelectedTech(null)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                  selectedTech === null
                    ? 'bg-acorn-deep text-paper font-bold shadow-xs'
                    : 'bg-paper text-muted hover:text-ink border border-acorn/20'
                }`}
              >
                Todos ({projects.length})
              </button>
              {availableTechs.map((tech) => {
                const count = projects.filter((p) => p.tech.includes(tech)).length;
                const isSelected = selectedTech === tech;
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setSelectedTech(isSelected ? null : tech)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sageDeep text-paper font-bold shadow-xs'
                        : 'bg-paper/80 text-muted hover:text-ink border border-acorn/15 hover:border-acorn/30'
                    }`}
                  >
                    {tech} <span className="opacity-60 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
              {filteredProjects.map((p) => (
                <div key={p.title} className="p-3.5 rounded-xl border border-acorn/25 bg-white/60 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-ink text-sm leading-snug">{p.title}</h4>
                      {p.links[0] && (
                        <a
                          href={p.links[0].href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-acorn-deep hover:text-ink transition-colors shrink-0 bg-oat/70 hover:bg-moss/60 px-2 py-0.5 rounded-md border border-acorn/20"
                          title={p.links[0].label}
                        >
                          <span>{p.links[0].label.includes('GitHub') ? 'GitHub' : 'Demo'}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{p.description}</p>
                  </div>

                  {/* Métricas si existen */}
                  {p.metrics && p.metrics.length > 0 ? (
                    <div className="pt-2 border-t border-acorn/10 space-y-1.5 bg-oat/30 -mx-3.5 px-3.5 py-2 my-1">
                      {p.metrics.map((m) => (
                        <div key={m} className="flex items-start gap-1.5 text-[11.5px] text-muted">
                          <CheckCircle2 size={12} className="text-sageDeep shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Stack chips interactivos */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5 mt-auto border-t border-acorn/10">
                    {p.tech.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTech(selectedTech === t ? null : t)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition-colors cursor-pointer ${
                          selectedTech === t
                            ? 'bg-sageDeep text-paper font-bold border-sageDeep'
                            : 'bg-oat/80 text-ink/80 border-acorn/15 hover:bg-moss/40'
                        }`}
                        title={`Filtrar por ${t}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Espacio final de holgura para evitar solapamientos con el footer */}
          <div className="h-6" />
        </div>

        {/* Footer con CTA directo y enlaces de contacto con copia rápida */}
        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 sm:px-6 py-2.5 sm:py-3 border-t border-acorn/25 bg-oat/60 text-xs shrink-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          <span className="text-muted font-medium text-[11px] sm:text-xs">Información de contacto directo:</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            {profile.contactEmail && (
              <div className="inline-flex items-center gap-1 bg-paper/90 border border-acorn/20 rounded-md px-2 py-0.5 shadow-xs">
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="inline-flex items-center gap-1.5 text-acorn-deep font-bold hover:text-ink transition-colors"
                >
                  <Mail size={13} className="shrink-0" /> <span className="break-all">{profile.contactEmail}</span>
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(profile.contactEmail!, 'email')}
                  className="p-1 text-muted hover:text-ink cursor-pointer transition-colors"
                  title="Copiar email al portapapeles"
                  aria-label="Copiar email"
                >
                  {copiedKey === 'email' ? <Check size={12} className="text-sageDeep" /> : <Copy size={12} />}
                </button>
              </div>
            )}
            {profile.contactPhone && (
              <div className="inline-flex items-center gap-1 bg-paper/90 border border-acorn/20 rounded-md px-2 py-0.5 shadow-xs">
                <a
                  href="tel:+34617145051"
                  className="inline-flex items-center gap-1.5 text-acorn-deep font-bold hover:text-ink transition-colors"
                >
                  <Phone size={13} className="shrink-0" /> {profile.contactPhone}
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(profile.contactPhone!, 'phone')}
                  className="p-1 text-muted hover:text-ink cursor-pointer transition-colors"
                  title="Copiar teléfono al portapapeles"
                  aria-label="Copiar teléfono"
                >
                  {copiedKey === 'phone' ? <Check size={12} className="text-sageDeep" /> : <Copy size={12} />}
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              {contactLinks
                .filter((c) => c.label === 'LinkedIn' || c.label === 'GitHub')
                .map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-acorn-deep font-bold underline underline-offset-2 hover:text-ink transition-colors"
                  >
                    {c.label} ↗
                  </a>
                ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
