import React, { Component, Suspense, type ErrorInfo, type ReactNode } from 'react';

const SpeedrunDossier = React.lazy(() =>
  import('../overlay/SpeedrunDossier').then((m) => ({ default: m.SpeedrunDossier }))
);

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('WebGL / 3D Canvas Error captured:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-paper text-ink">
          <div className="text-center max-w-md space-y-3 mb-6">
            <span className="text-3xl">🛠️</span>
            <h1 className="font-display text-xl text-acorn-deep">Modo Compatible Activado</h1>
            <p className="text-xs text-muted leading-relaxed">
              Tu navegador o hardware no tiene aceleración WebGL disponible. Hemos desplegado automáticamente el dossier
              completo con todos los proyectos, experiencia y contacto.
            </p>
          </div>
          <div className="w-full max-w-4xl h-[85vh]">
            <Suspense fallback={null}>
              <SpeedrunDossier onClose={() => this.setState({ hasError: false, error: null })} />
            </Suspense>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
