# Add sprite

Add New Sprite places a star on the current scene. The star fades out and back in and stays on that scene.

## Sub-features

- `sprite-add-menu` adds a star on the main menu.
- `sprite-add-game` adds a star on the checkerboard.
- `sprite-add-game-over` adds a star on game over.

## How to get to it (user POV)

- Press `Add New Sprite` under the canvas. It is available on the main menu, the game, and game over.

## Driving it with the Cursor browser

Preconditions:

- `doctor.mjs` printed `http-ok`.
- The browser shows the scene named by the sub-feature: enabled `Toggle Movement` for the menu, disabled `Toggle Movement` and a checkerboard for the game, disabled `Toggle Movement` and `Game Over` for game over.
- A screenshot of `#game-container canvas` was saved before the press.

- **Add on this scene.** Press `Add New Sprite`. The canvas gains a star that was not in the before screenshot. The scene does not change, and `.spritePosition pre` stays the same.
- **Catch the blink.** The star fades out and back. If the first after screenshot matches the before screenshot, wait and capture again. At least one after screenshot must differ inside the canvas. Two identical captures do not pass.
- **Other scenes.** Reach the game and game over with `Change Scene`, and repeat the before/after capture there.
- **Proof.** Save `artifacts/add-sprite/<scene>-before.png` and `artifacts/add-sprite/<scene>-after.png` for `menu`, `game`, and `game-over`, plus `after.aria.txt` showing which scene's `Toggle Movement` state you were on.

## Gotchas

- The star's position is random. Match a new star in the picture, not a fixed coordinate.
- A capture during the fade can show no star. Take another capture before calling the sub-feature failed.
- Stars do not survive `Change Scene`. Add the star on the scene you are proving.
- The position readout is not the star. It only tracks the logo.
