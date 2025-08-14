import { Maze, Player, CELL_SIZE } from './Maze';
/**
 * Attach a global WASD keyboard handler to move the player within the maze.
 *
 * Registers a keydown listener on document that maps 'w', 'a', 's', 'd' to up/left/down/right moves.
 * If a move is performed, the player's move method is called, then `drawGame`, then `onPlayerMove`.
 * The handler is a no-op when there is no player, no maze, or when `isSolvingRef.current` is true.
 *
 * @param maze - The Maze instance used to validate and perform moves.
 * @param player - The Player instance that will be moved.
 * @param drawGame - Callback to re-render the game after the player moves.
 * @param onPlayerMove - Callback invoked after movement with the current maze, player, rendering context, and canvas.
 * @param isSolvingRef - Mutable ref object whose `current` flag disables input while a solver is running.
 * @param canvas - The canvas element used for rendering (passed to `onPlayerMove`).
 * @param ctx - The CanvasRenderingContext2D used for rendering (passed to `onPlayerMove`).
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
