import type { Maze } from './Maze';
import type { Player } from './Player';
import type { ShowMessageFunction, IsSolvingRef, Cell } from '../types/maze';
import { MazeRenderer } from './MazeRenderer';
import { DELAY_MS } from './constants';

export class MazeSolver {
    private maze: Maze;
    private player: Player;
    private renderer: MazeRenderer;
    private showMessage: ShowMessageFunction;
    private isSolvingRef: IsSolvingRef;

    constructor(
        maze: Maze,
        player: Player,
        renderer: MazeRenderer,
        showMessage: ShowMessageFunction,
        isSolvingRef: IsSolvingRef
    ) {
        this.maze = maze;
        this.player = player;
        this.renderer = renderer;
        this.showMessage = showMessage;
        this.isSolvingRef = isSolvingRef;
    }

    private async visualizeStep(): Promise<void> {
        this.renderer.draw(this.maze, this.player);
        return new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }

    async solveBFS(): Promise<void> {
        this.isSolvingRef.current = true;
        this.maze.resetCellsForSolution();
        this.renderer.draw(this.maze, this.player);

        const queue: Cell[] = [this.maze.startCell];
        this.maze.startCell.visited = true;
        this.maze.startCell.distance = 0;

        let foundPath = false;

        while (queue.length > 0 && this.isSolvingRef.current) {
            const current = queue.shift()!;
            current.isExplored = true;

            if (current === this.maze.endCell) {
                foundPath = true;
                break;
            }

            await this.visualizeStep();

            const neighbors = this.maze.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (!neighbor.isExplored && neighbor !== this.maze.startCell) {
                    neighbor.isExplored = true;
                    neighbor.parent = current;
                    neighbor.distance = current.distance + 1;
                    queue.push(neighbor);
                }
            }
        }

        this.handleSolutionResult(foundPath, 'BFS');
    }

    async solveDFS(): Promise<void> {
        this.isSolvingRef.current = true;
        this.maze.resetCellsForSolution();
        this.renderer.draw(this.maze, this.player);

        const stack: Cell[] = [this.maze.startCell];
        this.maze.startCell.visited = true;

        let foundPath = false;

        while (stack.length > 0 && this.isSolvingRef.current) {
            const current = stack.pop()!;
            current.isExplored = true;

            if (current === this.maze.endCell) {
                foundPath = true;
                break;
            }

            await this.visualizeStep();

            const neighbors = this.maze.getNeighbors(current);
            neighbors.sort(() => Math.random() - 0.5);

            for (const neighbor of neighbors) {
                if (!neighbor.isExplored && neighbor !== this.maze.startCell) {
                    neighbor.isExplored = true;
                    neighbor.parent = current;
                    stack.push(neighbor);
                }
            }
        }

        this.handleSolutionResult(foundPath, 'DFS');
    }

    private handleSolutionResult(foundPath: boolean, algorithm: string): void {
        if (foundPath) {
            this.reconstructPath();
            this.renderer.draw(this.maze, this.player);
            this.showMessage(`Path found using ${algorithm}!`);
        } else {
            this.showMessage(`No path found using ${algorithm}. All reachable cells explored!`);
        }
        this.isSolvingRef.current = false;
    }

    private reconstructPath(): void {
        let currentPathCell: Cell | null = this.maze.endCell;
        while (currentPathCell && currentPathCell !== this.maze.startCell) {
            currentPathCell.isPath = true;
            currentPathCell = currentPathCell.parent;
        }
        if (currentPathCell === this.maze.startCell) {
            currentPathCell.isPath = true;
        }
    }
}
