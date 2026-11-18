---
name: verify-rockets
description: "Drive the rockets-too Phaser game in the browser and prove the main menu, scene changes, logo movement, and added sprites. Use when a change touches src/game, src/App.tsx, src/PhaserGame.tsx, or the page at /."
---

# Verify rockets-too

The user-facing app is one web page at `/`. A Phaser canvas (390×844, scaled to fit) shows the game. Under it, the page has three buttons and a sprite-position readout. There is no login, database, or account. Boot and Preloader run by themselves and are not screens the user chooses.

Other surfaces, not this skill: `npm run build` writes a production bundle, and `npm run dev` also runs `log.js`, which requests `gryzor.co`. Verification does not use those commands.

## Launch

From the repo root:

```sh
node .cursor/skills/verify-rockets/scripts/launch.mjs
```

Optional: `VERIFY_PORT` (default `4173`). The script starts `node_modules/next/dist/bin/next dev` on `127.0.0.1` at that port. It does not run `log.js`. It writes `.cursor/skills/verify-rockets/run/next.pid`, `next.port`, and `next.log`.

It is ready for the doctor when it prints `url http://127.0.0.1:<port>/` and the log contains `Ready`. It is ready to drive only after the doctor’s browser checks pass: the canvas is up and **Toggle Movement** is enabled. An HTTP 200 while the canvas is still loading is not usable. There is no migration or seed. A fresh server always starts in Boot, then Preloader, then the main menu.

Do not launch a second server on the same port. The script exits if the port is taken or if a recorded pid is still alive. Two instances can run only on two ports, each with its own `VERIFY_PORT` and its own skill `run/` directory. This script has one `run/` directory, so one instance at a time. Never attach to a dev server you did not start, including one a person opened with `npm run dev` on port 8080.

## Doctor

```sh
node .cursor/skills/verify-rockets/scripts/doctor.mjs
```

The script is read-only. It passes only when all of these are true:

- `run/next.pid` is a live process this launch started
- that process, or a child of it, is listening on the recorded port
- `GET /` returns 200 and the HTML title `Phaser Nextjs Template`
- the page is not a Next.js error page
- it prints `package template-nextjs@1.2.0` and the installed Next version (`15.3.1` in this repo)

It then prints `browser-unconfirmed`. Finish the doctor in the browser at the printed URL before any feature drive:

- `#game-container` contains a `canvas`
- buttons named `Change Scene`, `Toggle Movement`, and `Add New Sprite` are present
- `Toggle Movement` is enabled

Enabled `Toggle Movement` means the main menu has emitted `current-scene-ready`. Until then the button is disabled and `Change Scene` is a no-op. If the button stays disabled, stop. The instance is not worth driving.

## Drive

Use the Cursor browser on the verification URL. Click the HTML buttons by accessible name. Do not click the canvas, and do not call scene methods from the page console.

Stable handles:

- `Change Scene` button
- `Toggle Movement` button
- `Add New Sprite` button
- `#game-container canvas`
- `.spritePosition pre` — text shaped as `{ x: <int>, y: <int> }`

The canvas draws its labels. `Main Menu` and `Game Over` are not in the accessibility tree. Scene identity on the page is the button plus the canvas picture:

- Main menu: `Toggle Movement` enabled, canvas shows the logo and the words `Main Menu`, position pre starts at `{ x: 0, y: 0 }`
- Game: `Toggle Movement` disabled, canvas is a dark checkerboard with no menu title
- Game over: `Toggle Movement` disabled, canvas is red and shows `Game Over`

`Change Scene` follows the current scene: main menu → game → game over → main menu.

Read `.cursor/skills/verify-rockets/features/README.md` and the feature file before driving. A proof that uses one entry point does not cover an entry point the map lists separately.

## Evidence

Write proof under `.cursor/skills/verify-rockets/artifacts/<feature-id>/`. Cleanup must not delete that directory.

For each drive, record the feature id, the entry point, the action, and the resulting state:

- the button you pressed and the command or browser action that pressed it
- the accessibility snapshot after the action (`after.aria.txt`)
- a screenshot of the page, or of `#game-container canvas` when the proof is the picture (`after.png`)
- the `.spritePosition pre` text when the feature changes or displays it (`position.txt`)

Exercise the buttons and the canvas the user sees. Do not prove a scene by calling `scene.start` or writing React state. A screenshot of the final screen is not enough: keep the snapshot that shows the button state after the click. This game has no files, rows, or outbound messages on these paths. `npm run dev` would call `gryzor.co`; this launch does not, and a drive must not start that script. There is no dry-run mode.

## Cleanup

```sh
node .cursor/skills/verify-rockets/scripts/cleanup.mjs
```

This sends `SIGTERM`, then `SIGKILL` if needed, to the process group of the pid in `run/next.pid`. It deletes `next.pid`, `next.port`, and `next.log`. It does not delete `.cursor/skills/verify-rockets/artifacts/`. If the pidfile is missing, it prints that and exits 0. Never kill a process by the name `next` or `node`.

## Helpers

- `node .cursor/skills/verify-rockets/scripts/launch.mjs`
- `node .cursor/skills/verify-rockets/scripts/doctor.mjs`
- `node .cursor/skills/verify-rockets/scripts/cleanup.mjs`

Run failed attempts through cleanup as well, so a broken launch does not keep the port.
