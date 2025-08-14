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
 * Draws a straight line between two cell coordinates on the canvas, scaling by CELL_SIZE.
 *
 * @param ctx - Canvas 2D rendering context to draw into.
 * @param x1 - X coordinate of the start point in cell units.
 * @param y1 - Y coordinate of the start point in cell units.
 * @param x2 - X coordinate of the end point in cell units.
 * @param y2 - Y coordinate of the end point in cell units.
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
 * Render the maze onto the provided canvas: clears the canvas, fills explored/start/end cells,
 * draws all cell walls, and renders path dots for cells marked as part of the solution.
 *
 * @param maze - The Maze instance to draw
 * @param ctx - Canvas 2D rendering context used for drawing
 * @param canvas - Canvas element (used for clearing and size reference)
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
 * Draws the player as a filled circle at the player's grid position.
 *
 * The circle is centered in the cell at (player.x, player.y) and scaled using CELL_SIZE and PLAYER_SIZE.
 * Rendering uses PLAYER_COLOR and is drawn on the provided CanvasRenderingContext2D.
 *
 * @param player - Player whose position determines where the circle is rendered
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
 * Render the maze and then draw the player on the given canvas.
 *
 * @param maze - Maze to render
 * @param player - Player to draw on top of the maze
 * @param ctx - 2D canvas rendering context used for drawing
 * @param canvas - Target canvas element (used by the maze renderer for sizing/clearing)
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
 * Render the current maze and player state to the canvas and pause briefly to visualize a single step.
 *
 * Renders the maze and player using the provided 2D context, then awaits a short (100 ms) delay so callers can present an animated step.
 *
 * @param maze - The maze instance to draw.
 * @param player - The player whose position will be drawn.
 * @param ctx - Canvas 2D rendering context used for drawing.
 * @param canvas - The HTML canvas element targeted for rendering (used for sizing/clearing).
 * @returns A promise that resolves after the frame has been rendered and the 100 ms pause completes.
 */
async function visualizeStep(maze: Maze, player: Player, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): Promise<void> {
  drawMaze(maze, ctx, canvas);
  drawPlayer(player, ctx);
  await new Promise(resolve => setTimeout(resolve, 100)); // pausa per visualizzare il passo
}

/**
 * Returns adjacent grid neighbors of a cell that are not yet explored and are not the maze start.
 *
 * This considers only orthogonal grid adjacency (left, right, up, down) and bounds-checks coordinates;
 * it does not consider whether walls between cells are open. The returned array excludes cells
 * where `isExplored` is true and excludes the maze's start cell.
 *
 * @param cell - The cell whose neighbors to retrieve.
 * @param maze - The maze containing the grid and start cell.
 * @returns An array of neighboring cells meeting the filter criteria.
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
 * Asynchronously performs a depth-first search on the maze while visualizing each step and marking the discovered path.
 *
 * Resets solution state on the maze, explores reachable cells using a LIFO stack, updates each cell's `isExplored`,
 * `parent`, and `distance`, and reconstructs the path by following `parent` pointers if the end is reached.
 * The function respects cancellation via `isSolvingRef.current` (checked each iteration) and sets that flag to `true`
 * on start and `false` on completion. On finish it calls `showMessage` with a success or failure message and
 * re-renders the maze and player state.
 *
 * Side effects:
 * - Mutates cells in `maze.grid` (flags: visited, isExplored, parent, distance, isPath).
 * - Calls rendering helpers to draw the maze and player.
 * - Does not change the player's coordinates.
 *
 * @param showMessage - Callback used to display a short status message to the user (message, optional duration).
 * @param isSolvingRef - Mutable ref object used for cooperative cancellation; set to `true` while solving and cleared to `false` when done.
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
     * Finds a path from the maze start to end using breadth-first search (BFS) while visualizing progress.
     *
     * Performs an asynchronous BFS over maze cells, marking visited/explored cells, setting parent and distance
     * for path reconstruction, and rendering each step. If a path to `maze.endCell` is found the function
     * traces the parent links to mark the final path (`isPath`) and renders the result. The function updates
     * cell state fields: `visited`, `isExplored`, `parent`, `distance`, and `isPath`.
     *
     * The search can be cancelled by setting `isSolvingRef.current = false` from the caller; the function
     * sets this flag to `true` on start and resets it to `false` before returning.
     *
     * @param showMessage - Callback used to display a short user-facing message (e.g., success or failure).
     * @param isSolvingRef - Mutable ref object used for cancellation. Set `isSolvingRef.current = false` to stop early.
     * @returns A promise that resolves when the search completes or is cancelled.
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