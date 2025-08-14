import type { Maze } from './Maze';
import type { Player } from './Player';
import { MAZE_CONFIG, COLORS } from './constants';

export class MazeRenderer {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get canvas context');
        }
        this.ctx = context;
    }

    drawMaze(maze: Maze): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                this.drawCell(maze.grid[y][x]);
            }
        }

        this.drawPath(maze);
    }

    private drawCell(cell: {
        isExplored: boolean;
        isStart: boolean;
        isEnd: boolean;
        x: number;
        y: number;
        walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
    }): void {
        const { CELL_SIZE } = MAZE_CONFIG;

        // Draw cell background if needed
        if (cell.isExplored) {
            this.ctx.fillStyle = COLORS.EXPLORED;
            this.ctx.fillRect(
                cell.x * CELL_SIZE,
                cell.y * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
            );
        }

        if (cell.isStart || cell.isEnd) {
            this.ctx.fillStyle = cell.isStart ? COLORS.START : COLORS.END;
            this.ctx.fillRect(
                cell.x * CELL_SIZE,
                cell.y * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
            );
        }

        // Draw walls
        this.drawWalls(cell);
    }

    private drawWalls(cell: {
        x: number;
        y: number;
        walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
    }): void {
        const { CELL_SIZE } = MAZE_CONFIG;
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 2;

        if (cell.walls.top) {
            this.drawLine(
                cell.x * CELL_SIZE,
                cell.y * CELL_SIZE,
                (cell.x + 1) * CELL_SIZE,
                cell.y * CELL_SIZE
            );
        }
        if (cell.walls.right) {
            this.drawLine(
                (cell.x + 1) * CELL_SIZE,
                cell.y * CELL_SIZE,
                (cell.x + 1) * CELL_SIZE,
                (cell.y + 1) * CELL_SIZE
            );
        }
        if (cell.walls.bottom) {
            this.drawLine(
                cell.x * CELL_SIZE,
                (cell.y + 1) * CELL_SIZE,
                (cell.x + 1) * CELL_SIZE,
                (cell.y + 1) * CELL_SIZE
            );
        }
        if (cell.walls.left) {
            this.drawLine(
                cell.x * CELL_SIZE,
                cell.y * CELL_SIZE,
                cell.x * CELL_SIZE,
                (cell.y + 1) * CELL_SIZE
            );
        }
    }

    private drawLine(startX: number, startY: number, endX: number, endY: number): void {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    private drawPath(maze: Maze): void {
        const { CELL_SIZE } = MAZE_CONFIG;
        this.ctx.fillStyle = COLORS.PATH_DOT;
        
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                const cell = maze.grid[y][x];
                if (cell.isPath) {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        x * CELL_SIZE + CELL_SIZE / 2,
                        y * CELL_SIZE + CELL_SIZE / 2,
                        MAZE_CONFIG.DOT_RADIUS,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                }
            }
        }
    }

    drawPlayer(player: Player): void {
        const { CELL_SIZE, PLAYER_SIZE } = MAZE_CONFIG;
        this.ctx.fillStyle = COLORS.PLAYER;
        this.ctx.beginPath();
        this.ctx.arc(
            player.x * CELL_SIZE + CELL_SIZE / 2,
            player.y * CELL_SIZE + CELL_SIZE / 2,
            PLAYER_SIZE / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    draw(maze: Maze, player: Player): void {
        this.drawMaze(maze);
        this.drawPlayer(player);
    }
}
