import { useCallback, useEffect, useRef, useState } from "react";
import type { MobileDirection, TouchInteractDetail, TouchMoveDetail } from "../types/events";

type MobileControlsProps = {
  disabled: boolean;
};

const JOYSTICK_RADIUS = 46;
const DEAD_ZONE = 14;

function emitTouchMove(direction: MobileDirection, isActive: boolean): void {
  const detail: TouchMoveDetail = { direction, isActive };
  window.dispatchEvent(new CustomEvent<TouchMoveDetail>("touch-move", { detail }));
}

function emitTouchInteract(): void {
  const detail: TouchInteractDetail = { requestedAt: Date.now() };
  window.dispatchEvent(
    new CustomEvent<TouchInteractDetail>("touch-interact", { detail }),
  );
}

function vibrateSafe(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch {
    // Fallback silencioso en navegadores que bloquean vibracion.
  }
}

function resolveDirection(x: number, y: number): MobileDirection | null {
  if (Math.abs(x) < DEAD_ZONE && Math.abs(y) < DEAD_ZONE) {
    return null;
  }

  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? "right" : "left";
  }

  return y > 0 ? "down" : "up";
}

export default function MobileControls({ disabled }: MobileControlsProps) {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const activeDirectionRef = useRef<MobileDirection | null>(null);
  const [activeDirection, setActiveDirection] = useState<MobileDirection | null>(null);
  const [thumbPosition, setThumbPosition] = useState({ x: 0, y: 0 });

  const updateDirection = useCallback((nextDirection: MobileDirection | null) => {
    const previousDirection = activeDirectionRef.current;

    if (previousDirection === nextDirection) {
      return;
    }

    if (previousDirection) {
      emitTouchMove(previousDirection, false);
    }

    if (nextDirection) {
      emitTouchMove(nextDirection, true);
      vibrateSafe(10);
    }

    activeDirectionRef.current = nextDirection;
    setActiveDirection(nextDirection);
  }, []);

  const resetJoystick = useCallback(() => {
    setThumbPosition({ x: 0, y: 0 });
    updateDirection(null);
    activePointerIdRef.current = null;
  }, [updateDirection]);

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) {
      return;
    }

    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const clampedDistance = Math.min(distance, JOYSTICK_RADIUS);
    const angle = Math.atan2(deltaY, deltaX);

    const x = Math.cos(angle) * clampedDistance;
    const y = Math.sin(angle) * clampedDistance;
    setThumbPosition({ x, y });
    updateDirection(resolveDirection(deltaX, deltaY));
  }, [updateDirection]);

  useEffect(() => {
    if (!disabled || !activeDirection) {
      return;
    }

    resetJoystick();
  }, [activeDirection, disabled, resetJoystick]);

  useEffect(() => {
    return () => {
      resetJoystick();
    };
  }, [resetJoystick]);

  const handleJoystickDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    activePointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX, event.clientY);
  };

  const handleJoystickMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    updateFromPointer(event.clientX, event.clientY);
  };

  const handleJoystickEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // No-op
    }

    resetJoystick();
  };

  const handleInteract = () => {
    if (disabled) {
      return;
    }

    emitTouchInteract();
    vibrateSafe([12, 20, 12]);
  };

  return (
    <div className="mobile-controls" aria-hidden={disabled}>
      <div
        ref={joystickBaseRef}
        className={`mobile-joystick-base ${activeDirection ? "is-active" : ""}`}
        role="group"
        aria-label="Joystick de movimiento tactil"
        onPointerDown={handleJoystickDown}
        onPointerMove={handleJoystickMove}
        onPointerUp={handleJoystickEnd}
        onPointerCancel={handleJoystickEnd}
        onPointerLeave={handleJoystickEnd}
      >
        <div
          className="mobile-joystick-thumb"
          style={{ transform: `translate(${thumbPosition.x}px, ${thumbPosition.y}px)` }}
        />
      </div>

      <button
        type="button"
        className="mobile-btn mobile-btn-action"
        onPointerDown={handleInteract}
        disabled={disabled}
        aria-label="Interactuar"
      >
        Interactuar
      </button>
    </div>
  );
}

