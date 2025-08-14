import { Maze } from './Maze';
import { Player } from './Player';
-import { MAZE_CONFIG, COLORS } from './constants';
-import { CELL_SIZE } from './Maze';
+import { MAZE_CONFIG, COLORS, CELL_SIZE } from './constants';

interface InitializeGameOptions {
  size: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  onInit: (...args: any[]) => void;
  showMessage: (...args: any[]) => void;
  isSolvingRef: { current: boolean };
  drawGame: () => void;
}

/**
 * Set up the canvas and initial game state, render the starting scene, and invoke the startup callback.
 *
 * Resets `isSolvingRef.current` to `false`, resizes `canvas` to `size * CELL_SIZE`, constructs a new `Maze(size, size)`
 * and a `Player` positioned at (0, 0), calls `drawGame()` to render the initial state, then calls
 * `onInit(maze, player, ctx, canvas, showMessage, isSolvingRef)`.
 *
 * @param onInit - Callback invoked after initialization with `(maze, player, ctx, canvas, showMessage, isSolvingRef)`.
 * @param isSolvingRef - Mutable ref whose `current` flag is reset to `false` to indicate no solve is in progress.
 * @returns An object containing the created `maze` and `player`.
 */
export function initializeGame(options: InitializeGameOptions) {
  const {
    size,
    canvas,
    ctx,
    onInit,
    showMessage,
    isSolvingRef,
    drawGame,
  } = options;

  isSolvingRef.current = false;
  canvas.width = size * CELL_SIZE;
  canvas.height = size * CELL_SIZE;

  const maze = new Maze(size, size);
  const player = new Player(0, 0);

  drawGame();
  onInit(maze, player, ctx, canvas, showMessage, isSolvingRef);

  return { maze, player };
}