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