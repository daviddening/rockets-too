# Change scene

Change Scene walks the game in a ring: main menu, then the game board, then game over, then the main menu again.

## Sub-features

- `scene-to-game` leaves the main menu for the checkerboard.
- `scene-to-game-over` leaves the game for the red game-over screen.
- `scene-to-menu` leaves game over for the main menu.
- `scene-toggle` enables Toggle Movement only on the main menu.

## How to get to it (user POV)

- Press `Change Scene` under the canvas. That is the only control that changes the scene.

## Driving it with the Cursor browser

Preconditions:

- The browser is on the verification URL.
- `Toggle Movement` is enabled and the canvas shows `Main Menu`.
- `doctor.mjs` printed `http-ok`.

- **Menu to game.** Press `Change Scene`. `Toggle Movement` becomes disabled. The canvas becomes a dark checkerboard and no longer shows `Main Menu`.
- **Game to game over.** Press `Change Scene` again. `Toggle Movement` stays disabled. The canvas turns red and shows `Game Over`.
- **Game over to menu.** Press `Change Scene` again. `Toggle Movement` becomes enabled. The canvas shows the logo and `Main Menu`.
- **Proof.** After each press, save a snapshot and a canvas screenshot under `artifacts/change-scene/` as `game.aria.txt`, `game.png`, `game-over.aria.txt`, `game-over.png`, `menu.aria.txt`, and `menu.png`. Each snapshot must show the `Toggle Movement` state named above.

## Gotchas

- Pressing `Change Scene` before `Toggle Movement` has enabled does nothing, because the page does not yet have a scene.
- Canvas titles are not DOM text. Use the button's enabled state together with the screenshot.
- The position readout is unchanged by `Change Scene`. Do not use it as proof of the scene.
- One press is one step. A double click skips a screen and fails the matching sub-feature.
