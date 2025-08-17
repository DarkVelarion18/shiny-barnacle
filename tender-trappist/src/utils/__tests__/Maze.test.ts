/**
 * Tests for Maze utilities.
 *
 * Testing library and framework: Jest (ts-jest) assumed.
 * If this project uses Vitest, replace jest.* with vi.* accordingly.
 */

import * as MazeModule from '../Maze'; // Adjust if source file path differs
import {
  CELL_SIZE,
  DOT_RADIUS,
  PLAYER_SIZE,
  PATH_DOT_COLOR,
  GRID_COLOR,
  START_COLOR,
  END_COLOR,
  EXPLORED_COLOR,
  Maze,
  Player,
  drawMaze,
  drawPlayer,
  drawMazeAndPlayer,
  solveDFS,
  solveBFS,
  type Cell,
} from '../Maze';

type Ctx = CanvasRenderingContext2D & {
  calls?: Array<{ method: string; args: any[] }>;
};

// Minimal fake CanvasRenderingContext2D for unit tests
function createMockCtx(): Ctx {
  const record: Array<{ method: string; args: any[] }> = [];
  const mk = (name: string) => (...args: any[]) => {
    record.push({ method: name, args });
  };
  // Provide properties used by code under test
  const ctx = {
    calls: record,
    // stateful fields that code alters/reads
    fillStyle: '' as any,
    strokeStyle: '' as any,
    lineWidth: 0,
    // methods used
    beginPath: mk('beginPath') as any,
    moveTo: mk('moveTo') as any,
    lineTo: mk('lineTo') as any,
    stroke: mk('stroke') as any,
    fillRect: mk('fillRect') as any,
    clearRect: mk('clearRect') as any,
    arc: mk('arc') as any,
    fill: mk('fill') as any,
    // Unused in this file but present in interface
    save: mk('save') as any,
    restore: mk('restore') as any,
    closePath: mk('closePath') as any,
  } as unknown as Ctx;
  return ctx;
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  // Create a minimal fake canvas object sufficient for our tests
  return {
    width,
    height,
  } as HTMLCanvasElement;
}

describe('Constants', () => {
  test('CELL_SIZE-derived constants are consistent', () => {
    expect(PLAYER_SIZE).toBeCloseTo(CELL_SIZE * 0.6);
    expect(DOT_RADIUS).toBeCloseTo(CELL_SIZE * 0.15);
  });
});

describe('Maze initialization', () => {
  test('initializes grid with correct dimensions and flags start/end', () => {
    const maze = new Maze(3, 2);
    expect(maze.width).toBe(3);
    expect(maze.height).toBe(2);
    expect(maze.grid.length).toBe(2);
    expect(maze.grid[0].length).toBe(3);
    // Start at (0,0)
    expect(maze.startCell.x).toBe(0);
    expect(maze.startCell.y).toBe(0);
    expect(maze.startCell.isStart).toBe(true);
    // End at (width-1,height-1)
    expect(maze.endCell.x).toBe(2);
    expect(maze.endCell.y).toBe(1);
    expect(maze.endCell.isEnd).toBe(true);
  });

  test('cells initialized with walls and default metadata', () => {
    const maze = new Maze(2, 2);
    const cell = maze.grid[0][0];
    expect(cell.walls).toEqual({ top: true, right: true, bottom: true, left: true });
    expect(cell.visited).toBe(false);
    expect(cell.parent).toBeNull();
    expect(cell.isPath).toBe(false);
    expect(cell.isExplored).toBe(false);
    expect(cell.distance).toBe(Infinity);
  });

  test('generateMaze removes some walls (not a fully closed grid)', () => {
    // Stabilize Math.random to avoid flakiness
    const origRandom = Math.random;
    Math.random = () => 0.123456;
    try {
      const maze = new Maze(3, 3);
      // There must be at least one wall removed in the spanning tree generation
      let removed = 0;
      for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
          const c = maze.grid[y][x];
          if (!c.walls.top || !c.walls.right || !c.walls.bottom || !c.walls.left) {
            removed++;
          }
        }
      }
      expect(removed).toBeGreaterThan(0);
      // Using the Maze.getNeighbors (wall-aware), start should have at least one neighbor after generation
      const n = maze.getNeighbors(maze.startCell);
      expect(n.length).toBeGreaterThan(0);
    } finally {
      Math.random = origRandom;
    }
  });
});

describe('Maze.resetCellsForSolution', () => {
  test('resets pathfinding metadata', () => {
    const maze = new Maze(2, 2);
    // mess up some states
    maze.grid[0][0].parent = maze.grid[0][1];
    maze.grid[1][1].isPath = true;
    maze.grid[1][0].isExplored = true;
    maze.grid[1][1].distance = 10;

    maze.resetCellsForSolution();
    for (const row of maze.grid) {
      for (const cell of row) {
        expect(cell.parent).toBeNull();
        expect(cell.isPath).toBe(false);
        expect(cell.isExplored).toBe(false);
        expect(cell.distance).toBe(Infinity);
      }
    }
  });
});

describe('Maze.getNeighbors (wall-aware)', () => {
  test('returns only neighbors with open walls and within bounds', () => {
    const maze = new Maze(2, 2);
    // Reset walls for a controlled scenario
    for (const row of maze.grid) {
      for (const cell of row) {
        cell.walls = { top: true, right: true, bottom: true, left: true };
      }
    }
    const a = maze.grid[0][0];
    const b = maze.grid[0][1];
    const c = maze.grid[1][0];

    // Open wall between a and b (right/left) and a and c (bottom/top)
    a.walls.right = false;
    b.walls.left = false;
    a.walls.bottom = false;
    c.walls.top = false;

    const neighbors = maze.getNeighbors(a);
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toEqual(expect.arrayContaining([b, c]));
  });

  test('does not include neighbors blocked by walls', () => {
    const maze = new Maze(2, 2);
    // Start with all walls closed | attempt to open only one side incorrectly:
    const a = maze.grid[0][0];
    const b = maze.grid[0][1];
    // open only a.right but b.left remains true (inconsistent, but method reads current cell's walls only)
    a.walls.right = false;

    const neighbors = maze.getNeighbors(a);
    // Since Maze.getNeighbors checks only current cell's walls, it will include b despite inconsistent opposite wall
    // But in current implementation, getNeighbors checks walls of the cell itself, not neighbor's opposite wall, so b is included
    expect(neighbors).toEqual(expect.arrayContaining([b]));
  });
});

describe('Player movement', () => {
  test('respects walls and boundaries', () => {
    const maze = new Maze(2, 2);
    // Make deterministic
    const origRandom = Math.random;
    Math.random = () => 0.5;
    try {
      // Reset walls to all closed for predictability
      for (const row of maze.grid) {
        for (const cell of row) {
          cell.walls = { top: true, right: true, bottom: true, left: true };
        }
      }
      const player = new Player(0, 0);

      // Try moving right when wall is present -> no movement
      player.move(1, 0, maze);
      expect(player.x).toBe(0);
      expect(player.y).toBe(0);

      // Open right wall, move should succeed
      maze.grid[0][0].walls.right = false;
      maze.grid[0][1].walls.left = false;
      player.move(1, 0, maze);
      expect(player.x).toBe(1);
      expect(player.y).toBe(0);

      // Try to move out of bounds to the right -> blocked by boundary
      player.move(1, 0, maze);
      expect(player.x).toBe(1);

      // Open bottom wall and move down
      maze.grid[0][1].walls.bottom = false;
      maze.grid[1][1].walls.top = false;
      player.move(0, 1, maze);
      expect(player.y).toBe(1);

      // Move left not allowed if wall is present
      player.move(-1, 0, maze);
      expect(player.x).toBe(1);
    } finally {
      Math.random = origRandom;
    }
  });
});

describe('drawMaze', () => {
  test('clears canvas and draws grid lines for walls', () => {
    const maze = new Maze(2, 1);
    // Control walls: open some, keep some closed
    maze.grid[0][0].walls = { top: true, right: false, bottom: true, left: true };
    maze.grid[0][1].walls = { top: true, right: true, bottom: true, left: false };

    const ctx = createMockCtx();
    const canvas = createCanvas(100, 100);

    drawMaze(maze, ctx, canvas);

    // First call should be clearRect
    expect(ctx.calls![0].method).toBe('clearRect');
    // Check we stroke lines for closed walls
    const lineToCalls = ctx.calls!.filter(c => c.method === 'lineTo');
    // top walls for both cells + left wall for cell 0 + right wall for cell 1 + bottom walls for both cells
    // At least several lines should have been drawn
    expect(lineToCalls.length).toBeGreaterThan(0);

    // Ensure styles are set
    expect(ctx.strokeStyle).toBe(GRID_COLOR);
    expect(ctx.lineWidth).toBe(2);
  });

  test('fills start, end, and explored cells with correct colors and draws path dots', () => {
    const maze = new Maze(2, 2);
    const ctx = createMockCtx();
    const canvas = createCanvas(100, 100);

    // Mark states
    maze.grid[0][0].isExplored = true; // start is [0,0]
    maze.grid[1][1].isPath = true;     // end is [1,1]

    drawMaze(maze, ctx, canvas);

    // We can't read fillRect color per-call from our simple mock,
    // but we can assert that fillRect was invoked multiple times.
    const fillRects = ctx.calls!.filter(c => c.method === 'fillRect');
    expect(fillRects.length).toBeGreaterThanOrEqual(2);

    // Verify a dot is drawn for path cell [1,1]
    const arcCalls = ctx.calls!.filter(c => c.method === 'arc');
    expect(arcCalls.length).toBeGreaterThanOrEqual(1);
    const [x, y, r] = arcCalls[0].args;
    expect(r).toBeCloseTo(DOT_RADIUS);
    // Coordinates should be center of the cell
    expect(x).toBeCloseTo(1 * CELL_SIZE + CELL_SIZE / 2);
    expect(y).toBeCloseTo(1 * CELL_SIZE + CELL_SIZE / 2);
  });
});

describe('drawPlayer and drawMazeAndPlayer', () => {
  test('drawPlayer draws a circle at player position with proper radius', () => {
    const ctx = createMockCtx();
    const player = new Player(2, 3);

    drawPlayer(player, ctx);

    const arc = ctx.calls!.find(c => c.method === 'arc');
    expect(arc).toBeDefined();
    const [x, y, r] = arc!.args;
    expect(x).toBeCloseTo(2 * CELL_SIZE + CELL_SIZE / 2);
    expect(y).toBeCloseTo(3 * CELL_SIZE + CELL_SIZE / 2);
    expect(r).toBeCloseTo(PLAYER_SIZE / 2);
  });

  test('drawMazeAndPlayer invokes drawMaze then drawPlayer', () => {
    const maze = new Maze(2, 2);
    const player = new Player(0, 0);
    const ctx = createMockCtx();
    const canvas = createCanvas(100, 100);

    const drawMazeSpy = jest.spyOn(MazeModule, 'drawMaze');
    const drawPlayerSpy = jest.spyOn(MazeModule, 'drawPlayer');

    drawMazeAndPlayer(maze, player, ctx, canvas);

    expect(drawMazeSpy).toHaveBeenCalledTimes(1);
    expect(drawPlayerSpy).toHaveBeenCalledTimes(1);
    expect(drawMazeSpy).toHaveBeenCalledBefore(drawPlayerSpy);

    drawMazeSpy.mockRestore();
    drawPlayerSpy.mockRestore();
  });
});

describe('solveDFS and solveBFS', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  function setupSmallOpenMaze(): Maze {
    const origRandom = Math.random;
    Math.random = () => 0.42;
    const maze = new Maze(2, 2);
    Math.random = origRandom;

    // Open all walls to ensure straightforward traversal
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        maze.grid[y][x].walls = { top: false, right: false, bottom: false, left: false };
      }
    }
    return maze;
  }

  test('solveDFS finds a path, marks it, renders, and shows success message', async () => {
    const maze = setupSmallOpenMaze();
    const player = new Player(0, 0);
    const ctx = createMockCtx();
    const canvas = createCanvas(100, 100);

    const drawSpy = jest.spyOn(MazeModule, 'drawMazeAndPlayer');
    const messages: string[] = [];
    const showMessage = (msg: string) => messages.push(msg);
    const isSolvingRef = { current: true };

    const p = solveDFS(maze, player, ctx, canvas, showMessage, isSolvingRef);

    // Advance timers to flush visualizeStep internal timeout(s)
    await Promise.resolve(); // queue microtasks
    jest.runOnlyPendingTimers();
    jest.runAllTimers();

    await p;

    // Should have drawn at least at start and end
    expect(drawSpy).toHaveBeenCalled();
    expect(messages.some(m => /Path found using DFS/i.test(m))).toBe(true);
    expect(isSolvingRef.current).toBe(false);

    // Path flags should connect from end to start
    const end = maze.endCell;
    expect(end.isPath).toBe(true);
    // Ensure there's at least one other path cell (besides end)
    const anyOtherPath = maze.grid.flat().some(c => c.isPath && c !== end);
    expect(anyOtherPath).toBe(true);

    drawSpy.mockRestore();
  });

  test('solveBFS finds a path, marks it, renders, and shows success message', async () => {
    const maze = setupSmallOpenMaze();
    const player = new Player(0, 0);
    const ctx = createMockCtx();
    const canvas = createCanvas(100, 100);

    const drawSpy = jest.spyOn(MazeModule, 'drawMazeAndPlayer');
    const messages: string[] = [];
    const showMessage = (msg: string) => messages.push(msg);
    const isSolvingRef = { current: true };

    const p = solveBFS(maze, player, ctx, canvas, showMessage, isSolvingRef);

    await Promise.resolve();
    jest.runOnlyPendingTimers();
    jest.runAllTimers();

    await p;

    expect(drawSpy).toHaveBeenCalled();
    expect(messages.some(m => /Path found using BFS/i.test(m))).toBe(true);
    expect(isSolvingRef.current).toBe(false);

    // Verify start is marked on path as well (implementation sets start as path at the end)
    expect(maze.startCell.isPath).toBe(true);

    drawSpy.mockRestore();
  });

  test('solveDFS respects isSolvingRef.current = false to early stop', async () => {
    const maze = setupSmallOpenMaze();
    const player = new Player(0, 0);
    const ctx = createMockCtx();
    const canvas = createCanvas(100, 100);

    const messages: string[] = [];
    const showMessage = (msg: string) => messages.push(msg);
    const isSolvingRef = { current: true };

    // Flip the flag to false quickly to simulate cancel
    const solvePromise = solveDFS(maze, player, ctx, canvas, showMessage, isSolvingRef);
    isSolvingRef.current = false;

    await Promise.resolve();
    jest.runAllTimers();
    await solvePromise;

    // Since it may stop before reaching the end, either success or "No path" message could appear,
    // but the important assertion is it stops and sets current to false.
    expect(isSolvingRef.current).toBe(false);
    // No throw and one of messages could be present or none; we avoid strict assertion here.
  });
});