import { useEffect } from "react";
import Phaser from "phaser";

export function useGameScenePause(
  game: Phaser.Game | null,
  shouldPause: boolean
) {
  useEffect(() => {
    if (!game) {
      return;
    }

    if (shouldPause) {
      game.scene.pause("GameScene");
    } else {
      game.scene.resume("GameScene");
    }
  }, [game, shouldPause]);
}

