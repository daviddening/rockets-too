---
name: verify-scene-cycle
description: "Prove the rockets-too scene ring: Change Scene goes from the main menu to the game, to game over, and back, and leaving the menu stops the logo tween first. Use when a change touches MainMenu.changeScene, Game.changeScene, or GameOver.changeScene."
---

# Verify the scene cycle

A player who presses Change Scene must land on the next screen in the ring, and a logo that was moving on the main menu must stop before that screen is left. A wrong start name strands the player on the wrong screen. A tween that keeps running calls back into a scene that has already been replaced.

The check runs those three methods and every tween state they actually branch on. No model checker is installed here, and Java is not available, so the check does not use a hand-written model of the methods. Phaser's canvas runtime is not a verifier target: the methods only call `this.scene.start` and, on the menu, `this.logoTween.stop`.

## When a change touches this

Re-run the check when a diff touches any of these:

- `src/game/scenes/MainMenu.ts` `changeScene`
- `src/game/scenes/Game.ts` `changeScene`
- `src/game/scenes/GameOver.ts` `changeScene`

If the diff does not touch those methods, the check does not apply. Boot, Preloader, `App.tsx`, and `PhaserGame.tsx` are outside this check.

Last confirmed the check describes those methods at commit `57607ccc1fdc7e9cec4496418b659ef4f5835e1f`. Move that commit forward only after you read the methods at the new commit and confirm the successors and the stop-then-start order below still match them.

## Property

Pressing Change Scene on the main menu starts Game, on Game starts Game Over, and on Game Over starts the main menu. If the main menu has a logo tween, Change Scene stops that tween and clears it before it starts Game.

Harm: the player sees the wrong screen, or the page keeps moving a logo that has already left.

## Run

From the repo root, with Node 24 (this machine is v24.21.0; type stripping loads the scene files):

```sh
node .cursor/skills/verify-scene-cycle/check-scene-cycle.mjs
```

Exit 0 prints two sentences: the ring holds, and the tween is stopped before Game starts. Node also prints a `MODULE_TYPELESS_PACKAGE_JSON` warning because the scene files are TypeScript without `"type": "module"`. That warning is not a failure. Do not add `"type": "module"` to `package.json` to silence it. Exit 1 prints, for each break, the screen name and what started instead, in those words. A modeling problem looks different: the script throws on import or because `changeScene` is missing, and it does not print a "next scene is" line. Fix the script or the mock only when the scene methods themselves still match the property. Do not change the expected successors to match a broken method.

The run enumerates four cases: each of the three screens with no tween, and the main menu with a tween object whose `stop` records the call. That is the whole branch space of these methods. There is no separate bound.

## What a failure means

- `Change Scene started X, but the next scene is Y` — the method's `this.scene.start` argument is wrong, or it did not call `start`. That is a product bug. Report it. Do not edit the expected ring.
- `logoTween is still set` or the stop/start order is wrong — `MainMenu.changeScene` no longer stops and clears the tween before `start('Game')`. That is a product bug.
- An exception from `import` or from `new MainMenu()` — the check could not load the scene file. Read the stack. If `phaser-mock.mjs` no longer matches a new import the scene file needs, update the mock and say so. If the method now needs a real Phaser game, the check's scope has changed; do not stub the new call into a pass.

## Scope

Checked: the `start` target of each `changeScene`, and the stop-then-clear-then-start order in `MainMenu.changeScene` when `logoTween` is set.

Not checked:

- The real Phaser `ScenePlugin.start`, tween manager, or canvas.
- Boot and Preloader. They never handle Change Scene. The React page also ignores Change Scene until a scene has emitted `current-scene-ready`.
- `App.tsx` `currentScene`, which disables Toggle Movement when `scene.scene.key !== 'MainMenu'`. That is a second target: the button can lie about the screen even when `changeScene` is correct.
- `moveLogo` pause and resume, sprite coordinates, and Add New Sprite.

Assumptions: a truthy `logoTween` is the moving or paused logo, `stop` ends it, and `this.scene.start` is the scene change the player sees. The mock replaces the `phaser` package so those calls can be recorded. It does not prove the engine honors them.

## Keeping the check honest

On a scratch copy of the repo, or on a change you will revert, break the real method in one of these ways and run the command:

- In `Game.changeScene`, start `MainMenu` instead of `GameOver`. The command must exit 1 and name Game and Main Menu.
- In `MainMenu.changeScene`, skip `logoTween.stop()`. The command must exit 1 and say the tween was not stopped before Game starts.

Restore the file and run the command again. It must exit 0, or fail only on a product bug you are already reporting. Do not weaken the script to make a scratch break pass. Do not leave the scratch edit in the tree.
