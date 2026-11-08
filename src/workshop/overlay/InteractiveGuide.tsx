import { useEffect, useState } from 'react';
import { Compass, Sparkles, X, ChevronRight } from 'lucide-react';
import { useWorkshop } from '../store/useWorkshop';
import { soundEffects } from '../store/useSound';

const STORAGE_KEY = 'portfolio:guide_seen:v1';

export function InteractiveGuide() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const go = useWorkshop((state) => state.go);
  const overview = useWorkshop((state) => state.overview);

  useEffect(() => {
    // Si el usuario ya lo descartó o completó, no molestar automáticamente
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen && window.innerWidth >= 640) {
        // Mostrar con sutil retardo inicial para dar la bienvenida
        const timer = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignorar errores de storage
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignorar
    }
    setOpen(false);
    setCurrentStep(null);
  };

  const startTour = () => {
    soundEffects.whoosh();
    setCurrentStep(0);
    go('profileCard');
  };

  const TOUR_STEPS = [
    {
      view: 'profileCard' as const,
      title: '1. Sobre mí & Enfoque',
      desc: 'Formación en Ingeniería de Software, metodologías y filosofía de código.',
      next: 'blueprint' as const,
    },
    {
      view: 'blueprint' as const,
      title: '2. Proyectos & Métricas',
      desc: 'Explora casos reales con arquitecturas limpias y pruebas de rendimiento.',
      next: 'laptop' as const,
    },
    {
      view: 'laptop' as const,
      title: '3. Terminal Interactiva',
      desc: 'Ejecuta comandos CLI (`npm test`, `skills`) directamente en el navegador.',
      next: 'phone' as const,
    },
    {
      view: 'phone' as const,
      title: '4. Contacto Directo',
      desc: 'Canales de comunicación directos para concertar una entrevista.',
      next: 'overview' as const,
    },
  ];

  const handleNextStep = () => {
    if (currentStep === null) return;
    const nextIdx = currentStep + 1;
    if (nextIdx < TOUR_STEPS.length) {
      setCurrentStep(nextIdx);
      go(TOUR_STEPS[nextIdx].view);
    } else {
      dismiss();
      overview();
    }
  };

  // Si está en medio del tour guiado
  if (currentStep !== null) {
    const step = TOUR_STEPS[currentStep];
    return (
      <div className="fixed bottom-18 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-paper/95 border border-acorn/40 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="size-2 rounded-full bg-sageDeep animate-pulse" />
        <div className="text-xs">
          <p className="font-bold text-ink">{step.title}</p>
          <p className="text-muted text-[11px] hidden sm:block">{step.desc}</p>
        </div>
        <button
          onClick={handleNextStep}
          className="inline-flex items-center gap-1 ml-2 px-3 py-1.5 rounded-full bg-acorn text-paper hover:bg-acorn-deep text-[11px] font-semibold transition-colors cursor-pointer"
        >
          {currentStep === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
          <ChevronRight size={13} />
        </button>
        <button
          onClick={dismiss}
          className="p-1 rounded-full text-muted hover:text-ink transition-colors cursor-pointer"
          title="Cerrar tour"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Modal / Píldora de invitación inicial
  if (!open) return null;

  return (
    <div className="fixed bottom-18 right-4 sm:right-6 z-40 max-w-sm rounded-2xl bg-paper/95 border border-acorn/40 p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-acorn-deep">
          <Compass size={18} className="animate-spin-slow" />
          <h3 className="font-display font-bold text-sm text-ink">¿Primera vez en el taller?</h3>
        </div>
        <button
          onClick={dismiss}
          className="text-muted hover:text-ink p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Cerrar bienvenida"
        >
          <X size={15} />
        </button>
      </div>
      <p className="text-xs text-muted mt-2 leading-relaxed">
        Puedes explorar libremente los objetos 3D o seguir un recorrido express guiado de 1 minuto.
      </p>
      <div className="flex items-center gap-2 mt-3.5">
        <button
          onClick={startTour}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-sageDeep text-paper hover:bg-sage text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Sparkles size={13} />
          Recorrido 1 min
        </button>
        <button
          onClick={dismiss}
          className="px-3 py-1.5 rounded-full border border-acorn/30 text-acorn-deep hover:bg-moss/40 text-xs font-medium transition-colors cursor-pointer"
        >
          Explorar solo
        </button>
      </div>
    </div>
  );
}
