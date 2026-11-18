// Stand-in for the phaser package. The scene-cycle check calls changeScene only.
// It does not boot a canvas, a loader, or a tween manager.

export class Scene {
  constructor(config) {
    const key = typeof config === 'string' ? config : config?.key;
    this.scene = {
      key,
      start() {},
    };
  }
}

export class Events {
  static EventEmitter = class EventEmitter {
    on() {}
    off() {}
    emit() {}
    removeListener() {}
  };
}

export const GameObjects = {};
export const AUTO = 'AUTO';
export const Scale = { FIT: 'FIT', CENTER_BOTH: 'CENTER_BOTH' };
export class Game {}
