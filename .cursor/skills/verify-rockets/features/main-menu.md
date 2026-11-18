# Main menu

The main menu is the screen the game opens on: a logo, the words Main Menu, an enabled Toggle Movement button, and a sprite position of zero.

## Sub-features

- `menu-arrive` shows the menu after the page loads, without the user pressing a button.
- `menu-controls` shows the three buttons, with Toggle Movement enabled.
- `menu-position` shows the sprite position at zero until the user toggles movement.

## How to get to it (user POV)

- Open the verification URL in the browser and wait for the game to finish loading.
- From game over, press `Change Scene`.

## Driving it with the Cursor browser

Preconditions:

- `doctor.mjs` printed `http-ok` for this run's URL.
- The browser is on that URL.
- No earlier action in this session has pressed `Toggle Movement` or `Change Scene`. For the game-over entry, complete the change-scene ring first so the canvas shows game over, and do not expect the position readout to return to zero.

- **Open the page.** Navigate to the verification URL. Wait until `#game-container` contains a canvas and `Toggle Movement` is enabled. The canvas shows the logo and the words `Main Menu`. The accessibility snapshot lists `Change Scene`, `Toggle Movement`, and `Add New Sprite`.
- **Read the position.** Read `.spritePosition pre`. On a fresh launch it is `{ x: 0, y: 0 }`.
- **Return from game over.** When proving the second entry, start on game over (`Toggle Movement` disabled, canvas shows `Game Over`) and press `Change Scene`. `Toggle Movement` becomes enabled and the canvas shows `Main Menu` again.
- **Proof.** Save the snapshot to `artifacts/main-menu/after.aria.txt` and a screenshot to `artifacts/main-menu/after.png`. The snapshot shows `Toggle Movement` enabled. The screenshot shows the logo and `Main Menu`. Save the pre text to `artifacts/main-menu/position.txt`.

## Gotchas

- The server HTML is an empty `<main>` until client JavaScript runs. A curl of `/` does not show the buttons.
- `Toggle Movement` is disabled until the main menu is ready. Do not treat a disabled button as the menu.
- The words `Main Menu` are drawn on the canvas. An accessibility snapshot will not contain them.
- After `Toggle Movement`, the position readout does not reset when you come back from game over.
