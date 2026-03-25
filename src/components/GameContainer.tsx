import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useTheme } from "../theme";
import { createPhaserConfig } from "../game/PhaserConfig";

type GameContainerProps = {
  onGameReady?: (game: Phaser.Game) => void;
};

export default function GameContainer({ onGameReady }: GameContainerProps) {
  const { currentTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) {
      return;
    }

    gameRef.current = new Phaser.Game(
      createPhaserConfig(containerRef.current, currentTheme.colors.bgPrimary),
    );
    onGameReady?.(gameRef.current);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onGameReady, currentTheme]);

  return <div ref={containerRef} className="game-canvas" />;
}
