# Rockets verification map

This directory is the maintained source for verifying the user-facing behavior of rockets-too. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `node .cursor/skills/verify-rockets/scripts/launch.mjs` so the game is at `http://127.0.0.1:4173/` unless `VERIFY_PORT` says otherwise.
- Run `node .cursor/skills/verify-rockets/scripts/doctor.mjs` and require `http-ok`, the recorded pid, and port `4173` or the chosen `VERIFY_PORT`.
- In the browser, require a canvas in `#game-container` and an enabled `Toggle Movement` button before the first action.
- There is no account and no seeded save. Each launch starts at the main menu after Boot and Preloader.
- Never drive an instance that was not started by this verification run.

## Driving conventions

- Start every recipe from the main menu unless its preconditions say otherwise.
- Press the HTML buttons by accessible name: `Change Scene`, `Toggle Movement`, `Add New Sprite`.
- Treat canvas pictures as evidence of the scene. Those words are not DOM text.
- Read `.spritePosition pre` for the published logo coordinates.
- Restore the main menu after a recipe that leaves it, by pressing `Change Scene` until `Toggle Movement` is enabled again. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an accessibility snapshot and a screenshot with the page title or the canvas scene visible.
- Scene-change proof includes the `Toggle Movement` enabled state and a canvas screenshot.
- Record the feature id and entry point used with every artifact.
- Report an unreachable path with the attempted action and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with the Cursor browser` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact browser action and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Main menu](./main-menu.md) covers arrival on the menu, the enabled movement button, and the zeroed position readout.
- [Change scene](./change-scene.md) covers the ring from the main menu through the game and game over and back.
- [Toggle movement](./toggle-movement.md) covers starting and pausing the logo and the position readout.
- [Add sprite](./add-sprite.md) covers adding a blinking star on the current scene.
