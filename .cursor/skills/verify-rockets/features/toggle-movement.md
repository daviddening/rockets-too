# Toggle movement

Toggle Movement starts the logo moving on the main menu, publishes its coordinates, and pauses or resumes it on later presses.

## Sub-features

- `move-start` starts the logo and changes the position readout off zero.
- `move-pause` freezes the published coordinates.
- `move-resume` changes the coordinates again after a pause.
- `move-menu-only` leaves the control disabled away from the main menu.

## How to get to it (user POV)

- On the main menu, press `Toggle Movement`.
- Press the same button again to pause, and again to resume.

## Driving it with the Cursor browser

Preconditions:

- The browser is on the verification URL and the canvas shows `Main Menu`.
- `Toggle Movement` is enabled.
- `.spritePosition pre` has been read. On a fresh launch it is `{ x: 0, y: 0 }`.

- **Start.** Press `Toggle Movement`. Wait until `.spritePosition pre` is no longer `{ x: 0, y: 0 }`. The canvas logo is away from the center title.
- **Pause.** Read the pre text, press `Toggle Movement`, and read it again after a short wait. The two readings match.
- **Resume.** Press `Toggle Movement` once more. A later reading differs from the paused reading.
- **Disabled off the menu.** Press `Change Scene`. `Toggle Movement` is disabled on the checkerboard. Press `Change Scene` again. It stays disabled on game over. Press `Change Scene` again. It is enabled on the main menu.
- **Proof.** Save `artifacts/toggle-movement/moving.aria.txt`, `moving.png`, and `position.txt` while the logo is moving. `position.txt` must contain a non-zero coordinate. Save `paused-position.txt` with two identical readings.

## Gotchas

- The readout updates on the tween, not on the click itself. Wait for the pre text to change. Do not pass on the click alone.
- Pausing compares two readings. A single reading cannot show that motion stopped.
- Coordinates are whole pixels. Assert the pre text, not a guessed logo pixel.
- `Change Scene` from the menu stops the logo. Proving pause and resume has to happen before leaving the menu.
- The button is disabled off the main menu. Re-enabling it requires returning to the menu. Do not force the click.
