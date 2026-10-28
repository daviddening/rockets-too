import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x101827);

        const columns = 7;
        const rows = 10;
        const cellSize = Math.min(
            (this.scale.width - 48) / columns,
            (this.scale.height - 240) / rows
        );
        const boardWidth = columns * cellSize;
        const boardHeight = rows * cellSize;
        const boardX = (this.scale.width - boardWidth) / 2;
        const boardY = (this.scale.height - boardHeight) / 2;
        const grid = this.add.graphics();

        for (let row = 0; row < rows; row++)
        {
            for (let column = 0; column < columns; column++)
            {
                const x = boardX + column * cellSize;
                const y = boardY + row * cellSize;
                const color = (row + column) % 2 === 0 ? 0x1e293b : 0x243247;

                grid.fillStyle(color, 1);
                grid.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                grid.lineStyle(1, 0x64748b, 1);
                grid.strokeRect(x, y, cellSize, cellSize);
            }
        }

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
