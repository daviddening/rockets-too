import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const barWidth = Math.min(300, this.scale.width - 48);

    this.add
      .image(centerX, centerY, "background")
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add
      .rectangle(centerX, centerY, barWidth + 8, 32)
      .setStrokeStyle(1, 0xffffff);

    const bar = this.add
      .rectangle(centerX - barWidth / 2, centerY, 4, 28, 0xffffff)
      .setOrigin(0, 0.5);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar
      bar.width = 4 + barWidth * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");

    this.load.image("logo", "logo.png");
    this.load.image("star", "star.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
