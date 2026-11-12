export const title = "Change Scene";

const screenLabel = {
  MainMenu: "Main menu",
  Game: "Game",
  GameOver: "Game over",
};

export const state = (v) => {
  const where = screenLabel[v.screen] ?? v.screen;
  if (v.queued !== "none") {
    const next = screenLabel[v.queued] ?? v.queued;
    const stillMoving = v.screen === "MainMenu" && v.tween === "moving" ? ", logo still moving" : "";
    return `${where}, Change Scene queued for ${next}${stillMoving}`;
  }
  if (v.screen === "MainMenu" && v.tween === "moving") return "Main menu, logo moving";
  return where;
};

export const step = (action) => {
  const labels = {
    ToggleMovement: "you press Toggle Movement",
    LeaveMenu: "you press Change Scene",
    LeaveGame: "you press Change Scene",
    LeaveOver: "you press Change Scene",
    ApplyQueue: "the next scene opens",
  };
  return labels[action] ?? null;
};

export const group = (v) => {
  if (v.queued !== "none") return "Handoff queued";
  if (v.screen === "MainMenu") return "Main menu";
  if (v.screen === "Game") return "Game";
  if (v.screen === "GameOver") return "Game over";
  return "Other";
};

export const colors = {
  "Main menu": "blue",
  Game: "orange",
  "Game over": "purple",
  "Handoff queued": "yellow",
  Other: "tan",
};
