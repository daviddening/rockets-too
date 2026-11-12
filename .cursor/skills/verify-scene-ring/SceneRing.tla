---- MODULE SceneRing ----
\* Change Scene on the three playable scenes, and the logo tween on the main menu.
\* MenuNext, GameNext, and OverNext are the scene.start names in
\* MainMenu.changeScene, Game.changeScene, and GameOver.changeScene.
\* StopsTween is TRUE only when MainMenu.changeScene stops and clears logoTween
\* before it calls scene.start. check.mjs reads those from the scene files.

CONSTANTS MenuNext, GameNext, OverNext, StopsTween

VARIABLES screen, tween, queued

vars == <<screen, tween, queued>>

TypeOK ==
  /\ screen \in {"MainMenu", "Game", "GameOver"}
  /\ tween \in {"still", "moving"}
  /\ queued \in {"none"} \cup {MenuNext, GameNext, OverNext}
  /\ StopsTween \in BOOLEAN

Init ==
  /\ screen = "MainMenu"
  /\ tween = "still"
  /\ queued = "none"

\* App.moveSprite -> MainMenu.moveLogo, and only while this scene is still the main menu.
\* changeScene has not returned a queued handoff yet: ScenePlugin.start does not run until
\* the next SceneManager update, so Toggle Movement is refused once a handoff is queued
\* in this model. The real page still accepts that click until processQueue; that click
\* cannot tick the new tween, because processQueue runs before the scene step that
\* updates tweens, and shutdown kills the scene's tweens. That click is out of this model.
ToggleMovement ==
  /\ screen = "MainMenu"
  /\ queued = "none"
  /\ tween' = IF tween = "still" THEN "moving" ELSE "still"
  /\ UNCHANGED <<screen, queued>>

\* MainMenu.changeScene. One step: stop and clear, then queue scene.start.
LeaveMenu ==
  /\ screen = "MainMenu"
  /\ queued = "none"
  /\ queued' = MenuNext
  /\ tween' = IF StopsTween THEN "still" ELSE tween
  /\ UNCHANGED screen

\* Game.changeScene. The body only queues scene.start.
LeaveGame ==
  /\ screen = "Game"
  /\ queued = "none"
  /\ queued' = GameNext
  /\ UNCHANGED <<screen, tween>>

\* GameOver.changeScene. The body only queues scene.start.
LeaveOver ==
  /\ screen = "GameOver"
  /\ queued = "none"
  /\ queued' = OverNext
  /\ UNCHANGED <<screen, tween>>

\* SceneManager.processQueue, then the next scene's create. create does not start a logo tween.
ApplyQueue ==
  /\ queued \in {"MainMenu", "Game", "GameOver"}
  /\ screen' = queued
  /\ queued' = "none"
  /\ tween' = "still"

Next == ToggleMovement \/ LeaveMenu \/ LeaveGame \/ LeaveOver \/ ApplyQueue

Spec == Init /\ [][Next]_vars

\* The player who presses Change Scene lands on the next screen of the ring.
MenuOpensGame == screen = "MainMenu" /\ queued # "none" => queued = "Game"
GameOpensGameOver == screen = "Game" /\ queued # "none" => queued = "GameOver"
OverOpensMenu == screen = "GameOver" /\ queued # "none" => queued = "MainMenu"

\* A logo that was moving is stopped before the main menu queues the next scene.
MenuHandoffStopsTween ==
  screen = "MainMenu" /\ queued # "none" => tween = "still"

====
