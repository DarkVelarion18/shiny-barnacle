import { initializeGame } from './mazeGame';
import { Maze } from './Maze';
import { Player } from './Player';
import { solveBFS } from './Maze' 
import { solveDFS } from './Maze';


/**
 * Initialize a new maze game session.
 *
 * Delegates to `initializeGame`, forwarding the provided canvas, rendering context, lifecycle callbacks, draw function, and the mutable `isSolvingRef`.
 *
 * @param newSize - Number of cells per side for the generated maze.
 * @param isSolvingRef - Mutable ref whose `.current` is true while a solution visualization is running.
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
 * Orchestrates solving the provided maze with the chosen algorithm.
 *
 * Prepares the maze for solution visualization, redraws the board, runs the selected solver (`'bfs'` or `'dfs'`), and redraws again when finished.
 * The function returns immediately without action if `maze` is falsy or a solution is already running (guarded by `isSolvingRef.current`).
 * If an unknown algorithm string is provided, a message is shown and no solver is invoked.
 *
 * @param algorithm - Solver to run; supported values: `'bfs'` or `'dfs'`.
 * @returns A promise that resolves when the solving process (and final redraw) completes.
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
  } else {
    showMessage(`Unknown algorithm "${algorithm}". Use "bfs" or "dfs".`, 2000);
  }

  drawGame();
}

/**
 * Reset the player's position to the maze origin and clear any solution visualization.
 *
 * Clears solution-related cell state on the provided maze (via maze.resetCellsForSolution()),
 * sets the solving flag to false, moves the player to coordinates (0,0), triggers a redraw,
 * and displays a short "Player reset!" message.
 *
 * @param maze - Maze whose solution state will be cleared.
 * @param player - Player whose coordinates will be reset to the origin (0,0).
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