# Portfolio Interactivo (React + Phaser)

Portfolio gamificado con estetica retro: controlas un personaje sobre el mapa principal y accedes a secciones del portfolio mediante POIs interactivos.

## Stack

- React + TypeScript
- Phaser 3
- Create React App (`react-scripts`)
- Sistema de temas con Context API + CSS Variables

## Inicio rapido

### Requisitos

- Node.js 18+
- npm

### Instalacion

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Alternativa:

```bash
npm start
```

### Build

```bash
npm run build
```

### Tests

```bash
npm test
```

## Caracteristicas principales

- Juego fullscreen y responsive
- Sistema de temas dinamico (5 temas)
- ThemeSwitcher minimizable (esquina superior izquierda)
- Mapa de navegacion interactivo y minimizable
- HUD y modales adaptativos
- Arquitectura modular por capas

## POIs e interacciones

Spawn inicial: **POI `0`**.

Al entrar a una zona interactiva aparece un aviso y se puede interactuar con **`E`** o **`Enter`**.

- `0 - Casa`: presentacion
- `1 - Universidad`: formacion
- `2 - Fabrica`: skills
- `3 - Cabina`: contacto

Configuracion de POIs: `src/game/poiConfig.ts`
Contenido de modales: `src/constants/modalContent.ts`

## Sistema de temas

El proyecto usa un sistema type-safe en `src/theme`.

### Temas disponibles

- `retro`
- `retro-dark`
- `neon`
- `light`
- `matrix`

### Como funciona

- `ThemeProvider` envuelve la app en `src/index.tsx`
- `useTheme()` expone `currentTheme`, `themeName`, `setTheme`
- Los tokens se inyectan como CSS Variables en `:root`
- El tema activo se persiste en `localStorage`

### Agregar un tema nuevo

1. Editar `src/theme/presets.ts` y definir un nuevo objeto `Theme`.
2. Agregarlo al objeto `THEMES`.
3. El `ThemeSwitcher` lo mostrara automaticamente.

## Responsive

Breakpoints principales definidos en `src/styles/retro-ui.css`:

- `@media (max-width: 1024px)`
- `@media (max-width: 768px)`
- `@media (max-width: 480px)`

Elementos adaptativos:

- `ThemeSwitcher`
- `InteractionMap`
- `pixel-hud`
- `pixel-modal`
- `travel-overlay`

## CSS y convenciones

`src/styles/retro-ui.css` define principalmente **estructura/layout**.

- Colores y tokens: `src/theme/presets.ts`
- Estructura visual y responsive: `src/styles/retro-ui.css`

## Arquitectura

- `src/App.tsx`: composicion de vistas
- `src/app/useAppController.ts`: orquestacion de flujo app
- `src/components/*`: componentes de presentacion
- `src/ui/*`: design system (`PixelButton`, `PixelModal`, `PixelText`)
- `src/theme/*`: proveedor, hook y presets de tema
- `src/game/*`: escena Phaser y config de juego
- `src/hooks/*`: hooks de eventos, UI, viaje y pausa
- `src/assets/*`: assets organizados por dominio (`game`, `map`, `ui`)
- `src/types/*`: contratos y tipos compartidos

## Estructura principal

```text
src/
  app/
    useAppController.ts
  assets/
    index.ts
    game/
      character-spritesheet.png
      fondo1.png
      index.ts
    map/
      fondo1_colisiones_rpg_hibrido.json
      mapa_poi_points.json
      index.ts
    ui/
      bus.png
      index.ts
  components/
    GameContainer.tsx
    InteractionMap.tsx
    ThemeSwitcher.tsx
    TravelLoadingOverlay.tsx
    UIModal.tsx
  constants/
    modalContent.ts
    timing.ts
  game/
    PhaserConfig.ts
    poiConfig.ts
    Scene.ts
  hooks/
    index.ts
    useGameEvents.ts
    useGameScenePause.ts
    useTravelState.ts
    useTypewriter.ts
    useUIState.ts
  styles/
    retro-ui.css
  theme/
    index.ts
    presets.ts
    theme.ts
    ThemeProvider.tsx
    useTheme.ts
  types/
    assets.d.ts
    events.ts
  ui/
    index.ts
    PixelButton.tsx
    PixelModal.tsx
    PixelText.tsx
  utils/
    section.ts
  App.tsx
  index.tsx
  types.ts
```

## Notas

- Assets se consumen via manifiestos (`src/assets/*/index.ts`).
- Build de produccion se genera en `build/`.
- Este `README.md` es la unica fuente de documentacion del proyecto.
