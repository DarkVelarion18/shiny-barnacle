import { Maze, Player, CELL_SIZE } from './Maze';
/**
 * Register global WASD keyboard handlers to move the player one cell and trigger post-move updates.
 *
 * Listens for 'w', 'a', 's', 'd' keydown events and, when a move is applicable, calls
 * `player.move(dx, dy, maze)`, then `drawGame()`, and finally `onPlayerMove(maze, player, ctx, canvas)`.
 * The handler is a global keydown listener and is not removed by this function.
 *
 * Behavior notes:
 * - No action is taken if `player` is falsy, `isSolvingRef.current` is true, or `maze` is falsy.
 * - Moves are single-cell steps: 'w' = up (dy = -1), 's' = down (dy = 1), 'a' = left (dx = -1), 'd' = right (dx = 1).
 *
 * @param maze - Maze instance used to validate/apply moves.
 * @param player - Player to move.
 * @param drawGame - Callback invoked to redraw the game after a move.
 * @param onPlayerMove - Callback invoked after moving; receives (maze, player, ctx, canvas).
 * @param isSolvingRef - Mutable ref object with a boolean `current`; input is ignored while `current` is true.
 * @param canvas - Canvas element forwarded to `onPlayerMove`.
 * @param ctx - CanvasRenderingContext2D forwarded to `onPlayerMove`.
 */
export function setupKeyboardControls(
  maze: Maze,
  player: Player,
  drawGame: () => void,
  onPlayerMove: (maze: Maze, player: Player, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
  isSolvingRef: { current: boolean },
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!player || isSolvingRef.current || !maze) return;

    let dx = 0;
    let dy = 0;

    switch (e.key) {
      case 'w':
        dy = -1;
        break;
      case 's':
        dy = 1;
        break;
      case 'a':
        dx = -1;
        break;
      case 'd':
        dx = 1;
        break;
    }

    if (dx !== 0 || dy !== 0) {
      player.move(dx, dy, maze);
      drawGame();
      onPlayerMove(maze, player, ctx, canvas);
    }
  });
}
