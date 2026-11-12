---
name: verify-scene-ring
description: "Model-check the rockets-too Change Scene ring: the main menu opens the game, the game opens game over, game over opens the main menu, and the menu stops the logo tween before that handoff is queued. Use when a change touches MainMenu.changeScene, Game.changeScene, or GameOver.changeScene."
---

# Verify the Change Scene ring

A player who presses Change Scene must land on the next screen in the ring, and a logo that was moving on the main menu must already be stopped when that handoff is queued. A wrong `scene.start` name skips a screen. A tween that is still moving at that queue keeps the logo in motion while the player has asked to leave.

The check is a TLA+ model of those three methods. TLC explores every order of Toggle Movement, Change Scene, and the scene manager opening the queued scene. The scene names and the tween-stop flag are read from the TypeScript, so the model checks the methods on disk.

## When a change touches this

Re-run the check when a diff touches any of these:

- `src/game/scenes/MainMenu.ts` `changeScene` or `moveLogo`
- `src/game/scenes/Game.ts` `changeScene`
- `src/game/scenes/GameOver.ts` `changeScene`

If the diff does not touch those methods, the check does not apply. Boot, Preloader, `App.tsx`, and `PhaserGame.tsx` are outside this check.

Last confirmed the model describes those methods at commit `57607ccc1fdc7e9cec4496418b659ef4f5835e1f`, with one uncommitted difference: `src/game/scenes/Game.ts` `changeScene` calls `this.scene.start('MainMenu')` where that commit calls `this.scene.start('GameOver')`. Move the commit forward only after you read the methods at the new commit and confirm the actions in `SceneRing.tla` still match them: one `scene.start` per method, Toggle Movement only on the main menu while nothing is queued, and the menu's stop-then-clear-then-start as a single step.

## Property

Pressing Change Scene on the main menu queues the game, on the game queues game over, and on game over queues the main menu. If the logo was moving, the main menu stops and clears that tween in the same step, before the queue.

Harm: the player never sees game over, or the logo is still moving when they have asked to leave the menu.

## Run

From the repo root:

```sh
node .cursor/skills/verify-scene-ring/check.mjs
```

That rewrites `.cursor/skills/verify-scene-ring/SceneRing.cfg` from the three methods. Then read `SceneRing.tla` with `/statechart`, using that cfg and `view.mjs` in the same directory. `/statechart` is the checker. Do not treat `check.mjs` exiting 0 as a pass. Its exit 0 only means the methods still have the shape the model can read.

A pass is `/statechart` reporting that `MenuOpensGame`, `GameOpensGameOver`, `OverOpensMenu`, and `MenuHandoffStopsTween` all hold. Node may print a `MODULE_TYPELESS_PACKAGE_JSON` warning because `check.mjs` is a module script. That warning is not a failure.

## What a failure means

Read every `/statechart` result with `/statechart`. The chart's broken states are the rules that failed.

- `GameOpensGameOver` — `Game.changeScene` queued something other than `GameOver`. That is a product bug. The shortest path is the presses that reached the game, then Change Scene. Report the queued name. Do not change the invariant to the name in the file.
- `MenuOpensGame` or `OverOpensMenu` — the same, for the main menu or game over.
- `MenuHandoffStopsTween` — `MainMenu.changeScene` queued the next scene while `logoTween` was still moving. The stop and the clear no longer happen before `scene.start`. That is a product bug.
- `TypeOK` — a `scene.start` name is not `MainMenu`, `Game`, or `GameOver`, so the next scene is outside the ring. Report that name.
- `check.mjs` throws, or `/statechart` stops with an error instead of a broken rule — the model could not read the method. If `changeScene` now has a branch, an `await`, or more than one `scene.start`, update `SceneRing.tla` so each action is still one indivisible step of the method, and say what you changed. Do not delete the rule that failed.

## Scope

Checked: which scene each `changeScene` queues, and that the main menu's stop and clear happen in that same step when the logo was moving. Toggle Movement is in the model so the logo can be moving before Change Scene.

Not checked:

- Phaser's `ScenePlugin.start`, `SceneManager.processQueue`, tween shutdown, or the canvas. The model takes as given that `scene.start` only queues, that the queue runs on the next scene-manager update, before tween updates, and that scene shutdown kills that scene's tweens.
- A second Toggle Movement after Change Scene has queued and before the queue runs. The page still allows it, because the button stays enabled until `current-scene-ready`. That new tween is killed on shutdown before the tween manager ticks, so it does not move the logo on a later frame. It is left out on purpose.
- Boot and Preloader. They never handle Change Scene.
- `App.tsx` `currentScene`, which sets `canMoveSprite` from `scene.scene.key !== 'MainMenu'`. The button can still lie about the screen when this ring is correct. That is a separate check.

Assumptions: a moving logo is `logoTween` set and playing, `stop` then `logoTween = null` ends it, and the string passed to `this.scene.start` is the screen the player sees once the queue runs.

## Keeping the check honest

On a scratch copy you will revert, break the real method and read the model again with `/statechart`:

- In `Game.changeScene`, start `MainMenu` instead of `GameOver`. `GameOpensGameOver` must fail, and the path must be Change Scene on the main menu, the game opening, then Change Scene.
- In `MainMenu.changeScene`, skip `logoTween.stop()` and the clear. `MenuHandoffStopsTween` must fail on the path that presses Toggle Movement and then Change Scene.

Restore the file and read the model again. It must pass, or fail only on a product bug you are already reporting. Do not weaken an invariant to make a scratch break pass. Do not leave the scratch edit in the tree.
