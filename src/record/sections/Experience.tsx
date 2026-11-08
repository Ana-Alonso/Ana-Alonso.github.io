import { experience } from '../content';
import { TimelineList } from './TimelineList';

export function Experience() {
  return (
    <div className="space-y-5">
      <p className="text-[13.5px] leading-relaxed text-ink/85">
        Prácticas en producto real: componentes frontend modulares en React y TypeScript, integración
        con Supabase y entregas en equipo ágil. El trabajo fin de grado vive en Proyectos, que es donde
        se puede abrir.
      </p>
      <TimelineList blocks={experience} />
    </div>
  );
}
