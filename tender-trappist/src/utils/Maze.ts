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

/**
 * Draws a straight stroked line between two grid cells on the provided canvas context.
 *
 * Coordinates are grid-cell indices (not pixels); they are multiplied by `CELL_SIZE` before drawing.
 *
 * @param ctx - Canvas rendering context used to draw the line
 * @param x1 - X index of the start cell (grid units)
 * @param y1 - Y index of the start cell (grid units)
 * @param x2 - X index of the end cell (grid units)
 * @param y2 - Y index of the end cell (grid units)
 */

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

/**
 * Render the maze state onto the given canvas.
 *
 * Draws explored cells, start/end cells, cell walls, and path indicator dots
 * according to each cell's flags (isExplored, isStart, isEnd, walls, isPath).
 * Coordinates are taken from cell.x/cell.y and scaled by CELL_SIZE; path dots use DOT_RADIUS.
 *
 * @param maze - The Maze instance to render.
 * @param ctx - 2D rendering context of the target canvas.
 * @param canvas - The canvas element to which the maze is drawn.
 */
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

/**
 * Draws the player as a filled circle centered in the player's current grid cell.
 *
 * The circle's center is computed from CELL_SIZE; its diameter is PLAYER_SIZE and it is filled with PLAYER_COLOR.
 *
 * @param player - Player with integer grid coordinates (x, y).
 * @param ctx - Canvas rendering context to draw into.
 */
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

/**
 * Render the maze then draw the player on top.
 *
 * Renders the maze onto the provided canvas/context and then draws the player so the player appears above maze elements.
 *
 * @param maze - Maze to render.
 * @param player - Player whose current grid position will be drawn.
 * @param ctx - Canvas 2D rendering context to draw with.
 * @param canvas - Canvas element (used for sizing/clearing when rendering the maze).
 */
export function drawMazeAndPlayer(
  maze: Maze,
  player: Player,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  drawMaze(maze, ctx, canvas);
  drawPlayer(player, ctx);
}

/**
 * Render the maze and player, then pause briefly to visualize a single step.
 *
 * Renders the current maze state and player to the provided canvas context, then awaits ~100ms to allow step-by-step animation.
 *
 * @returns A promise that resolves after the short visualization delay.
 */
async function visualizeStep(maze: Maze, player: Player, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): Promise<void> {
  drawMaze(maze, ctx, canvas);
  drawPlayer(player, ctx);
  await new Promise(resolve => setTimeout(resolve, 100)); // pausa per visualizzare il passo
}

/**
 * Returns orthogonally adjacent neighbor cells within the maze grid, ignoring walls.
 *
 * Examines the four cardinal neighbors (left, right, up, down) that are inside the maze bounds,
 * then filters out cells already marked `isExplored` and the maze's `startCell`.
 *
 * @param cell - The cell whose neighbors to retrieve.
 * @param maze - The maze containing the grid used for bounds and the `startCell` reference.
 * @returns An array of adjacent, not-yet-explored neighbor cells (walls are not considered).
 */
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
/**
 * Asynchronously solves the maze using Depth-First Search (DFS) with step-by-step visualization.
 *
 * Explores the maze iteratively from the start cell, marking cells as explored, tracking their
 * parents to reconstruct the path, and visualizing each step until the end cell is reached or
 * all reachable cells have been explored. Upon completion, it highlights the found path or indicates failure.
 *
 * @param maze - The maze instance to solve.
 * @param player - The player whose position is shown during visualization.
 * @param ctx - The canvas rendering context used for drawing.
 * @param canvas - The HTML canvas element where the maze and player are rendered.
 * @param showMessage - Callback to display status or result messages.
 * @param isSolvingRef - Mutable reference controlling the solving process, allowing cancellation.
 */
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

    // If canceled, don't show a failure message.
    if (!isSolvingRef.current) {
        isSolvingRef.current = false;
        showMessage("Solving canceled");
        return;
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

/**
     * Performs a breadth-first search on the maze to find a path from start to end while visualizing progress.
     *
     * Runs an animated BFS that marks cells' `visited`, `isExplored`, `parent`, and `distance` fields as it explores.
     * If a path to `maze.endCell` is found the function reconstructs the path by following `parent` pointers and sets
     * `isPath` on each cell in the path. The maze and player are re-rendered during the search via `drawMazeAndPlayer`
     * and `visualizeStep`, and a status message is reported via `showMessage`.
     *
     * The search can be cancelled early by setting `isSolvingRef.current = false`; the function sets this flag to `true`
     * on start and resets it to `false` before returning.
     *
     * Side effects:
     * - Mutates cells in `maze.grid` (fields: `visited`, `isExplored`, `parent`, `distance`, `isPath`).
     * - Renders to the provided canvas context.
     * - Calls `showMessage` with the final outcome.
     *
     * @param maze - The maze to search.
     * @param player - Current player state (used for rendering).
     * @param ctx - Canvas 2D rendering context for visualization.
     * @param canvas - Canvas element used for sizing/clearing during rendering.
     * @param showMessage - Callback used to display short user-facing messages.
     * @param isSolvingRef - Mutable ref object with a `current` boolean used to start/cancel the search.
     * @returns A promise that resolves once the search completes (either by finding a path, exhausting reachable cells, or being cancelled).
     */
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