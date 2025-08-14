import { Maze } from './Maze';
import { Player } from './Player';
import { MAZE_CONFIG, COLORS } from './constants';
import { CELL_SIZE } from './Maze';

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
 * Initialize the maze game: configure the canvas, create a Maze and Player, and run startup callbacks.
 *
 * Sets `isSolvingRef.current` to `false`, resizes the provided `canvas` to `size * CELL_SIZE`, constructs
 * a new `Maze(size, size)` and a `Player(0, 0)`, calls `drawGame()`, then invokes `onInit(maze, player, ctx, canvas, showMessage, isSolvingRef)`.
 *
 * @param onInit - Callback invoked after creation with arguments `(maze, player, ctx, canvas, showMessage, isSolvingRef)`.
 * @param isSolvingRef - Mutable ref whose `current` property is reset to `false` to indicate no solve is in progress.
 * @returns An object containing the created `{ maze, player }`.
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