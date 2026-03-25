import { useEffect, useMemo } from "react";
import { getDialogContent } from "../constants/modalContent";
import { useTypewriter } from "../hooks";
import { PixelModal, PixelText } from "../ui";

const THEME_TITLE: Record<string, string> = {
  "mailbox-letter": "Carta del buzon",
  "enrollment-form": "Matricula",
  "factory-sheet": "Ficha de fabrica",
  "radio-panel": "Panel de cabina",
};

type UIModalProps = {
  section: string;
  onClose: () => void;
};

export default function UIModal({ section, onClose }: UIModalProps) {
  const content = useMemo(() => getDialogContent(section), [section]);
  const typedBody = useTypewriter(content.body);

  const enrollmentId = useMemo(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const sequence = String((content.studies?.length ?? 0) + 1).padStart(3, "0");
    return `${content.enrollmentPrefix ?? "UNI"}-${year}${month}-${sequence}`;
  }, [content.enrollmentPrefix, content.studies]);

  const productionProgress = Math.min(100, (content.skills?.length ?? 0) * 6);

  const progressSegments = useMemo(() => {
    if (!content.skills?.length || !content.skillCategories?.length) {
      return [];
    }

    const availableSkills = new Set(content.skills.map((skill) => skill.label));
    const total = content.skills.length;

    return content.skillCategories
      .map((category) => {
        const count = category.skills.filter((skill) => availableSkills.has(skill)).length;
        const percent = Math.round((count / total) * 100);

        return {
          label: category.label,
          count,
          percent,
        };
      })
      .filter((segment) => segment.count > 0);
  }, [content.skillCategories, content.skills]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const themeClass = content.theme
    ? `dialog-theme-${content.theme}`
    : "dialog-theme-default";
  const frameTitle = content.theme ? THEME_TITLE[content.theme] : "Registro";

  return (
    <PixelModal isOpen={true} onClose={onClose} title={content.title}>
      <div className={`dialog-frame ${themeClass}`}>
        <p className="dialog-frame-title">{frameTitle}</p>

        <div className="dialog-paper">
          {content.theme === "mailbox-letter" && (
            <div className="dialog-theme-head dialog-mailbox-head" aria-hidden="true">
              <span>De: Ana</span>
              <span>Buzon 01</span>
            </div>
          )}

          {content.theme === "mailbox-letter" && (
            <div className="dialog-stamp" aria-hidden="true">
              {content.stampText ?? "SELLO PIXEL"}
            </div>
          )}

          {content.theme === "enrollment-form" && (
            <div className="dialog-theme-head dialog-enrollment-head" aria-hidden="true">
              <span>Formulario de matricula</span>
              <span>Estado: Validado</span>
            </div>
          )}

          {content.theme === "enrollment-form" && (
            <div className="dialog-enrollment-id" aria-hidden="true">
              Expediente: {enrollmentId}
            </div>
          )}

          {content.theme === "factory-sheet" && (
            <div className="dialog-theme-head dialog-factory-head" aria-hidden="true">
              <span>Linea activa: Front-end</span>
              <span>Control: OK</span>
            </div>
          )}

          {content.theme === "factory-sheet" && (
            <div className="dialog-progress" aria-hidden="true">
              <span>Produccion</span>
              <div className="dialog-progress-track">
                <div
                  className="dialog-progress-fill"
                  style={{ width: `${productionProgress}%` }}
                />
              </div>
              <span>{productionProgress}%</span>
            </div>
          )}

          {content.theme === "factory-sheet" && progressSegments.length > 0 && (
            <div className="dialog-progress-segments" aria-hidden="true">
              {progressSegments.map((segment) => (
                <div
                  key={segment.label}
                  className={`dialog-progress-segment dialog-progress-segment--${segment.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span>{segment.label}</span>
                  <div className="dialog-progress-track">
                    <div
                      className="dialog-progress-fill"
                      style={{ width: `${segment.percent}%` }}
                    />
                  </div>
                  <span>{segment.percent}%</span>
                </div>
              ))}
            </div>
          )}

          {content.theme === "radio-panel" && (
            <div className="dialog-theme-head dialog-radio-head" aria-hidden="true">
              <span>Canal: CAB-01</span>
              <span>Senal: Estable</span>
            </div>
          )}

          {content.theme === "radio-panel" && (
            <div className="dialog-on-air" aria-hidden="true">
              <span className="dialog-on-air-dot" />
              <span>ON AIR</span>
            </div>
          )}

          <PixelText variant="body" className="typewriter-text">
            {typedBody}
          </PixelText>

          {content.meta && (
            <ul className="dialog-meta-list">
              {content.meta.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          )}

          {content.studies && (
            <>
              <p className="dialog-block-title">Expediente</p>
              <ul className="pixel-list">
                {content.studies.map((study) => (
                  <li key={study}>{study}</li>
                ))}
              </ul>
            </>
          )}

          {content.skills && (
            <>
              <p className="dialog-block-title">Linea de produccion</p>
              {content.theme === "factory-sheet" && content.skillCategories ? (
                <div className="skill-categories">
                  {content.skillCategories.map((category) => {
                    const categorySkills = content.skills?.filter((skill) =>
                      category.skills.includes(skill.label)
                    ) ?? [];

                    if (categorySkills.length === 0) return null;

                    return (
                      <div
                        key={category.label}
                        className={`skill-category skill-category--${category.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <h4 className="skill-category-title">{category.label}</h4>
                        <div className="skill-grid">
                          {categorySkills.map((skill) => (
                            <div key={skill.label} className="skill-card">
                              <span className="skill-icon">{skill.icon}</span>
                              <span>{skill.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="skill-grid">
                  {content.skills.map((skill) => (
                    <div key={skill.label} className="skill-card">
                      <span className="skill-icon">{skill.icon}</span>
                      <span>{skill.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {content.contacts && (
            <>
              <p className="dialog-block-title">Canales</p>
              <ul className="link-list">
                {content.contacts.map((contact) => (
                  <li key={contact.href}>
                    <a href={contact.href} target="_blank" rel="noreferrer">
                      {contact.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          {content.theme === "mailbox-letter" && (
            <p className="dialog-signature" aria-hidden="true">
              Firma: Ana
            </p>
          )}
        </div>
      </div>
    </PixelModal>
  );
}
