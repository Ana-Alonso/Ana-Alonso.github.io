import Phaser from "phaser";
import { GAME_ASSETS } from "../assets/game";
import { MAP_ASSETS } from "../assets/map";
import type { CollisionArea, RawColisionesData } from "../types";
import type {
  InteractionHintDetail,
  MobileDirection,
  OpenUiDetail,
  TeleportPlayerDetail,
  TouchMoveDetail,
} from "../types/events";
import {
  DEFAULT_SPAWN_POI_ID,
  getPoiDestinationById,
  POI_DESTINATIONS,
  POI_MAP_HEIGHT,
  POI_MAP_WIDTH,
} from "./poiConfig";

const PLAYER_SPEED = 130;
const DEFAULT_SPAWN_X = 512;
const DEFAULT_SPAWN_Y = 348;
const TRIGGER_SIZE = 32;


const WALK_ANIM_RANGES = {
  down: { start: 143, end: 155, idle: 143 },
  up: { start: 130, end: 142, idle: 130 },
  left: { start: 117, end: 129, idle: 117 },
  right: { start: 104, end: 116, idle: 104 },
} as const;

type FacingDirection = "down" | "up" | "left" | "right";

type TriggerZone = Phaser.GameObjects.Zone & {
  body: Phaser.Physics.Arcade.StaticBody;
};

type ActiveTriggerDetail = {
  section: string;
  poiId: number;
};

export default class Scene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private poiScaleX = 1;
  private poiScaleY = 1;
  private mapWidth = 0;
  private mapHeight = 0;
  private facing: FacingDirection = "down";
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private keyInteractE!: Phaser.Input.Keyboard.Key;
  private keyInteractEnter!: Phaser.Input.Keyboard.Key;
  private triggerZones!: Phaser.GameObjects.Group;
  private activeTriggerPoiId: number | null = null;
  private activeTriggerName: string | null = null;
  private lastSentHintSection: string | null = null;
  private lastSentHintPoiId: number | null = null;
  private lastWarnedTriggerName: string | null = null;
  private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
  private touchMovement: Record<MobileDirection, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  private touchInteractRequested = false;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    this.load.image("map", GAME_ASSETS.mapImageUrl);

    this.load.spritesheet("player", GAME_ASSETS.playerSpritesheetUrl, {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create(): void {
    const mapImage = this.add.image(0, 0, "map").setOrigin(0, 0);
    const mapWidth = mapImage.width;
    const mapHeight = mapImage.height;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    const metadataWidth = POI_MAP_WIDTH || mapWidth;
    const metadataHeight = POI_MAP_HEIGHT || mapHeight;
    this.poiScaleX = mapWidth / metadataWidth;
    this.poiScaleY = mapHeight / metadataHeight;

    this.cameras.main.roundPixels = true;

    const spawnPoint = this.getPlayerSpawnPoint();

    // Usar atlas LPC con pivote en pies (0.5, 0.9)
    this.player = this.physics.add.sprite(
      spawnPoint.x,
      spawnPoint.y,
      "player",
      0, // Frame inicial: walk_down_0
    );
    this.player.setOrigin(0.5, 0.9); // Pivote en los pies
    this.player.setCollideWorldBounds(true);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(20, 28);
    playerBody.setOffset(0, 0);

    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    this.createAnimations();
    this.createCollisionsFromTilemap();
    this.createInteractionTriggers();

    window.addEventListener("teleport-player", this.onTeleportPlayer);
    window.addEventListener("touch-move", this.onTouchMove);
    window.addEventListener("touch-interact", this.onTouchInteract);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.emitInteractionHint(null, null);
      this.lastSentHintSection = null;
      this.lastSentHintPoiId = null;
      window.removeEventListener("teleport-player", this.onTeleportPlayer);
      window.removeEventListener("touch-move", this.onTouchMove);
      window.removeEventListener("touch-interact", this.onTouchInteract);
      this.touchMovement = { up: false, down: false, left: false, right: false };
      this.touchInteractRequested = false;
    });

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as {
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
    };

    this.keyInteractE = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyInteractEnter = keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER,
    );
  }

  update(): void {
    if (!this.player?.body || !this.cursors || !this.wasd) {
      return;
    }

    this.handleMovement();
    this.checkTriggerOverlap();

    if (
      this.activeTriggerName &&
      (Phaser.Input.Keyboard.JustDown(this.keyInteractE) ||
        Phaser.Input.Keyboard.JustDown(this.keyInteractEnter) ||
        this.touchInteractRequested)
    ) {
      const detail: OpenUiDetail = { section: this.activeTriggerName };
      window.dispatchEvent(
        new CustomEvent<OpenUiDetail>("open-ui", { detail }),
      );
    }

    this.touchInteractRequested = false;
  }

  private onTeleportPlayer = (event: Event): void => {
    const customEvent = event as CustomEvent<TeleportPlayerDetail>;
    const poiId = customEvent.detail?.poiId;
    if (typeof poiId !== "number") {
      return;
    }

    this.teleportPlayerToPoi(poiId);
  };

  private onTouchMove = (event: Event): void => {
    const customEvent = event as CustomEvent<TouchMoveDetail>;
    const direction = customEvent.detail?.direction;
    const isActive = customEvent.detail?.isActive;

    if (!direction || typeof isActive !== "boolean") {
      return;
    }

    this.touchMovement[direction] = isActive;
  };

  private onTouchInteract = (_event: Event): void => {
    this.touchInteractRequested = true;
  };

  private teleportPlayerToPoi(poiId: number): void {
    const destination = getPoiDestinationById(poiId);
    if (!destination || !this.player?.body) {
      return;
    }

    const targetX = destination.x * this.poiScaleX;
    const targetY = destination.y * this.poiScaleY;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(0, 0);
    this.player.setPosition(targetX, targetY);
    this.player.anims.stop();
    this.player.setFrame(WALK_ANIM_RANGES.down.idle);
    this.facing = "down";
    this.activeTriggerName = destination.section;
    this.activeTriggerPoiId = destination.id;

    this.cameras.main.centerOn(targetX, targetY);
    this.emitInteractionHint(destination.section, destination.id);
    this.lastSentHintSection = destination.section;
    this.lastSentHintPoiId = destination.id;
  }

  private createAnimations(): void {
    this.createWalkAnimation("walk-down", WALK_ANIM_RANGES.down.start, WALK_ANIM_RANGES.down.end);
    this.createWalkAnimation("walk-up", WALK_ANIM_RANGES.up.start, WALK_ANIM_RANGES.up.end);
    this.createWalkAnimation("walk-left", WALK_ANIM_RANGES.left.start, WALK_ANIM_RANGES.left.end);
    this.createWalkAnimation("walk-right", WALK_ANIM_RANGES.right.start, WALK_ANIM_RANGES.right.end);
  }

  private createWalkAnimation(key: string, start: number, end: number): void {
    const texture = this.textures.get("player");
    const maxFrame = texture.frameTotal - 1;
    const safeStart = Math.max(0, Math.min(start, maxFrame));
    const safeEnd = Math.max(safeStart, Math.min(end, maxFrame));
    const frames = this.anims.generateFrameNumbers("player", {
      start: safeStart,
      end: safeEnd,
    });

    // Evita registrar animaciones vacias, lo que rompe anim.play() en tiempo de ejecucion.
    if (frames.length === 0) {
      return;
    }

    if (this.anims.exists(key)) {
      this.anims.remove(key);
    }

    this.anims.create({
      key,
      frames,
      frameRate: 8,
      repeat: -1,
    });
  }

  private playIfExists(key: string): void {
    const animation = this.anims.get(key);
    if (animation && animation.frames.length > 0) {
      this.player.anims.play(key, true);
    }
  }

  private createCollisionsFromTilemap(): void {
    const colisionesData = MAP_ASSETS.collisionsRaw as RawColisionesData;
    const collisionAreas: CollisionArea[] = (colisionesData.colisiones || []).map(
      (obj) => ({
        x: obj.x,
        y: obj.y,
        width: obj.w,
        height: obj.h,
        type: obj.tipo,
      }),
    );

    this.collisionGroup = this.physics.add.staticGroup();

    if (collisionAreas.length > 0) {
      collisionAreas.forEach((obj) => {
        if (
          obj.x !== undefined &&
          obj.y !== undefined &&
          obj.width &&
          obj.height &&
          obj.width > 0 &&
          obj.height > 0
        ) {
          // El JSON de colisiones esta dibujado sobre fondo1.png, se usa en coordenadas reales.
          const scaledX = obj.x;
          const scaledY = obj.y;
          const scaledWidth = obj.width;
          const scaledHeight = obj.height;

          const zone = this.add.zone(
            scaledX + scaledWidth / 2,
            scaledY + scaledHeight / 2,
            scaledWidth,
            scaledHeight,
          );

          this.physics.add.existing(zone, true);

          // Agregar propiedad con el tipo de colisión para debugging
          if (obj.type) {
            zone.setData("collisionType", obj.type);
          }

          this.collisionGroup.add(zone);
        }
      });
    }

    this.physics.add.collider(this.player, this.collisionGroup);
  }

  private getPlayerSpawnPoint(): { x: number; y: number } {
    const spawnPoint = getPoiDestinationById(DEFAULT_SPAWN_POI_ID);

    if (spawnPoint) {
      return {
        x: spawnPoint.x * this.poiScaleX,
        y: spawnPoint.y * this.poiScaleY,
      };
    }

    return {
      x: this.mapWidth / 2 || DEFAULT_SPAWN_X,
      y: this.mapHeight / 2 || DEFAULT_SPAWN_Y,
    };
  }

  private createInteractionTriggers(): void {
    this.triggerZones = this.add.group();

    POI_DESTINATIONS.forEach((point) => {
      const zone = this.add
        .zone(
          point.x * this.poiScaleX,
          point.y * this.poiScaleY,
          TRIGGER_SIZE * this.poiScaleX,
          TRIGGER_SIZE * this.poiScaleY,
        )
        .setOrigin(0.5, 0.5) as TriggerZone;
      this.physics.add.existing(zone, true);
      zone.setData("section", point.section);
      zone.setData("poiId", point.id);
      this.triggerZones.add(zone);
    });
  }

  private emitInteractionHint(section: string | null, poiId: number | null): void {
    const detail: InteractionHintDetail = {
      isInteractive: Boolean(section),
      section,
      poiId,
    };
    window.dispatchEvent(
      new CustomEvent<InteractionHintDetail>("interaction-hint", { detail }),
    );
  }

  private checkTriggerOverlap(): void {
    this.activeTriggerPoiId = null;
    this.activeTriggerName = null;
    this.physics.overlap(
      this.player,
      this.triggerZones,
      (_player, zoneObject) => {
        const zone = zoneObject as Phaser.GameObjects.Zone;
        const section = zone.getData("section") as string | undefined;
        const poiId = zone.getData("poiId") as number | undefined;
        if (section) {
          this.activeTriggerName = section;
          this.activeTriggerPoiId = typeof poiId === "number" ? poiId : null;
        }
      },
      undefined,
      this,
    );

    if (!this.activeTriggerName) {
      const proximityTrigger = this.resolveTriggerByProximity();
      if (proximityTrigger) {
        this.activeTriggerName = proximityTrigger.section;
        this.activeTriggerPoiId = proximityTrigger.poiId;
      }
    }

    if (
      this.activeTriggerName !== this.lastSentHintSection ||
      this.activeTriggerPoiId !== this.lastSentHintPoiId
    ) {
      this.emitInteractionHint(this.activeTriggerName, this.activeTriggerPoiId);
      this.lastSentHintSection = this.activeTriggerName;
      this.lastSentHintPoiId = this.activeTriggerPoiId;
    }

    // Warn solo al entrar/cambiar de punto de interaccion para evitar ruido por frame.
    if (this.activeTriggerName && this.activeTriggerName !== this.lastWarnedTriggerName) {
      console.warn(`[INTERACCION] Punto activo: ${this.activeTriggerName}`);
      this.lastWarnedTriggerName = this.activeTriggerName;
      return;
    }

    if (!this.activeTriggerName) {
      this.lastWarnedTriggerName = null;
    }
  }

  private resolveTriggerByProximity(): ActiveTriggerDetail | null {
    if (!this.player) {
      return null;
    }

    const playerX = this.player.x;
    const playerY = this.player.y;
    const baseRadius = Math.max(TRIGGER_SIZE * this.poiScaleX, TRIGGER_SIZE * this.poiScaleY) * 0.9;
    let nearest: ActiveTriggerDetail | null = null;
    let nearestDistSq = Number.POSITIVE_INFINITY;

    POI_DESTINATIONS.forEach((point) => {
      const targetX = point.x * this.poiScaleX;
      const targetY = point.y * this.poiScaleY;
      const dx = targetX - playerX;
      const dy = targetY - playerY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= baseRadius * baseRadius && distSq < nearestDistSq) {
        nearest = { section: point.section, poiId: point.id };
        nearestDistSq = distSq;
      }
    });

    return nearest;
  }

  private handleMovement(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    const left = this.cursors.left?.isDown || this.wasd.left.isDown || this.touchMovement.left;
    const right =
      this.cursors.right?.isDown || this.wasd.right.isDown || this.touchMovement.right;
    const up = this.cursors.up?.isDown || this.wasd.up.isDown || this.touchMovement.up;
    const down = this.cursors.down?.isDown || this.wasd.down.isDown || this.touchMovement.down;

    let dirX = 0;
    let dirY = 0;

    if (left && !right) {
      dirX = -1;
    } else if (right && !left) {
      dirX = 1;
    }

    if (up && !down) {
      dirY = -1;
    } else if (down && !up) {
      dirY = 1;
    }

    if (dirX !== 0 || dirY !== 0) {
      if (dirX !== 0 && dirY !== 0) {
        // Mantener velocidad constante en diagonal.
        const diagonalFactor = Math.SQRT1_2;
        body.setVelocity(
          dirX * PLAYER_SPEED * diagonalFactor,
          dirY * PLAYER_SPEED * diagonalFactor,
        );
      } else {
        body.setVelocity(dirX * PLAYER_SPEED, dirY * PLAYER_SPEED);
      }

      if (dirY < 0 && dirX === 0) {
        this.facing = "up";
        this.playIfExists("walk-right");
      } else if (dirY > 0 && dirX === 0) {
        this.facing = "down";
        this.playIfExists("walk-down");
      } else if (dirX < 0) {
        this.facing = "left";
        this.playIfExists("walk-left");
      } else if (dirX > 0) {
        this.facing = "right";
        this.playIfExists("walk-down");
      }
      return;
    }

    body.setVelocity(0, 0);
    this.player.anims.stop();
    const texture = this.textures.get("player");
    const maxFrame = texture.frameTotal - 1;
    const idleFrames: Record<FacingDirection, number> = {
      down: Math.min(WALK_ANIM_RANGES.down.idle, maxFrame),
      up: Math.min(WALK_ANIM_RANGES.up.idle, maxFrame),
      left: Math.min(WALK_ANIM_RANGES.left.idle, maxFrame),
      right: Math.min(WALK_ANIM_RANGES.right.idle, maxFrame),
    };
    this.player.setFrame(idleFrames[this.facing]);
  }
}
