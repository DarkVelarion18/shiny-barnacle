import { initializeGame } from './mazeGame';
import { Maze } from './Maze';
import { Player } from './Player';
import { solveBFS } from './Maze' 
import { solveDFS } from './Maze';


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