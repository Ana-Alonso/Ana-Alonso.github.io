import Phaser from "phaser";
const MainScene = require("./Scene").default;

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 640;

export const createPhaserConfig = (
  parent: HTMLElement | string,
  backgroundColor: string = "#10151d",
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: VIEWPORT_WIDTH,
  height: VIEWPORT_HEIGHT,
  backgroundColor,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  render: {
    pixelArt: true,
    antialias: false,
    antialiasGL: false,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: "parent",
    expandParent: true,
    width: "100%",
    height: "100%",
  },
  scene: [MainScene],
});
