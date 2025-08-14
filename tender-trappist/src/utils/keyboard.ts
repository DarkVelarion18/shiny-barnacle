import { Maze, Player, CELL_SIZE } from './Maze';
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
