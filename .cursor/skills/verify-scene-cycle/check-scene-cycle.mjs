#!/usr/bin/env node
// Exhaustive check of the playable scene ring and the menu tween stop.
// Runs the scene methods. Phaser itself is replaced so ScenePlugin and the canvas are not started.

import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.resolve(skillDir, '../../..');
const mockUrl = pathToFileURL(path.join(skillDir, 'phaser-mock.mjs')).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'phaser') {
      return { url: mockUrl, shortCircuit: true };
    }
    if (specifier.startsWith('.') && context.parentURL) {
      const parentPath = fileURLToPath(context.parentURL);
      const candidate = path.resolve(path.dirname(parentPath), specifier);
      for (const ext of ['.ts', '.tsx', '.mjs', '.js']) {
        const file = candidate.endsWith(ext) ? candidate : `${candidate}${ext}`;
        if (existsSync(file)) {
          return { url: pathToFileURL(file).href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

const { MainMenu } = await import(pathToFileURL(path.join(repoRoot, 'src/game/scenes/MainMenu.ts')).href);
const { Game } = await import(pathToFileURL(path.join(repoRoot, 'src/game/scenes/Game.ts')).href);
const { GameOver } = await import(pathToFileURL(path.join(repoRoot, 'src/game/scenes/GameOver.ts')).href);

const successor = {
  MainMenu: 'Game',
  Game: 'GameOver',
  GameOver: 'MainMenu',
};

const failures = [];

function checkSuccessor(label, SceneClass, fromKey) {
  const scene = new SceneClass();
  const log = [];
  scene.scene = {
    key: fromKey,
    start(name) {
      log.push(['start', name]);
    },
  };
  scene.changeScene();
  const expected = successor[fromKey];
  if (log.length !== 1 || log[0][0] !== 'start' || log[0][1] !== expected) {
    const started = log.filter((entry) => entry[0] === 'start').map((entry) => entry[1]).join(', ') || 'nothing';
    failures.push(`${label}: Change Scene started ${started}, but the next scene is ${expected}.`);
  }
}

function checkTweenStop() {
  const scene = new MainMenu();
  const log = [];
  scene.logoTween = {
    stop() {
      log.push('stop');
    },
  };
  scene.scene = {
    key: 'MainMenu',
    start(name) {
      log.push(`start ${name}`);
    },
  };
  scene.changeScene();
  const expected = ['stop', 'start Game'];
  if (log.join(' | ') !== expected.join(' | ') || scene.logoTween !== null) {
    failures.push(
      `Main Menu with a logo tween: Change Scene did ${log.join(' then ') || 'nothing'}, and logoTween is ${scene.logoTween === null ? 'clear' : 'still set'}. It must stop the tween, clear it, and only then start Game.`
    );
  }
}

checkSuccessor('Main Menu', MainMenu, 'MainMenu');
checkTweenStop();
checkSuccessor('Game', Game, 'Game');
checkSuccessor('Game Over', GameOver, 'GameOver');

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log('Scene ring holds: Main Menu → Game → Game Over → Main Menu.');
console.log('Leaving the main menu with a logo tween stops and clears that tween before Game starts.');
