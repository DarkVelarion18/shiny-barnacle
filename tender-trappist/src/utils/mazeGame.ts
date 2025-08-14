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
 * Bootstraps a maze game: sets up canvas size, creates the Maze and Player,
 * performs an initial render, and invokes the provided initialization callback.
 *
 * The function sets `isSolvingRef.current` to `false`, resizes `canvas` to
 * `size * CELL_SIZE`, constructs `Maze(size, size)` and `Player(0, 0)`,
 * calls `drawGame()` to render the initial state, then calls `onInit(maze, player, ctx, canvas, showMessage, isSolvingRef)`.
 *
 * @param options - Initialization options including:
 *   - size: grid dimension in cells
 *   - canvas: target HTMLCanvasElement
 *   - ctx: canvas rendering context
 *   - onInit: callback invoked after initial draw (receives maze, player, ctx, canvas, showMessage, isSolvingRef)
 *   - showMessage: UI message function passed through to onInit
 *   - isSolvingRef: mutable ref object whose `current` is set to `false`
 *   - drawGame: function used to render the initial game state
 * @returns An object with the created `maze` and `player`.
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