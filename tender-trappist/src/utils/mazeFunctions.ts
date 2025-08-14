import { initializeGame } from './mazeGame';
import { Maze } from './Maze';
import { Player } from './Player';
import { solveBFS } from './Maze' 
import { solveDFS } from './Maze';


/**
 * Initialize and render a new maze of the specified size.
 *
 * Delegates maze creation and initialization to `initializeGame`, passing the provided canvas, rendering context, lifecycle callbacks, solving state reference, and draw function so the new maze is created and rendered.
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
 * Solve the provided maze using the specified algorithm and update the canvas rendering.
 *
 * This function prepares the maze for visualization, selects and awaits the chosen solver
 * (Breadth‑First Search or Depth‑First Search), and redraws the game before and after solving.
 * It exits immediately if no maze is provided or a solution run is already in progress.
 *
 * @param algorithm - Solver to run; supported values: `'bfs'` or `'dfs'`.
 * @param maze - The Maze instance to solve; its cells will be reset for solution visualization.
 * @param player - The Player instance used/updated by the solver during traversal.
 * @param ctx - Canvas rendering context used by solvers for drawing.
 * @param canvas - Canvas element passed through to solver routines.
 * @param showMessage - Callback for displaying user messages (message, durationMs).
 * @param isSolvingRef - Object with a boolean `current` flag; if `current` is true the call is ignored to prevent concurrent solves.
 * @param drawGame - Function called to render the current game state before and after solving.
 * @returns A promise that resolves when the chosen solver completes and the final frame has been drawn.
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
 * Reset the player's position and clear any solution visualization state.
 *
 * Sets `isSolvingRef.current` to `false`, clears solution-related markings on the
 * maze, moves the player to coordinates (0, 0), triggers a redraw via `drawGame()`,
 * and displays a short "Player reset!" notification.
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
 * Stop an ongoing solution visualization and clear solution state.
 *
 * Resets the solving flag, clears solution-related markings on the given maze, triggers a redraw, and displays a brief user message.
 *
 * @param maze - Maze instance whose solution markings will be cleared.
 * @param isSolvingRef - Mutable ref with a `.current` boolean that indicates whether a solution is running; this will be set to `false`.
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