import { initializeGame } from './mazeGame';
import { Maze } from './Maze';
import { Player } from './Player';
import { solveBFS } from './Maze' 
import { solveDFS } from './Maze';


/**
 * Initialize a new maze game session with the given size and drawing/context callbacks.
 *
 * Delegates to initializeGame with the provided canvas, rendering context, lifecycle callbacks, and solving-state reference.
 *
 * @param newSize - Maze dimension (number of cells per side).
 * @param isSolvingRef - Mutable ref whose `.current` indicates whether a solution run is active.
 */
export function generateMaze(
  newSize: number,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  onInit: (...args: any[]) => void,
  showMessage: (...args: any[]) => void,
  isSolvingRef: { current: boolean },
  drawGame: () => void
) {
  initializeGame({
  size: newSize,
  canvas,
  ctx,
  onInit,
  showMessage,
  isSolvingRef,
  drawGame,
});
}

/**
 * Orchestrates solving the given maze using the specified algorithm.
 *
 * Prepares the maze for solution visualization, invokes the selected solver, and requests redraws before and after solving.
 *
 * @param algorithm - Solver to run; supported values: `'bfs'` or `'dfs'`. If another value is provided, no solver is invoked.
 */
export async function solveMaze(
  algorithm: string,
  maze: Maze,
  player: Player,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  showMessage: (msg: string, duration?: number) => void,
  isSolvingRef: { current: boolean },
  drawGame: () => void
) {
  if (!maze || isSolvingRef.current) return;

  maze.resetCellsForSolution();
  drawGame();

  if (algorithm === 'bfs') {
    await solveBFS(maze, player, ctx, canvas, showMessage, isSolvingRef);
  } else if (algorithm === 'dfs') {
    await solveDFS(maze, player, ctx, canvas, showMessage, isSolvingRef);
  }

  drawGame();
}

/**
 * Reset the player's position and clear any ongoing solution visualization.
 *
 * Sets the solving flag to false, clears solution-related cell state on the maze,
 * moves the player back to (0, 0), redraws the game, and shows a short "Player reset!" message.
 *
 * @param maze - The Maze instance whose solution visualization will be cleared.
 * @param player - The Player object whose coordinates will be reset to (0, 0).
 * @param drawGame - Callback to re-render the maze and player after the reset.
 * @param showMessage - Function to display a user-facing message; invoked with `"Player reset!"` for 2000ms.
 * @param isSolvingRef - Mutable ref object containing the current solving state; its `.current` property will be set to `false`.
 */
export function resetPlayer(
  maze: Maze,
  player: Player,
  drawGame: () => void,
  showMessage: (msg: string, duration?: number) => void,
  isSolvingRef: { current: boolean }
) {
  isSolvingRef.current = false;
  maze.resetCellsForSolution();
  player.x = 0;
  player.y = 0;
  drawGame();
  showMessage("Player reset!", 2000);
}

/**
 * Stops any ongoing maze solution visualization.
 *
 * Clears solution-specific cell state, sets the solving flag to false, forces a redraw,
 * and displays a short confirmation message.
 *
 * @param maze - The maze instance whose solution visualization will be cleared.
 * @param drawGame - Callback to redraw the game canvas.
 * @param showMessage - Function to display a user-facing message; called with the text and an optional duration.
 * @param isSolvingRef - Mutable ref object with a `current` boolean that tracks whether a solve is in progress.
 */
export function stopSolution(
  maze: Maze,
  drawGame: () => void,
  showMessage: (msg: string, duration?: number) => void,
  isSolvingRef: { current: boolean }
) {
  isSolvingRef.current = false;
  maze.resetCellsForSolution();
  drawGame();
  showMessage("Solution visualization stopped.", 2000);
}