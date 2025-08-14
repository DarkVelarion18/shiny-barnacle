// === TYPES ===

export type WallDirection = 'top' | 'right' | 'bottom' | 'left';

export type Cell = {
  x: number;
  y: number;
  walls: Record<WallDirection, boolean>;
  visited: boolean;
  parent: Cell | null;
  isStart: boolean;
  isEnd: boolean;
  isPath: boolean;
  isExplored: boolean;
  distance: number;
};

export type Edge = {
  cell1: Cell;
  cell2: Cell;
  wall: WallDirection;
  weight: number;
};

// === CONSTANTS ===

export const CELL_SIZE = 30;
export const PLAYER_SIZE = CELL_SIZE * 0.6;
export const PLAYER_COLOR = '#ef4444';
export const START_COLOR = '#ffffff';
export const END_COLOR = '#ffffff';
export const EXPLORED_COLOR = '#10b981';
export const GRID_COLOR = '#94a3b8';
export const PATH_DOT_COLOR = '#000000';
export const DOT_RADIUS = CELL_SIZE * 0.15;

// === MAZE CLASS ===

export class Maze {
  width: number;
  height: number;
  grid: Cell[][] = [];
  startCell!: Cell;
  endCell!: Cell;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initGrid();
    this.generateMaze();
  }

  private initGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = {
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false,
          parent: null,
          isStart: false,
          isEnd: false,
          isPath: false,
          isExplored: false,
          distance: Infinity,
        };
      }
    }

    this.startCell = this.grid[0][0];
    this.startCell.isStart = true;
    this.endCell = this.grid[this.height - 1][this.width - 1];
    this.endCell.isEnd = true;
  }

  resetCellsForSolution(): void {
    for (const row of this.grid) {
      for (const cell of row) {
        cell.parent = null;
        cell.isPath = false;
        cell.isExplored = false;
        cell.distance = Infinity;
      }
    }
  }

  private generateMaze(): void {
    this.resetCellsForSolution();
    const edges: Edge[] = this.collectEdges();
    edges.sort((a, b) => a.weight - b.weight);

    const parents = new Map<Cell, Cell>();
    for (const edge of edges) {
      const { cell1, cell2, wall } = edge;
      if (this.union(cell1, cell2, parents)) {
        this.removeWall(cell1, cell2, wall);
      }
    }
  }

  private collectEdges(): Edge[] {
    const edges: Edge[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        if (x < this.width - 1) {
          edges.push({ cell1: cell, cell2: this.grid[y][x + 1], wall: 'right', weight: Math.random() });
        }
        if (y < this.height - 1) {
          edges.push({ cell1: cell, cell2: this.grid[y + 1][x], wall: 'bottom', weight: Math.random() });
        }
      }
    }
    return edges;
  }

  private find(cell: Cell, parents: Map<Cell, Cell>): Cell {
    if (!parents.has(cell)) {
      parents.set(cell, cell);
    }
    if (parents.get(cell) === cell) return cell;
    const root = this.find(parents.get(cell)!, parents);
    parents.set(cell, root);
    return root;
  }

  private union(cell1: Cell, cell2: Cell, parents: Map<Cell, Cell>): boolean {
    const root1 = this.find(cell1, parents);
    const root2 = this.find(cell2, parents);
    if (root1 !== root2) {
      parents.set(root2, root1);
      return true;
    }
    return false;
  }

  private removeWall(cell1: Cell, cell2: Cell, wall: WallDirection): void {
    if (wall === 'right') {
      cell1.walls.right = false;
      cell2.walls.left = false;
    } else if (wall === 'bottom') {
      cell1.walls.bottom = false;
      cell2.walls.top = false;
    }
  }

  getNeighbors(cell: Cell): Cell[] {
    const { x, y, walls } = cell;
    const neighbors: Cell[] = [];

    if (y > 0 && !walls.top) neighbors.push(this.grid[y - 1][x]);
    if (x < this.width - 1 && !walls.right) neighbors.push(this.grid[y][x + 1]);
    if (y < this.height - 1 && !walls.bottom) neighbors.push(this.grid[y + 1][x]);
    if (x > 0 && !walls.left) neighbors.push(this.grid[y][x - 1]);

    return neighbors;
  }
}

// === PLAYER CLASS ===

export class Player {
  x: number;
  y: number;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  move(dx: number, dy: number, maze: Maze): void {
    const current = maze.grid[this.y][this.x];
    const newX = this.x + dx;
    const newY = this.y + dy;

    if (dx === 1 && !current.walls.right && newX < maze.width) this.x = newX;
    else if (dx === -1 && !current.walls.left && newX >= 0) this.x = newX;
    else if (dy === 1 && !current.walls.bottom && newY < maze.height) this.y = newY;
    else if (dy === -1 && !current.walls.top && newY >= 0) this.y = newY;
  }
}

// === VISUALIZATION HELPERS ===

function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.beginPath();
  ctx.moveTo(x1 * CELL_SIZE, y1 * CELL_SIZE);
  ctx.lineTo(x2 * CELL_SIZE, y2 * CELL_SIZE);
  ctx.stroke();
}

export function drawMaze(maze: Maze, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.grid[y][x];

      if (cell.isExplored) {
        ctx.fillStyle = EXPLORED_COLOR;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }

      if (cell.isStart) {
        ctx.fillStyle = START_COLOR;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else if (cell.isEnd) {
        ctx.fillStyle = END_COLOR;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }

      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 2;

      if (cell.walls.top) drawLine(ctx, x, y, x + 1, y);
      if (cell.walls.right) drawLine(ctx, x + 1, y, x + 1, y + 1);
      if (cell.walls.bottom) drawLine(ctx, x, y + 1, x + 1, y + 1);
      if (cell.walls.left) drawLine(ctx, x, y, x, y + 1);
    }
  }

  // Draw path dots
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.grid[y][x];
      if (cell.isPath) {
        ctx.beginPath();
        ctx.fillStyle = PATH_DOT_COLOR;
        ctx.arc(
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          DOT_RADIUS,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
  }
}

export function drawPlayer(player: Player, ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = PLAYER_COLOR;
  ctx.beginPath();
  ctx.arc(
    player.x * CELL_SIZE + CELL_SIZE / 2,
    player.y * CELL_SIZE + CELL_SIZE / 2,
    PLAYER_SIZE / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

export function drawMazeAndPlayer(
  maze: Maze,
  player: Player,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  drawMaze(maze, ctx, canvas);
  drawPlayer(player, ctx);
}

async function visualizeStep(maze: Maze, player: Player, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): Promise<void> {
  drawMaze(maze, ctx, canvas);
  drawPlayer(player, ctx);
  await new Promise(resolve => setTimeout(resolve, 100)); // pausa per visualizzare il passo
}

function getNeighbors(cell: Cell, maze: Maze): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  // Supponendo che maze abbia una matrice di celle maze.grid
  // Aggiungi controlli per non uscire dai bordi
  if (x > 0) neighbors.push(maze.grid[y][x - 1]);
  if (x < maze.width - 1) neighbors.push(maze.grid[y][x + 1]);
  if (y > 0) neighbors.push(maze.grid[y - 1][x]);
  if (y < maze.height - 1) neighbors.push(maze.grid[y + 1][x]);

  return neighbors.filter(n => !n.isExplored && n !== maze.startCell);
}
export async function solveDFS(
  maze: Maze,
  player: Player,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  showMessage: (msg: string, duration?: number) => void,
  isSolvingRef: { current: boolean }
): Promise<void> {
    isSolvingRef.current = true;
    maze.resetCellsForSolution();
    drawMazeAndPlayer(maze, player, ctx, canvas);

    const stack: Cell[] = [maze.startCell];
    maze.startCell.visited = true;
    maze.startCell.distance = 0;

    let foundPath = false;

    while (stack.length > 0 && isSolvingRef.current) {
        const current = stack.pop()!;
        current.isExplored = true;

        if (current === maze.endCell) {
            foundPath = true;
            break;
        }

        await visualizeStep(maze, player, ctx, canvas);

        const neighbors = getNeighbors(current, maze);
        for (const neighbor of neighbors) {
            if (!neighbor.isExplored && neighbor !== maze.startCell) {
                neighbor.isExplored = true;
                neighbor.parent = current;
                neighbor.distance = current.distance + 1;
                stack.push(neighbor);
            }
        }
    }

    if (foundPath) {
        let currentPathCell: Cell | null = maze.endCell;
        while (currentPathCell && currentPathCell !== maze.startCell) {
            currentPathCell.isPath = true;
            currentPathCell = currentPathCell.parent;
        }
        if (currentPathCell === maze.startCell) {
           currentPathCell.isPath = true;
        }
        drawMazeAndPlayer(maze, player, ctx, canvas);
        showMessage("Path found using DFS!");
    } else {
        showMessage("No path found using DFS. All reachable cells explored!");
    }
    isSolvingRef.current = false;
}

export async function solveBFS(
  maze: Maze,
  player: Player,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  showMessage: (msg: string, duration?: number) => void,
  isSolvingRef: { current: boolean }
): Promise<void> {isSolvingRef.current = true;
    maze.resetCellsForSolution();
    drawMazeAndPlayer(maze, player, ctx, canvas);

    const queue: Cell[] = [maze.startCell];
    maze.startCell.visited = true;
    maze.startCell.distance = 0;

    let foundPath = false;

    while (queue.length > 0 && isSolvingRef.current) {
        const current = queue.shift()!;
        current.isExplored = true;

        if (current === maze.endCell) {
            foundPath = true;
            break;
        }

        await visualizeStep(maze, player, ctx, canvas);

        const neighbors = getNeighbors(current, maze);
        for (const neighbor of neighbors) {
            if (!neighbor.isExplored && neighbor !== maze.startCell) {
                neighbor.isExplored = true;
                neighbor.parent = current;
                neighbor.distance = current.distance + 1;
                queue.push(neighbor);
            }
        }
    }

    if (foundPath) {
        let currentPathCell: Cell | null = maze.endCell;
        while (currentPathCell && currentPathCell !== maze.startCell) {
            currentPathCell.isPath = true;
            currentPathCell = currentPathCell.parent;
        }
        if (currentPathCell === maze.startCell) {
           currentPathCell.isPath = true;
        }
        drawMazeAndPlayer(maze, player, ctx, canvas);
        showMessage("Path found using BFS!");
    } else {
        showMessage("No path found using BFS. All reachable cells explored!");
    }
    isSolvingRef.current = false;}