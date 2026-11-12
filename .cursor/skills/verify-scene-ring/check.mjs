#!/usr/bin/env node
// Read the three changeScene methods and write SceneRing.cfg for /statechart.
// This file does not run the model checker. /statechart does.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(skillDir, '../../..');

const scenes = [
  ['MainMenu', 'src/game/scenes/MainMenu.ts', 'MenuNext'],
  ['Game', 'src/game/scenes/Game.ts', 'GameNext'],
  ['GameOver', 'src/game/scenes/GameOver.ts', 'OverNext'],
];

function changeSceneBody(source, file) {
  const start = source.search(/changeScene\s*\(\s*\)\s*\{/);
  if (start < 0) {
    throw new Error(`${file} has no changeScene() method. The model cannot describe this file.`);
  }
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  throw new Error(`${file} changeScene() has an unclosed body. The model cannot describe this file.`);
}

function startName(body, file) {
  const found = [...body.matchAll(/this\.scene\.start\(\s*['"]([^'"]+)['"]\s*\)/g)];
  if (found.length !== 1) {
    throw new Error(
      `${file} changeScene() has ${found.length} this.scene.start calls. The model expects one. This is a modeling gap, not a ring result.`
    );
  }
  return found[0][1];
}

const extracted = {};
let stopsTween = false;

for (const [key, rel, constant] of scenes) {
  const file = path.join(repoRoot, rel);
  const source = readFileSync(file, 'utf8');
  const body = changeSceneBody(source, rel);
  extracted[constant] = startName(body, rel);
  if (key === 'MainMenu') {
    const stopAt = body.indexOf('this.logoTween.stop()');
    const clearAt = body.indexOf('this.logoTween = null');
    const startAt = body.search(/this\.scene\.start\(/);
    stopsTween = stopAt >= 0 && clearAt > stopAt && startAt > clearAt;
  }
}

const cfg = `SPECIFICATION Spec
CONSTANTS
  MenuNext = "${extracted.MenuNext}"
  GameNext = "${extracted.GameNext}"
  OverNext = "${extracted.OverNext}"
  StopsTween = ${stopsTween ? 'TRUE' : 'FALSE'}
INVARIANT
  TypeOK
  MenuOpensGame
  GameOpensGameOver
  OverOpensMenu
  MenuHandoffStopsTween
`;

const cfgPath = path.join(skillDir, 'SceneRing.cfg');
writeFileSync(cfgPath, cfg);
console.log(`Wrote ${path.relative(repoRoot, cfgPath)}`);
console.log(
  `Main menu queues ${extracted.MenuNext}. Game queues ${extracted.GameNext}. Game over queues ${extracted.OverNext}. Menu stops the logo tween before the queue: ${stopsTween}.`
);
console.log('Read this model with /statechart.');
