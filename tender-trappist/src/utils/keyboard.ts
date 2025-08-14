import { Maze, Player, CELL_SIZE } from './Maze';
/**
 * Registers global WASD keyboard controls to move the player inside the maze.
 *
 * Listens for 'w', 'a', 's', 'd' keydown events and, when appropriate, moves the
 * provided player by one cell, redraws the game, and invokes the post-move callback.
 *
 * @param maze - The Maze instance used for validating/mapping moves.
 * @param player - The Player to move; if falsy no handler action is taken.
 * @param drawGame - Callback that redraws the game after a successful move.
 * @param onPlayerMove - Callback invoked after moving the player; receives (maze, player, ctx, canvas).
 * @param isSolvingRef - Ref object with a boolean `current` flag; input is ignored while `current` is true.
 * @param canvas - Canvas element passed to `onPlayerMove`.
 * @param ctx - Canvas rendering context passed to `onPlayerMove`.
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
