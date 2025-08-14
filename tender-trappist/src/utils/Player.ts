import type { Maze } from './Maze';

export class Player {
    x: number;
    y: number;

    constructor(startX: number, startY: number) {
        this.x = startX;
        this.y = startY;
    }

    move(dx: number, dy: number, maze: Maze): void {
        const currentCell = maze.grid[this.y][this.x];
        const newX = this.x + dx;
        const newY = this.y + dy;

        const canMove = this.canMoveToPosition(dx, dy, newX, newY, currentCell, maze);

        if (canMove) {
            this.x = newX;
            this.y = newY;
        }
    }

    private canMoveToPosition(
        dx: number,
        dy: number,
        newX: number,
        newY: number,
        currentCell: { walls: { right: boolean; left: boolean; bottom: boolean; top: boolean } },
        maze: { width: number; height: number }
    ): boolean {
        if (dx === 1 && !currentCell.walls.right && newX < maze.width) return true;
        if (dx === -1 && !currentCell.walls.left && newX >= 0) return true;
        if (dy === 1 && !currentCell.walls.bottom && newY < maze.height) return true;
        if (dy === -1 && !currentCell.walls.top && newY >= 0) return true;
        return false;
    }

    reset(): void {
        this.x = 0;
        this.y = 0;
    }
}
